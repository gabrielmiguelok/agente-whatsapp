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
      // Buscar exacto primero
      let [results] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM contacts WHERE phone = ? LIMIT 1',
        [phoneDigits]
      );

      if (results.length > 0) return results[0] as ContactType;

      // Buscar por contenido (ultimos digitos)
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
      // Intentar encontrar existente
      let contact = await this.findByPhone(phoneDigits);
      if (contact) {
        console.log(`[Contact] Contacto EXISTE: ${phoneDigits} (id: ${contact.id})`);
        return { contact, created: false };
      }

      // Crear nuevo
      console.log(`[Contact] Creando nuevo contacto: ${phoneDigits}`);
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO contacts (phone, name, action_status, sequence_status, instance_email, seguimiento)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [phoneDigits, '', 'PENDIENTE', 'NO INICIADA', instanceEmail || null, 'SEGUIMIENTO 1']
      );

      contact = {
        id: result.insertId,
        phone: phoneDigits,
        name: '',
        action_status: 'PENDIENTE',
        sequence_status: 'NO INICIADA',
        message_to_send: null,
        seguimiento: 'SEGUIMIENTO 1',
        email: null,
        accion: null,
        zona: null,
        presupuesto: null,
        instance_email: instanceEmail || null,
        created_at: new Date(),
        updated_at: new Date(),
      } as ContactType;

      console.log(`[Contact] Contacto CREADO: ${phoneDigits} (id: ${contact.id})`);
      return { contact, created: true };
    } catch (err: any) {
      // Si es error de duplicado, intentar obtener el existente
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
   * Obtiene contactos con accion ENVIAR
   */
  static async getContactsToSend(limit = 50): Promise<ContactType[]> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM contacts
         WHERE action_status = ? AND message_to_send IS NOT NULL AND message_to_send != ?
         LIMIT ?`,
        ['ENVIAR', '', limit]
      );
      return results as ContactType[];
    } catch (err: any) {
      console.error('[Contact] getContactsToSend error:', err.message);
      return [];
    }
  }

  /**
   * Actualiza el estado de accion de un contacto
   */
  static async setActionStatus(contactId: number, status: string): Promise<boolean> {
    try {
      await pool.execute('UPDATE contacts SET action_status = ? WHERE id = ?', [status, contactId]);
      return true;
    } catch (err: any) {
      console.error('[Contact] setActionStatus error:', err.message);
      return false;
    }
  }

  /**
   * Obtiene contactos con secuencia INICIAR
   */
  static async getContactsToStartSequence(limit = 50): Promise<ContactType[]> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM contacts WHERE sequence_status = ? LIMIT ?',
        ['INICIAR', limit]
      );
      return results as ContactType[];
    } catch (err: any) {
      console.error('[Contact] getContactsToStartSequence error:', err.message);
      return [];
    }
  }

  /**
   * Actualiza el estado de secuencia de un contacto
   */
  static async setSequenceStatus(contactId: number, status: string): Promise<boolean> {
    try {
      await pool.execute('UPDATE contacts SET sequence_status = ? WHERE id = ?', [status, contactId]);
      return true;
    } catch (err: any) {
      console.error('[Contact] setSequenceStatus error:', err.message);
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
   * Actualiza la zona de un contacto
   */
  static async updateZona(phoneDigits: string, zona: string): Promise<boolean> {
    try {
      await pool.execute('UPDATE contacts SET zona = ? WHERE phone = ?', [zona, phoneDigits]);
      console.log(`[Contact] Zona actualizada para ${phoneDigits}: ${zona}`);
      return true;
    } catch (err: any) {
      console.error('[Contact] updateZona error:', err.message);
      return false;
    }
  }

  /**
   * Actualiza la accion de un contacto (COMPRA/ALQUILER)
   */
  static async updateAccion(phoneDigits: string, accion: string): Promise<boolean> {
    try {
      await pool.execute('UPDATE contacts SET accion = ? WHERE phone = ?', [accion, phoneDigits]);
      console.log(`[Contact] Accion actualizada para ${phoneDigits}: ${accion}`);
      return true;
    } catch (err: any) {
      console.error('[Contact] updateAccion error:', err.message);
      return false;
    }
  }

  /**
   * Actualiza el presupuesto de un contacto
   */
  static async updatePresupuesto(phoneDigits: string, presupuesto: number): Promise<boolean> {
    try {
      await pool.execute('UPDATE contacts SET presupuesto = ? WHERE phone = ?', [presupuesto, phoneDigits]);
      console.log(`[Contact] Presupuesto actualizado para ${phoneDigits}: ${presupuesto}`);
      return true;
    } catch (err: any) {
      console.error('[Contact] updatePresupuesto error:', err.message);
      return false;
    }
  }

  /**
   * Actualiza multiples campos de un contacto de una vez
   */
  static async updateFields(
    phoneDigits: string,
    fields: Partial<{ zona: string; accion: string; presupuesto: number }>
  ): Promise<boolean> {
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (fields.zona !== undefined) {
      updates.push('zona = ?');
      values.push(fields.zona);
    }
    if (fields.accion !== undefined) {
      updates.push('accion = ?');
      values.push(fields.accion);
    }
    if (fields.presupuesto !== undefined) {
      updates.push('presupuesto = ?');
      values.push(fields.presupuesto);
    }

    if (updates.length === 0) return true;

    try {
      values.push(phoneDigits);
      await pool.execute(`UPDATE contacts SET ${updates.join(', ')} WHERE phone = ?`, values);
      console.log(`[Contact] Campos actualizados para ${phoneDigits}:`, fields);
      return true;
    } catch (err: any) {
      console.error('[Contact] updateFields error:', err.message);
      return false;
    }
  }

  /**
   * Actualiza un campo dinámico de un contacto (para campos configurables)
   * @param phoneDigits - Número de teléfono
   * @param columnName - Nombre de la columna en la DB
   * @param value - Valor a guardar
   */
  static async updateDynamicField(
    phoneDigits: string,
    columnName: string,
    value: string | number | null
  ): Promise<boolean> {
    const ALLOWED_COLUMNS = [
      'zona', 'accion', 'presupuesto', 'name', 'email',
      'seguimiento', 'action_status', 'sequence_status', 'message_to_send',
    ];

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
