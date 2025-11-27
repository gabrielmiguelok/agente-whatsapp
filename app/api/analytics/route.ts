// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

// GET - Obtener todos los proyectos de analytics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter'); // Opcional: 'criticos', 'completados'

    let query = 'SELECT * FROM analytics';
    const params: any[] = [];

    if (filter === 'criticos') {
      query += ' WHERE prioridad = "Crítico" ORDER BY rendimiento ASC';
    } else if (filter === 'completados') {
      query += ' WHERE estado = "Completado" ORDER BY completado DESC';
    } else if (filter === 'activos') {
      query += ' WHERE estado IN ("Activo", "En Proceso") ORDER BY prioridad DESC, rendimiento DESC';
    } else {
      query += ' ORDER BY id ASC';
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    // Parsear JSON de tendencia
    const parsedRows = rows.map((row: any) => ({
      ...row,
      tendencia: row.tendencia ? JSON.parse(row.tendencia) : [],
    }));

    return NextResponse.json({ success: true, data: parsedRows }, { status: 200 });
  } catch (error: any) {
    console.error('Error al obtener analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo proyecto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      proyecto,
      manager_nombre,
      pais,
      prioridad,
      estado,
      rendimiento,
      completado,
      satisfaccion,
      tendencia,
      manager_id,
    } = body;

    const tendenciaJson = JSON.stringify(tendencia || []);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO analytics
       (proyecto, manager_nombre, pais, prioridad, estado, rendimiento, completado, satisfaccion, tendencia, manager_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [proyecto, manager_nombre, pais, prioridad, estado, rendimiento, completado, satisfaccion, tendenciaJson, manager_id]
    );

    return NextResponse.json(
      { success: true, id: result.insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear proyecto:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar proyecto
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
      'proyecto',
      'manager_nombre',
      'pais',
      'prioridad',
      'estado',
      'rendimiento',
      'completado',
      'satisfaccion',
      'tendencia',
    ];

    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Campo ${field} no permitido` },
        { status: 400 }
      );
    }

    // Si es tendencia, convertir a JSON
    let finalValue = value;
    if (field === 'tendencia') {
      finalValue = JSON.stringify(value);
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE analytics SET ${field} = ?, updated_at = NOW() WHERE id = ?`,
      [finalValue, id]
    );

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al actualizar proyecto:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar proyecto
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
      'DELETE FROM analytics WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al eliminar proyecto:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
