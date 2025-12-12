import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [columns] = await pool.execute<RowDataPacket[]>(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'contacts'
       ORDER BY ORDINAL_POSITION`
    );

    const excludedColumns = [
      'id', 'phone', 'name', 'instance_email', 'created_at', 'updated_at',
      'seguimiento', 'localidad'
    ];

    const customColumns = columns.filter(
      (col: any) => !excludedColumns.includes(col.COLUMN_NAME)
    );

    return NextResponse.json({
      success: true,
      data: customColumns.map((col: any) => ({
        name: col.COLUMN_NAME,
        type: col.DATA_TYPE,
        nullable: col.IS_NULLABLE === 'YES',
        default: col.COLUMN_DEFAULT,
      })),
    });
  } catch (error: any) {
    console.error('❌ [CONTACTS COLUMNS GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { columnName, columnType = 'badge' } = body;

    if (!columnName || columnName.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El nombre de la columna es requerido' },
        { status: 400 }
      );
    }

    const safeName = columnName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 64);

    if (!safeName || safeName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Nombre de columna inválido' },
        { status: 400 }
      );
    }

    const reservedWords = [
      'id', 'phone', 'name', 'email', 'select', 'from', 'where', 'order',
      'group', 'by', 'insert', 'update', 'delete', 'create', 'drop', 'table'
    ];
    if (reservedWords.includes(safeName)) {
      return NextResponse.json(
        { success: false, error: 'Nombre de columna reservado' },
        { status: 400 }
      );
    }

    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'contacts' AND COLUMN_NAME = ?`,
      [safeName]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una columna con ese nombre' },
        { status: 409 }
      );
    }

    let sqlType = 'VARCHAR(255)';
    if (columnType === 'number' || columnType === 'currency') {
      sqlType = 'DECIMAL(12,2)';
    } else if (columnType === 'date') {
      sqlType = 'DATE';
    } else if (columnType === 'text' || columnType === 'badge') {
      sqlType = 'VARCHAR(255)';
    }

    await pool.execute(`ALTER TABLE contacts ADD COLUMN \`${safeName}\` ${sqlType} NULL`);

    console.log(`✅ [CONTACTS COLUMNS] Nueva columna creada: ${safeName} (${sqlType})`);

    return NextResponse.json({
      success: true,
      data: {
        name: safeName,
        displayName: columnName,
        type: columnType,
        sqlType,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ [CONTACTS COLUMNS POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const columnName = searchParams.get('name');

    if (!columnName) {
      return NextResponse.json(
        { success: false, error: 'Nombre de columna requerido' },
        { status: 400 }
      );
    }

    const protectedColumns = [
      'id', 'phone', 'name', 'instance_email', 'created_at', 'updated_at',
      'seguimiento', 'localidad'
    ];

    if (protectedColumns.includes(columnName)) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar esta columna' },
        { status: 403 }
      );
    }

    await pool.execute(`ALTER TABLE contacts DROP COLUMN \`${columnName}\``);

    console.log(`✅ [CONTACTS COLUMNS] Columna eliminada: ${columnName}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ [CONTACTS COLUMNS DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
