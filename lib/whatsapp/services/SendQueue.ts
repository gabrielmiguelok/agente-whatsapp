/************************************************************
 * lib/whatsapp/services/SendQueue.ts
 * Cola de envio con rate-limit (TypeScript)
 ************************************************************/

import type { WASocket } from '@whiskeysockets/baileys';
import { CONFIG } from '../config';
import { Utils } from '../utils/Utils';
import type { ISendQueue, QueueItem } from '../types';

export class SendQueue implements ISendQueue {
  private sock: WASocket | null;
  private queue: QueueItem[];
  private running: boolean;
  private minDelay: number;

  constructor(sock: WASocket | null = null) {
    this.sock = sock;
    this.queue = [];
    this.running = false;
    this.minDelay = CONFIG.SEND_RATE_MIN_DELAY_MS;
  }

  /**
   * Actualiza el socket
   */
  updateSocket(sock: WASocket | null): void {
    this.sock = sock;
  }

  /**
   * Encola un mensaje de texto para enviar
   */
  sendText(jid: string, text: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        jid,
        text: String(text || '').slice(0, 2000),
        resolve,
        reject,
      });
      this._kick();
    });
  }

  /**
   * Procesa la cola de envio
   */
  private async _kick(): Promise<void> {
    if (this.running) return;
    this.running = true;

    try {
      while (this.queue.length) {
        const item = this.queue.shift()!;
        try {
          if (!this.sock) throw new Error('Socket no disponible');
          await this.sock.sendMessage(item.jid, { text: item.text });
          item.resolve(true);
        } catch (e) {
          item.reject(e as Error);
        }
        await Utils.sleep(this.minDelay);
      }
    } finally {
      this.running = false;
    }
  }

  /**
   * Obtiene el numero de mensajes pendientes
   */
  pending(): number {
    return this.queue.length;
  }

  /**
   * Limpia la cola de envio
   */
  clear(): void {
    for (const item of this.queue) {
      item.reject(new Error('Cola limpiada'));
    }
    this.queue = [];
  }
}

export default SendQueue;
