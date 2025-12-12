/************************************************************
 * lib/whatsapp/types.ts
 * Tipos e interfaces TypeScript para el sistema WhatsApp
 ************************************************************/

import type { WASocket } from '@whiskeysockets/baileys';

// ==================== Sesión WhatsApp ====================

export type SessionStatus = 'disconnected' | 'connecting' | 'qr_pending' | 'connected';

export interface WhatsAppSessionRecord {
  id: number;
  email: string;
  status: SessionStatus;
  phone: string | null;
  last_connected_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface SessionState {
  email: string;
  status: SessionStatus;
  qrCode: string | null;
  phone: string | null;
  selfJid: string | null;
  connectedAt: Date | null;
}

// ==================== Contacto ====================

export interface Contact {
  id: number;
  phone: string;
  name: string | null;
  seguimiento: string | null;
  email: string | null;
  instance_email: string | null;
  created_at: Date;
  updated_at: Date;
  [key: string]: unknown;
}

// ==================== Mensaje ====================

export interface Message {
  id: number;
  contact_id: number | null;
  phone: string;
  name: string | null;
  message: string;
  direction: 'ENVIADO' | 'RECIBIDO';
  wa_id: string | null;
  instance_email: string | null;
  created_at: Date;
}

// ==================== Secuencias ====================

export interface Sequence {
  id: number;
  trigger_keyword: string;
  active: boolean;
  created_at: Date;
}

export interface SequenceStep {
  id: number;
  sequence_id: number;
  step_number: number;
  message_text: string;
}

export type SequenceLogStatus = 'idle' | 'active' | 'completed';

export interface SequenceLogRecord {
  id: number;
  phone: string;
  status: SequenceLogStatus;
  trigger_keyword: string | null;
  total_steps: number;
  current_step: number;
  started_at: Date | null;
  last_update: Date;
}

export interface SequenceHistoryEvent {
  id: number;
  phone: string;
  event_type: 'incoming' | 'outgoing' | 'trigger';
  step_number: number | null;
  message_text: string | null;
  created_at: Date;
}

// ==================== Dedup / Outbox ====================

export interface DedupRecord {
  id: number;
  session_name: string;
  dedup_key: string;
  created_at: Date;
}

export interface OutboxItem {
  id: number;
  session_name: string;
  queue_id: string;
  operation_type: string;
  payload: string | Record<string, unknown>;
  attempts: number;
  next_at: Date;
  created_at: Date;
}

export interface OutboxPayload {
  phoneDigits: string;
  text: string;
  direction: 'ENVIADO' | 'RECIBIDO';
}

// ==================== Historial en memoria ====================

export interface HistoryEntry {
  dir: 'IN' | 'OUT';
  text: string;
  ts: number;
}

// ==================== Procesamiento de mensajes ====================

export interface ProcessedMessage {
  phoneDigits: string;
  text: string;
  tsMs: number;
}

export interface TriggerMatch {
  trigger: string;
  steps: string[];
}

// ==================== AI Conversation ====================

export interface ConversationData {
  [key: string]: string | number | null;
}

export interface ConversationState {
  phone: string;
  clientName: string | null;
  active: boolean;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  data: ConversationData;
  lastActivity: number;
}

export interface AIAnalysisResult {
  [key: string]: string | number | null;
}

export interface AIConversationOptions {
  model?: string;
  assistantName?: string;
  allowedPhones?: string[];
  triggerKeyword?: string;
}

// ==================== SendQueue ====================

export interface QueueItem {
  jid: string;
  text: string;
  resolve: (value: boolean) => void;
  reject: (reason: Error) => void;
}

// ==================== WhatsApp Client ====================

export interface WhatsAppClientDeps {
  sessionEmail: string;
  dataStore: IDataStore;
  sequenceEngine: ISequenceEngine;
  sendQueue: ISendQueue;
  aiConversation?: IAIConversation | null;
  onQrCode?: (qr: string) => void;
  onStatusChange?: (status: SessionStatus) => void;
  onConnected?: (phone: string) => void;
}

// ==================== Interfaces de servicios ====================

export interface IDataStore {
  initialize(): Promise<void>;
  setSelfPhoneDigits(digits: string | null): void;
  logMessage(data: { phoneDigits: string; text: string; direction: 'ENVIADO' | 'RECIBIDO'; waId?: string | null }): Promise<void>;
  findContactByPhone(phoneDigits: string): Promise<Contact | null>;
  cleanup(): void;
  dedup: IDedup;
}

export interface IDedup {
  load(): Promise<void>;
  has(key: string): boolean;
  add(key: string): Promise<void>;
}

export interface ISendQueue {
  updateSocket(sock: WASocket | null): void;
  sendText(jid: string, text: string): Promise<boolean>;
  pending(): number;
  clear(): void;
}

export interface ISequenceEngine {
  triggers: Map<string, string[]>;
  onIncomingMessage(phoneDigits: string, text: string, tsMs: number, contact?: Contact | null): Promise<void>;
  startManualSequence(phoneDigits: string, triggerKey: string, onComplete?: (phone: string) => Promise<void>): Promise<boolean>;
}

export interface IAIConversation {
  isEligible(phone: string): boolean;
  isTrigger(text: string): boolean;
  hasActiveConversation(phone: string): boolean;
  startConversation(phone: string, contact?: Contact | null, initialMessage?: string): Promise<boolean>;
  processMessage(phone: string, text: string, contact?: Contact | null): Promise<boolean>;
  cancelConversation(phone: string): void;
  healthCheck(): Promise<boolean>;
  reloadConfig(): Promise<void>;
  // Métodos de decisión inteligente de trigger
  shouldStartConversation(phone: string, text: string, contactName?: string | null, timestamp?: Date): Promise<{ start: boolean; reason: string }>;
  isContactIgnored(phone: string): Promise<boolean>;
  removeContactFromIgnored(phone: string): Promise<void>;
}

// ==================== WebSocket Events ====================

export interface WSMessage {
  type: 'qr' | 'status' | 'connected' | 'error' | 'ping';
  data?: unknown;
}

export interface WSQrMessage extends WSMessage {
  type: 'qr';
  data: string;
}

export interface WSStatusMessage extends WSMessage {
  type: 'status';
  data: SessionStatus;
}

export interface WSConnectedMessage extends WSMessage {
  type: 'connected';
  data: { phone: string; jid: string };
}

export interface WSErrorMessage extends WSMessage {
  type: 'error';
  data: string;
}

// ==================== Config ====================

export interface WhatsAppConfig {
  // Database
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_CONNECTION_LIMIT: number;

