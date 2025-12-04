/************************************************************
 * lib/whatsapp/services/AIConversation.ts
 * Motor de conversación inteligente con GPT - VERSIÓN ROBUSTA
 *
 * Objetivo: Obtener datos configurables del cliente de forma
 * natural y conversacional, usando prompts personalizables.
 ************************************************************/

import { Utils } from '../utils/Utils';
import { Contact } from '../models/Contact';
import { loadPromptConfig, invalidateCache, getPromptConfig } from './PromptConfigService';
import {
  decideTrigger,
  isIgnored,
  removeFromIgnored,
  addToIgnored,
  invalidateCache as invalidateTriggerCache,
} from './TriggerDecisionService';
import type {
  IAIConversation,
  ISendQueue,
  AIConversationOptions,
  ConversationState,
  AIAnalysisResult,
  Contact as ContactType,
} from '../types';
import type { PromptConfig, MissionField } from '../types/promptConfig';

export class AIConversation implements IAIConversation {
  private sendQueue: ISendQueue;
  private apiKey: string;
  private model: string;
  private baseURL: string;
  private assistantName: string;
  private allowedPhones: string[];
  private triggerKeyword: string;
  private conversations: Map<string, ConversationState>;
  private lastMessageSent: Map<string, number>;
  private processingLock: Map<string, boolean>;
  private promptConfig: PromptConfig | null = null;

  // Configuración de timing
  private MIN_DELAY_MS = 2500;
  private TYPING_DELAY_MS = 1500;
  private CONVERSATION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

  // Buffer de mensajes para agrupar múltiples mensajes antes de responder
  private messageBuffer: Map<string, { messages: string[]; timer: NodeJS.Timeout | null }> = new Map();
  private BUFFER_WAIT_MS = 10000; // Esperar 10 segundos de silencio antes de responder

  constructor(sendQueue: ISendQueue, openaiApiKey: string, options: AIConversationOptions = {}) {
    this.sendQueue = sendQueue;
    this.apiKey = openaiApiKey;
    this.model = options.model || 'gpt-4o-mini';
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
    this.assistantName = options.assistantName || 'Ana';
    this.allowedPhones = options.allowedPhones || [];
    this.triggerKeyword = options.triggerKeyword || 'hola';
    this.conversations = new Map();
    this.lastMessageSent = new Map();
    this.processingLock = new Map();

    // Cargar configuración inicial
    this._loadConfig();

    console.log('[AI-CONV] Motor de conversación ROBUSTO inicializado');
    console.log(`[AI-CONV] Asistente: ${this.assistantName}`);
  }

  /**
   * Carga la configuración de prompts desde la DB
   */
  private async _loadConfig(): Promise<void> {
    try {
      this.promptConfig = await loadPromptConfig();
      this.assistantName = this.promptConfig.assistant_name;
      console.log('[AI-CONV] Configuración de prompts cargada');
    } catch (error) {
      console.error('[AI-CONV] Error cargando config, usando defaults:', error);
    }
  }

  /**
   * Recarga la configuración de prompts (llamado desde API)
   */
  async reloadConfig(): Promise<void> {
    invalidateCache();
    invalidateTriggerCache();
    await this._loadConfig();
    console.log('[AI-CONV] Configuración y cache de triggers recargados');
  }

  /**
   * Obtiene la configuración actual
   */
  private _getConfig(): PromptConfig {
    return this.promptConfig || getPromptConfig();
  }

