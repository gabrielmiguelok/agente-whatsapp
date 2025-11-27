/************************************************************
 * app/api/crm-whatsapp/prompt-config/route.ts
 * API para gestionar la configuración de prompts de IA
 ************************************************************/

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import type { PromptConfig, PromptConfigRecord } from '@/lib/whatsapp/types/promptConfig';

export const dynamic = 'force-dynamic';

// Claves editables permitidas
const EDITABLE_KEYS = [
  'assistant_name',
  'mission_fields',
  'conversation_strategy',
  'question_examples',
  'mission_complete_message',
  'extraction_rules',
  // Identidad y reglas
  'base_identity',
  'unbreakable_rules',
  // Trigger (disparador inteligente)
  'trigger_criteria',
  'trigger_examples_positive',
  'trigger_examples_negative',
  'trigger_vip_phones',
  'trigger_context_instructions',
  'trigger_ignore_duration_hours',
];

/**
 * GET - Obtener toda la configuración de prompts
 */
export async function GET() {
  try {
    console.log('📥 GET /api/crm-whatsapp/prompt-config');

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM ai_prompt_config ORDER BY id'
    );

    const records = rows as PromptConfigRecord[];

    // Construir objeto de configuración
    const config: PromptConfig = {
      assistant_name: 'Ana',
      mission_fields: [],
      conversation_strategy: '',
      question_examples: {},
      mission_complete_message: '',
      extraction_rules: {},
    };

    for (const record of records) {
      const key = record.config_key as keyof PromptConfig;
      const value = record.config_value;

      try {
        // Intentar parsear como JSON si corresponde
        if (key === 'mission_fields' || key === 'question_examples' || key === 'extraction_rules') {
          (config as Record<string, unknown>)[key] = JSON.parse(value);
        } else {
          (config as Record<string, unknown>)[key] = value;
        }
      } catch {
        // Si falla el parse, usar el valor como string
        (config as Record<string, unknown>)[key] = value;
      }
    }

    console.log('✅ Configuración cargada correctamente');
    return NextResponse.json({ success: true, data: config });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error cargando configuración:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * PUT - Actualizar una configuración específica
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { config_key, config_value } = body;

    console.log(`📥 PUT /api/crm-whatsapp/prompt-config - key: ${config_key}`);

    // Validar que la clave sea editable
    if (!EDITABLE_KEYS.includes(config_key)) {
      return NextResponse.json(
        { success: false, error: `La clave "${config_key}" no es editable` },
        { status: 400 }
      );
    }

    // Validar que el valor no esté vacío
    if (config_value === undefined || config_value === null) {
      return NextResponse.json(
        { success: false, error: 'El valor no puede estar vacío' },
        { status: 400 }
      );
    }

    // Serializar a JSON si es necesario
    let valueToSave = config_value;
    if (typeof config_value === 'object') {
      valueToSave = JSON.stringify(config_value);
    }

    // Actualizar en la base de datos
    await pool.execute(
      'UPDATE ai_prompt_config SET config_value = ? WHERE config_key = ?',
      [valueToSave, config_key]
    );

    console.log(`✅ Configuración actualizada: ${config_key}`);
    return NextResponse.json({ success: true, message: 'Configuración actualizada' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error actualizando configuración:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST - Recargar la configuración en las sesiones activas
 */
export async function POST() {
  try {
    console.log('📥 POST /api/crm-whatsapp/prompt-config - Recargando en sesiones');

    // Importar dinámicamente el manager para evitar problemas de SSR
    const { WhatsAppSessionManager } = await import('@/lib/whatsapp/manager/WhatsAppSessionManager');
    const manager = WhatsAppSessionManager.getInstance();

    // Recargar la configuración en todas las sesiones activas
    await manager.reloadPromptConfig();

    console.log('✅ Configuración recargada en sesiones activas');
    return NextResponse.json({ success: true, message: 'Configuración recargada' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error recargando configuración:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