  // Dedup
  DEDUP_MAX: number;
  DEDUP_SAVE_EVERY: number;
  DEDUP_SAVE_INTERVAL_MS: number;

  // Outbox
  OUTBOX_FLUSH_EVERY_MS: number;
  OUTBOX_MAX_ATTEMPTS: number;
  OUTBOX_BACKOFF_BASE_MS: number;

  // Poll agenda
  POLL_INTERVAL_MS: number;

  // Baileys tuning
  WA_CONNECT_TIMEOUT_MS: number;
  WA_KEEPALIVE_MS: number;
  VERBOSE: boolean;

  // Sequences
  TITLE_PROP_NAME: string;
  MESSAGE_PROP_PREFIX: string;

  // Timing sequences
  WAIT_SILENCE_MS: number;
  BETWEEN_SUB_MS: number;
  FIRST_STEP_START_DELAY_MS: number;

  // Reconnection
  RECONNECT_BASE_MS: number;
  RECONNECT_MAX_MS: number;
  REPLACED_RETRY_LIMIT: number;
  REPLACED_WINDOW_MS: number;
  AUTO_FORCE_NEW_ON_PERSISTENT_REPLACED: boolean;
  AUTO_FORCE_NEW_MAX: number;

  // QR timeout
  QR_TIMEOUT_MAX_RETRIES: number;
  QR_TIMEOUT_RETRY_DELAY_MS: number;

  // Rate limit
  SEND_RATE_MIN_DELAY_MS: number;

  // Manual sequences
  MANUAL_SEQUENCE_POLL_INTERVAL_MS: number;

  // OpenAI
  OPENAI_API_KEY: string;

  // Feature flags
  SEQUENCES_ENABLED: boolean;
}
