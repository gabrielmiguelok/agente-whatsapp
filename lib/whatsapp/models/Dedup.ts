/************************************************************
 * lib/whatsapp/models/Dedup.ts
 * Modelo de deduplicacion con cache en memoria y DB (TypeScript)
 ************************************************************/

import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { CONFIG } from '../config';
import type { IDedup } from '../types';

export class Dedup implements IDedup {
  private sessionName: string;
  private maxSize: number;
  private cache: Set<string>;
  private _loaded: boolean;

  constructor(sessionName: string) {
    this.sessionName = sessionName;
    this.maxSize = CONFIG.DEDUP_MAX || 10000;
    this.cache = new Set();
    this._loaded = false;
  }

  /**
   * Carga el cache desde la base de datos
   */
  async load(): Promise<void> {
    if (this._loaded) return;

    try {
      const [results] = await pool.execute<RowDataPacket[]>(
        'SELECT dedup_key FROM dedup_cache WHERE session_name = ? ORDER BY created_at DESC LIMIT ?',
        [this.sessionName, this.maxSize]
      );

      for (const row of results) {
        this.cache.add(row.dedup_key as string);
      }

      this._loaded = true;
      console.log(`[Dedup] Cargados ${this.cache.size} registros del cache`);
    } catch (err: any) {
      console.error('[Dedup] Error al cargar cache:', err.message);
    }
  }

  /**
   * Verifica si una clave ya existe
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Agrega una clave al cache
   */
  async add(key: string): Promise<void> {
    if (!key) return;

    // Agregar al cache en memoria
    this.cache.add(key);

    // Mantener el tamano maximo
    if (this.cache.size > this.maxSize) {
      const toRemove = Array.from(this.cache).slice(0, this.cache.size - this.maxSize);
      for (const k of toRemove) {
        this.cache.delete(k);
      }
    }

    // Persistir en DB (async, no bloquea)
    this._persistKey(key).catch(() => {});
  }

  /**
   * Persiste una clave en la base de datos
   */
  private async _persistKey(key: string): Promise<void> {
    try {
      await pool.execute(
        'INSERT IGNORE INTO dedup_cache (session_name, dedup_key) VALUES (?, ?)',
        [this.sessionName, key]
      );
    } catch (err: any) {
      // Ignorar errores de duplicados
      if (err.code !== 'ER_DUP_ENTRY') {
        console.error('[Dedup] Error al persistir clave:', err.message);
      }
    }
  }

  /**
   * Limpia el cache de una sesion
   */
  static async wipe(sessionName: string): Promise<void> {
    try {
      await pool.execute('DELETE FROM dedup_cache WHERE session_name = ?', [sessionName]);
      console.log(`[Dedup] Cache de sesion "${sessionName}" eliminado`);
    } catch (err: any) {
      console.error('[Dedup] Error al limpiar cache:', err.message);
    }
  }

  /**
   * Limpia registros antiguos (mas de 24h)
   */
  static async cleanup(): Promise<void> {
    try {
      const [result] = await pool.execute<any>(
        'DELETE FROM dedup_cache WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)'
      );
      if (result.affectedRows > 0) {
        console.log(`[Dedup] Limpiados ${result.affectedRows} registros antiguos`);
      }
    } catch (err: any) {
      console.error('[Dedup] Error en cleanup:', err.message);
    }
  }
}

export default Dedup;
