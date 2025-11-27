/************************************************************
 * lib/whatsapp/models/Outbox.ts
 * Modelo de cola de operaciones pendientes (TypeScript)
 ************************************************************/

import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { CONFIG } from '../config';
import type { OutboxItem, OutboxPayload } from '../types';

export class Outbox {
  private sessionName: string;

  constructor(sessionName: string) {
    this.sessionName = sessionName;
  }

  /**
   * Agrega un item a la cola
   */
  async add(queueId: string, operationType: string, payload: OutboxPayload): Promise<boolean> {
    try {
      await pool.execute(
        `INSERT INTO outbox (session_name, queue_id, operation_type, payload, attempts, next_at)
         VALUES (?, ?, ?, ?, 0, NOW())
         ON DUPLICATE KEY UPDATE id = id`,
        [this.sessionName, queueId, operationType, JSON.stringify(payload)]
      );
      return true;
    } catch (err: any) {
      if (err.code !== 'ER_DUP_ENTRY') {
        console.error('[Outbox] Error al agregar item:', err.message);
      }
      return false;
    }
  }

  /**
   * Obtiene items pendientes para procesar
   */
  async getPending(limit = 50): Promise<OutboxItem[]> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM outbox
         WHERE session_name = ? AND next_at <= NOW()
         ORDER BY next_at ASC LIMIT ?`,
        [this.sessionName, limit]
      );

      // Parsear payload JSON
      return results.map((row) => ({
        ...row,
        payload:
          typeof row.payload === 'string'
            ? JSON.parse(row.payload)
            : row.payload,
      })) as OutboxItem[];
    } catch (err: any) {
      console.error('[Outbox] Error al obtener pendientes:', err.message);
      return [];
    }
  }

  /**
   * Marca un item como completado (lo elimina)
   */
  async complete(id: number): Promise<boolean> {
    try {
      await pool.execute('DELETE FROM outbox WHERE id = ?', [id]);
      return true;
    } catch (err: any) {
      console.error('[Outbox] Error al completar item:', err.message);
      return false;
    }
  }

  /**
   * Marca un item como fallido y programa reintento
   */
  async markFailed(id: number, attempts: number): Promise<boolean> {
    try {
      if (attempts >= CONFIG.OUTBOX_MAX_ATTEMPTS) {
        // Descartar si se alcanzo el maximo de intentos
        console.error(`[Outbox] Item ${id} descartado tras ${attempts} intentos`);
        await pool.execute('DELETE FROM outbox WHERE id = ?', [id]);
        return false;
      }

      // Calcular backoff exponencial
      const backoffMs = CONFIG.OUTBOX_BACKOFF_BASE_MS * Math.pow(2, Math.min(attempts, 6));
      const nextAt = new Date(Date.now() + backoffMs);

      await pool.execute('UPDATE outbox SET attempts = ?, next_at = ? WHERE id = ?', [
        attempts,
        nextAt,
        id,
      ]);

      console.warn(`[Outbox] Item ${id} fallo, reintentando en ${Math.round(backoffMs / 1000)}s`);
      return true;
    } catch (err: any) {
      console.error('[Outbox] Error al marcar fallido:', err.message);
      return false;
    }
  }

  /**
   * Verifica si un queueId ya existe en la cola
   */
  async exists(queueId: string): Promise<boolean> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT 1 FROM outbox WHERE queue_id = ? LIMIT 1',
        [queueId]
      );
      return results.length > 0;
    } catch (err: any) {
      console.error('[Outbox] Error al verificar existencia:', err.message);
      return false;
    }
  }

  /**
   * Obtiene el numero de items en cola
   */
  async count(): Promise<number> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM outbox WHERE session_name = ?',
        [this.sessionName]
      );
      return results[0]?.count || 0;
    } catch (err: any) {
      console.error('[Outbox] Error al contar items:', err.message);
      return 0;
    }
  }

  /**
   * Limpia la cola de una sesion
   */
  static async wipe(sessionName: string): Promise<void> {
    try {
      await pool.execute('DELETE FROM outbox WHERE session_name = ?', [sessionName]);
      console.log(`[Outbox] Cola de sesion "${sessionName}" eliminada`);
    } catch (err: any) {
      console.error('[Outbox] Error al limpiar cola:', err.message);
    }
  }
}

export default Outbox;
