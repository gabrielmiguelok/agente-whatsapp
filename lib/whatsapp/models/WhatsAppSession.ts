/************************************************************
 * lib/whatsapp/models/WhatsAppSession.ts
 * Modelo para la tabla whatsapp_sessions (TypeScript)
 ************************************************************/

import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { WhatsAppSessionRecord, SessionStatus } from '../types';

export class WhatsAppSessionModel {
  /**
   * Obtiene una sesion por email
   */
  static async findByEmail(email: string): Promise<WhatsAppSessionRecord | null> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM whatsapp_sessions WHERE email = ? LIMIT 1',
        [email]
      );
      return results.length > 0 ? (results[0] as WhatsAppSessionRecord) : null;
    } catch (err: any) {
      console.error('[WhatsAppSession] findByEmail error:', err.message);
      return null;
    }
  }

  /**
   * Obtiene todas las sesiones
   */
  static async getAll(): Promise<WhatsAppSessionRecord[]> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM whatsapp_sessions ORDER BY created_at DESC'
      );
      return results as WhatsAppSessionRecord[];
    } catch (err: any) {
      console.error('[WhatsAppSession] getAll error:', err.message);
      return [];
    }
  }

  /**
   * Crea una nueva sesion
   */
  static async create(email: string): Promise<WhatsAppSessionRecord | null> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO whatsapp_sessions (email, status) VALUES (?, ?)',
        [email, 'disconnected']
      );

      return {
        id: result.insertId,
        email,
        status: 'disconnected',
        phone: null,
        last_connected_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        // Ya existe, retornar la existente
        return this.findByEmail(email);
      }
      console.error('[WhatsAppSession] create error:', err.message);
      return null;
    }
  }

  /**
   * Obtiene o crea una sesion
   */
  static async getOrCreate(email: string): Promise<WhatsAppSessionRecord | null> {
    const existing = await this.findByEmail(email);
    if (existing) return existing;
    return this.create(email);
  }

  /**
   * Actualiza el estado de una sesion
   */
  static async updateStatus(email: string, status: SessionStatus): Promise<boolean> {
    try {
      await pool.execute(
        'UPDATE whatsapp_sessions SET status = ? WHERE email = ?',
        [status, email]
      );
      return true;
    } catch (err: any) {
      console.error('[WhatsAppSession] updateStatus error:', err.message);
      return false;
    }
  }

  /**
   * Actualiza el telefono y estado de una sesion al conectarse
   */
  static async setConnected(email: string, phone: string): Promise<boolean> {
    try {
      await pool.execute(
        `UPDATE whatsapp_sessions
         SET status = 'connected', phone = ?, last_connected_at = NOW()
         WHERE email = ?`,
        [phone, email]
      );
      return true;
    } catch (err: any) {
      console.error('[WhatsAppSession] setConnected error:', err.message);
      return false;
    }
  }

  /**
   * Desconecta una sesion
   */
  static async setDisconnected(email: string): Promise<boolean> {
    try {
      await pool.execute(
        "UPDATE whatsapp_sessions SET status = 'disconnected' WHERE email = ?",
        [email]
      );
      return true;
    } catch (err: any) {
      console.error('[WhatsAppSession] setDisconnected error:', err.message);
      return false;
    }
  }

  /**
   * Elimina una sesion
   */
  static async delete(email: string): Promise<boolean> {
    try {
      await pool.execute('DELETE FROM whatsapp_sessions WHERE email = ?', [email]);
      return true;
    } catch (err: any) {
      console.error('[WhatsAppSession] delete error:', err.message);
      return false;
    }
  }
}

export default WhatsAppSessionModel;
