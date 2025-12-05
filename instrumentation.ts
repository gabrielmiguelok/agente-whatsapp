export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('[Process] unhandledRejection:', reason?.message || reason);
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('[Process] uncaughtException:', error?.message || error);
    });

    // Dynamic imports para módulos que usan fs
    const { getSessionManager } = await import('@/lib/whatsapp/manager/WhatsAppSessionManager');
    const { hasValidSession } = await import('@/lib/whatsapp/utils/sessionValidator');

    const SESSION_ID = process.env.WHATSAPP_SESSION_ID || 'agentewhatsapp';

    console.log(`[WhatsApp] Verificando sesión (${SESSION_ID})...`);

    const cleanup = async () => {
      console.log('[WhatsApp] Cerrando sesiones...');
      try {
        const manager = getSessionManager();
        await manager.shutdownAll();
      } catch (e: any) {
        console.error('[WhatsApp] Error en cleanup:', e?.message || e);
      }
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Solo auto-conectar si hay una sesión válida (credenciales guardadas)
    const hasSession = hasValidSession(SESSION_ID);

    if (hasSession) {
      console.log(`[WhatsApp] Sesión válida encontrada, auto-conectando en 3s...`);
      setTimeout(async () => {
        try {
          const manager = getSessionManager();
          await manager.startSession(SESSION_ID);
          console.log('[WhatsApp] Sesión reconectada correctamente');
        } catch (error: any) {
          console.error('[WhatsApp] Error reconectando:', error?.message || error);
        }
      }, 3000);
    } else {
      console.log(`[WhatsApp] No hay sesión válida. Use la UI para iniciar y escanear QR.`);
    }
  }
}
