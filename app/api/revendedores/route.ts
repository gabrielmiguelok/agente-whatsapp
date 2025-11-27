// app/api/revendedores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { TableFieldValidator } from '@/lib/validators/TableFieldValidator';

export const dynamic = 'force-dynamic';

const validator = new TableFieldValidator();

// GET - Obtener todos los revendedores
export async function GET(request: NextRequest) {
  try {
    const query = 'SELECT * FROM revendedores ORDER BY id ASC';
    const [rows] = await pool.execute<RowDataPacket[]>(query);

    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error('Error al obtener revendedores:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo revendedor con validaciones
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 [REVENDEDORES POST] Body recibido:', body);

    // Extraer campos
    const { nombre, telefono, email } = body;

    // Validar campos requeridos
    if (!nombre || nombre.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Validar nombre
    const nombreValidation = await validator.validateField('revendedores', 'nombre', nombre);
    if (!nombreValidation.success) {
      return NextResponse.json(
        { success: false, error: nombreValidation.error },
        { status: 400 }
      );
    }

    // Validar teléfono si está presente
    if (telefono && telefono.trim() !== '') {
      const telefonoValidation = await validator.validateField('revendedores', 'telefono', telefono);
      if (!telefonoValidation.success) {
        return NextResponse.json(
          { success: false, error: telefonoValidation.error },
          { status: 400 }
        );
      }
    }

    // Validar email si está presente
    if (email && email.trim() !== '') {
      const emailValidation = await validator.validateField('revendedores', 'email', email);
      if (!emailValidation.success) {
        return NextResponse.json(
          { success: false, error: emailValidation.error },
          { status: 400 }
        );
      }
    }

    // Insertar en la base de datos (fecha_alta se establece automáticamente por el DEFAULT)
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO revendedores (nombre, telefono, email)
       VALUES (?, ?, ?)`,
      [nombre, telefono || null, email || null]
    );

    console.log('✅ [REVENDEDORES POST] Registro creado con ID:', result.insertId);

    // Obtener el registro completo recién creado
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM revendedores WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ [REVENDEDORES POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar revendedor con validación robusta
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

    // Importar validador dinámicamente
    const { TableFieldValidator } = await import('@/lib/validators/TableFieldValidator');
    const validator = new TableFieldValidator();

    // Validar el campo
    const validationResult = await validator.validateField('revendedores', field, value);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error, code: validationResult.code },
        { status: 400 }
      );
    }

    // Actualizar en la base de datos
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE revendedores SET ${field} = ?, updated_at = NOW() WHERE id = ?`,
      [validationResult.data, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Revendedor no encontrado' },
        { status: 404 }
      );
    }

    // Retornar el registro actualizado
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM revendedores WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al actualizar revendedor:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar revendedor
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
      'DELETE FROM revendedores WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al eliminar revendedor:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
