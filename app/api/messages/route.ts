// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

// GET - Obtener todos los mensajes
export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        m.*,
        c.name as contact_name
       FROM messages m
       LEFT JOIN contacts c ON m.contact_id = c.id
       ORDER BY m.created_at DESC
       LIMIT 500`
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error('❌ [MESSAGES GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo mensaje
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, message, direction, contact_id } = body;

    if (!phone || !message || !direction) {
      return NextResponse.json(
        { success: false, error: 'phone, message y direction son requeridos' },
        { status: 400 }
      );
    }

    if (!['ENVIADO', 'RECIBIDO'].includes(direction)) {
      return NextResponse.json(
        { success: false, error: 'direction debe ser ENVIADO o RECIBIDO' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO messages (phone, name, message, direction, contact_id)
       VALUES (?, ?, ?, ?, ?)`,
      [phone, name || null, message, direction, contact_id || null]
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT m.*, c.name as contact_name
       FROM messages m
       LEFT JOIN contacts c ON m.contact_id = c.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ [MESSAGES POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar mensaje (solo para correcciones)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, field, value } = body;

    if (!id || !field) {
      return NextResponse.json(
        { success: false, error: 'ID y campo son requeridos' },
        { status: 400 }
      );
    }

    const allowedFields = ['phone', 'name', 'message', 'direction'];
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Campo no permitido: ${field}` },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE messages SET ${field} = ? WHERE id = ?`,
      [value, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Mensaje no encontrado' },
        { status: 404 }
      );
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT m.*, c.name as contact_name
       FROM messages m
       LEFT JOIN contacts c ON m.contact_id = c.id
       WHERE m.id = ?`,
      [id]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [MESSAGES PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar mensaje
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM messages WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [MESSAGES DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
