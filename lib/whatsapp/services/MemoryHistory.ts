/************************************************************
 * lib/whatsapp/services/MemoryHistory.ts
 * Historial temporal en RAM para deteccion de silencios (TypeScript)
 ************************************************************/

import type { HistoryEntry } from '../types';

export class MemoryHistory {
  private limit: number;
  private map: Map<string, HistoryEntry[]>;

  constructor(limitPerPhone: number = 50) {
    this.limit = limitPerPhone;
    this.map = new Map();
  }

  /**
   * Agrega un mensaje al historial
   */
  add(phone: string, dir: 'IN' | 'OUT', text: string, ts: number): void {
    const arr = this.map.get(phone) || [];
    arr.push({ dir, text: String(text || ''), ts: ts || Date.now() });
    while (arr.length > this.limit) arr.shift();
    this.map.set(phone, arr);
  }

  /**
   * Obtiene mensajes recientes de un telefono
   */
  recent(phone: string): HistoryEntry[] {
    return this.map.get(phone) || [];
  }

  /**
   * Obtiene el timestamp del ultimo mensaje entrante
   */
  lastIncomingAt(phone: string): number {
    const arr = this.recent(phone);
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].dir === 'IN') return arr[i].ts;
    }
    return 0;
  }

  /**
   * Obtiene el timestamp del ultimo mensaje saliente
   */
  lastOutgoingAt(phone: string): number {
    const arr = this.recent(phone);
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].dir === 'OUT') return arr[i].ts;
    }
    return 0;
  }

  /**
   * Verifica si hay silencio desde hace cierto tiempo
   */
  isSilentSince(phone: string, msWindow: number): boolean {
    const lastIn = this.lastIncomingAt(phone);
    return Date.now() - lastIn >= msWindow;
  }

  /**
   * Sincroniza con datos persistidos al arrancar
   */
  syncFromPersisted(phone: string, incomingTs: number, outgoingTs: number): void {
    if (!this.map.has(phone)) {
      const arr: HistoryEntry[] = [];
      if (incomingTs > 0) arr.push({ dir: 'IN', text: '[restored]', ts: incomingTs });
      if (outgoingTs > 0) arr.push({ dir: 'OUT', text: '[restored]', ts: outgoingTs });
      if (arr.length > 0) this.map.set(phone, arr);
    }
  }

  /**
   * Limpia el historial de un telefono
   */
  clear(phone: string): void {
    this.map.delete(phone);
  }

  /**
   * Limpia todo el historial
   */
  clearAll(): void {
    this.map.clear();
  }
}

export default MemoryHistory;
