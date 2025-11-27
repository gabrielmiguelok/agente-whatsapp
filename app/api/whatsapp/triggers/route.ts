/************************************************************
 * app/api/whatsapp/triggers/route.ts
 * API para recargar triggers de secuencias
 ************************************************************/

import { NextResponse } from 'next/server';
import { getSessionManager } from '@/lib/whatsapp/manager/WhatsAppSessionManager';

export async function POST() {
  try {
    const manager = getSessionManager();
    await manager.reloadTriggers();

    return NextResponse.json({
      success: true,
      message: 'Triggers recargados en todas las sesiones',
    });
  } catch (error: any) {
    console.error('[API] Error reloading triggers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
