// app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

// GET - Obtener todos los contactos
export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM contacts ORDER BY created_at DESC`
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error('❌ [CONTACTS GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo contacto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name } = body;

    if (!phone || phone.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El teléfono es requerido' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO contacts (phone, name, seguimiento)
       VALUES (?, ?, ?)`,
      [
        phone,
        name || null,
        'NUEVO'
      ]
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM contacts WHERE id = ?`,
      [result.insertId]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ [CONTACTS POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar contacto
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

    const protectedFields = ['id', 'created_at', 'updated_at', 'instance_email'];
    if (protectedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Campo protegido: ${field}` },
        { status: 400 }
      );
    }

    const [columns] = await pool.execute<RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'contacts' AND COLUMN_NAME = ?`,
      [field]
    );

    if ((columns as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: `Campo no existe: ${field}` },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE contacts SET \`${field}\` = ? WHERE id = ?`,
      [value, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Contacto no encontrado' },
        { status: 404 }
      );
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM contacts WHERE id = ?`,
      [id]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [CONTACTS PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar contacto
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
      'DELETE FROM contacts WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [CONTACTS DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
