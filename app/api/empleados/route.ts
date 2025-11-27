// app/api/empleados/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

// GET - Obtener todos los empleados
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter'); // Opcional: 'prioritarios', 'bajo_rendimiento'

    let query = 'SELECT * FROM empleados';
    const params: any[] = [];

    if (filter === 'prioritarios') {
      query += ' WHERE rendimiento >= 70 ORDER BY rendimiento DESC';
    } else if (filter === 'bajo_rendimiento') {
      query += ' WHERE rendimiento < 40 ORDER BY rendimiento ASC';
    } else {
      query += ' ORDER BY id ASC';
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error: any) {
    console.error('Error al obtener empleados:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo empleado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      pais,
      departamento,
      salario,
      edad,
      rendimiento,
      fecha_ingreso,
      email,
      nivel,
      satisfaccion,
    } = body;

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO empleados
       (nombre, pais, departamento, salario, edad, rendimiento, fecha_ingreso, email, nivel, satisfaccion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, pais, departamento, salario, edad, rendimiento, fecha_ingreso, email, nivel, satisfaccion]
    );

    return NextResponse.json(
      { success: true, id: result.insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear empleado:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar empleado
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

    // Lista blanca de campos permitidos para edición
    const allowedFields = [
      'nombre',
      'pais',
      'departamento',
      'salario',
      'edad',
      'rendimiento',
      'fecha_ingreso',
      'email',
      'nivel',
      'satisfaccion',
    ];

    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Campo ${field} no permitido` },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE empleados SET ${field} = ?, updated_at = NOW() WHERE id = ?`,
      [value, id]
    );

    // Actualizar ventas y analytics relacionados si el nombre cambia
    if (field === 'nombre' && result.affectedRows > 0) {
      await pool.execute(
        'UPDATE ventas SET vendedor_nombre = ? WHERE empleado_id = ?',
        [value, id]
      );
      await pool.execute(
        'UPDATE analytics SET manager_nombre = ? WHERE manager_id = ?',
        [value, id]
      );
    }

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al actualizar empleado:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar empleado
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
      'DELETE FROM empleados WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al eliminar empleado:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
