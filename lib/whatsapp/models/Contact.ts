/************************************************************
 * lib/whatsapp/models/Contact.ts
 * Modelo de contactos (TypeScript)
 ************************************************************/

import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { Contact as ContactType } from '../types';

export class Contact {
  /**
   * Busca un contacto por numero de telefono
   */
  static async findByPhone(phoneDigits: string): Promise<ContactType | null> {
    if (!phoneDigits || phoneDigits.length < 8) return null;

    try {
      let [results] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM contacts WHERE phone = ? LIMIT 1',
        [phoneDigits]
      );

      if (results.length > 0) return results[0] as ContactType;

      [results] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM contacts WHERE phone LIKE ? ORDER BY LENGTH(phone) DESC LIMIT 1',
        [`%${phoneDigits.slice(-8)}`]
      );

      return results.length > 0 ? (results[0] as ContactType) : null;
    } catch (err: any) {
      console.error('[Contact] findByPhone error:', err.message);
      return null;
    }
  }

  /**
   * Obtiene o crea un contacto
   */
  static async getOrCreate(
    phoneDigits: string,
    instanceEmail?: string | null
  ): Promise<{ contact: ContactType | null; created: boolean }> {
    if (!phoneDigits || phoneDigits.length < 8) {
      console.error('[Contact] Telefono invalido:', phoneDigits);
      return { contact: null, created: false };
    }

    try {
      let contact = await this.findByPhone(phoneDigits);
      if (contact) {
        console.log(`[Contact] Contacto EXISTE: ${phoneDigits} (id: ${contact.id})`);
        return { contact, created: false };
      }

      console.log(`[Contact] Creando nuevo contacto: ${phoneDigits}`);
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO contacts (phone, name, instance_email, seguimiento)
         VALUES (?, ?, ?, ?)`,
        [phoneDigits, '', instanceEmail || null, 'SEGUIMIENTO 1']
      );

      contact = {
        id: result.insertId,
        phone: phoneDigits,
        name: '',
        seguimiento: 'SEGUIMIENTO 1',
        email: null,
        instance_email: instanceEmail || null,
        created_at: new Date(),
        updated_at: new Date(),
      } as ContactType;

      console.log(`[Contact] Contacto CREADO: ${phoneDigits} (id: ${contact.id})`);
      return { contact, created: true };
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        const contact = await this.findByPhone(phoneDigits);
        return { contact, created: false };
      }
      console.error('[Contact] Error en getOrCreate:', err.message);
      return { contact: null, created: false };
    }
  }

  /**
   * Obtiene el nombre de un contacto por ID
   */
  static async getNameById(contactId: number): Promise<string> {
    if (!contactId) return '';
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT name FROM contacts WHERE id = ?',
        [contactId]
      );
      return results.length > 0 ? (results[0].name || '') : '';
    } catch (err: any) {
      console.error('[Contact] getNameById error:', err.message);
      return '';
    }
  }

  /**
   * Actualiza el nombre de un contacto
   */
  static async updateName(contactId: number, name: string): Promise<boolean> {
    try {
      await pool.execute('UPDATE contacts SET name = ? WHERE id = ?', [name, contactId]);
      return true;
    } catch (err: any) {
      console.error('[Contact] updateName error:', err.message);
      return false;
    }
  }

  /**
   * Verifica si un contacto tiene mas de 1 dia de creacion
   */
  static isOlderThanOneDay(contact: ContactType | null): boolean {
    if (!contact || !contact.created_at) return false;

    try {
      const createdAt = new Date(contact.created_at);
      if (isNaN(createdAt.getTime())) return false;

      const ageMs = Date.now() - createdAt.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;

      return ageMs > oneDayMs;
    } catch (err: any) {
      console.error('[Contact] isOlderThanOneDay error:', err.message);
      return false;
    }
  }

  /**
   * Actualiza un campo dinámico de un contacto
   */
  static async updateDynamicField(
    phoneDigits: string,
    columnName: string,
    value: string | number | null
  ): Promise<boolean> {
    try {
      const [columns] = await pool.execute<RowDataPacket[]>(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'contacts'`
      );
      const validColumns = (columns as any[]).map(c => c.COLUMN_NAME.toLowerCase());

      const colLower = columnName.toLowerCase();
      if (!validColumns.includes(colLower)) {
        console.error(`[Contact] Columna inválida: ${columnName}`);
        return false;
      }

      const safeColumn = columnName.replace(/[^a-zA-Z0-9_]/g, '');

      await pool.execute(
        `UPDATE contacts SET \`${safeColumn}\` = ? WHERE phone = ?`,
        [value, phoneDigits]
      );
      console.log(`[Contact] Campo ${safeColumn} actualizado para ${phoneDigits}: ${value}`);
      return true;
    } catch (err: any) {
      console.error(`[Contact] updateDynamicField error (${columnName}):`, err.message);
      return false;
    }
  }
}

export default Contact;
