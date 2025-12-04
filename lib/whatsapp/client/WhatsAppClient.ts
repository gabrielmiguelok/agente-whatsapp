/************************************************************
 * lib/whatsapp/client/WhatsAppClient.ts
 * Cliente de WhatsApp con Baileys (TypeScript)
 ************************************************************/

import fs from 'fs';
import path from 'path';
import pino from 'pino';
import type { WASocket, BaileysEventMap, DisconnectReason as DR } from '@whiskeysockets/baileys';
import { CONFIG } from '../config';
import { Utils } from '../utils/Utils';
import { MessageProcessor } from '../utils/MessageProcessor';
import type {
  WhatsAppClientDeps,
  IDataStore,
  ISequenceEngine,
  ISendQueue,
  IAIConversation,
  SessionStatus,
  Contact,
} from '../types';

let makeWASocket: any;
let useMultiFileAuthState: any;
let DisconnectReason: any;
let fetchLatestBaileysVersion: any;

async function loadBaileys(): Promise<void> {
  const baileys = await import('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  DisconnectReason = baileys.DisconnectReason;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
}

interface FailedMessage {
  key: any;
  jid: string;
  timestamp: number;
  retryCount: number;
}

export class WhatsAppClient {
  private sessionEmail: string;
  private dataStore: IDataStore;
  private engine: ISequenceEngine;
  private sendQueue: ISendQueue;
  private aiConversation: IAIConversation | null;

  private onQrCode?: (qr: string) => void;
  private onStatusChange?: (status: SessionStatus) => void;
  private onConnected?: (phone: string) => void;

  private sock: WASocket | null = null;
  private authFolder: string;
  public initialized: boolean = false;

  private _reconnectTimer: NodeJS.Timeout | null = null;
  private _closingCount: number = 0;
  private _sawQR: boolean = false;
  private _initializing: boolean = false;

  private _replacedTimestamps: number[] = [];
  private _autoForced: number = 0;
  private _stoppedDueToReplaced: boolean = false;

  private _pollRunning: boolean = false;
  private _pollTimer: NodeJS.Timeout | null = null;

  private _manualSeqPollRunning: boolean = false;
  private _manualSeqPollTimer: NodeJS.Timeout | null = null;
  private _processingManualSequences: Set<number> = new Set();

  private _initMutex: Promise<void> | null = null;
  private _failedMessages: Map<string, FailedMessage> = new Map();
  private _retryTimer: NodeJS.Timeout | null = null;
  private _messageStore: Map<string, any> = new Map();

  constructor(deps: WhatsAppClientDeps) {
    this.sessionEmail = deps.sessionEmail;
    this.dataStore = deps.dataStore;
    this.engine = deps.sequenceEngine;
    this.sendQueue = deps.sendQueue;
    this.aiConversation = deps.aiConversation || null;

    this.onQrCode = deps.onQrCode;
    this.onStatusChange = deps.onStatusChange;
    this.onConnected = deps.onConnected;

    // Usar email sanitizado como nombre de carpeta
    const sanitizedEmail = Utils.sanitize(this.sessionEmail);
    this.authFolder = path.join(process.cwd(), 'auth-ts', sanitizedEmail);
  }

  /**
   * Inicializa el cliente (con mutex para evitar race conditions)
   */
  async initialize(): Promise<void> {
    if (this._stoppedDueToReplaced) {
      console.warn(`[${this.sessionEmail}] Reconexión bloqueada - sesión detenida por conflicto REPLACED`);
      console.warn(`[${this.sessionEmail}] Usa resetReplacedBlock() o reinicia la sesión manualmente`);
      return;
    }

    if (this.sock && this.initialized) {
      console.log(`[${this.sessionEmail}] Ya inicializado y conectado, ignorando`);
      return;
    }

    if (this._initMutex) {
      console.log(`[${this.sessionEmail}] Inicialización ya en progreso, esperando...`);
      return this._initMutex;
    }

    this._initMutex = this._doInitialize();
    try {
      await this._initMutex;
    } finally {
      this._initMutex = null;
    }
  }

  /**
   * Resetea el bloqueo por REPLACED (para reconexión manual)
   */
  resetReplacedBlock(): void {
    this._stoppedDueToReplaced = false;
    this._replacedTimestamps = [];
    console.log(`[${this.sessionEmail}] Bloqueo REPLACED reseteado`);
  }

  private async _doInitialize(): Promise<void> {
    if (this._initializing) return;
    this._initializing = true;

    try {
      await loadBaileys();

      if (!fs.existsSync(this.authFolder)) {
        fs.mkdirSync(this.authFolder, { recursive: true });
      }

      if (this._reconnectTimer) {
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = null;
      }

      await this._destroySocket();

      this.onStatusChange?.('connecting');

      const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
      const { version } = await fetchLatestBaileysVersion();
      const browser: [string, string, string] = ['Chrome', 'Linux', '127.0.0'];

      const getMessage = async (key: any) => {
        const msgId = key?.id;
        if (msgId && this._messageStore.has(msgId)) {
          return this._messageStore.get(msgId);
        }
        return undefined;
      };

      this.sock = makeWASocket({
        version,
        browser,
        auth: state,
        logger: pino({ level: 'error' }),
        printQRInTerminal: false,
        syncFullHistory: false,
        emitOwnEvents: true,
        connectTimeoutMs: CONFIG.WA_CONNECT_TIMEOUT_MS,
        keepAliveIntervalMs: CONFIG.WA_KEEPALIVE_MS,
        defaultQueryTimeoutMs: 60_000,
        qrTimeout: 0,
        getMessage,
        retryRequestDelayMs: 500,
        maxMsgRetryCount: 10,
      });

      this.sendQueue.updateSocket(this.sock);

      this._sawQR = false;
      this._closingCount = 0;
      this._setupListeners(saveCreds);
    } finally {
      this._initializing = false;
    }
  }

  /**
   * Destruye el socket actual de forma completa y segura
   */
  private async _destroySocket(): Promise<void> {
    if (!this.sock) return;

    const sockRef = this.sock;
    this.sock = null;

    try {
      sockRef.ev.removeAllListeners();

      try {
        await (sockRef as any).logout?.();
      } catch {}

      try {
        (sockRef as any).ws?.close?.();
      } catch {}

      try {
        (sockRef as any).end?.();
      } catch {}

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e: any) {
      console.warn(`[${this.sessionEmail}] Error destruyendo socket:`, e?.message);
    }
  }

  /**
   * Programa una reconexion
   */
  private _scheduleReconnect(hint: string = '', customDelay?: number): void {
    if (this._reconnectTimer) return;
    this._closingCount++;
    const base = CONFIG.RECONNECT_BASE_MS * Math.max(1, this._closingCount);
    const delay = customDelay ?? Utils.jitter(Math.min(CONFIG.RECONNECT_MAX_MS, base));
    console.log(
      `[${this.sessionEmail}] Reintentando conexion${hint ? ` (${hint})` : ''} en ~${Math.round(delay / 1000)}s...`
    );

    this._reconnectTimer = setTimeout(async () => {
      this._reconnectTimer = null;
      try {
        await this.initialize();
      } catch (e: any) {
        console.error(`[${this.sessionEmail}] Fallo reinit:`, e?.message || e);
      }
    }, delay);
    this._reconnectTimer.unref?.();
  }

  /**
   * Maneja el evento REPLACED
   */
  private _incrReplacedAndMaybeRecover(): boolean {
    const now = Date.now();
    this._replacedTimestamps = this._replacedTimestamps.filter(
      (t) => now - t <= CONFIG.REPLACED_WINDOW_MS
    );
    this._replacedTimestamps.push(now);

    console.warn(`[${this.sessionEmail}] La conexión fue REEMPLAZADA (${this._replacedTimestamps.length}/${CONFIG.REPLACED_RETRY_LIMIT} en ${CONFIG.REPLACED_WINDOW_MS / 1000}s)`);

    if (this._replacedTimestamps.length > CONFIG.REPLACED_RETRY_LIMIT) {
      if (
        CONFIG.AUTO_FORCE_NEW_ON_PERSISTENT_REPLACED &&
        this._autoForced < CONFIG.AUTO_FORCE_NEW_MAX
      ) {
        this._autoForced++;
        console.warn(`[${this.sessionEmail}] REPLACED persistente. Auto re-vincular #${this._autoForced}...`);
        try {
          this.wipeAuth();
        } catch {}
        return true;
      }
      console.error(`[${this.sessionEmail}] ⚠️ REPLACED repetido ${this._replacedTimestamps.length} veces. DETENIENDO reconexión.`);
      console.error(`[${this.sessionEmail}] ⚠️ Posible causa: WhatsApp Web abierto en navegador o otra app usando las mismas credenciales.`);
      console.error(`[${this.sessionEmail}] ⚠️ Solución: Cierra todas las sesiones de WhatsApp Web y vuelve a conectar manualmente.`);
      this.onStatusChange?.('disconnected');
      this._stoppedDueToReplaced = true;
      return false;
    }
    return true;
  }

  /**
   * Configura los listeners
   */
  private _setupListeners(saveCreds: () => Promise<void>): void {
    if (!this.sock) return;

    this.sock.ev.on('connection.update', (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this._sawQR = true;
        console.log(`[${this.sessionEmail}] QR Code generado`);
        this.onStatusChange?.('qr_pending');
        this.onQrCode?.(qr);
      }

      if (connection === 'close') {
        const isBoom =
          lastDisconnect?.error?.constructor?.name === 'Boom' ||
          lastDisconnect?.error?.isBoom === true;
        const statusCode = isBoom ? lastDisconnect.error.output?.statusCode : null;

        const msg = String(lastDisconnect?.error?.message || '');
        const payloadStr = String(lastDisconnect?.error?.output?.payload?.message || '');
        const looksReplaced =
          statusCode === 440 || /replac/i.test(msg) || /conflict/i.test(payloadStr);
        const isLoggedOut = statusCode === DisconnectReason?.loggedOut;
        const isStream515 = statusCode === 515;
        const isQRTimeout = statusCode === 408 && this._sawQR;

        if (isQRTimeout) {
          console.log(`[${this.sessionEmail}] QR expirado, generando nuevo...`);
          this._sawQR = false;
          this._scheduleReconnect('qr-timeout', 1000);
          return;
        }

        console.error(`[${this.sessionEmail}] Conexion cerrada (code=${statusCode ?? '??'})`);
        this.onStatusChange?.('disconnected');

        if (isLoggedOut) {
          console.log(`[${this.sessionEmail}] Sesion invalida/loggedOut.`);
          return;
        }

        if (looksReplaced) {
          const shouldRetry = this._incrReplacedAndMaybeRecover();
          if (shouldRetry) {
            this._scheduleReconnect('replaced', 30_000);
          }
          return;
        }
        if (isStream515) {
          this._scheduleReconnect('stream 515');
          return;
        }

        if (!this.initialized && this._sawQR) {
          console.log(`[${this.sessionEmail}] Esperando escaneo de QR...`);
          return;
        }

        this._scheduleReconnect();
      }

      if (connection === 'open') {
        if (this._reconnectTimer) {
          clearTimeout(this._reconnectTimer);
          this._reconnectTimer = null;
        }
        this._closingCount = 0;

        // Guardar tel propio
        const selfJid = this.sock?.user?.id || null;
        const base = (selfJid || '').split('@')[0].split(':')[0];
        const selfPhoneDigits = Utils.digitsOnly(base);
        this.dataStore.setSelfPhoneDigits(selfPhoneDigits);

        console.log(`[${this.sessionEmail}] Conectado. Self: ${selfJid} | Tel: ${selfPhoneDigits}`);
        this.initialized = true;
        this.onStatusChange?.('connected');
        this.onConnected?.(selfPhoneDigits);

        // Iniciar polling
        this._startAgendaPolling();
        if (CONFIG.SEQUENCES_ENABLED) {
          this._startManualSequencePolling();
        } else {
          console.log(`[${this.sessionEmail}] Secuencias deshabilitadas - polling manual no iniciado`);
        }
      }
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('messages.upsert', async (m: any) => {
      const messagesCount = m?.messages?.length || 0;
      if (messagesCount > 0) {
        console.log(`[MSG] Recibidos ${messagesCount} mensaje(s)`);
      }

      for (let i = 0; i < messagesCount; i++) {
        const msg = m.messages[i];
        try {
          const waId = msg?.key?.id;
          const jid = msg?.key?.remoteJid || '';
          const fromMe = !!msg?.key?.fromMe;
          const timestamp = msg?.messageTimestamp || 0;

          const keyId = waId || `${jid}_${timestamp}`;
          if (!keyId) {
            console.log(`[MSG] Sin keyId, saltando`);
            continue;
          }

          if (this.dataStore.dedup.has(keyId)) {
            console.log(`[MSG] Dedup: ${keyId.slice(0, 20)}...`);
            continue;
          }

          if (!Utils.isOneToOneJid(jid)) {
            console.log(`[MSG] No es 1:1: ${jid.slice(0, 30)}`);
            await this.dataStore.dedup.add(keyId);
            continue;
          }

          const text = Utils.extractPureTextFromMessage(msg);
          if (!text || !text.trim()) {
            const hasMessageContent = msg?.message && Object.keys(msg.message).length > 0;
            const isProtocolMsg = msg?.message?.protocolMessage ||
                                  msg?.message?.reactionMessage ||
                                  msg?.messageStubType;

            if (!hasMessageContent && !isProtocolMsg && waId && !fromMe) {
              console.log(`[MSG] Posible descifrado fallido de ${jid.split('@')[0]}, solicitando re-envío...`);
              this._scheduleMessageRetry(msg.key, jid, timestamp);
            } else {
              console.log(`[MSG] Sin texto extraible de ${jid.split('@')[0]} (protocolo/reacción)`);
            }
            await this.dataStore.dedup.add(keyId);
            if (waId) await this.dataStore.dedup.add(`WA:${waId}`);
            continue;
          }

          if (waId && msg?.message) {
            this._messageStore.set(waId, msg.message);
            if (this._messageStore.size > 500) {
              const keysToDelete = Array.from(this._messageStore.keys()).slice(0, 100);
              keysToDelete.forEach(k => this._messageStore.delete(k));
            }
          }

          if (waId && this._failedMessages.has(waId)) {
            console.log(`[MSG-RETRY] Mensaje recuperado exitosamente: ${waId.slice(0, 20)}...`);
            this._failedMessages.delete(waId);
          }

          const direction = fromMe ? 'ENVIADO' : 'RECIBIDO';
          const otherPhoneDigits = Utils.digitsOnly(jid.split('@')[0]);

          console.log(
            `[MSG] ${otherPhoneDigits} [${direction}]: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`
          );
          await this.dataStore.logMessage({ phoneDigits: otherPhoneDigits, text, direction, waId });

          // Secuencias (solo incoming) - Solo si SEQUENCES_ENABLED = true
          console.log(`[MSG] fromMe=${fromMe}, SEQUENCES_ENABLED=${CONFIG.SEQUENCES_ENABLED}`);
          if (!fromMe && CONFIG.SEQUENCES_ENABLED) {
            const processed = MessageProcessor.process(msg);
            console.log(`[MSG] MessageProcessor result: ${processed ? 'OK' : 'null'}`);
            if (processed) {
              let contact: Contact | null = null;
              try {
                contact = await this.dataStore.findContactByPhone(processed.phoneDigits);
              } catch (e: any) {
                console.warn(`[MSG] No se pudo obtener contacto: ${e?.message || e}`);
              }

              // Verificar si usar AIConversation (IA conversacional)
              let handledByAI = false;
              if (this.aiConversation) {
                console.log(`[AI] Evaluando mensaje de ${processed.phoneDigits}`);

                // Si ya hay conversacion activa, procesarla
                if (this.aiConversation.hasActiveConversation(processed.phoneDigits)) {
                  console.log(`[AI] Conversación activa encontrada para ${processed.phoneDigits}`);
                  handledByAI = await this.aiConversation.processMessage(
                    processed.phoneDigits,
                    processed.text,
                    contact
                  );
                }
                // Usar decisión inteligente con IA (trigger_*, VIP phones, etc)
                else if (this.aiConversation.isEligible(processed.phoneDigits)) {
                  console.log(`[AI] Consultando si iniciar conversación para ${processed.phoneDigits}`);
                  // Usar shouldStartConversation para decisión con IA
                  const decision = await this.aiConversation.shouldStartConversation(
                    processed.phoneDigits,
                    processed.text,
                    contact?.name || null,
                    new Date(processed.tsMs)
                  );

                  if (decision.start) {
                    console.log(`[AI-CONV] Iniciando: ${processed.phoneDigits} - ${decision.reason}`);
                    handledByAI = await this.aiConversation.startConversation(
                      processed.phoneDigits,
                      contact,
                      processed.text // Pasar el mensaje inicial para contexto
                    );
                  } else {
                    console.log(`[AI-CONV] No iniciar: ${processed.phoneDigits} - ${decision.reason}`);
                  }
                } else {
                  console.log(`[AI] No elegible para IA: ${processed.phoneDigits}`);
                }
              } else {
                console.log(`[AI] AIConversation no disponible`);
              }

              // Si no lo manejo AIConversation, usar el motor de secuencias normal
              if (!handledByAI) {
                await this.engine.onIncomingMessage(
                  processed.phoneDigits,
                  processed.text,
                  processed.tsMs,
                  contact
                );
              }
            }
          } else if (!fromMe && !CONFIG.SEQUENCES_ENABLED) {
            console.log(`[MSG] Secuencias deshabilitadas - solo logging`);
          }

          // Dedup final
          await this.dataStore.dedup.add(keyId);
          if (waId) await this.dataStore.dedup.add(`WA:${waId}`);
        } catch (e: any) {
          console.error(`[MSG] Error procesando mensaje:`, e?.message || e);
        }
      }
    });
  }

  /**
   * Inicia el polling de agenda
   */
  private _startAgendaPolling(): void {
    if (this._pollTimer) clearInterval(this._pollTimer);
    this._processAgendaSends().catch(() => {});
    this._pollTimer = setInterval(
      () => this._processAgendaSends().catch(() => {}),
      CONFIG.POLL_INTERVAL_MS
    );
    this._pollTimer.unref?.();
  }

  /**
   * Procesa envios de agenda
   */
  private async _processAgendaSends(): Promise<void> {
    if (this._pollRunning) return;
    this._pollRunning = true;

    try {
      const items = await this.dataStore.fetchContactsToSend(50);
      if (!items?.length) return;

      for (const contact of items) {
        try {
          const phoneDigits = contact.phone;
          if (!phoneDigits) continue;

          const text = contact.message_to_send;
          if (!text?.trim()) continue;

          const jid = `${phoneDigits}@s.whatsapp.net`;
          const sent = await this.sock?.sendMessage(jid, { text: text.slice(0, 2000) });
          const waId = sent?.key?.id;

          await this.dataStore.logMessage({ phoneDigits, text, direction: 'ENVIADO', waId });
          const ok = await this.dataStore.setContactActionStatus(contact.id, 'OK');

          if (ok) console.log(`[SEND] OK -> ${phoneDigits}`);
          else console.warn(`[SEND] Enviado pero no se pudo marcar OK: ${phoneDigits}`);
        } catch (e: any) {
          console.error('[SEND] Error:', e?.message || e);
        }
      }
    } finally {
      this._pollRunning = false;
    }
  }

  /**
   * Inicia el polling de secuencias manuales
   */
  private _startManualSequencePolling(): void {
    if (this._manualSeqPollTimer) clearInterval(this._manualSeqPollTimer);
    this._processManualSequences().catch(() => {});
    this._manualSeqPollTimer = setInterval(
      () => this._processManualSequences().catch(() => {}),
      CONFIG.MANUAL_SEQUENCE_POLL_INTERVAL_MS
    );
    this._manualSeqPollTimer.unref?.();
    console.log(
      `[SEQ-MANUAL] Polling iniciado (cada ${CONFIG.MANUAL_SEQUENCE_POLL_INTERVAL_MS / 1000}s)`
    );
  }

  /**
   * Procesa secuencias manuales
   */
  private async _processManualSequences(): Promise<void> {
    if (this._manualSeqPollRunning) return;
    this._manualSeqPollRunning = true;

    try {
      const items = await this.dataStore.fetchContactsToStartSequence(50);
      if (!items || items.length === 0) return;

      console.log(`[SEQ-MANUAL] Encontrados ${items.length} contacto(s) con SECUENCIA=INICIAR`);

      for (const contact of items) {
        const contactId = contact.id;

        if (this._processingManualSequences.has(contactId)) continue;
        this._processingManualSequences.add(contactId);

        try {
          const phoneDigits = contact.phone;
          if (!phoneDigits || phoneDigits.length < 8) {
            console.warn(`[SEQ-MANUAL] Telefono invalido: ${contact.phone}`);
            await this.dataStore.setContactSequenceStatus(contactId, 'NO INICIADA');
            this._processingManualSequences.delete(contactId);
            continue;
          }

          console.log(`[SEQ-MANUAL] Procesando: ${phoneDigits}`);

          // Actualizar estado
          await this.dataStore.setContactSequenceStatus(contactId, 'INICIADA');

          // Obtener primer trigger
          const firstTrigger = this.engine.triggers.keys().next().value;
          if (!firstTrigger) {
            console.error(`[SEQ-MANUAL] No hay triggers configurados`);
            await this.dataStore.setContactSequenceStatus(contactId, 'NO INICIADA');
            this._processingManualSequences.delete(contactId);
            continue;
          }

          // Callback de finalizacion
          const onComplete = async (phone: string) => {
            console.log(`[SEQ-MANUAL] Secuencia completada para ${phone}`);
            await this.dataStore.setContactSequenceStatus(contactId, 'NO INICIADA');
            this._processingManualSequences.delete(contactId);
          };

          // Iniciar secuencia
          const started = await this.engine.startManualSequence(phoneDigits, firstTrigger, onComplete);
          if (!started) {
            console.error(`[SEQ-MANUAL] No se pudo iniciar para ${phoneDigits}`);
            await this.dataStore.setContactSequenceStatus(contactId, 'NO INICIADA');
            this._processingManualSequences.delete(contactId);
          }
        } catch (e: any) {
          console.error(`[SEQ-MANUAL] Error:`, e?.message || e);
          await this.dataStore.setContactSequenceStatus(contactId, 'NO INICIADA').catch(() => {});
          this._processingManualSequences.delete(contactId);
        }
      }
    } catch (e: any) {
      console.error('[SEQ-MANUAL] Error general:', e?.message || e);
    } finally {
      this._manualSeqPollRunning = false;
    }
  }

  /**
   * Programa un retry para un mensaje con descifrado fallido
   */
  private _scheduleMessageRetry(key: any, jid: string, timestamp: number): void {
    const msgId = key?.id;
    if (!msgId) return;

    if (this._failedMessages.has(msgId)) {
      const existing = this._failedMessages.get(msgId)!;
      if (existing.retryCount >= 3) {
        console.log(`[MSG-RETRY] ${msgId.slice(0, 20)}... max intentos alcanzado`);
        this._failedMessages.delete(msgId);
        return;
      }
      existing.retryCount++;
    } else {
      this._failedMessages.set(msgId, {
        key,
        jid,
        timestamp,
        retryCount: 1,
      });
    }

    if (!this._retryTimer) {
      this._retryTimer = setTimeout(() => this._processFailedMessages(), 5000);
      this._retryTimer.unref?.();
    }
  }

  /**
   * Procesa mensajes fallidos solicitando re-envío
   */
  private async _processFailedMessages(): Promise<void> {
    this._retryTimer = null;

    if (!this.sock || this._failedMessages.size === 0) return;

    const toProcess = Array.from(this._failedMessages.entries()).slice(0, 5);
    console.log(`[MSG-RETRY] Procesando ${toProcess.length} mensaje(s) fallido(s)`);

    for (const [msgId, failed] of toProcess) {
      try {
        const sockAny = this.sock as any;
        if (sockAny.requestPlaceholderResend) {
          console.log(`[MSG-RETRY] Solicitando re-envío: ${msgId.slice(0, 20)}... (intento ${failed.retryCount})`);
          await sockAny.requestPlaceholderResend(failed.key);
        } else if (sockAny.fetchMessageHistory) {
          console.log(`[MSG-RETRY] Solicitando historial: ${msgId.slice(0, 20)}... (intento ${failed.retryCount})`);
          await sockAny.fetchMessageHistory(1, failed.key, failed.timestamp * 1000);
        } else {
          console.log(`[MSG-RETRY] No hay método de retry disponible`);
          this._failedMessages.delete(msgId);
        }
      } catch (e: any) {
        console.error(`[MSG-RETRY] Error:`, e?.message || e);
        const entry = this._failedMessages.get(msgId);
        if (entry && entry.retryCount >= 3) {
          this._failedMessages.delete(msgId);
        }
      }
    }

    if (this._failedMessages.size > 0 && !this._retryTimer) {
      this._retryTimer = setTimeout(() => this._processFailedMessages(), 10000);
      this._retryTimer.unref?.();
    }
  }

  wipeAuth(): void {
    if (fs.existsSync(this.authFolder)) {
      fs.rmSync(this.authFolder, { recursive: true, force: true });
    }
  }

  getSocket(): WASocket | null {
    return this.sock;
  }

  cleanup(): void {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
    if (this._manualSeqPollTimer) {
      clearInterval(this._manualSeqPollTimer);
      this._manualSeqPollTimer = null;
    }
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    if (this._retryTimer) {
      clearTimeout(this._retryTimer);
      this._retryTimer = null;
    }
    this._failedMessages.clear();
    this._messageStore.clear();
    this._destroySocket();
    this.dataStore.cleanup();
  }
}

export default WhatsAppClient;
