// app/api/ventas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

// GET - Obtener todas las ventas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter'); // Opcional: 'alta_satisfaccion', 'pendientes'

    let query = 'SELECT * FROM ventas';
    const params: any[] = [];

    if (filter === 'alta_satisfaccion') {
      query += ' WHERE satisfaccion >= 4.5 ORDER BY satisfaccion DESC';
    } else if (filter === 'pendientes') {
      query += ' WHERE estado = "Pendiente" ORDER BY fecha_venta DESC';
    } else {
      query += ' ORDER BY id ASC';
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error: any) {
    console.error('Error al obtener ventas:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nueva venta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cliente_nombre,
      producto,
      monto,
      cantidad,
      fecha_venta,
      vendedor_nombre,
      region,
      estado,
      satisfaccion,
      cliente_id,
      empleado_id,
    } = body;

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO ventas
       (cliente_nombre, producto, monto, cantidad, fecha_venta, vendedor_nombre, region, estado, satisfaccion, cliente_id, empleado_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cliente_nombre, producto, monto, cantidad, fecha_venta, vendedor_nombre, region, estado, satisfaccion, cliente_id, empleado_id]
    );

    return NextResponse.json(
      { success: true, id: result.insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear venta:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar venta
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

    const allowedFields = [
      'cliente_nombre',
      'producto',
      'monto',
      'cantidad',
      'fecha_venta',
      'vendedor_nombre',
      'region',
      'estado',
      'satisfaccion',
    ];

    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Campo ${field} no permitido` },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE ventas SET ${field} = ?, updated_at = NOW() WHERE id = ?`,
      [value, id]
    );

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al actualizar venta:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar venta
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
      'DELETE FROM ventas WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al eliminar venta:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
