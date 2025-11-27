/************************************************************
 * lib/whatsapp/services/DataStore.ts
 * Almacen de datos principal (TypeScript)
 ************************************************************/

import { CONFIG } from '../config';
import { Utils } from '../utils/Utils';
import { Contact } from '../models/Contact';
import { Message } from '../models/Message';
import { Dedup } from '../models/Dedup';
import { Outbox } from '../models/Outbox';
import type { IDataStore, IDedup, Contact as ContactType, OutboxPayload } from '../types';

export class DataStore implements IDataStore {
  private sessionName: string;
  private instanceEmail: string;
  private selfPhoneDigits: string | null;
  public dedup: IDedup;
  private outbox: Outbox;
  private _flushing: boolean;
  private _flushTimer: NodeJS.Timeout | null;

  constructor(sessionName: string, instanceEmail: string) {
    this.sessionName = sessionName;
    this.instanceEmail = instanceEmail;
    this.selfPhoneDigits = null;
    this.dedup = new Dedup(sessionName);
    this.outbox = new Outbox(sessionName);
    this._flushing = false;
    this._flushTimer = null;
  }

  /**
   * Inicializa el store
   */
  async initialize(): Promise<void> {
    await this.dedup.load();
    this._startFlushTimer();
  }

  /**
   * Establece el telefono propio
   */
  setSelfPhoneDigits(d: string | null): void {
    this.selfPhoneDigits = d || null;
  }

  /**
   * Inicia el timer de flush del outbox
   */
  private _startFlushTimer(): void {
    if (this._flushTimer) clearInterval(this._flushTimer);
    this._flushTimer = setInterval(() => this._flush().catch(() => {}), CONFIG.OUTBOX_FLUSH_EVERY_MS);
    this._flushTimer.unref?.();
  }

  /**
   * Registra un mensaje
   */
  async logMessage(data: {
    phoneDigits: string;
    text: string;
    direction: 'ENVIADO' | 'RECIBIDO';
    waId?: string | null;
  }): Promise<void> {
    const { phoneDigits, text, direction, waId } = data;

    if (!text?.trim() || !phoneDigits) {
      console.warn('[LOG] Mensaje descartado: texto o telefono vacio');
      return;
    }

    // Dedup por WA ID
    const dedupKey = waId ? `WA:${waId}` : null;
    if (dedupKey && this.dedup.has(dedupKey)) {
      if (CONFIG.VERBOSE) console.log(`[LOG] Mensaje ya procesado (dedup): ${dedupKey}`);
      return;
    }
    if (dedupKey) await this.dedup.add(dedupKey);

    const queueId =
      dedupKey || `GEN:${Utils.sha1(`${phoneDigits}|${direction}|${text}|${Date.now()}|${Math.random()}`)}`;

    const exists = await this.outbox.exists(queueId);
    if (exists) {
      if (CONFIG.VERBOSE) console.log(`[LOG] Mensaje ya en cola: ${queueId}`);
      return;
    }

    console.log(
      `[LOG] ENCOLANDO: ${phoneDigits} [${direction}] "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`
    );

    await this.outbox.add(queueId, 'log', { phoneDigits, text, direction });

    // Flush inmediato para colas pequenas
    const count = await this.outbox.count();
    if (count <= 5) {
      setImmediate(() =>
        this._flush().catch((e: any) => console.error('[LOG] Error en flush:', e?.message || e))
      );
    }
  }

  /**
   * Procesa la cola de outbox
   */
  private async _flush(): Promise<void> {
    if (this._flushing) return;
    this._flushing = true;

    try {
      const items = await this.outbox.getPending(50);
      if (items.length === 0) return;

      console.log(`[OUTBOX] Procesando ${items.length} item(s)`);

      for (const item of items) {
        if (item.operation_type === 'log') {
          const payload = item.payload as OutboxPayload;
          const ok = await this._processLogItem(payload);
          if (ok) {
            await this.outbox.complete(item.id);
            console.log(`[OUTBOX] Item ${item.id} completado`);
          } else {
            await this.outbox.markFailed(item.id, item.attempts + 1);
          }
        } else {
          console.warn(`[OUTBOX] Tipo desconocido: ${item.operation_type}`);
          await this.outbox.complete(item.id);
        }
      }
    } catch (e: any) {
      console.error('[OUTBOX] Error en flush:', e?.message || e);
    } finally {
      this._flushing = false;
    }
  }

  /**
   * Procesa un item de log
   */
  private async _processLogItem(payload: OutboxPayload): Promise<boolean> {
    const { phoneDigits, text, direction } = payload;

    try {
      console.log(`[OUTBOX] Procesando: ${phoneDigits} [${direction}]`);

      // Obtener o crear contacto
      const { contact, created } = await Contact.getOrCreate(phoneDigits, this.instanceEmail);
      if (!contact) {
        console.error(`[OUTBOX] No se pudo obtener/crear contacto para ${phoneDigits}`);
        // Aun asi guardar en historial
        const result = await Message.create({
          contactId: null,
          phone: phoneDigits,
          name: '',
          message: text,
          direction,
          instanceEmail: this.instanceEmail,
        });
        return result.success;
      }

      if (created) {
        console.log(`[OUTBOX] Nuevo contacto creado: ${phoneDigits}`);
      }

      // Obtener nombre del contacto
      const name = contact.name || '';

      // Guardar mensaje
      const result = await Message.create({
        contactId: contact.id,
        phone: phoneDigits,
        name,
        message: text,
        direction,
        instanceEmail: this.instanceEmail,
      });

      if (!result.success) {
        console.error(`[OUTBOX] Fallo insercion de mensaje para ${phoneDigits}`);
        return false;
      }

      console.log(`[OUTBOX] COMPLETADO: ${phoneDigits} [${direction}]`);
      return true;
    } catch (e: any) {
      console.error(`[OUTBOX] ERROR procesando ${phoneDigits}:`, e?.message || e);
      return false;
    }
  }

  /**
   * Obtiene contactos con accion ENVIAR
   */
  async fetchContactsToSend(limit = 50): Promise<ContactType[]> {
    return Contact.getContactsToSend(limit);
  }

  /**
   * Actualiza el estado de accion de un contacto
   */
  async setContactActionStatus(contactId: number, status: string): Promise<boolean> {
    return Contact.setActionStatus(contactId, status);
  }

  /**
   * Obtiene contactos con secuencia INICIAR
   */
  async fetchContactsToStartSequence(limit = 50): Promise<ContactType[]> {
    return Contact.getContactsToStartSequence(limit);
  }

  /**
   * Actualiza el estado de secuencia de un contacto
   */
  async setContactSequenceStatus(contactId: number, status: string): Promise<boolean> {
    return Contact.setSequenceStatus(contactId, status);
  }

  /**
   * Busca un contacto por telefono
   */
  async findContactByPhone(phoneDigits: string): Promise<ContactType | null> {
    return Contact.findByPhone(phoneDigits);
  }

  /**
   * Limpia recursos
   */
  cleanup(): void {
    if (this._flushTimer) {
      clearInterval(this._flushTimer);
      this._flushTimer = null;
    }
  }
}

export default DataStore;
