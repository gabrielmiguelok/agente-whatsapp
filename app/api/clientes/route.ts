// app/api/clientes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { TableFieldValidator } from '@/lib/validators/TableFieldValidator';

export const dynamic = 'force-dynamic';

const validator = new TableFieldValidator();

// GET - Obtener todos los clientes con información del responsable
export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT
        c.*,
        r.nombre as responsable_nombre
      FROM clientes c
      LEFT JOIN revendedores r ON c.responsable_id = r.id
      ORDER BY c.id ASC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query);

    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo cliente con validaciones
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 [CLIENTES POST] Body recibido:', body);

    const { nombre, telefono, email, responsable_id } = body;

    // Validar campos requeridos
    if (!nombre || nombre.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Validar nombre
    const nombreValidation = await validator.validateField('clientes', 'nombre', nombre);
    if (!nombreValidation.success) {
      return NextResponse.json(
        { success: false, error: nombreValidation.error },
        { status: 400 }
      );
    }

    // Validar teléfono si está presente
    if (telefono && telefono.trim() !== '') {
      const telefonoValidation = await validator.validateField('clientes', 'telefono', telefono);
      if (!telefonoValidation.success) {
        return NextResponse.json(
          { success: false, error: telefonoValidation.error },
          { status: 400 }
        );
      }
    }

    // Validar email si está presente
    if (email && email.trim() !== '') {
      const emailValidation = await validator.validateField('clientes', 'email', email);
      if (!emailValidation.success) {
        return NextResponse.json(
          { success: false, error: emailValidation.error },
          { status: 400 }
        );
      }
    }

    // Validar responsable_id si está presente
    if (responsable_id) {
      const responsableValidation = await validator.validateField('clientes', 'responsable_id', responsable_id);
      if (!responsableValidation.success) {
        return NextResponse.json(
          { success: false, error: responsableValidation.error },
          { status: 400 }
        );
      }
    }

    // Insertar en la base de datos (fecha se establece automáticamente)
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO clientes (nombre, telefono, email, responsable_id)
       VALUES (?, ?, ?, ?)`,
      [nombre, telefono || null, email || null, responsable_id || null]
    );

    console.log('✅ [CLIENTES POST] Registro creado con ID:', result.insertId);

    // Obtener el registro completo recién creado con JOIN
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, r.nombre as responsable_nombre
       FROM clientes c
       LEFT JOIN revendedores r ON c.responsable_id = r.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ [CLIENTES POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar cliente con validación robusta
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, field, value } = body;

    console.log('🔧 [CLIENTES PUT] Request recibido:', { id, field, value, type: typeof value });

    if (!id || !field) {
      return NextResponse.json(
        { success: false, error: 'ID y campo son requeridos' },
        { status: 400 }
      );
    }

    // Importar validador dinámicamente para evitar problemas de imports en edge runtime
    const { TableFieldValidator } = await import('@/lib/validators/TableFieldValidator');
    const validator = new TableFieldValidator();

    // Validar el campo
    console.log('🔍 [CLIENTES PUT] Validando campo:', field, 'con valor:', value);
    const validationResult = await validator.validateField('clientes', field, value);
    console.log('✅ [CLIENTES PUT] Resultado de validación:', validationResult);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error, code: validationResult.code },
        { status: 400 }
      );
    }

    // Actualizar en la base de datos
    console.log('💾 [CLIENTES PUT] Ejecutando UPDATE:', { field, value: validationResult.data, id });
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE clientes SET ${field} = ?, updated_at = NOW() WHERE id = ?`,
      [validationResult.data, id]
    );
    console.log('✅ [CLIENTES PUT] UPDATE ejecutado, affectedRows:', result.affectedRows);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Retornar el registro actualizado con JOIN
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, r.nombre as responsable_nombre
       FROM clientes c
       LEFT JOIN revendedores r ON c.responsable_id = r.id
       WHERE c.id = ?`,
      [id]
    );
    console.log('📤 [CLIENTES PUT] Retornando datos:', rows[0]);

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al actualizar cliente:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar cliente
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
      'DELETE FROM clientes WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al eliminar cliente:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
