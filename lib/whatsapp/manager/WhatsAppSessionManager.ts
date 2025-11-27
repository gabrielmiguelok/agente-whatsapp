/************************************************************
 * lib/whatsapp/manager/WhatsAppSessionManager.ts
 * Singleton que maneja multiples sesiones de WhatsApp
 ************************************************************/

import { CONFIG } from '../config';
import { WhatsAppClient } from '../client/WhatsAppClient';
import { DataStore } from '../services/DataStore';
import { SendQueue } from '../services/SendQueue';
import { SequenceEngine } from '../services/SequenceEngine';
import { ContactValidator } from '../services/ContactValidator';
import { AIConversation } from '../services/AIConversation';
import { Sequence } from '../models/Sequence';
import { WhatsAppSessionModel } from '../models/WhatsAppSession';
import type { SessionState, SessionStatus } from '../types';

interface ManagedSession {
  email: string;
  client: WhatsAppClient;
  dataStore: DataStore;
  sendQueue: SendQueue;
  sequenceEngine: SequenceEngine;
  aiConversation: AIConversation | null;
  state: SessionState;
}

class WhatsAppSessionManagerImpl {
  private sessions: Map<string, ManagedSession> = new Map();
  private triggersMap: Map<string, string[]> | null = null;
  private static singletonInstance: WhatsAppSessionManagerImpl | null = null;

  constructor() {
    console.log('[SessionManager] Instancia creada');
  }

  /**
   * Obtiene la instancia singleton
   */
  static getInstance(): WhatsAppSessionManagerImpl {
    if (!WhatsAppSessionManagerImpl.singletonInstance) {
      WhatsAppSessionManagerImpl.singletonInstance = new WhatsAppSessionManagerImpl();
    }
    return WhatsAppSessionManagerImpl.singletonInstance;
  }

  /**
   * Carga los triggers una sola vez (compartidos entre todas las sesiones)
   */
  private async _loadTriggers(): Promise<Map<string, string[]>> {
    if (this.triggersMap) return this.triggersMap;
    this.triggersMap = await Sequence.loadAll();
    console.log(`[SessionManager] Cargados ${this.triggersMap.size} trigger(s)`);
    return this.triggersMap;
  }

  /**
   * Recarga los triggers (para cuando se agreguen nuevas secuencias)
   */
  async reloadTriggers(): Promise<void> {
    this.triggersMap = await Sequence.loadAll();
    console.log(`[SessionManager] Recargados ${this.triggersMap.size} trigger(s)`);

    // Actualizar en todas las sesiones activas
    for (const [email, session] of this.sessions) {
      session.sequenceEngine.triggers = this.triggersMap;
    }
  }

  /**
   * Recarga la configuración de prompts en todas las sesiones activas
   */
  async reloadPromptConfig(): Promise<void> {
    console.log('[SessionManager] Recargando configuración de prompts...');

    for (const [email, session] of this.sessions) {
      if (session.aiConversation) {
        await session.aiConversation.reloadConfig();
        console.log(`[SessionManager] Config recargada para: ${email}`);
      }
    }

    console.log('[SessionManager] Configuración de prompts recargada en todas las sesiones');
  }

