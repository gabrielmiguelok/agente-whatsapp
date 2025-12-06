// app/api/select-options/route.ts
/**
 * ═══════════════════════════════════════════════════════════════════
 * API GENÉRICA PARA GESTIÓN DE OPCIONES DE SELECT
 * ═══════════════════════════════════════════════════════════════════
 *
 * Esta API es completamente independiente y flexible.
 * Permite:
 * - Obtener opciones existentes de cualquier tabla/columna
 * - Crear nuevas opciones (inserta valor en la columna especificada)
 * - Eliminar opciones (marca como inactivo o elimina físicamente)
 *
 * SEGURIDAD:
 * - Lista blanca de tablas y columnas permitidas
 * - Validación de entrada
 * - Prevención de SQL injection
 */

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN: Lista blanca de tablas/columnas permitidas
// ═══════════════════════════════════════════════════════════════════
const ALLOWED_CONFIG: Record<string, { table: string; allowedFields: string[]; valueField?: string; labelField?: string }> = {
  empleados: {
    table: 'empleados',
    allowedFields: ['pais', 'departamento', 'nivel'],
  },
  productos: {
    table: 'productos',
    allowedFields: ['categoria'],
  },
  ventas: {
    table: 'ventas',
    allowedFields: ['producto', 'region', 'estado'],
  },
  analytics: {
    table: 'analytics',
    allowedFields: ['pais', 'prioridad', 'estado'],
  },
  // ========== SISTEMA DE CONTROL ==========
  revendedores: {
    table: 'revendedores',
    allowedFields: ['id', 'nombre'],
    valueField: 'id',
    labelField: 'nombre',
  },
  clientes: {
    table: 'clientes',
    allowedFields: ['id', 'nombre'],
    valueField: 'id',
    labelField: 'nombre',
  },
  // ========== WHATSAPP CRM ==========
  contacts: {
    table: 'contacts',
    allowedFields: ['seguimiento'],
  },
};

/**
 * GET - Obtener opciones únicas de una columna
 *
 * Query params:
 * - dataset: nombre del dataset (empleados, productos, ventas, analytics)
 * - field: nombre del campo/columna
 *
 * Respuesta: { success: true, options: ['option1', 'option2', ...] }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataset = searchParams.get('dataset');
    const field = searchParams.get('field');

    // Validación de entrada
    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el dataset esté en la lista blanca
    const config = ALLOWED_CONFIG[dataset];
    if (!config) {
      return NextResponse.json(
        { success: false, error: `Dataset '${dataset}' no permitido` },
        { status: 403 }
      );
    }

    // Si tiene valueField y labelField, es un foreign key (no requiere field)
    if (config.valueField && config.labelField) {
      const query = `
        SELECT ${config.valueField} as value, ${config.labelField} as label
        FROM ${config.table}
        ORDER BY ${config.labelField} ASC
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(query);

      const options = rows.map((row) => ({
        value: String(row.value),
        label: String(row.label),
      }));

      return NextResponse.json(
        { success: true, options },
        { status: 200 }
      );
    }

    // Si no tiene valueField/labelField, requiere field
    if (!field) {
      return NextResponse.json(
        { success: false, error: 'Field es requerido para este dataset' },
        { status: 400 }
      );
    }

    // Verificar que el campo esté en la lista blanca
    if (!config.allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Campo '${field}' no permitido en ${dataset}` },
        { status: 403 }
      );
    }

    // Query segura: obtener valores únicos y no nulos (para opciones simples)
    const query = `
      SELECT DISTINCT ${field} as value
      FROM ${config.table}
      WHERE ${field} IS NOT NULL
        AND ${field} != ''
      ORDER BY ${field} ASC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query);

    // Extraer valores únicos
    const options = rows.map((row) => row.value).filter(Boolean);

    return NextResponse.json(
      { success: true, options },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al obtener opciones:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Crear nueva opción (no inserta fila, solo valida que se pueda usar)
 *
 * Body:
 * - dataset: nombre del dataset
 * - field: nombre del campo
 * - value: nuevo valor a agregar
 *
 * Respuesta: { success: true, value: 'nuevo_valor' }
 *
 * NOTA: En realidad, las opciones se crean automáticamente cuando el usuario
 * edita una celda y pone un valor nuevo. Esta ruta solo valida que el valor
 * es aceptable.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataset, field, value } = body;

    // Validación de entrada
    if (!dataset || !field || !value) {
      return NextResponse.json(
        { success: false, error: 'Dataset, field y value son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el dataset esté en la lista blanca
    const config = ALLOWED_CONFIG[dataset];
    if (!config) {
      return NextResponse.json(
        { success: false, error: `Dataset '${dataset}' no permitido` },
        { status: 403 }
      );
    }

    // Verificar que el campo esté en la lista blanca
    if (!config.allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Campo '${field}' no permitido en ${dataset}` },
        { status: 403 }
      );
    }

    // Validar que el valor no sea demasiado largo
    if (value.length > 100) {
      return NextResponse.json(
        { success: false, error: 'El valor no puede exceder 100 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el valor ya existe
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM ${config.table}
      WHERE ${field} = ?
    `;

    const [existingRows] = await pool.execute<RowDataPacket[]>(checkQuery, [value]);
    const exists = existingRows[0].count > 0;

    return NextResponse.json(
      {
        success: true,
        value,
        exists,
        message: exists
          ? 'El valor ya existe en el dataset'
          : 'El valor es válido y se puede usar',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al crear opción:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar opción (elimina todas las filas con ese valor)
 *
 * Query params:
 * - dataset: nombre del dataset
 * - field: nombre del campo
 * - value: valor a eliminar
 *
 * ADVERTENCIA: Esto eliminará TODAS las filas que tengan ese valor.
 * Usar con precaución.
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataset = searchParams.get('dataset');
    const field = searchParams.get('field');
    const value = searchParams.get('value');

    // Validación de entrada
    if (!dataset || !field || !value) {
      return NextResponse.json(
        { success: false, error: 'Dataset, field y value son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el dataset esté en la lista blanca
    const config = ALLOWED_CONFIG[dataset];
    if (!config) {
      return NextResponse.json(
        { success: false, error: `Dataset '${dataset}' no permitido` },
        { status: 403 }
      );
    }

    // Verificar que el campo esté en la lista blanca
    if (!config.allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Campo '${field}' no permitido en ${dataset}` },
        { status: 403 }
      );
    }

    // En lugar de eliminar físicamente, establecer el campo como NULL
    // Esto es más seguro y permite recuperación
    const updateQuery = `
      UPDATE ${config.table}
      SET ${field} = NULL, updated_at = NOW()
      WHERE ${field} = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(updateQuery, [value]);

    return NextResponse.json(
      {
        success: true,
        affectedRows: result.affectedRows,
        message: `Se actualizaron ${result.affectedRows} filas`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al eliminar opción:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
