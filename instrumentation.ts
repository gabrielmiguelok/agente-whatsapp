export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('[Process] unhandledRejection:', reason?.message || reason);
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('[Process] uncaughtException:', error?.message || error);
    });

    const { getSessionManager } = await import('@/lib/whatsapp/manager/WhatsAppSessionManager');

    const SESSION_ID = process.env.WHATSAPP_SESSION_ID || 'crm-onia';

    console.log(`[Auto-Start] Iniciando sesión de WhatsApp (${SESSION_ID})...`);

    const cleanup = async () => {
      console.log('[Auto-Start] Cerrando sesiones...');
      try {
        const manager = getSessionManager();
        await manager.shutdownAll();
      } catch (e: any) {
        console.error('[Auto-Start] Error en cleanup:', e?.message || e);
      }
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    setTimeout(async () => {
      try {
        const manager = getSessionManager();
        await manager.startSession(SESSION_ID);
        console.log('[Auto-Start] Sesión de WhatsApp iniciada correctamente');
      } catch (error: any) {
        console.error('[Auto-Start] Error iniciando sesión:', error?.message || error);
      }
    }, 3000);
  }
}
