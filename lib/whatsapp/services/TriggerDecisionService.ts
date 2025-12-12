/************************************************************
 * lib/whatsapp/services/TriggerDecisionService.ts
 * Servicio que usa IA para decidir si iniciar conversación
 * Con soporte para keywords prioritarias y fuzzy matching
 ************************************************************/

import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { loadPromptConfig } from './PromptConfigService';

interface TriggerDecision {
  shouldStart: boolean;
  reason: string;
  confidence: number;
}

// ==============================================================================
// FUZZY MATCHING - Distancia de Levenshtein para tolerar errores tipográficos
// ==============================================================================

/**
 * Calcula la distancia de Levenshtein entre dos strings
 * Menor distancia = más similares
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Verifica si una palabra es similar a un keyword (fuzzy matching)
 * Tolera hasta 2 errores para palabras >= 5 caracteres, 1 error para más cortas
 */
function isFuzzyMatch(word: string, keyword: string): boolean {
  const w = word.toLowerCase().trim();
  const k = keyword.toLowerCase().trim();

  // Match exacto
  if (w === k) return true;

  // Si la palabra contiene el keyword
  if (w.includes(k) || k.includes(w)) return true;

  // Fuzzy matching con Levenshtein
  const distance = levenshteinDistance(w, k);
  const maxDistance = Math.min(w.length, k.length) >= 5 ? 2 : 1;

  return distance <= maxDistance;
}

/**
 * Busca si el mensaje contiene alguna keyword prioritaria (con fuzzy matching)
 * Retorna la keyword encontrada o null
 */
function findKeywordInMessage(message: string, keywords: string[]): string | null {
  if (!keywords || keywords.length === 0) return null;

  // Normalizar mensaje: quitar acentos, pasar a minúsculas, extraer palabras
  const normalizedMessage = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s]/g, ' '); // Solo letras, números y espacios

  const words = normalizedMessage.split(/\s+/).filter(w => w.length >= 3);

  for (const keyword of keywords) {
    const normalizedKeyword = keyword
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (!normalizedKeyword) continue;

    // Buscar keyword en cada palabra del mensaje
    for (const word of words) {
      if (isFuzzyMatch(word, normalizedKeyword)) {
        return keyword;
      }
    }

    // También buscar si el mensaje completo contiene el keyword (para keywords multi-palabra)
    if (normalizedMessage.includes(normalizedKeyword)) {
      return keyword;
    }
  }

  return null;
}

interface IgnoredContact {
  id: number;
  phone: string;
  reason: string | null;
  first_message: string | null;
  ignored_at: Date;
  expires_at: Date | null;
}

// Cache de contactos ignorados
let ignoredPhonesCache: Set<string> = new Set();
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60000; // 1 minuto

/**
 * Carga la lista de contactos ignorados desde la DB
 */
async function loadIgnoredPhones(): Promise<Set<string>> {
  if (Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return ignoredPhonesCache;
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT phone FROM ai_ignored_contacts
      WHERE expires_at IS NULL OR expires_at > NOW()
    `);

    ignoredPhonesCache = new Set(rows.map(r => r.phone));
    cacheTimestamp = Date.now();
    console.log(`[TriggerDecision] Cache actualizado: ${ignoredPhonesCache.size} contactos ignorados`);

    return ignoredPhonesCache;
  } catch (error) {
    console.error('[TriggerDecision] Error cargando ignorados:', error);
    return ignoredPhonesCache;
  }
}

/**
 * Verifica si un contacto está en la lista de ignorados
 */
export async function isIgnored(phone: string): Promise<boolean> {
  const ignored = await loadIgnoredPhones();
  return ignored.has(phone);
}

/**
 * Agrega un contacto a la lista de ignorados
 */
export async function addToIgnored(phone: string, reason: string, firstMessage: string): Promise<void> {
  try {
    // Obtener duración de expiración
    const config = await loadPromptConfig();
    const hours = parseInt((config as Record<string, string>).trigger_ignore_duration_hours || '168', 10);

    await pool.execute<ResultSetHeader>(`
      INSERT INTO ai_ignored_contacts (phone, reason, first_message, expires_at)
      VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))
      ON DUPLICATE KEY UPDATE
        reason = VALUES(reason),
        first_message = VALUES(first_message),
        ignored_at = NOW(),
        expires_at = DATE_ADD(NOW(), INTERVAL ? HOUR)
    `, [phone, reason, firstMessage, hours, hours]);

    // Actualizar cache local
    ignoredPhonesCache.add(phone);
    console.log(`[TriggerDecision] Contacto agregado a ignorados: ${phone}`);
  } catch (error) {
    console.error('[TriggerDecision] Error agregando a ignorados:', error);
  }
}

/**
 * Remueve un contacto de la lista de ignorados
 */
export async function removeFromIgnored(phone: string): Promise<void> {
  try {
    await pool.execute('DELETE FROM ai_ignored_contacts WHERE phone = ?', [phone]);
    ignoredPhonesCache.delete(phone);
    console.log(`[TriggerDecision] Contacto removido de ignorados: ${phone}`);
  } catch (error) {
    console.error('[TriggerDecision] Error removiendo de ignorados:', error);
  }
}

/**
 * Obtiene todos los contactos ignorados
 */
export async function getIgnoredContacts(): Promise<IgnoredContact[]> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT * FROM ai_ignored_contacts
      ORDER BY ignored_at DESC
    `);
    return rows as IgnoredContact[];
  } catch (error) {
    console.error('[TriggerDecision] Error obteniendo ignorados:', error);
    return [];
  }
}

