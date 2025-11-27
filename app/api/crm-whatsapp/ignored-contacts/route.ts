/************************************************************
 * app/api/crm-whatsapp/ignored-contacts/route.ts
 * API para gestionar contactos ignorados por la IA
 ************************************************************/

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

interface IgnoredContact {
  id: number;
  phone: string;
  reason: string | null;
  first_message: string | null;
  ignored_at: Date;
  expires_at: Date | null;
}

/**
 * GET - Obtener todos los contactos ignorados
 */
export async function GET() {
  try {
    console.log('📥 GET /api/crm-whatsapp/ignored-contacts');

    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT
        id,
        phone,
        reason,
        first_message,
        ignored_at,
        expires_at,
        CASE
          WHEN expires_at IS NULL THEN FALSE
          WHEN expires_at <= NOW() THEN TRUE
          ELSE FALSE
        END as is_expired
      FROM ai_ignored_contacts
      ORDER BY ignored_at DESC
    `);

    // Contar estadísticas
    const total = rows.length;
    const active = rows.filter(r => !r.is_expired).length;
    const expired = total - active;

    console.log(`✅ ${total} contactos ignorados (${active} activos, ${expired} expirados)`);

    return NextResponse.json({
      success: true,
      data: rows as IgnoredContact[],
      stats: { total, active, expired },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error obteniendo contactos ignorados:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST - Agregar un contacto a ignorados manualmente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, reason, hours } = body;

    console.log(`📥 POST /api/crm-whatsapp/ignored-contacts - ${phone}`);

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'El teléfono es requerido' },
        { status: 400 }
      );
    }

    const expirationHours = hours || 168; // 7 días por defecto

    await pool.execute<ResultSetHeader>(`
      INSERT INTO ai_ignored_contacts (phone, reason, first_message, expires_at)
      VALUES (?, ?, 'Agregado manualmente', DATE_ADD(NOW(), INTERVAL ? HOUR))
      ON DUPLICATE KEY UPDATE
        reason = VALUES(reason),
        ignored_at = NOW(),
        expires_at = DATE_ADD(NOW(), INTERVAL ? HOUR)
    `, [phone, reason || 'Agregado manualmente', expirationHours, expirationHours]);

    console.log(`✅ Contacto agregado a ignorados: ${phone}`);

    return NextResponse.json({
      success: true,
      message: `Contacto ${phone} agregado a ignorados por ${expirationHours} horas`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error agregando contacto:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remover un contacto de ignorados
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const id = searchParams.get('id');

    console.log(`📥 DELETE /api/crm-whatsapp/ignored-contacts - ${phone || id}`);

    if (!phone && !id) {
      return NextResponse.json(
        { success: false, error: 'Se requiere phone o id' },
        { status: 400 }
      );
    }

    let result: ResultSetHeader;

    if (id) {
      [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM ai_ignored_contacts WHERE id = ?',
        [id]
      );
    } else {
      [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM ai_ignored_contacts WHERE phone = ?',
        [phone]
      );
    }

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Contacto no encontrado' },
        { status: 404 }
      );
    }

    console.log(`✅ Contacto removido de ignorados`);

    return NextResponse.json({
      success: true,
      message: 'Contacto removido de la lista de ignorados',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error removiendo contacto:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * PUT - Limpiar contactos
 * ?action=expired  -> Solo expirados (default)
 * ?action=all      -> Todos los contactos
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'expired';

    console.log(`📥 PUT /api/crm-whatsapp/ignored-contacts - Acción: ${action}`);

    let result: ResultSetHeader;
    let message: string;

    if (action === 'all') {
      [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM ai_ignored_contacts'
      );
      message = `${result.affectedRows} contactos eliminados (todos)`;
    } else {
      [result] = await pool.execute<ResultSetHeader>(`
        DELETE FROM ai_ignored_contacts
        WHERE expires_at IS NOT NULL AND expires_at <= NOW()
      `);
      message = `${result.affectedRows} contactos expirados eliminados`;
    }

    console.log(`✅ ${message}`);

    return NextResponse.json({
      success: true,
      message,
      deleted: result.affectedRows,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error limpiando contactos:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
