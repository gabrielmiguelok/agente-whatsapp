// app/api/operaciones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { TableFieldValidator } from '@/lib/validators/TableFieldValidator';

export const dynamic = 'force-dynamic';

const validator = new TableFieldValidator();

// GET - Obtener todas las operaciones de compra
export async function GET(request: NextRequest) {
  try {
    const query = 'SELECT * FROM operaciones_compra ORDER BY fecha DESC, id DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query);

    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error('Error al obtener operaciones:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nueva operación de compra con validaciones
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 [OPERACIONES POST] Body recibido:', body);

    const {
      fecha,
      producto,
      proveedor,
      unidades,
      precio_unitario,
      con_iva,
      porcentaje_iva,
      costo_variable_porcentaje,
      observaciones
    } = body;

    // Validar campos requeridos
    if (!producto || producto.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El producto es requerido' },
        { status: 400 }
      );
    }
    if (!unidades) {
      return NextResponse.json(
        { success: false, error: 'Las unidades son requeridas' },
        { status: 400 }
      );
    }
    if (precio_unitario === undefined || precio_unitario === null) {
      return NextResponse.json(
        { success: false, error: 'El precio unitario es requerido' },
        { status: 400 }
      );
    }

    // Validar fecha si está presente
    if (fecha) {
      const fechaValidation = await validator.validateField('operaciones_compra', 'fecha', fecha);
      if (!fechaValidation.success) {
        return NextResponse.json(
          { success: false, error: fechaValidation.error },
          { status: 400 }
        );
      }
    }

    // Validar producto
    const productoValidation = await validator.validateField('operaciones_compra', 'producto', producto);
    if (!productoValidation.success) {
      return NextResponse.json(
        { success: false, error: productoValidation.error },
        { status: 400 }
      );
    }

    // Validar proveedor si está presente
    if (proveedor && proveedor.trim() !== '') {
      const proveedorValidation = await validator.validateField('operaciones_compra', 'proveedor', proveedor);
      if (!proveedorValidation.success) {
        return NextResponse.json(
          { success: false, error: proveedorValidation.error },
          { status: 400 }
        );
      }
    }

    // Validar unidades
    const unidadesValidation = await validator.validateField('operaciones_compra', 'unidades', unidades);
    if (!unidadesValidation.success) {
      return NextResponse.json(
        { success: false, error: unidadesValidation.error },
        { status: 400 }
      );
    }

    // Validar precio_unitario
    const precioValidation = await validator.validateField('operaciones_compra', 'precio_unitario', precio_unitario);
    if (!precioValidation.success) {
      return NextResponse.json(
        { success: false, error: precioValidation.error },
        { status: 400 }
      );
    }

    // Validar con_iva
    const conIvaValue = con_iva !== undefined ? String(con_iva) : '0';
    const conIvaValidation = await validator.validateField('operaciones_compra', 'con_iva', conIvaValue);
    if (!conIvaValidation.success) {
      return NextResponse.json(
        { success: false, error: conIvaValidation.error },
        { status: 400 }
      );
    }

    // Validar porcentaje_iva
    const porcentajeIva = porcentaje_iva !== undefined ? porcentaje_iva : 21;
    const porcentajeIvaValidation = await validator.validateField('operaciones_compra', 'porcentaje_iva', porcentajeIva);
    if (!porcentajeIvaValidation.success) {
      return NextResponse.json(
        { success: false, error: porcentajeIvaValidation.error },
        { status: 400 }
      );
    }

    // Validar costo_variable_porcentaje
    const costoVariable = costo_variable_porcentaje !== undefined ? costo_variable_porcentaje : 0;
    const costoVariableValidation = await validator.validateField('operaciones_compra', 'costo_variable_porcentaje', costoVariable);
    if (!costoVariableValidation.success) {
      return NextResponse.json(
        { success: false, error: costoVariableValidation.error },
        { status: 400 }
      );
    }

    // Validar observaciones si está presente
    if (observaciones && observaciones.trim() !== '') {
      const observacionesValidation = await validator.validateField('operaciones_compra', 'observaciones', observaciones);
      if (!observacionesValidation.success) {
        return NextResponse.json(
          { success: false, error: observacionesValidation.error },
          { status: 400 }
        );
      }
    }

    // Insertar en la base de datos
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO operaciones_compra
       (fecha, producto, proveedor, unidades, precio_unitario, con_iva,
        porcentaje_iva, costo_variable_porcentaje, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fecha || new Date().toISOString().split('T')[0],
        producto,
        proveedor || null,
        unidades,
        precio_unitario,
        conIvaValue,
        porcentajeIva,
        costoVariable,
        observaciones || null
      ]
    );

    console.log('✅ [OPERACIONES POST] Registro creado con ID:', result.insertId);

    // Obtener el registro completo recién creado (con columnas calculadas)
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM operaciones_compra WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ [OPERACIONES POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar operación de compra con validación robusta
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
    const validationResult = await validator.validateField('operaciones_compra', field, value);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error, code: validationResult.code },
        { status: 400 }
      );
    }

    // Actualizar en la base de datos
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE operaciones_compra SET ${field} = ?, updated_at = NOW() WHERE id = ?`,
      [validationResult.data, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Operación no encontrada' },
        { status: 404 }
      );
    }

    // Retornar el registro actualizado (con columnas calculadas)
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM operaciones_compra WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, data: rows[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al actualizar operación:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar operación de compra
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
      'DELETE FROM operaciones_compra WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al eliminar operación:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
