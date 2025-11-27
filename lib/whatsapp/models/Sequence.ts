/************************************************************
 * lib/whatsapp/models/Sequence.ts
 * Modelo de secuencias/triggers (TypeScript)
 * Comparte la misma tabla con el sistema JS
 ************************************************************/

import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import type { Sequence as SequenceType, SequenceStep } from '../types';

export class Sequence {
  /**
   * Carga todas las secuencias activas con sus pasos
   */
  static async loadAll(): Promise<Map<string, string[]>> {
    const triggersMap = new Map<string, string[]>();

    try {
      // Obtener secuencias activas
      const [sequences] = await pool.execute<RowDataPacket[]>(
        'SELECT id, trigger_keyword FROM sequences WHERE active = TRUE'
      );

      if (sequences.length === 0) {
        console.log('[Sequence] No se encontraron secuencias activas');
        return triggersMap;
      }

      // Obtener pasos de todas las secuencias
      const sequenceIds = sequences.map((s) => s.id);
      const placeholders = sequenceIds.map(() => '?').join(',');

      const [steps] = await pool.execute<RowDataPacket[]>(
        `SELECT sequence_id, step_number, message_text
         FROM sequence_steps
         WHERE sequence_id IN (${placeholders})
         ORDER BY sequence_id, step_number`,
        sequenceIds
      );

      // Agrupar pasos por secuencia
      const stepsBySequence = new Map<number, string[]>();
      for (const step of steps) {
        const seqId = step.sequence_id as number;
        if (!stepsBySequence.has(seqId)) {
          stepsBySequence.set(seqId, []);
        }
        stepsBySequence.get(seqId)!.push(step.message_text as string);
      }

      // Construir el mapa final
      for (const seq of sequences) {
        const stepsArray = stepsBySequence.get(seq.id as number) || [];
        if (stepsArray.length > 0) {
          triggersMap.set(seq.trigger_keyword as string, stepsArray);
        }
      }

      console.log(`[Sequence] Cargadas ${triggersMap.size} secuencia(s) activas`);
      return triggersMap;
    } catch (err: any) {
      console.error('[Sequence] loadAll error:', err.message);
      return triggersMap;
    }
  }

  /**
   * Crea una nueva secuencia con sus pasos
   */
  static async create(
    triggerKeyword: string,
    steps: string[]
  ): Promise<{ success: boolean; id?: number }> {
    if (!triggerKeyword || !steps || steps.length === 0) {
      return { success: false };
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Crear secuencia
      const [seqResult] = await connection.execute<ResultSetHeader>(
        'INSERT INTO sequences (trigger_keyword, active) VALUES (?, TRUE)',
        [triggerKeyword]
      );
      const sequenceId = seqResult.insertId;

      // Crear pasos
      for (let i = 0; i < steps.length; i++) {
        await connection.execute(
          'INSERT INTO sequence_steps (sequence_id, step_number, message_text) VALUES (?, ?, ?)',
          [sequenceId, i + 1, steps[i]]
        );
      }

      await connection.commit();
      console.log(`[Sequence] Creada secuencia "${triggerKeyword}" con ${steps.length} pasos`);
      return { success: true, id: sequenceId };
    } catch (err: any) {
      await connection.rollback();
      console.error('[Sequence] create error:', err.message);
      return { success: false };
    } finally {
      connection.release();
    }
  }

  /**
   * Actualiza los pasos de una secuencia existente
   */
  static async updateSteps(sequenceId: number, steps: string[]): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Eliminar pasos existentes
      await connection.execute('DELETE FROM sequence_steps WHERE sequence_id = ?', [sequenceId]);

      // Crear nuevos pasos
      for (let i = 0; i < steps.length; i++) {
        await connection.execute(
          'INSERT INTO sequence_steps (sequence_id, step_number, message_text) VALUES (?, ?, ?)',
          [sequenceId, i + 1, steps[i]]
        );
      }

      await connection.commit();
      return true;
    } catch (err: any) {
      await connection.rollback();
      console.error('[Sequence] updateSteps error:', err.message);
      return false;
    } finally {
      connection.release();
    }
  }

  /**
   * Activa o desactiva una secuencia
   */
  static async setActive(sequenceId: number, active: boolean): Promise<boolean> {
    try {
      await pool.execute('UPDATE sequences SET active = ? WHERE id = ?', [active, sequenceId]);
      return true;
    } catch (err: any) {
      console.error('[Sequence] setActive error:', err.message);
      return false;
    }
  }

  /**
   * Obtiene una secuencia por su trigger keyword
   */
  static async findByTrigger(triggerKeyword: string): Promise<SequenceType | null> {
    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM sequences WHERE trigger_keyword = ? LIMIT 1',
        [triggerKeyword]
      );
      return results.length > 0 ? (results[0] as SequenceType) : null;
    } catch (err: any) {
      console.error('[Sequence] findByTrigger error:', err.message);
      return null;
    }
  }

  /**
   * Elimina una secuencia y sus pasos
   */
  static async delete(sequenceId: number): Promise<boolean> {
    try {
      await pool.execute('DELETE FROM sequences WHERE id = ?', [sequenceId]);
      return true;
    } catch (err: any) {
      console.error('[Sequence] delete error:', err.message);
      return false;
    }
  }
}

export default Sequence;
