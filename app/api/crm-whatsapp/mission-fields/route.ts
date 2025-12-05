import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

const SYSTEM_COLUMNS = ['id', 'created_at', 'updated_at', 'instance_email'];

const FIELD_METADATA: Record<string, { label: string; description: string; type: 'string' | 'number' | 'enum'; values?: string[] }> = {
  phone: { label: 'Teléfono', description: 'Número de teléfono del contacto', type: 'string' },
  name: { label: 'Nombre', description: 'Nombre completo del cliente', type: 'string' },
  email: { label: 'Email', description: 'Correo electrónico', type: 'string' },
  zona: { label: 'Zona', description: 'Ubicación, barrio o ciudad de interés', type: 'string' },
  accion: { label: 'Operación', description: 'Compra o alquiler', type: 'enum', values: ['COMPRA', 'ALQUILER'] },
  presupuesto: { label: 'Presupuesto', description: 'Monto aproximado', type: 'number' },
  seguimiento: { label: 'Seguimiento', description: 'Estado de seguimiento', type: 'enum', values: ['SEGUIMIENTO 1', 'SEGUIMIENTO 2', 'SEGUIMIENTO 3', 'SEGUIMIENTO 4'] },
  action_status: { label: 'Estado de Acción', description: 'Estado actual del contacto', type: 'enum', values: ['PENDIENTE', 'EN PROCESO', 'COMPLETADO'] },
  sequence_status: { label: 'Estado de Secuencia', description: 'Estado de la secuencia automática', type: 'string' },
  message_to_send: { label: 'Mensaje a Enviar', description: 'Mensaje pendiente de envío', type: 'string' },
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
      .filter(col => !SYSTEM_COLUMNS.includes(col.COLUMN_NAME))
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
