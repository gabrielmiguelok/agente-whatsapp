import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

// Columnas excluidas de la misión (mismas que el tablero de contactos)
const EXCLUDED_COLUMNS = [
  'id', 'phone', 'email', 'instance_email', 'created_at', 'updated_at',
  'seguimiento'
];

// Metadata para campos conocidos
const FIELD_METADATA: Record<string, { label: string; description: string; type: 'string' | 'number' | 'enum'; values?: string[] }> = {
  name: { label: 'Nombre', description: 'Nombre completo del cliente', type: 'string' },
  accion: { label: 'Acción', description: 'Tipo de operación que busca el cliente', type: 'enum', values: ['COMPRA', 'ALQUILER', 'VENTA'] },
  zona: { label: 'Zona', description: 'Zona o barrio de interés', type: 'string' },
  presupuesto: { label: 'Presupuesto', description: 'Monto aproximado que maneja el cliente', type: 'number' },
};

export async function GET() {
  try {
    const [columns] = await pool.execute<RowDataPacket[]>(
      `SELECT COLUMN_NAME, DATA_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'contacts'
       ORDER BY ORDINAL_POSITION`
    );

    const fields = (columns as any[])
      .filter(col => !EXCLUDED_COLUMNS.includes(col.COLUMN_NAME))
      .map(col => {
        const name = col.COLUMN_NAME;
        const sqlType = col.DATA_TYPE.toLowerCase();
        const meta = FIELD_METADATA[name];

        const isNumeric = ['decimal', 'int', 'bigint', 'float', 'double', 'tinyint', 'smallint', 'mediumint'].includes(sqlType);

        return {
          key: name,
          label: meta?.label || name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: meta?.description || '',
          dbColumn: name,
          type: meta?.type || (isNumeric ? 'number' : 'string'),
          values: meta?.values,
        };
      });

    return NextResponse.json({ success: true, data: fields });
  } catch (error: any) {
    console.error('❌ [MISSION FIELDS] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
