/************************************************************
 * lib/whatsapp/services/SequenceEngine.ts
 * Motor de secuencias automaticas (TypeScript)
 ************************************************************/

import { CONFIG } from '../config';
import { Utils } from '../utils/Utils';
import { SequenceLog } from '../models/SequenceLog';
import { MemoryHistory } from './MemoryHistory';
import { ContactValidator } from './ContactValidator';
import type { ISequenceEngine, ISendQueue, Contact, TriggerMatch } from '../types';

export class SequenceEngine implements ISequenceEngine {
  private sendQueue: ISendQueue;
  public triggers: Map<string, string[]>;
  private sessionName: string;
  private history: MemoryHistory;
  private activeTimers: Map<string, NodeJS.Timeout>;
  private validator: ContactValidator;
  private _manualCallbacks: Map<string, (phone: string) => Promise<void>>;

  constructor(
    sendQueue: ISendQueue,
    triggersMap: Map<string, string[]>,
    sessionName: string,
    contactValidator?: ContactValidator
  ) {
    this.sendQueue = sendQueue;
    this.triggers = triggersMap;
    this.sessionName = sessionName;
    this.history = new MemoryHistory(50);
    this.activeTimers = new Map();
    this.validator = contactValidator || new ContactValidator();
    this._manualCallbacks = new Map();
  }

  /**
   * Divide texto enumerado en segmentos
   */
  static splitEnumeratedSegments(text: string): string[] {
    const raw = String(text || '').trim();
    if (!raw) return [];
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const numbered: string[] = [];
    for (const line of lines) {
      const m = line.match(/^\s*(\d+)\.\s+(.+)$/);
      if (m) numbered.push(m[2].trim());
    }
    return numbered.length >= 1 ? numbered : [raw];
  }

