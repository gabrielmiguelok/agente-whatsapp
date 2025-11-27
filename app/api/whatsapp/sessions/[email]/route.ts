/************************************************************
 * app/api/whatsapp/sessions/[email]/route.ts
 * API para manejar sesión específica
 ************************************************************/

import { NextRequest, NextResponse } from 'next/server';
import { getSessionManager } from '@/lib/whatsapp/manager/WhatsAppSessionManager';
import { WhatsAppSessionModel } from '@/lib/whatsapp/models/WhatsAppSession';

interface RouteParams {
  params: Promise<{ email: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    const manager = getSessionManager();
    const memoryState = manager.getSessionState(decodedEmail);
    const dbSession = await WhatsAppSessionModel.findByEmail(decodedEmail);

    if (!memoryState && !dbSession) {
      return NextResponse.json(
        { success: false, error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: decodedEmail,
        status: memoryState?.status || dbSession?.status || 'disconnected',
        phone: memoryState?.phone || dbSession?.phone,
        qrCode: memoryState?.qrCode || null,
        connectedAt: memoryState?.connectedAt || dbSession?.lastConnectedAt,
        inMemory: !!memoryState,
      },
    });
  } catch (error: any) {
    console.error('[API] Error getting session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    const body = await request.json();
    const { action } = body;

    const manager = getSessionManager();

    switch (action) {
      case 'start': {
        const state = await manager.startSession(decodedEmail);
        return NextResponse.json({
          success: true,
          data: {
            email: state.email,
            status: state.status,
            phone: state.phone,
            qrCode: state.qrCode,
          },
          message: 'Sesión iniciada',
        });
      }

      case 'stop': {
        await manager.stopSession(decodedEmail);
        return NextResponse.json({
          success: true,
          message: 'Sesión detenida',
        });
      }

      case 'logout': {
        await manager.logoutSession(decodedEmail);
        return NextResponse.json({
          success: true,
          message: 'Sesión desconectada y credenciales eliminadas',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Acción desconocida: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[API] Error handling session action:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    const manager = getSessionManager();
    await manager.deleteSession(decodedEmail);

    return NextResponse.json({
      success: true,
      message: 'Sesión eliminada completamente',
    });
  } catch (error: any) {
    console.error('[API] Error deleting session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
