/************************************************************
 * lib/whatsapp/models/Message.ts
 * Modelo de mensajes (TypeScript)
 ************************************************************/

import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { Message as MessageType } from '../types';

interface CreateMessageParams {
  contactId: number | null;
  phone: string;
  name?: string;
  message: string;
  direction: 'ENVIADO' | 'RECIBIDO';
  waId?: string | null;
  instanceEmail?: string | null;
}

export class Message {
  /**
   * Crea un nuevo mensaje en el historial
   */
  static async create(params: CreateMessageParams): Promise<{ success: boolean; id?: number }> {
    const { contactId, phone, name, message, direction, waId, instanceEmail } = params;

    if (!message?.trim() || !phone) {
      console.warn('[Message] Mensaje descartado: texto o telefono vacio');
      return { success: false };
    }

    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO messages (contact_id, phone, name, message, direction, wa_id, instance_email)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          contactId || null,
          phone,
          name || '',
          message.slice(0, 65000),
          direction,
          waId || null,
          instanceEmail || null,
        ]
      );

      console.log(`[Message] Guardado: ${phone} [${direction}]${name ? ` name="${name}"` : ''}`);
      return { success: true, id: result.insertId };
    } catch (err: any) {
      console.error('[Message] Error al crear:', err.message);
      return { success: false };
    }
  }

  /**
   * Busca un mensaje por WA ID
   */
  static async findByWaId(waId: string): Promise<MessageType | null> {
    if (!waId) return null;

    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM messages WHERE wa_id = ? LIMIT 1',
        [waId]
      );
      return results.length > 0 ? (results[0] as MessageType) : null;
    } catch (err: any) {
      console.error('[Message] findByWaId error:', err.message);
      return null;
    }
  }

  /**
   * Verifica si un mensaje ya existe por WA ID
   */
  static async existsByWaId(waId: string): Promise<boolean> {
    if (!waId) return false;

    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT 1 FROM messages WHERE wa_id = ? LIMIT 1',
        [waId]
      );
      return results.length > 0;
    } catch (err: any) {
      console.error('[Message] existsByWaId error:', err.message);
      return false;
    }
  }

  /**
   * Obtiene mensajes de un contacto
   */
  static async getByPhone(phone: string, limit = 50): Promise<MessageType[]> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM messages WHERE phone = ? ORDER BY created_at DESC LIMIT ?',
        [phone, limit]
      );
      return results as MessageType[];
    } catch (err: any) {
      console.error('[Message] getByPhone error:', err.message);
      return [];
    }
  }

  /**
   * Obtiene el ultimo mensaje entrante de un contacto
   */
  static async getLastIncoming(phone: string): Promise<MessageType | null> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM messages WHERE phone = ? AND direction = ? ORDER BY created_at DESC LIMIT 1',
        [phone, 'RECIBIDO']
      );
      return results.length > 0 ? (results[0] as MessageType) : null;
    } catch (err: any) {
      console.error('[Message] getLastIncoming error:', err.message);
      return null;
    }
  }

  /**
   * Obtiene el ultimo mensaje saliente de un contacto
   */
  static async getLastOutgoing(phone: string): Promise<MessageType | null> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM messages WHERE phone = ? AND direction = ? ORDER BY created_at DESC LIMIT 1',
        [phone, 'ENVIADO']
      );
      return results.length > 0 ? (results[0] as MessageType) : null;
    } catch (err: any) {
      console.error('[Message] getLastOutgoing error:', err.message);
      return null;
    }
  }

  /**
   * Cuenta mensajes de un contacto
   */
  static async countByPhone(phone: string): Promise<number> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM messages WHERE phone = ?',
        [phone]
      );
      return results[0]?.count || 0;
    } catch (err: any) {
      console.error('[Message] countByPhone error:', err.message);
      return 0;
    }
  }
}

export default Message;