  /**
   * Normaliza texto para matching flexible
   */
  private _normalizeTextForMatching(text: string): string {
    let normalized = String(text || '').trim().toLowerCase();

    // Quitar URLs
    normalized = normalized.replace(/https?:\/\/[^\s]+/gi, '');
    normalized = normalized.replace(/ftp:\/\/[^\s]+/gi, '');
    normalized = normalized.replace(/www\.[^\s]+/gi, '');

    // Quitar dominios
    normalized = normalized.replace(
      /\b[a-z0-9.-]+\.(com|net|org|me|ly|co|io|app|link|ar|cl|mx|es|br|pe|uy|py|ve|bo|ec|gt|hn|sv|ni|cr|pa|do|cu|pr|us|uk|de|fr|it|ru|cn|jp|in|au|nz|za|ca|info|biz)\/[^\s]*/gi,
      ''
    );

    // Quitar marcadores de WhatsApp y Meta Ads
    normalized = normalized.replace(/wa\.me\/[^\s]*/gi, '');
    normalized = normalized.replace(/api\.whatsapp\.com\/[^\s]*/gi, '');
    normalized = normalized.replace(/m\.me\/[^\s]*/gi, '');
    normalized = normalized.replace(/fb\.me\/[^\s]*/gi, '');
    normalized = normalized.replace(/bit\.ly\/[^\s]*/gi, '');
    normalized = normalized.replace(/tinyurl\.com\/[^\s]*/gi, '');

    // Quitar emojis
    normalized = normalized.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
    normalized = normalized.replace(/[\u{1F300}-\u{1F5FF}]/gu, '');
    normalized = normalized.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');
    normalized = normalized.replace(/[\u{1F900}-\u{1F9FF}]/gu, '');
    normalized = normalized.replace(/[\u{2600}-\u{26FF}]/gu, '');
    normalized = normalized.replace(/[\u{2700}-\u{27BF}]/gu, '');
    normalized = normalized.replace(/[\u{FE00}-\u{FE0F}]/gu, '');
    normalized = normalized.replace(/[\u{200D}]/gu, '');

    // Quitar caracteres especiales
    normalized = normalized.replace(/[*#|_~`\u2022\u2023\u2043]/g, ' ');
    normalized = normalized.replace(/[➡️➜→⇒⟶⟹▶️▸►➤➥]/g, ' ');
    normalized = normalized.replace(/[✓✔️✅✗✘❌]/g, ' ');
    normalized = normalized.replace(/[★☆⭐]/g, ' ');
    normalized = normalized.replace(/[\[\](){}⟨⟩«»‹›""'']/g, ' ');

    // Limpiar espacios
    normalized = normalized.replace(/\.{2,}/g, ' ');
    normalized = normalized.replace(/\-{2,}/g, ' ');
    normalized = normalized.replace(/_{2,}/g, ' ');
    normalized = normalized.replace(/[\r\n\t]+/g, ' ');
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
  }

  /**
   * Busca un trigger que coincida con el texto
   */
  private _findMatchingTrigger(incomingText: string): TriggerMatch | null {
    if (!incomingText || !incomingText.trim()) {
      return null;
    }

    const normalized = this._normalizeTextForMatching(incomingText);
    console.log(`[SEQ] Buscando trigger en: "${incomingText}" -> normalizado: "${normalized}"`);

    // 1. Match exacto
    const exactMatch = this.triggers.get(incomingText.trim());
    if (exactMatch) {
      console.log(`[SEQ] Match EXACTO: "${incomingText.trim()}"`);
      return { trigger: incomingText.trim(), steps: exactMatch };
    }

    // 2. Match exacto normalizado
    const normalizedExactMatch = this.triggers.get(normalized);
    if (normalizedExactMatch) {
      console.log(`[SEQ] Match EXACTO (normalizado): "${normalized}"`);
      return { trigger: normalized, steps: normalizedExactMatch };
    }

    // 3. Match por substring
    let bestMatch: TriggerMatch | null = null;
    let bestMatchLength = 0;

    for (const [triggerKey, steps] of this.triggers.entries()) {
      const normalizedTrigger = this._normalizeTextForMatching(triggerKey);
      if (!normalizedTrigger || normalizedTrigger.length < 2) continue;

      // Substring
      if (normalized.includes(normalizedTrigger)) {
        if (normalizedTrigger.length > bestMatchLength) {
          bestMatch = { trigger: triggerKey, steps };
          bestMatchLength = normalizedTrigger.length;
          if (CONFIG.VERBOSE) console.log(`[SEQ] Match por SUBSTRING: "${triggerKey}"`);
        }
        continue;
      }

      // Palabra completa
      try {
        const escapedTrigger = normalizedTrigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedTrigger}\\b`, 'i');
        if (regex.test(normalized)) {
          if (normalizedTrigger.length > bestMatchLength) {
            bestMatch = { trigger: triggerKey, steps };
            bestMatchLength = normalizedTrigger.length;
            if (CONFIG.VERBOSE) console.log(`[SEQ] Match por PALABRA COMPLETA: "${triggerKey}"`);
          }
          continue;
        }
      } catch {}

      // Fuzzy matching (70%)
      const triggerWords = normalizedTrigger.split(/\s+/).filter((w) => w.length >= 2);
      const messageWords = normalized.split(/\s+/).filter((w) => w.length >= 2);

      if (triggerWords.length > 0) {
        let matchedWords = 0;
        for (const tw of triggerWords) {
          if (messageWords.some((mw) => mw.includes(tw) || tw.includes(mw))) {
            matchedWords++;
          }
        }
        const matchRatio = matchedWords / triggerWords.length;
        if (matchRatio >= 0.7 && normalizedTrigger.length > bestMatchLength) {
          bestMatch = { trigger: triggerKey, steps };
          bestMatchLength = normalizedTrigger.length;
          if (CONFIG.VERBOSE)
            console.log(`[SEQ] Match FUZZY (${Math.round(matchRatio * 100)}%): "${triggerKey}"`);
        }
      }
    }

    if (bestMatch) {
      console.log(`[SEQ] Match ENCONTRADO: "${bestMatch.trigger}" con ${bestMatch.steps.length} pasos`);
      return bestMatch;
    }

    console.log(`[SEQ] NO se encontro match para: "${incomingText}"`);
    return null;
  }

  /**
   * Limpia el timer de un telefono
   */
  private _clearTimer(phone: string): void {
    if (this.activeTimers.has(phone)) {
      clearTimeout(this.activeTimers.get(phone)!);
      this.activeTimers.delete(phone);
    }
  }

  /**
   * Verifica si necesita esperar silencio
   */
  private _mustWaitSilence(stepIndex: number): boolean {
    return stepIndex > 0;
  }

  /**
   * Sincroniza historial desde persistencia
   */
  private async _ensureSyncedHistory(phone: string): Promise<void> {
    const lastInTs = await SequenceLog.getLastIncomingTs(phone);
    const lastOutTs = await SequenceLog.getLastOutgoingTs(phone);
    this.history.syncFromPersisted(phone, lastInTs, lastOutTs);
  }

  /**
   * Verifica si hay silencio suficiente
   */
  private async _hasSufficientSilence(phone: string): Promise<boolean> {
    await this._ensureSyncedHistory(phone);

    const lastInTsLogger = (await SequenceLog.getLastIncomingTs(phone)) || 0;
    const lastOutTsLogger = (await SequenceLog.getLastOutgoingTs(phone)) || 0;
    const lastInTsMemory = this.history.lastIncomingAt(phone) || 0;
    const lastOutTsMemory = this.history.lastOutgoingAt(phone) || 0;

    const lastInTs = Math.max(lastInTsLogger, lastInTsMemory);
    const lastOutTs = Math.max(lastOutTsLogger, lastOutTsMemory);

    // Debe haber mensaje entrante despues del ultimo saliente
    if (lastInTs <= lastOutTs) {
      if (CONFIG.VERBOSE) console.log(`[SEQ] ${phone}: esperando msg entrante`);
      return false;
    }

    // Verificar tiempo de silencio
    const silenceMs = Date.now() - lastInTs;
    const needed = CONFIG.WAIT_SILENCE_MS;

    if (silenceMs < needed) {
      if (CONFIG.VERBOSE)
        console.log(
          `[SEQ] ${phone}: silencio insuficiente (${Math.round(silenceMs / 1000)}s/${Math.round(needed / 1000)}s)`
        );
      return false;
    }

    return true;
  }

  /**
   * Programa el siguiente paso si hay silencio
   */
  private _scheduleNextIfQuiet(phone: string): void {
    this._clearTimer(phone);

    const check = async () => {
      const currentState = await SequenceLog.getContact(phone);
      if (!currentState || currentState.status !== 'active') {
        this._clearTimer(phone);
        return;
      }

      const stepIndex = currentState.current_step;

      // Para pasos 2+, verificar silencio
      if (this._mustWaitSilence(stepIndex)) {
        const hasSilence = await this._hasSufficientSilence(phone);
        if (!hasSilence) {
          const timer = setTimeout(check, 1000);
          this.activeTimers.set(phone, timer);
          timer.unref?.();
          return;
        }
      }

      // Enviar paso actual
      await this._sendCurrentStep(phone);

      // Si sigue activa, programar siguiente verificacion
      const finalState = await SequenceLog.getContact(phone);
      if (finalState && finalState.status === 'active') {
        const timer = setTimeout(() => this._scheduleNextIfQuiet(phone), 200);
        this.activeTimers.set(phone, timer);
        timer.unref?.();
      }
    };

    const initialDelay = 10;
    const timer = setTimeout(check, initialDelay);
    this.activeTimers.set(phone, timer);
    timer.unref?.();
  }

  /**
   * Procesa un mensaje entrante
   */
  async onIncomingMessage(
    phoneDigits: string,
    text: string,
    tsMs: number,
    contact: Contact | null = null
  ): Promise<void> {
    if (!phoneDigits) return;
    this.history.add(phoneDigits, 'IN', text, tsMs || Date.now());

    // Persistir mensaje
    try {
      await SequenceLog.recordIncoming(phoneDigits, text, tsMs || Date.now());
    } catch (e: any) {
      console.error('[SEQ] error al persistir incoming:', e?.message || e);
    }

    const contactState = await SequenceLog.getContact(phoneDigits);

    // Si esta activa, solo re-programar
    if (contactState?.status === 'active') {
      this._scheduleNextIfQuiet(phoneDigits);
      return;
    }

    // Verificar elegibilidad
    if (!this.validator.isEligibleForAutoSequence(contact)) {
      console.log(`[SEQ] ${phoneDigits}: Contacto NO es elegible (mas de 1 dia de creacion)`);
      return;
    }

    // Verificar en ultimos 2 mensajes
    const recentMessages = this.history.recent(phoneDigits);
    const lastTwoIncoming = recentMessages.filter((m) => m.dir === 'IN').slice(-2);

    if (CONFIG.VERBOSE) {
      console.log(`[SEQ] ${phoneDigits}: Historial reciente: ${recentMessages.length} mensajes`);
    }

    // Buscar trigger
    const matchResult = this._findMatchingTrigger(text);
    if (!matchResult || !matchResult.steps || matchResult.steps.length === 0) {
      if (CONFIG.VERBOSE) console.log(`[SEQ] ${phoneDigits}: no coincide con ningun disparador`);
      return;
    }

    // Verificar trigger en ultimos 2 mensajes
    const triggerInLastTwo = lastTwoIncoming.some((msg) => {
      const msgMatch = this._findMatchingTrigger(msg.text);
      return msgMatch && msgMatch.trigger === matchResult.trigger;
    });

    if (!triggerInLastTwo) {
      console.log(`[SEQ] ${phoneDigits}: Trigger detectado pero NO esta en ultimos 2 mensajes`);
      return;
    }

    // Activar secuencia
    await SequenceLog.startSequence(phoneDigits, matchResult.trigger, matchResult.steps);
    console.log(`[SEQ] Iniciada para ${phoneDigits} con trigger="${matchResult.trigger}"`);

    await Utils.sleep(CONFIG.FIRST_STEP_START_DELAY_MS);
    await this._sendCurrentStep(phoneDigits);

    const finalState = await SequenceLog.getContact(phoneDigits);
    if (finalState && finalState.status === 'active') {
      this._scheduleNextIfQuiet(phoneDigits);
    }
  }

  /**
   * Envia el paso actual de una secuencia
   */
  private async _sendCurrentStep(phone: string): Promise<void> {
    const contactState = await SequenceLog.getContact(phone);
    if (!contactState || contactState.status !== 'active') return;
    if (contactState.current_step >= contactState.total_steps) {
      await this._finishSequence(phone);
      return;
    }

    const triggerKey = contactState.trigger_keyword;
    const sequenceSteps = triggerKey ? this.triggers.get(triggerKey) : null;
    if (!sequenceSteps) {
      console.error(`[SEQ] Error: no se encontro secuencia para "${triggerKey}"`);
      await this._finishSequence(phone);
      return;
    }

    try {
      const jid = `${phone}@s.whatsapp.net`;
      const textToSend = sequenceSteps[contactState.current_step] || '';
      const parts = SequenceEngine.splitEnumeratedSegments(textToSend);

      for (let i = 0; i < parts.length; i++) {
        const chunk = parts[i].slice(0, 2000);
        if (CONFIG.VERBOSE)
          console.log(`[SEND] -> ${phone}: "${chunk.slice(0, 80)}${chunk.length > 80 ? '...' : ''}"`);
        await this.sendQueue.sendText(jid, chunk);
        this.history.add(phone, 'OUT', chunk, Date.now());
        if (i < parts.length - 1) await Utils.sleep(CONFIG.BETWEEN_SUB_MS);
      }

      await SequenceLog.advanceStep(phone, textToSend);

      const newState = await SequenceLog.getContact(phone);
      if (newState && newState.current_step >= newState.total_steps) {
        await this._finishSequence(phone);
      }
    } catch (e: any) {
      console.error(`[SEQ] Error enviando a ${phone}:`, e?.message || e);
    }
  }

  /**
   * Finaliza una secuencia
   */
  private async _finishSequence(phone: string): Promise<void> {
    this._clearTimer(phone);
    await SequenceLog.finishSequence(phone);
    console.log(`[SEQ] Finalizada para ${phone}`);

    const callback = this._manualCallbacks?.get(phone);
    if (callback) {
      await callback(phone).catch((e: any) =>
        console.error('[SEQ-MANUAL] Error en callback:', e?.message || e)
      );
      this._manualCallbacks.delete(phone);
    }
  }

  /**
   * Inicia una secuencia manual
   */
  async startManualSequence(
    phoneDigits: string,
    triggerKey: string,
    onComplete: ((phone: string) => Promise<void>) | null = null
  ): Promise<boolean> {
    if (!phoneDigits || !triggerKey) {
      console.error('[SEQ-MANUAL] phoneDigits o triggerKey vacios');
      return false;
    }

    const sequenceSteps = this.triggers.get(triggerKey);
    if (!sequenceSteps || sequenceSteps.length === 0) {
      console.error(`[SEQ-MANUAL] No se encontro secuencia para trigger="${triggerKey}"`);
      return false;
    }

    // Cancelar secuencia activa si existe
    const contactState = await SequenceLog.getContact(phoneDigits);
    if (contactState?.status === 'active') {
      console.log(`[SEQ-MANUAL] Cancelando secuencia activa para ${phoneDigits}`);
      this._clearTimer(phoneDigits);
      await SequenceLog.finishSequence(phoneDigits);
    }

    // Iniciar nueva secuencia
    await SequenceLog.startSequence(phoneDigits, triggerKey, sequenceSteps);
    console.log(`[SEQ-MANUAL] Iniciando secuencia para ${phoneDigits} con trigger="${triggerKey}"`);

    // Guardar callback
    if (onComplete) {
      this._manualCallbacks.set(phoneDigits, onComplete);
    }

    await Utils.sleep(CONFIG.FIRST_STEP_START_DELAY_MS);
    await this._sendCurrentStep(phoneDigits);

    const finalState = await SequenceLog.getContact(phoneDigits);
    if (finalState && finalState.status === 'active') {
      this._scheduleNextIfQuiet(phoneDigits);
    } else {
      if (onComplete) {
        await onComplete(phoneDigits).catch((e: any) =>
          console.error('[SEQ-MANUAL] Error:', e?.message || e)
        );
        this._manualCallbacks.delete(phoneDigits);
      }
    }

    return true;
  }
}

export default SequenceEngine;
