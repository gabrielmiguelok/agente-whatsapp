// app/api/sucursales/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { TableFieldValidator } from '@/lib/validators/TableFieldValidator';

export const dynamic = 'force-dynamic';

const validator = new TableFieldValidator();

// GET - Obtener todas las sucursales con información completa
export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT
        s.*,
        c.nombre as cliente_nombre,
        r1.nombre as responsable_nombre,
        r2.nombre as despachante_nombre
      FROM sucursales s
      INNER JOIN clientes c ON s.cliente_id = c.id
      LEFT JOIN revendedores r1 ON s.responsable_id = r1.id
      LEFT JOIN revendedores r2 ON s.despachante_id = r2.id
      ORDER BY s.id ASC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query);

    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error('Error al obtener sucursales:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nueva sucursal con validaciones
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 [SUCURSALES POST] Body recibido:', body);

    const { cliente_id, provincia, localidad, domicilio, responsable_id, despachante_id } = body;

    // Validar campos requeridos
    if (!cliente_id) {
      return NextResponse.json(
        { success: false, error: 'El cliente es requerido' },
        { status: 400 }
      );
    }
    if (!provincia || provincia.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'La provincia es requerida' },
        { status: 400 }
      );
    }
    if (!localidad || localidad.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'La localidad es requerida' },
        { status: 400 }
      );
    }
    if (!domicilio || domicilio.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El domicilio es requerido' },
        { status: 400 }
      );
    }

    // Validar cliente_id
    const clienteValidation = await validator.validateField('sucursales', 'cliente_id', cliente_id);
    if (!clienteValidation.success) {
      return NextResponse.json(
        { success: false, error: clienteValidation.error },
        { status: 400 }
      );
    }

    // Validar provincia
    const provinciaValidation = await validator.validateField('sucursales', 'provincia', provincia);
    if (!provinciaValidation.success) {
      return NextResponse.json(
        { success: false, error: provinciaValidation.error },
        { status: 400 }
      );
    }

    // Validar localidad
    const localidadValidation = await validator.validateField('sucursales', 'localidad', localidad);
    if (!localidadValidation.success) {
      return NextResponse.json(
        { success: false, error: localidadValidation.error },
        { status: 400 }
      );
    }

    // Validar domicilio
    const domicilioValidation = await validator.validateField('sucursales', 'domicilio', domicilio);
    if (!domicilioValidation.success) {
      return NextResponse.json(
        { success: false, error: domicilioValidation.error },
        { status: 400 }
      );
    }

    // Validar responsable_id si está presente
    if (responsable_id) {
      const responsableValidation = await validator.validateField('sucursales', 'responsable_id', responsable_id);
      if (!responsableValidation.success) {
        return NextResponse.json(
          { success: false, error: responsableValidation.error },
          { status: 400 }
        );
      }
    }

    // Validar despachante_id si está presente
    if (despachante_id) {
      const despachanteValidation = await validator.validateField('sucursales', 'despachante_id', despachante_id);
      if (!despachanteValidation.success) {
        return NextResponse.json(
          { success: false, error: despachanteValidation.error },
          { status: 400 }
        );
      }
    }

    // Insertar en la base de datos
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO sucursales
       (cliente_id, provincia, localidad, domicilio, responsable_id, despachante_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cliente_id, provincia, localidad, domicilio, responsable_id || null, despachante_id || null]
    );

    console.log('✅ [SUCURSALES POST] Registro creado con ID:', result.insertId);

    // Obtener el registro completo recién creado con JOINs
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        s.*,
        c.nombre as cliente_nombre,
        r1.nombre as responsable_nombre,
        r2.nombre as despachante_nombre
      FROM sucursales s
      INNER JOIN clientes c ON s.cliente_id = c.id
      LEFT JOIN revendedores r1 ON s.responsable_id = r1.id
      LEFT JOIN revendedores r2 ON s.despachante_id = r2.id
      WHERE s.id = ?`,
      [result.insertId]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ [SUCURSALES POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar sucursal con validación robusta
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
    const validationResult = await validator.validateField('sucursales', field, value);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error, code: validationResult.code },
        { status: 400 }
      );
    }

    // Actualizar en la base de datos
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE sucursales SET ${field} = ?, updated_at = NOW() WHERE id = ?`,
      [validationResult.data, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Sucursal no encontrada' },
        { status: 404 }
      );
    }

    // Retornar el registro actualizado con JOINs
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT s.*, c.nombre as cliente_nombre,
              r1.nombre as responsable_nombre,
              r2.nombre as despachante_nombre
       FROM sucursales s
       INNER JOIN clientes c ON s.cliente_id = c.id
       LEFT JOIN revendedores r1 ON s.responsable_id = r1.id
       LEFT JOIN revendedores r2 ON s.despachante_id = r2.id
       WHERE s.id = ?`,
      [id]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al actualizar sucursal:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar sucursal
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
      'DELETE FROM sucursales WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al eliminar sucursal:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
