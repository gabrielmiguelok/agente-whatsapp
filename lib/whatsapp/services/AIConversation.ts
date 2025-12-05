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

  // Tracking de última pregunta por campo (para respuestas cortas como "Sí")
  private lastAskedField: Map<string, string> = new Map();

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
   * Crea una nueva conversación con datos dinámicos según config
   */
  private _createConversation(phone: string, contact: ContactType | null): ConversationState {
    let clientName: string | null = null;
    if (contact?.name && contact.name.trim()) {
      clientName = contact.name.trim();
    }

    const config = this._getConfig();
    const data: Record<string, string | number | null> = {};

    for (const field of config.mission_fields) {
      data[field.key] = null;
    }

    return {
      phone,
      clientName,
      active: true,
      history: [],
      data: data as any,
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

ORDEN DE PREGUNTAS - PRIORIDAD INTELIGENTE:
Analizá los datos que te faltan y decidí cuál preguntar PRIMERO según esta lógica:

1. **DATOS DE IDENTIDAD PRIMERO**: Si falta nombre, email o cualquier dato que identifique a la persona → SIEMPRE preguntá esto PRIMERO. Presentate y pedí el dato. Es descortés hablar sin saber con quién hablás.

2. **DATOS PERSONALES SEGUNDO**: Datos sobre la persona (familia, situación, preferencias personales).

3. **DATOS DE NEGOCIO AL FINAL**: Zona, presupuesto, tipo de operación, características técnicas.

REGLA DE ORO: Aunque el cliente mencione algo técnico ("quiero comprar una casa"), vos PRIMERO te presentás y preguntás cómo se llama. Podés reconocer brevemente lo que dijo, pero NO avances a preguntar datos técnicos sin antes saber el nombre.

Ejemplo correcto:
- Cliente: "Hola, quiero comprar una casa"
- Vos: "¡Hola! Qué bueno que estés buscando 😊 Soy Ana, asistente de [inmobiliaria]. ¿Con quién tengo el gusto de hablar?"
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
   * Prompt para análisis de datos - VERSIÓN DINÁMICA CON CONTEXTO
   * Usa la configuración personalizable y el historial de conversación
   */
  private _buildAnalysisPrompt(text: string, conv: ConversationState, phone: string): string {
    const config = this._getConfig();
    const lastAsked = this.lastAskedField.get(phone);

    const contextLines = config.mission_fields.map(field => {
      const value = (conv.data as Record<string, any>)[field.key];
      return `- ${field.label}: ${value || 'NO OBTENIDO/A'}`;
    });

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

    const jsonFormat = config.mission_fields
      .map(f => {
        if (f.type === 'number') return `"${f.key}": número o null`;
        if (f.type === 'enum') return `"${f.key}": "${f.values?.join('/')} o null"`;
        return `"${f.key}": "texto o null"`;
      })
      .join(', ');

    const lastMessages = conv.history.slice(-4).map(m => `${m.role === 'user' ? 'CLIENTE' : 'ASISTENTE'}: ${m.content}`).join('\n');

    let contextHint = '';
    if (lastAsked) {
      const askedField = config.mission_fields.find(f => f.key === lastAsked);
      if (askedField) {
        contextHint = `
CONTEXTO CRÍTICO: La última pregunta del asistente fue sobre "${askedField.label}" (${askedField.description}).
Si el cliente responde "sí", "si", "sep", "claro", "obvio", "dale", "ok", "ajá", "aha", "no", "nop", "nope", "nel", "para nada", o cualquier afirmación/negación corta,
esa respuesta ES PARA EL CAMPO "${askedField.key}".

Para campos de tipo SÍ/NO o boolean:
- Respuestas afirmativas (sí, si, sep, claro, obvio, dale, ok, ajá, seguro, por supuesto) → guardar "SI" o el valor positivo
- Respuestas negativas (no, nop, nope, nel, para nada, negativo) → guardar "NO" o el valor negativo
`;
      }
    }

    return `TAREA: Analizar mensaje del cliente y extraer información. IMPORTANTE: Considerar el CONTEXTO de la conversación.

HISTORIAL RECIENTE:
${lastMessages || 'Sin historial previo'}

MENSAJE ACTUAL DEL CLIENTE: "${text}"
${contextHint}

DATOS YA OBTENIDOS:
${contextLines.join('\n')}

REGLAS DE EXTRACCIÓN:

${extractionInstructions.join('\n\n')}

IMPORTANTE PARA PRESUPUESTO:
- Si menciona "pesos", "ARS" → convertir a USD (1200 ARS = 1 USD)
- "lucas", "k" sin moneda en Argentina → asumir pesos y convertir
- "dólares", "USD" → dejar el número tal cual
- Resultado SIEMPRE en dólares (número entero)

IMPORTANTE PARA RESPUESTAS CORTAS:
- "Sí", "No", "Claro", "Dale", etc. → INTERPRETAR según el contexto de la última pregunta
- Si se preguntó por hijos y responde "sí" → significa que SÍ tiene hijos
- Si se preguntó por zona y responde "centro" → es la zona

RESPUESTA: JSON exacto, sin explicaciones ni markdown:
{${jsonFormat}}`;
  }

  /**
   * Analiza el mensaje y extrae datos con IA - VERSIÓN DINÁMICA
   */
  private async _analyzeMessage(text: string, conv: ConversationState, phone: string): Promise<Record<string, any> | null> {
    const config = this._getConfig();
    const analysisPrompt = this._buildAnalysisPrompt(text, conv, phone);

    const result = await this._callGPT(
      [
        { role: 'system', content: 'Sos un extractor de datos preciso. Respondé SOLO con JSON válido, sin markdown ni explicaciones. SIEMPRE considerá el contexto de la conversación para interpretar respuestas cortas.' },
        { role: 'user', content: analysisPrompt },
      ],
      0.1,
      200
    );

    if (!result) return null;

    try {
      const cleaned = result
        .replace(/```json\n?/g, '')
        .replace(/\n?```/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .trim();

      const parsed = JSON.parse(cleaned) as Record<string, any>;
      const validated: Record<string, any> = {};

      for (const field of config.mission_fields) {
        let value = parsed[field.key];

        if (value === undefined || value === null || value === 'null' || value === '') {
          validated[field.key] = null;
          continue;
        }

        if (field.type === 'number') {
          const num = Number(value);
          validated[field.key] = isNaN(num) || num <= 0 ? null : Math.round(num);
        } else if (field.type === 'enum' && field.values) {
          const upper = String(value).toUpperCase().trim();
          const matched = field.values.find(v => v.toUpperCase() === upper);
          validated[field.key] = matched || null;
        } else {
          const strVal = String(value).trim();
          validated[field.key] = strVal.toLowerCase() === 'null' ? null : strVal;
        }
      }

      console.log('[AI-CONV] Análisis resultado:', validated);
      return validated;
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
    const config = this._getConfig();

    if (initialMessage) {
      const analysis = await this._analyzeMessage(initialMessage, conv, phone);
      if (analysis) {
        for (const field of config.mission_fields) {
          const value = analysis[field.key];
          const currentValue = (conv.data as Record<string, any>)[field.key];
          if (value && !currentValue) {
            (conv.data as Record<string, any>)[field.key] = value;
            await Contact.updateDynamicField(phone, field.dbColumn, value);
            console.log(`[AI-CONV] ✓ ${field.label} detectado en mensaje inicial: ${value}`);
          }
        }
      }

      conv.history.push({ role: 'user', content: initialMessage });
    }

    await Utils.sleep(this.TYPING_DELAY_MS);

    const userPrompt = initialMessage
      ? `El cliente envió este mensaje: "${initialMessage}". Respondé de forma natural al contenido de su mensaje, saludando y continuando la conversación según lo que escribió.`
      : 'El cliente acaba de saludar. Respondé con un saludo cálido, presentate brevemente y preguntá en qué podés ayudarlo con su búsqueda inmobiliaria.';

    let response = await this._callGPT([
      { role: 'system', content: this._buildSystemPrompt(conv) },
      { role: 'user', content: userPrompt },
    ]);

    if (!response) {
      response = this._getFallbackResponse(conv);
    }

    conv.history.push({ role: 'assistant', content: response });
    await this._sendMessage(phone, response);

    this._detectAskedField(response, phone);

    return true;
  }

  /**
   * Detecta qué campo se preguntó en el mensaje del asistente
   * para poder interpretar respuestas cortas como "Sí"
   */
  private _detectAskedField(assistantMessage: string, phone: string): void {
    const config = this._getConfig();
    const msgLower = assistantMessage.toLowerCase();

    for (const field of config.mission_fields) {
      const examples = config.question_examples?.[field.key] || [];
      const labelLower = field.label.toLowerCase();
      const descLower = field.description.toLowerCase();

      const isAsking = examples.some(ex => {
        const exLower = ex.toLowerCase();
        const words = exLower.split(/\s+/).filter(w => w.length > 3);
        return words.some(word => msgLower.includes(word));
      }) || msgLower.includes(labelLower) || msgLower.includes(descLower);

      if (isAsking) {
        this.lastAskedField.set(phone, field.key);
        console.log(`[AI-CONV] Detectada pregunta sobre: ${field.key}`);
        return;
      }
    }
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
   * Procesa todos los mensajes acumulados en el buffer - VERSIÓN DINÁMICA
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

    const config = this._getConfig();
    const combinedText = buffer.messages.join('\n');
    const messageCount = buffer.messages.length;

    console.log(`[AI-CONV] Procesando ${messageCount} mensaje(s) de ${phone}`);

    buffer.messages = [];
    buffer.timer = null;
    this.messageBuffer.delete(phone);

    conv.history.push({ role: 'user', content: combinedText });

    await Utils.sleep(this.TYPING_DELAY_MS);

    const analysis = await this._analyzeMessage(combinedText, conv, phone);

    if (analysis) {
      for (const field of config.mission_fields) {
        const value = analysis[field.key];
        const currentValue = (conv.data as Record<string, any>)[field.key];
        if (value && !currentValue) {
          (conv.data as Record<string, any>)[field.key] = value;
          await Contact.updateDynamicField(phone, field.dbColumn, value);
          console.log(`[AI-CONV] ✓ ${field.label} detectado: ${value}`);
        }
      }
    }

    const systemPrompt = this._buildSystemPrompt(conv);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conv.history.slice(-10),
    ];

    let response = await this._callGPT(messages);

    if (!response) {
      console.warn('[AI-CONV] GPT falló, usando fallback');
      response = this._getFallbackResponse(conv);
    }

    conv.history.push({ role: 'assistant', content: response });
    await this._sendMessage(phone, response);

    this._detectAskedField(response, phone);

    const misionCompleta = config.mission_fields.every(field => {
      const value = (conv.data as Record<string, any>)[field.key];
      return value !== null && value !== undefined && value !== '';
    });

    if (misionCompleta) {
      console.log(`[AI-CONV] ✅ MISIÓN COMPLETADA para ${phone}:`);
      for (const field of config.mission_fields) {
        const value = (conv.data as Record<string, any>)[field.key];
        console.log(`   ${field.label}: ${value}`);
      }

      await addToIgnored(phone, 'MISION_COMPLETADA', 'Misión completada con éxito');
      console.log(`[AI-CONV] ✓ Contacto ${phone} agregado a ignorados (misión completada)`);

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
