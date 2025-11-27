/************************************************************
 * lib/whatsapp/models/SequenceLog.ts
 * Modelo de log de secuencias por contacto (TypeScript)
 ************************************************************/

import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { SequenceLogRecord, SequenceHistoryEvent } from '../types';

export class SequenceLog {
  /**
   * Obtiene el estado de secuencia de un contacto
   */
  static async getContact(phone: string): Promise<SequenceLogRecord | null> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM contact_sequence_log WHERE phone = ? LIMIT 1',
        [phone]
      );
      return results.length > 0 ? (results[0] as SequenceLogRecord) : null;
    } catch (err: any) {
      console.error('[SequenceLog] getContact error:', err.message);
      return null;
    }
  }

  /**
   * Registra un mensaje entrante
   */
  static async recordIncoming(
    phone: string,
    text: string,
    timestamp: number | null = null
  ): Promise<boolean> {
    try {
      const ts = timestamp ? new Date(timestamp) : new Date();

      // Asegurar que existe el registro del contacto
      await pool.execute(
        `INSERT INTO contact_sequence_log (phone, status, last_update)
         VALUES (?, 'idle', ?)
         ON DUPLICATE KEY UPDATE last_update = ?`,
        [phone, ts, ts]
      );

      // Registrar evento en historial
      await pool.execute(
        `INSERT INTO contact_sequence_history (phone, event_type, message_text, created_at)
         VALUES (?, 'incoming', ?, ?)`,
        [phone, text || '', ts]
      );

      return true;
    } catch (err: any) {
      console.error('[SequenceLog] recordIncoming error:', err.message);
      return false;
    }
  }

  /**
   * Inicia una secuencia para un contacto
   */
  static async startSequence(
    phone: string,
    trigger: string,
    steps: string[]
  ): Promise<boolean> {
    try {
      const now = new Date();

      // Actualizar o crear el registro
      await pool.execute(
        `INSERT INTO contact_sequence_log
         (phone, status, trigger_keyword, total_steps, current_step, started_at, last_update)
         VALUES (?, 'active', ?, ?, 0, ?, ?)
         ON DUPLICATE KEY UPDATE
         status = 'active',
         trigger_keyword = ?,
         total_steps = ?,
         current_step = 0,
         started_at = ?,
         last_update = ?`,
        [phone, trigger, steps.length, now, now, trigger, steps.length, now, now]
      );

      // Registrar evento de trigger
      await pool.execute(
        `INSERT INTO contact_sequence_history (phone, event_type, message_text, created_at)
         VALUES (?, 'trigger', ?, ?)`,
        [phone, trigger, now]
      );

      return true;
    } catch (err: any) {
      console.error('[SequenceLog] startSequence error:', err.message);
      return false;
    }
  }

  /**
   * Avanza un paso en la secuencia
   */
  static async advanceStep(phone: string, sentText: string): Promise<boolean> {
    try {
      const contact = await this.getContact(phone);
      if (!contact || contact.status !== 'active') return false;

      const now = new Date();
      const newStep = (contact.current_step || 0) + 1;

      // Actualizar paso actual
      await pool.execute(
        'UPDATE contact_sequence_log SET current_step = ?, last_update = ? WHERE phone = ?',
        [newStep, now, phone]
      );

      // Registrar evento de salida
      await pool.execute(
        `INSERT INTO contact_sequence_history (phone, event_type, step_number, message_text, created_at)
         VALUES (?, 'outgoing', ?, ?, ?)`,
        [phone, contact.current_step, sentText, now]
      );

      return true;
    } catch (err: any) {
      console.error('[SequenceLog] advanceStep error:', err.message);
      return false;
    }
  }

  /**
   * Finaliza una secuencia
   */
  static async finishSequence(phone: string): Promise<boolean> {
    try {
      await pool.execute(
        'UPDATE contact_sequence_log SET status = ?, last_update = ? WHERE phone = ?',
        ['completed', new Date(), phone]
      );
      return true;
    } catch (err: any) {
      console.error('[SequenceLog] finishSequence error:', err.message);
      return false;
    }
  }

  /**
   * Obtiene el timestamp del ultimo mensaje entrante
   */
  static async getLastIncomingTs(phone: string): Promise<number> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        `SELECT created_at FROM contact_sequence_history
         WHERE phone = ? AND event_type = 'incoming'
         ORDER BY created_at DESC LIMIT 1`,
        [phone]
      );

      if (results.length > 0 && results[0].created_at) {
        return new Date(results[0].created_at).getTime();
      }
      return 0;
    } catch (err: any) {
      console.error('[SequenceLog] getLastIncomingTs error:', err.message);
      return 0;
    }
  }

  /**
   * Obtiene el timestamp del ultimo mensaje saliente
   */
  static async getLastOutgoingTs(phone: string): Promise<number> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        `SELECT created_at FROM contact_sequence_history
         WHERE phone = ? AND event_type = 'outgoing'
         ORDER BY created_at DESC LIMIT 1`,
        [phone]
      );

      if (results.length > 0 && results[0].created_at) {
        return new Date(results[0].created_at).getTime();
      }
      return 0;
    } catch (err: any) {
      console.error('[SequenceLog] getLastOutgoingTs error:', err.message);
      return 0;
    }
  }

  /**
   * Verifica si hay mensajes entrantes validos persistidos
   */
  static async hasValidPersistedIncoming(phone: string): Promise<boolean> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        `SELECT message_text FROM contact_sequence_history
         WHERE phone = ? AND event_type = 'incoming'
         ORDER BY created_at DESC LIMIT 5`,
        [phone]
      );

      for (const row of results) {
        const txt = (row.message_text || '').trim();
        if (txt.length >= 3 && /[A-Za-z0-9\u00C0-\u017F]/.test(txt)) {
          return true;
        }
      }
      return false;
    } catch (err: any) {
      console.error('[SequenceLog] hasValidPersistedIncoming error:', err.message);
      return false;
    }
  }

  /**
   * Obtiene el historial reciente de un contacto
   */
  static async getHistory(phone: string, limit = 50): Promise<SequenceHistoryEvent[]> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM contact_sequence_history
         WHERE phone = ?
         ORDER BY created_at DESC LIMIT ?`,
        [phone, limit]
      );
      return results as SequenceHistoryEvent[];
    } catch (err: any) {
      console.error('[SequenceLog] getHistory error:', err.message);
      return [];
    }
  }
}

export default SequenceLog;