  /**
   * Llama a la API de OpenAI
   */
  private async _callGPT(
    messages: Array<{ role: string; content: string }>,
    temperature = 0.7,
    maxTokens = 300
  ): Promise<string | null> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        console.error('[AI-CONV] Error API:', await response.text());
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (err: any) {
      console.error('[AI-CONV] Error GPT:', err.message);
      return null;
    }
  }

  /**
   * Normaliza texto para comparaciones
   */
  private _normalize(text: string): string {
    return String(text || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Verifica si un teléfono está habilitado
   */
  isEligible(phone: string): boolean {
    if (this.allowedPhones.length === 0) return true;
    return this.allowedPhones.some((p) => phone.includes(p) || p.includes(phone));
  }

  /**
   * Verifica si es el trigger de inicio (versión simple síncrona - fallback)
   * @deprecated Usar shouldStartConversation() para decisión con IA
   */
  isTrigger(text: string): boolean {
    const normalized = this._normalize(text);
    const triggers = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'buen dia', 'hi', 'hello'];
    return triggers.some(t => normalized.includes(t));
  }

  /**
   * Verifica si un contacto está en la lista de ignorados
   */
  async isContactIgnored(phone: string): Promise<boolean> {
    return isIgnored(phone);
  }

  /**
   * Remueve un contacto de la lista de ignorados
   */
  async removeContactFromIgnored(phone: string): Promise<void> {
    await removeFromIgnored(phone);
  }

  /**
   * Decide si iniciar conversación usando IA
   * Analiza el mensaje, contexto, hora, número y decide inteligentemente
   */
  async shouldStartConversation(
    phone: string,
    text: string,
    contactName?: string | null,
    timestamp?: Date
  ): Promise<{ start: boolean; reason: string }> {
    try {
      const decision = await decideTrigger(
        phone,
        text,
        this.apiKey,
        contactName,
        timestamp
      );

      return {
        start: decision.shouldStart,
        reason: decision.reason,
      };
    } catch (error) {
      console.error('[AI-CONV] Error en shouldStartConversation:', error);
      // Fallback: usar método simple si falla la IA
      const shouldStart = this.isTrigger(text);
      return {
        start: shouldStart,
        reason: shouldStart ? 'Fallback: trigger básico detectado' : 'Fallback: no es trigger básico',
      };
    }
  }

  /**
   * Verifica si hay conversación activa
   */
  hasActiveConversation(phone: string): boolean {
    const conv = this.conversations.get(phone);
    if (!conv) return false;

    if (Date.now() - conv.lastActivity > this.CONVERSATION_TIMEOUT_MS) {
      console.log(`[AI-CONV] Conversación expirada: ${phone}`);
      this.conversations.delete(phone);
      return false;
    }

    return conv.active;
  }

  /**
   * Crea una nueva conversación
   */
  private _createConversation(phone: string, contact: ContactType | null): ConversationState {
    let clientName: string | null = null;
    if (contact?.name && contact.name.trim()) {
      clientName = contact.name.trim();
    }

    return {
      phone,
      clientName,
      active: true,
      history: [],
      data: {
        zona: null,
        accion: null,
        presupuesto: null,
      },
      lastActivity: Date.now(),
    };
  }

  /**
   * Construye el prompt del sistema - VERSIÓN DINÁMICA
   * Usa la configuración personalizable de la base de datos
   */
  private _buildSystemPrompt(conv: ConversationState): string {
    const config = this._getConfig();
    const datosFaltantes: string[] = [];
    const datosObtenidos: string[] = [];

    // Construir lista de datos obtenidos/faltantes dinámicamente
    for (const field of config.mission_fields) {
      const value = conv.data[field.key as keyof typeof conv.data];
      if (!value) {
        datosFaltantes.push(`${field.label} (${field.description})`);
      } else {
        const formattedValue = field.type === 'number'
          ? `$${Number(value).toLocaleString('es-AR')}`
          : String(value);
        datosObtenidos.push(`✓ ${field.label}: ${formattedValue}`);
      }
    }

    const misionCompleta = datosFaltantes.length === 0;
    const clientRef = conv.clientName ? `El cliente se llama ${conv.clientName}.` : '';

    // Construir identidad base
    const identity = (config.base_identity || 'Sos {assistant_name}, asistente virtual de una inmobiliaria. Respondés por WhatsApp.')
      .replace('{assistant_name}', this.assistantName);

    // Construir misión
    const missionItems = config.mission_fields
      .map((f, i) => `${i + 1}. ${f.label} - ${f.description}`)
      .join('\n');

    // Construir ejemplos de preguntas
    let questionExamplesText = '';
    if (!misionCompleta && config.question_examples) {
      const examples: string[] = [];
      for (const field of config.mission_fields) {
        const fieldExamples = config.question_examples[field.key];
        if (fieldExamples && fieldExamples.length > 0) {
          examples.push(`- ${field.label}: "${fieldExamples[0]}" / "${fieldExamples[1] || fieldExamples[0]}"`);
        }
      }
      questionExamplesText = `\nCÓMO OBTENER CADA DATO NATURALMENTE:\n${examples.join('\n')}`;
    }

    // Construir detección de datos
    let detectionText = '';
    if (config.extraction_rules) {
      const rules: string[] = [];
      for (const [key, rule] of Object.entries(config.extraction_rules)) {
        const field = config.mission_fields.find(f => f.key === key);
        if (field) {
          rules.push(`- ${rule}`);
        }
      }
      detectionText = `\nDETECCIÓN DE DATOS (aplicá siempre):\n${rules.join('\n')}`;
    }

    return `IDENTIDAD: ${identity}
${clientRef}

═══════════════════════════════════════════════════════════
TU MISIÓN ÚNICA E INQUEBRANTABLE:
Obtener estos ${config.mission_fields.length} datos del cliente de forma NATURAL y conversacional:
${missionItems}

${datosObtenidos.length > 0 ? `DATOS YA OBTENIDOS:\n${datosObtenidos.join('\n')}` : 'AÚN NO OBTUVISTE NINGÚN DATO.'}

${!misionCompleta ? `DATOS QUE FALTAN OBTENER:\n${datosFaltantes.map(d => `• ${d}`).join('\n')}` : ''}
═══════════════════════════════════════════════════════════

${misionCompleta ? `
¡MISIÓN COMPLETADA! Ahora debés:
${(config.mission_complete_message || '').replace(/\\n/g, '\n').split('\n').map(line => `- ${line.trim()}`).filter(l => l !== '-').join('\n')}
` : `
ESTRATEGIA DE CONVERSACIÓN:
${(config.conversation_strategy || '').replace(/\\n/g, '\n').split('\n').map(line => `- ${line.trim()}`).filter(l => l !== '-').join('\n')}
${questionExamplesText}
`}

REGLAS INQUEBRANTABLES (SEGUÍ TODAS AL PIE DE LA LETRA):
${(config.unbreakable_rules || '').replace(/\\n/g, '\n')}
${detectionText}

Respondé ÚNICAMENTE con el mensaje para el cliente. Nada más.`;
  }

  /**
   * Log del prompt para debug (temporal)
   */
  private _logPrompt(prompt: string): void {
    console.log('[AI-PROMPT] ========== PROMPT COMPLETO ==========');
    console.log(prompt);
    console.log('[AI-PROMPT] =====================================');
  }

  /**
   * Prompt para análisis de datos - VERSIÓN DINÁMICA
   * Usa la configuración personalizable de la base de datos
   */
  private _buildAnalysisPrompt(text: string, conv: ConversationState): string {
    const config = this._getConfig();

    // Construir contexto de datos ya obtenidos
    const contextLines = config.mission_fields.map(field => {
      const value = conv.data[field.key as keyof typeof conv.data];
      return `- ${field.label}: ${value || 'NO OBTENIDO/A'}`;
    });

    // Construir instrucciones de extracción
    const extractionInstructions = config.mission_fields.map((field, i) => {
      const rule = config.extraction_rules?.[field.key] || field.description;
      let typeHint = '';
      if (field.type === 'number') {
        typeHint = '(número o null)';
      } else if (field.type === 'enum' && field.values) {
        typeHint = `(${field.values.map(v => `"${v}"`).join(' o ')} o null)`;
      } else {
        typeHint = '(string o null)';
      }

      return `${i + 1}. ${field.key.toUpperCase()} ${typeHint}:
   - ${rule}`;
    });

    // Construir formato JSON esperado
    const jsonFormat = config.mission_fields
      .map(f => {
        if (f.type === 'number') return `"${f.key}": número o null`;
        if (f.type === 'enum') return `"${f.key}": "${f.values?.join('/')} o null"`;
        return `"${f.key}": "texto o null"`;
      })
      .join(', ');

    return `TAREA: Analizar este mensaje y extraer información SIGUIENDO LAS REGLAS AL PIE DE LA LETRA.

MENSAJE DEL CLIENTE: "${text}"

CONTEXTO - DATOS YA OBTENIDOS:
${contextLines.join('\n')}

REGLAS DE EXTRACCIÓN (OBLIGATORIAS):

${extractionInstructions.join('\n\n')}

IMPORTANTE PARA PRESUPUESTO:
- Si el cliente menciona "pesos", "ARS" o moneda argentina, convertir a dólares usando tipo de cambio 1200 ARS = 1 USD.
  Ejemplos: "145 millones de pesos" = 145000000 / 1200 = 120833 USD. "300 mil pesos" = 300000 / 1200 = 250 USD.
- Si dice "lucas", "k", o números sin especificar moneda en Argentina, asumir que son PESOS y convertir.
- Si dice explícitamente "dólares", "USD", "dolares", dejar el número tal cual.
- El resultado SIEMPRE debe ser en dólares (número entero, sin símbolo).
- Para números grandes tipo "145000000 pesos", el resultado debe ser ~120000 USD, NO 100 USD.

RESPUESTA: JSON exacto, sin explicaciones ni markdown:
{${jsonFormat}}`;
  }

  /**
   * Analiza el mensaje y extrae datos con IA - VERSIÓN ROBUSTA
   */
  private async _analyzeMessage(text: string, conv: ConversationState): Promise<AIAnalysisResult | null> {
    const analysisPrompt = this._buildAnalysisPrompt(text, conv);

    const result = await this._callGPT(
      [
        { role: 'system', content: 'Sos un extractor de datos preciso. Respondé SOLO con JSON válido, sin markdown ni explicaciones.' },
        { role: 'user', content: analysisPrompt },
      ],
      0,
      150
    );

    if (!result) return null;

    try {
      // Limpiar posibles artefactos de markdown
      const cleaned = result
        .replace(/```json\n?/g, '')
        .replace(/\n?```/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .trim();

      const parsed = JSON.parse(cleaned) as AIAnalysisResult;

      // Validar y limpiar datos
      if (parsed.zona && typeof parsed.zona === 'string') {
        parsed.zona = parsed.zona.trim();
        if (parsed.zona.toLowerCase() === 'null' || parsed.zona === '') {
          parsed.zona = null;
        }
      }

      if (parsed.accion && typeof parsed.accion === 'string') {
        const accionUpper = parsed.accion.toUpperCase().trim();
        if (accionUpper === 'COMPRA' || accionUpper === 'ALQUILER') {
          parsed.accion = accionUpper;
        } else {
          parsed.accion = null;
        }
      }

      if (parsed.presupuesto !== null && parsed.presupuesto !== undefined) {
        const num = Number(parsed.presupuesto);
        parsed.presupuesto = isNaN(num) || num <= 0 ? null : Math.round(num);
      }

      return parsed;
    } catch (e: any) {
      console.error('[AI-CONV] Error parseando análisis:', e.message, 'Raw:', result);
      return null;
    }
  }

  /**
   * Envía mensaje con control de timing
   */
  private async _sendMessage(phone: string, text: string): Promise<boolean> {
    if (this.processingLock.get(phone)) {
      console.log(`[AI-CONV] Lock activo para ${phone}`);
      await Utils.sleep(1000);
      if (this.processingLock.get(phone)) return false;
    }

    const lastSent = this.lastMessageSent.get(phone) || 0;
    const elapsed = Date.now() - lastSent;
    if (elapsed < this.MIN_DELAY_MS) {
      await Utils.sleep(this.MIN_DELAY_MS - elapsed);
    }

    try {
      this.processingLock.set(phone, true);

      // Detectar tipo de JID: números muy largos (>14 dígitos) probablemente son @lid
      const isLidNumber = phone.length > 14;
      const jid = isLidNumber ? `${phone}@lid` : `${phone}@s.whatsapp.net`;

      console.log(`[AI-CONV] Enviando a ${jid}`);
      await this.sendQueue.sendText(jid, text);
      this.lastMessageSent.set(phone, Date.now());
      console.log(`[AI-CONV] -> ${phone}: "${text.slice(0, 80)}..."`);
      return true;
    } catch (err: any) {
      console.error(`[AI-CONV] Error enviando:`, err.message);
      return false;
    } finally {
      this.processingLock.set(phone, false);
    }
  }

  /**
   * Genera respuesta de fallback si GPT falla
   */
  private _getFallbackResponse(conv: ConversationState): string {
    if (!conv.data.zona) {
      return `¡Hola! 😊 Contame, ¿por qué zona estás buscando?`;
    }
    if (!conv.data.accion) {
      return `Perfecto, ${conv.data.zona} es muy linda zona. ¿Buscás para comprar o alquilar?`;
    }
    if (!conv.data.presupuesto) {
      return `Excelente. ¿Qué presupuesto más o menos manejás para ${conv.data.accion === 'COMPRA' ? 'la compra' : 'el alquiler'}?`;
    }
    return `¡Gracias por la info! Un asesor se va a comunicar con vos a la brevedad 😊`;
  }

  /**
   * Inicia una nueva conversación
   * @param phone - Número de teléfono
   * @param contact - Datos del contacto (opcional)
   * @param initialMessage - Mensaje inicial del cliente (importante para contexto)
   */
  async startConversation(
    phone: string,
    contact: ContactType | null = null,
    initialMessage?: string
  ): Promise<boolean> {
    if (this.hasActiveConversation(phone)) {
      console.log(`[AI-CONV] Ya hay conversación activa para ${phone}`);
      return false;
    }

    console.log(`[AI-CONV] Iniciando conversación: ${phone}`);
    if (initialMessage) {
      console.log(`[AI-CONV] Mensaje inicial: "${initialMessage.slice(0, 80)}..."`);
    }

    const conv = this._createConversation(phone, contact);
    this.conversations.set(phone, conv);

    // Analizar el mensaje inicial para extraer datos si los hay
    if (initialMessage) {
      const analysis = await this._analyzeMessage(initialMessage, conv);
      if (analysis) {
        if (analysis.zona && !conv.data.zona) {
          conv.data.zona = analysis.zona;
          await Contact.updateZona(phone, analysis.zona);
          console.log(`[AI-CONV] ✓ Zona detectada en mensaje inicial: ${analysis.zona}`);
        }
        if (analysis.accion && !conv.data.accion) {
          conv.data.accion = analysis.accion;
          await Contact.updateAccion(phone, analysis.accion);
          console.log(`[AI-CONV] ✓ Operación detectada en mensaje inicial: ${analysis.accion}`);
        }
        if (analysis.presupuesto && !conv.data.presupuesto) {
          conv.data.presupuesto = analysis.presupuesto;
          await Contact.updatePresupuesto(phone, analysis.presupuesto);
          console.log(`[AI-CONV] ✓ Presupuesto detectado en mensaje inicial: ${analysis.presupuesto}`);
        }
      }

      // Agregar mensaje inicial al historial
      conv.history.push({ role: 'user', content: initialMessage });
    }

    // Simular que está escribiendo
    await Utils.sleep(this.TYPING_DELAY_MS);

    // Generar respuesta con IA - incluyendo contexto del mensaje inicial
    const userPrompt = initialMessage
      ? `El cliente envió este mensaje: "${initialMessage}". Respondé de forma natural al contenido de su mensaje, saludando y continuando la conversación según lo que escribió.`
      : 'El cliente acaba de saludar. Respondé con un saludo cálido, presentate brevemente y preguntá en qué podés ayudarlo con su búsqueda inmobiliaria.';

    let response = await this._callGPT([
      { role: 'system', content: this._buildSystemPrompt(conv) },
      { role: 'user', content: userPrompt },
    ]);

    // Fallback si falla GPT
    if (!response) {
      response = this._getFallbackResponse(conv);
    }

    conv.history.push({ role: 'assistant', content: response });
    await this._sendMessage(phone, response);

    return true;
  }

  /**
   * Encola un mensaje en el buffer y espera silencio antes de procesar
   * Esto evita responder múltiples veces si el usuario envía varios mensajes seguidos
   */
  async processMessage(
    phone: string,
    text: string,
    contact: ContactType | null = null
  ): Promise<boolean> {
    const conv = this.conversations.get(phone);
    if (!conv?.active) return false;

    console.log(`[AI-CONV] ${phone}: "${text.slice(0, 50)}..." (encolando)`);
    conv.lastActivity = Date.now();

    // Obtener o crear buffer para este teléfono
    let buffer = this.messageBuffer.get(phone);
    if (!buffer) {
      buffer = { messages: [], timer: null };
      this.messageBuffer.set(phone, buffer);
    }

    // Agregar mensaje al buffer
    buffer.messages.push(text);

    // Cancelar timer anterior si existe
    if (buffer.timer) {
      clearTimeout(buffer.timer);
    }

    // Crear nuevo timer - esperar silencio antes de procesar
    buffer.timer = setTimeout(async () => {
      await this._processBufferedMessages(phone, contact);
    }, this.BUFFER_WAIT_MS);

    console.log(`[AI-CONV] Buffer: ${buffer.messages.length} mensaje(s), esperando ${this.BUFFER_WAIT_MS}ms de silencio`);

    return true;
  }

  /**
   * Procesa todos los mensajes acumulados en el buffer
   */
  private async _processBufferedMessages(
    phone: string,
    contact: ContactType | null = null
  ): Promise<void> {
    const buffer = this.messageBuffer.get(phone);
    if (!buffer || buffer.messages.length === 0) return;

    const conv = this.conversations.get(phone);
    if (!conv?.active) {
      this.messageBuffer.delete(phone);
      return;
    }

    // Combinar todos los mensajes del buffer
    const combinedText = buffer.messages.join('\n');
    const messageCount = buffer.messages.length;

    console.log(`[AI-CONV] Procesando ${messageCount} mensaje(s) de ${phone}`);

    // Limpiar buffer
    buffer.messages = [];
    buffer.timer = null;
    this.messageBuffer.delete(phone);

    // Agregar mensajes al historial
    conv.history.push({ role: 'user', content: combinedText });

    // Simular lectura
    await Utils.sleep(this.TYPING_DELAY_MS);

    // Analizar mensaje para extraer datos (SIEMPRE, antes de responder)
    const analysis = await this._analyzeMessage(combinedText, conv);

    if (analysis) {
      if (analysis.zona && !conv.data.zona) {
        conv.data.zona = analysis.zona;
        await Contact.updateZona(phone, analysis.zona);
        console.log(`[AI-CONV] ✓ Zona detectada: ${analysis.zona}`);
      }
      if (analysis.accion && !conv.data.accion) {
        conv.data.accion = analysis.accion;
        await Contact.updateAccion(phone, analysis.accion);
        console.log(`[AI-CONV] ✓ Operación detectada: ${analysis.accion}`);
      }
      if (analysis.presupuesto && !conv.data.presupuesto) {
        conv.data.presupuesto = analysis.presupuesto;
        await Contact.updatePresupuesto(phone, analysis.presupuesto);
        console.log(`[AI-CONV] ✓ Presupuesto detectado: ${analysis.presupuesto}`);
      }
    }

    // Generar respuesta conversacional
    const systemPrompt = this._buildSystemPrompt(conv);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conv.history.slice(-10),
    ];

    let response = await this._callGPT(messages);

    // Fallback robusto si falla GPT
    if (!response) {
      console.warn('[AI-CONV] GPT falló, usando fallback');
      response = this._getFallbackResponse(conv);
    }

    conv.history.push({ role: 'assistant', content: response });
    await this._sendMessage(phone, response);

    // Verificar si completamos la misión
    const misionCompleta = conv.data.zona && conv.data.accion && conv.data.presupuesto;

    if (misionCompleta) {
      console.log(`[AI-CONV] ✅ MISIÓN COMPLETADA para ${phone}:`);
      console.log(`   Zona: ${conv.data.zona}`);
      console.log(`   Operación: ${conv.data.accion}`);
      console.log(`   Presupuesto: $${conv.data.presupuesto?.toLocaleString('es-AR')}`);

      // Agregar a lista de ignorados permanentemente (misión completada)
      await addToIgnored(phone, 'MISION_COMPLETADA', 'Misión completada con éxito');
      console.log(`[AI-CONV] ✓ Contacto ${phone} agregado a ignorados (misión completada)`);

      // Marcar conversación como inactiva inmediatamente
      conv.active = false;
      console.log(`[AI-CONV] Conversación finalizada: ${phone}`);
    }
  }

  /**
   * Cancela una conversación
   */
  cancelConversation(phone: string): void {
    this.conversations.delete(phone);
    this.lastMessageSent.delete(phone);
    this.processingLock.delete(phone);
    console.log(`[AI-CONV] Conversación cancelada: ${phone}`);
  }

  /**
   * Obtiene el estado de una conversación
   */
  getConversationState(phone: string): ConversationState | null {
    return this.conversations.get(phone) || null;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    const result = await this._callGPT([{ role: 'user', content: 'test' }], 0, 5);
    return result !== null;
  }
}

export default AIConversation;
