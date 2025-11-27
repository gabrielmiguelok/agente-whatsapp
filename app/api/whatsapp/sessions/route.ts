/************************************************************
 * app/api/whatsapp/sessions/route.ts
 * API para listar y crear sesiones de WhatsApp
 ************************************************************/

import { NextRequest, NextResponse } from 'next/server';
import { getSessionManager } from '@/lib/whatsapp/manager/WhatsAppSessionManager';
import { WhatsAppSessionModel } from '@/lib/whatsapp/models/WhatsAppSession';

export async function GET() {
  try {
    // Obtener sesiones de la DB
    const dbSessions = await WhatsAppSessionModel.getAll();

    // Obtener estados en memoria
    const manager = getSessionManager();
    const memorySessions = manager.getAllSessions();

    // Combinar información
    const sessions = dbSessions.map((dbSession) => {
      const memorySession = memorySessions.find((m) => m.email === dbSession.email);
      return {
        email: dbSession.email,
        status: memorySession?.status || dbSession.status,
        phone: memorySession?.phone || dbSession.phone,
        qrCode: memorySession?.qrCode || null,
        connectedAt: memorySession?.connectedAt || dbSession.lastConnectedAt,
        createdAt: dbSession.createdAt,
        inMemory: !!memorySession,
      };
    });

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error: any) {
    console.error('[API] Error getting sessions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID de sesión es requerido' },
        { status: 400 }
      );
    }

    // Sanitizar identificador (acepta cualquier string alfanumérico)
    const sessionId = email.trim().toLowerCase();
    if (!sessionId || sessionId.length < 1) {
      return NextResponse.json(
        { success: false, error: 'ID de sesión inválido' },
        { status: 400 }
      );
    }

    // Crear o obtener sesión
    const manager = getSessionManager();
    const state = await manager.startSession(email);

    return NextResponse.json({
      success: true,
      data: {
        email: state.email,
        status: state.status,
        phone: state.phone,
        qrCode: state.qrCode,
      },
      message: `Sesión ${state.status === 'connected' ? 'conectada' : 'iniciada'}`,
    });
  } catch (error: any) {
    console.error('[API] Error creating session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
