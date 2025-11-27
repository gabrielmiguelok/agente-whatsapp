/************************************************************
 * lib/whatsapp/types/promptConfig.ts
 * Tipos para la configuración de prompts de IA
 ************************************************************/

export interface MissionField {
  key: string;
  label: string;
  description: string;
  dbColumn: string;
  type: 'string' | 'number' | 'enum';
  values?: string[];
}

export interface QuestionExamples {
  [fieldKey: string]: string[];
}

export interface ExtractionRules {
  [fieldKey: string]: string;
}

export interface PromptConfigRecord {
  id: number;
  config_key: string;
  config_value: string;
  description: string | null;
  editable: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PromptConfig {
  assistant_name: string;
  mission_fields: MissionField[];
  conversation_strategy: string;
  question_examples: QuestionExamples;
  mission_complete_message: string;
  extraction_rules: ExtractionRules;
  // Read-only fields (for display only)
  base_identity?: string;
  unbreakable_rules?: string;
}

export interface PromptConfigUpdatePayload {
  config_key: string;
  config_value: string;
}

export interface PromptConfigResponse {
  success: boolean;
  data?: PromptConfig;
  error?: string;
}