  /**
   * Obtiene o crea una sesion
   */
  async getOrCreateSession(email: string): Promise<ManagedSession> {
    // Si ya existe en memoria, retornar
    const existing = this.sessions.get(email);
    if (existing) {
      console.log(`[SessionManager] Sesion existente en memoria: ${email}`);
      return existing;
    }

    // Asegurar que existe en DB
    await WhatsAppSessionModel.getOrCreate(email);

    // Cargar triggers
    const triggers = await this._loadTriggers();

    // Crear componentes
    const sessionName = `ts-${email.replace(/[^a-z0-9]/gi, '_')}`;
    const dataStore = new DataStore(sessionName, email);
    await dataStore.initialize();

    const sendQueue = new SendQueue(null);
    const contactValidator = new ContactValidator();
    const sequenceEngine = new SequenceEngine(sendQueue, triggers, sessionName, contactValidator);

    // Crear AI Conversation si hay API key
    let aiConversation: AIConversation | null = null;
    if (CONFIG.OPENAI_API_KEY) {
      aiConversation = new AIConversation(sendQueue, CONFIG.OPENAI_API_KEY, {
        model: 'gpt-4o-mini',
        assistantName: 'Ana',
        allowedPhones: [], // Todos habilitados
        triggerKeyword: 'hola',
      });
      console.log(`[SessionManager] AI Conversation habilitado para ${email}`);
    }

    // Estado inicial
    const state: SessionState = {
      email,
      status: 'disconnected',
      qrCode: null,
      phone: null,
      selfJid: null,
      connectedAt: null,
    };

    // Callbacks para eventos (el estado se guarda en memoria y DB, polling lo lee)
    const onQrCode = (qr: string) => {
      state.qrCode = qr;
      state.status = 'qr_pending';
      WhatsAppSessionModel.updateStatus(email, 'qr_pending');
    };

    const onStatusChange = (status: SessionStatus) => {
      state.status = status;
      if (status === 'disconnected') {
        state.qrCode = null;
      }
      WhatsAppSessionModel.updateStatus(email, status);
    };

    const onConnected = (phone: string) => {
      state.phone = phone;
      state.qrCode = null;
      state.status = 'connected';
      state.connectedAt = new Date();
      WhatsAppSessionModel.setConnected(email, phone);
    };

    // Crear cliente
    const client = new WhatsAppClient({
      sessionEmail: email,
      dataStore,
      sequenceEngine,
      sendQueue,
      aiConversation,
      onQrCode,
      onStatusChange,
      onConnected,
    });

    // Guardar sesion
    const managedSession: ManagedSession = {
      email,
      client,
      dataStore,
      sendQueue,
      sequenceEngine,
      aiConversation,
      state,
    };

    this.sessions.set(email, managedSession);
    console.log(`[SessionManager] Sesion creada: ${email}`);

    return managedSession;
  }

  /**
   * Inicia una sesion (conecta a WhatsApp)
   */
  async startSession(email: string): Promise<SessionState> {
    const session = await this.getOrCreateSession(email);

    if (session.state.status === 'connected') {
      console.log(`[SessionManager] Sesion ya conectada: ${email}`);
      return session.state;
    }

    console.log(`[SessionManager] Iniciando sesion: ${email}`);
    session.state.status = 'connecting';

    await session.client.initialize();

    return session.state;
  }

  /**
   * Detiene una sesion
   */
  async stopSession(email: string): Promise<void> {
    const session = this.sessions.get(email);
    if (!session) {
      console.log(`[SessionManager] No existe sesion: ${email}`);
      return;
    }

    console.log(`[SessionManager] Deteniendo sesion: ${email}`);
    session.client.cleanup();
    session.state.status = 'disconnected';

    await WhatsAppSessionModel.setDisconnected(email);
  }

  /**
   * Desconecta y elimina la autenticacion de una sesion
   */
  async logoutSession(email: string): Promise<void> {
    const session = this.sessions.get(email);
    if (!session) {
      console.log(`[SessionManager] No existe sesion: ${email}`);
      return;
    }

    console.log(`[SessionManager] Logout sesion: ${email}`);
    session.client.cleanup();
    session.client.wipeAuth();
    session.state.status = 'disconnected';
    session.state.qrCode = null;
    session.state.phone = null;

    await WhatsAppSessionModel.setDisconnected(email);
  }

  /**
   * Elimina una sesion completamente
   */
  async deleteSession(email: string): Promise<void> {
    await this.logoutSession(email);
    this.sessions.delete(email);
    await WhatsAppSessionModel.delete(email);
    console.log(`[SessionManager] Sesion eliminada: ${email}`);
  }

  /**
   * Obtiene el estado de una sesion
   */
  getSessionState(email: string): SessionState | null {
    const session = this.sessions.get(email);
    return session?.state || null;
  }

  /**
   * Obtiene todas las sesiones activas
   */
  getAllSessions(): SessionState[] {
    return Array.from(this.sessions.values()).map((s) => s.state);
  }

  /**
   * Cierra todas las sesiones
   */
  async shutdownAll(): Promise<void> {
    console.log('[SessionManager] Cerrando todas las sesiones...');
    for (const [email, session] of this.sessions) {
      try {
        session.client.cleanup();
        await WhatsAppSessionModel.setDisconnected(email);
      } catch (e: any) {
        console.error(`[SessionManager] Error cerrando ${email}:`, e?.message || e);
      }
    }
    this.sessions.clear();
    console.log('[SessionManager] Todas las sesiones cerradas');
  }
}

// Alias para compatibilidad
export const WhatsAppSessionManager = WhatsAppSessionManagerImpl;
export type WhatsAppSessionManager = WhatsAppSessionManagerImpl;

// Singleton function
export function getSessionManager(): WhatsAppSessionManagerImpl {
  return WhatsAppSessionManagerImpl.getInstance();
}

export default WhatsAppSessionManagerImpl;