/**
 * Limpia contactos ignorados expirados
 */
export async function cleanupExpired(): Promise<number> {
  try {
    const [result] = await pool.execute<ResultSetHeader>(`
      DELETE FROM ai_ignored_contacts
      WHERE expires_at IS NOT NULL AND expires_at <= NOW()
    `);

    if (result.affectedRows > 0) {
      // Invalidar cache
      cacheTimestamp = 0;
      console.log(`[TriggerDecision] Limpiados ${result.affectedRows} contactos expirados`);
    }

    return result.affectedRows;
  } catch (error) {
    console.error('[TriggerDecision] Error limpiando expirados:', error);
    return 0;
  }
}

/**
 * Invalida el cache de contactos ignorados
 */
export function invalidateCache(): void {
  cacheTimestamp = 0;
  ignoredPhonesCache.clear();
}

interface MessageContext {
  phone: string;
  message: string;
  timestamp: Date;
  contactName?: string | null;
}

/**
 * Construye el prompt para decidir si iniciar conversación
 */
function buildDecisionPrompt(
  context: MessageContext,
  criteria: string,
  positiveExamples: string,
  negativeExamples: string,
  contextInstructions: string
): string {
  const date = context.timestamp;
  const hour = date.getHours();
  const isBusinessHours = hour >= 9 && hour <= 20;
  const dayOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];

  return `TAREA: Decidir si este mensaje de WhatsApp justifica iniciar una conversación de asistencia inmobiliaria.

═══════════════════════════════════════════════════════════
CONTEXTO DEL MENSAJE:
═══════════════════════════════════════════════════════════
- Mensaje: "${context.message}"
- Teléfono: ${context.phone}
- Nombre del contacto: ${context.contactName || 'Desconocido'}
- Fecha: ${date.toLocaleDateString('es-AR')}
- Hora: ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
- Día: ${dayOfWeek}
- Horario comercial: ${isBusinessHours ? 'Sí' : 'No'}
- País (por código): ${context.phone.startsWith('54') ? 'Argentina' : context.phone.startsWith('1') ? 'USA/Canadá' : 'Otro'}

═══════════════════════════════════════════════════════════
CRITERIO PRINCIPAL DE ACEPTACIÓN:
═══════════════════════════════════════════════════════════
${criteria}

═══════════════════════════════════════════════════════════
INSTRUCCIONES DE CONTEXTO ADICIONALES:
═══════════════════════════════════════════════════════════
${contextInstructions}

═══════════════════════════════════════════════════════════
EJEMPLOS DE MENSAJES QUE SÍ DEBEN INICIAR:
${positiveExamples.split('|').map(e => `- "${e.trim()}"`).join('\n')}

EJEMPLOS DE MENSAJES QUE NO DEBEN INICIAR:
${negativeExamples.split('|').map(e => `- "${e.trim()}"`).join('\n')}
═══════════════════════════════════════════════════════════

ANÁLISIS REQUERIDO:
1. ¿El mensaje indica interés genuino en servicios inmobiliarios?
2. ¿Parece ser un potencial cliente o es spam/publicidad/otro servicio?
3. ¿El contexto (hora, día, número) apoya que es un cliente legítimo?
4. ¿Hay alguna instrucción de contexto que aplique a este caso?

RESPUESTA: JSON exacto sin explicaciones:
{"should_start": true/false, "reason": "explicación breve incluyendo qué factor fue decisivo", "confidence": 0.0-1.0}`;
}

