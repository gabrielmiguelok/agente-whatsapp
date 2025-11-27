// app/api/sequences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

// GET - Obtener todas las secuencias con sus pasos
export async function GET() {
  try {
    // Obtener secuencias
    const [sequences] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM sequences ORDER BY id ASC`
    );

    // Obtener todos los pasos
    const [steps] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM sequence_steps ORDER BY sequence_id, step_number ASC`
    );

    // Combinar: agregar pasos a cada secuencia como string formateado
    const result = (sequences as any[]).map(seq => {
      const seqSteps = (steps as any[]).filter(s => s.sequence_id === seq.id);
      const stepsText = seqSteps.map(s => `${s.step_number}. ${s.message_text}`).join('\n');
      return {
        ...seq,
        steps_count: seqSteps.length,
        steps_preview: stepsText.substring(0, 200) + (stepsText.length > 200 ? '...' : ''),
        steps_full: stepsText,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('❌ [SEQUENCES GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nueva secuencia con pasos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trigger_keyword, active, steps } = body;

    if (!trigger_keyword || trigger_keyword.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El trigger_keyword es requerido' },
        { status: 400 }
      );
    }

    // Crear secuencia
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO sequences (trigger_keyword, active) VALUES (?, ?)`,
      [trigger_keyword, active !== false ? 1 : 0]
    );

    const sequenceId = result.insertId;

    // Crear pasos si se proporcionan
    if (steps && Array.isArray(steps) && steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        await pool.execute(
          `INSERT INTO sequence_steps (sequence_id, step_number, message_text)
           VALUES (?, ?, ?)`,
          [sequenceId, i + 1, steps[i]]
        );
      }
    }

    // Obtener secuencia con pasos
    const [seqRows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM sequences WHERE id = ?`,
      [sequenceId]
    );

    const [stepRows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM sequence_steps WHERE sequence_id = ? ORDER BY step_number`,
      [sequenceId]
    );

    const stepsText = (stepRows as any[]).map(s => `${s.step_number}. ${s.message_text}`).join('\n');

    return NextResponse.json(
      {
        success: true,
        data: {
          ...(seqRows as any[])[0],
          steps_count: stepRows.length,
          steps_preview: stepsText.substring(0, 200),
          steps_full: stepsText,
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ [SEQUENCES POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar secuencia
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

    // Si es actualización de pasos completos
    if (field === 'steps_full') {
      // Eliminar pasos existentes
      await pool.execute(
        `DELETE FROM sequence_steps WHERE sequence_id = ?`,
        [id]
      );

      // Parsear y crear nuevos pasos
      const lines = value.split('\n').filter((l: string) => l.trim());
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Remover numeración si existe (ej: "1. mensaje" -> "mensaje")
        const cleanText = line.replace(/^\d+\.\s*/, '').trim();
        if (cleanText) {
          await pool.execute(
            `INSERT INTO sequence_steps (sequence_id, step_number, message_text)
             VALUES (?, ?, ?)`,
            [id, i + 1, cleanText]
          );
        }
      }
    } else {
      // Actualizar campo de secuencia
      const allowedFields = ['trigger_keyword', 'active'];
      if (!allowedFields.includes(field)) {
        return NextResponse.json(
          { success: false, error: `Campo no permitido: ${field}` },
          { status: 400 }
        );
      }

      let finalValue = value;
      if (field === 'active') {
        finalValue = value === true || value === 'true' || value === 1 || value === '1' ? 1 : 0;
      }

      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE sequences SET ${field} = ? WHERE id = ?`,
        [finalValue, id]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, error: 'Secuencia no encontrada' },
          { status: 404 }
        );
      }
    }

    // Obtener secuencia actualizada
    const [seqRows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM sequences WHERE id = ?`,
      [id]
    );

    const [stepRows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM sequence_steps WHERE sequence_id = ? ORDER BY step_number`,
      [id]
    );

    const stepsText = (stepRows as any[]).map(s => `${s.step_number}. ${s.message_text}`).join('\n');

    return NextResponse.json(
      {
        success: true,
        data: {
          ...(seqRows as any[])[0],
          steps_count: stepRows.length,
          steps_preview: stepsText.substring(0, 200),
          steps_full: stepsText,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [SEQUENCES PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar secuencia y sus pasos
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

    // Eliminar pasos primero (FK)
    await pool.execute(
      'DELETE FROM sequence_steps WHERE sequence_id = ?',
      [id]
    );

    // Eliminar secuencia
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM sequences WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, affectedRows: result.affectedRows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [SEQUENCES DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
