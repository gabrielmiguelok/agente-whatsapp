/************************************************************
 * lib/whatsapp/config.ts
 * Configuracion centralizada del sistema WhatsApp (TypeScript)
 * Mirrors src/config/index.js del sistema JS
 ************************************************************/

import type { WhatsAppConfig } from './types';

export const CONFIG: WhatsAppConfig = {
  // MariaDB (usa las mismas credenciales que el sistema JS)
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_USER: process.env.DB_USER || 'emprendi2',
  DB_PASSWORD: process.env.DB_PASSWORD || '56Ghambju!',
  DB_NAME: process.env.DB_NAME || 'crm_db',
  DB_CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),

  // Dedup
  DEDUP_MAX: 10000,
  DEDUP_SAVE_EVERY: 50,
  DEDUP_SAVE_INTERVAL_MS: 30000,

  // Outbox
  OUTBOX_FLUSH_EVERY_MS: 3000,
  OUTBOX_MAX_ATTEMPTS: 8,
  OUTBOX_BACKOFF_BASE_MS: 800,

  // Poll agenda
  POLL_INTERVAL_MS: 60_000,

  // Baileys tuning
  WA_CONNECT_TIMEOUT_MS: 60_000,
  WA_KEEPALIVE_MS: 15_000,
  VERBOSE: true,

  // Secuencias
  TITLE_PROP_NAME: 'Intro',
  MESSAGE_PROP_PREFIX: 'MENSAJE',

  // Timings secuencias
  WAIT_SILENCE_MS: 20_000,
  BETWEEN_SUB_MS: 2_000,
  FIRST_STEP_START_DELAY_MS: 400,

  // Reconexion robusta
  RECONNECT_BASE_MS: 2000,
  RECONNECT_MAX_MS: 30_000,
  REPLACED_RETRY_LIMIT: 2,
  REPLACED_WINDOW_MS: 60_000,
  AUTO_FORCE_NEW_ON_PERSISTENT_REPLACED: true,
  AUTO_FORCE_NEW_MAX: 1,

  // Envios rate-limit
  SEND_RATE_MIN_DELAY_MS: 2000,

  // Secuencias Manuales
  MANUAL_SEQUENCE_POLL_INTERVAL_MS: parseInt(process.env.MANUAL_SEQUENCE_POLL_INTERVAL_MS || '15000', 10),

  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  // Feature flags - Secuencias automáticas deshabilitadas
  SEQUENCES_ENABLED: false,
};

export default CONFIG;