/**
 * Verifica si un teléfono es VIP (siempre inicia)
 */
async function isVipPhone(phone: string): Promise<boolean> {
  try {
    const config = await loadPromptConfig();
    const vipPhones = ((config as Record<string, string>).trigger_vip_phones || '')
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return vipPhones.some(vip => phone.includes(vip) || vip.includes(phone));
  } catch {
    return false;
  }
}

/**
 * Usa la IA para decidir si iniciar conversación
 * PRIORIDAD: 1. VIP → 2. Ignorados → 3. Keywords prioritarias → 4. IA
 */
export async function decideTrigger(
  phone: string,
  message: string,
  apiKey: string,
  contactName?: string | null,
  timestamp?: Date
): Promise<TriggerDecision> {
  // 1. Verificar si es número VIP (siempre inicia si no está ignorado)
  if (await isVipPhone(phone)) {
    // Verificar que no esté ignorado
    if (!(await isIgnored(phone))) {
      console.log(`[TriggerDecision] ${phone} es VIP, iniciando automáticamente`);
      return {
        shouldStart: true,
        reason: 'Número VIP - inicio automático',
        confidence: 1.0,
      };
    }
  }

  // 2. Verificar si está ignorado
  if (await isIgnored(phone)) {
    console.log(`[TriggerDecision] ${phone} está en lista de ignorados, saltando`);
    return {
      shouldStart: false,
      reason: 'Contacto en lista de ignorados',
      confidence: 1.0,
    };
  }

  try {
    // 3. Cargar configuración y verificar KEYWORDS PRIORITARIAS (con fuzzy matching)
    const config = await loadPromptConfig();
    const configRecord = config as Record<string, string>;

    // Obtener keywords de la configuración
    const keywordsStr = configRecord.trigger_keywords || '';
    const keywords = keywordsStr
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywords.length > 0) {
      const matchedKeyword = findKeywordInMessage(message, keywords);
      if (matchedKeyword) {
        console.log(`[TriggerDecision] ${phone}: KEYWORD MATCH "${matchedKeyword}" en mensaje "${message.substring(0, 50)}..."`);
        return {
          shouldStart: true,
          reason: `Keyword prioritaria detectada: "${matchedKeyword}" (fuzzy matching)`,
          confidence: 1.0,
        };
      }
    }

    // 4. Si no hay keyword match, continuar con análisis de IA
    const criteria = configRecord.trigger_criteria || 'Interés en bienes raíces';
    const positiveExamples = configRecord.trigger_examples_positive || 'hola busco depto';
    const negativeExamples = configRecord.trigger_examples_negative || 'spam|publicidad';
    const contextInstructions = configRecord.trigger_context_instructions || '';

    // 5. Construir contexto del mensaje
    const context: MessageContext = {
      phone,
      message,
      timestamp: timestamp || new Date(),
      contactName,
    };

    // 6. Construir prompt con contexto completo
    const prompt = buildDecisionPrompt(context, criteria, positiveExamples, negativeExamples, contextInstructions);

    // 7. Llamar a GPT
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sos un clasificador de mensajes inteligente. Analizás el contexto completo (mensaje, hora, teléfono, día) para decidir. Respondés SOLO con JSON válido, sin markdown ni explicaciones.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('[TriggerDecision] Error API:', await response.text());
      return { shouldStart: false, reason: 'Error de API', confidence: 0 };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    // 8. Parsear respuesta
    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/\n?```/g, '')
      .replace(/^[^{]*/, '')
      .replace(/[^}]*$/, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    const decision: TriggerDecision = {
      shouldStart: parsed.should_start === true,
      reason: parsed.reason || 'Sin razón especificada',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    };

    console.log(`[TriggerDecision] ${phone}: ${decision.shouldStart ? 'INICIAR' : 'IGNORAR'} (${decision.confidence.toFixed(2)}) - ${decision.reason}`);

    // 9. Si decide no iniciar, agregar a ignorados
    if (!decision.shouldStart) {
      await addToIgnored(phone, decision.reason, message);
    }

    return decision;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[TriggerDecision] Error en decisión:', errorMessage);
    return { shouldStart: false, reason: `Error: ${errorMessage}`, confidence: 0 };
  }
}
