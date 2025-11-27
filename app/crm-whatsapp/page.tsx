/************************************************************
 * app/crm-whatsapp/page.tsx
 * Panel Premium de CRM WhatsApp con editor de prompts
 ************************************************************/

'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  StatusIndicator,
  QRCodeDisplay,
  ActionButton,
  PromptEditor,
} from '@/components/crm-whatsapp';
import type { SessionStatus as StatusType } from '@/lib/whatsapp/types';
import type { PromptConfig } from '@/lib/whatsapp/types/promptConfig';

const SESSION_ID = 'default';

interface SessionData {
  email: string;
  status: StatusType;
  phone: string | null;
  qrCode: string | null;
  connectedAt: string | null;
  inMemory: boolean;
}

type ViewMode = 'session' | 'prompts';

export default function CRMWhatsAppPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('session');
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Inicializar sesión
  const initializeSession = useCallback(async () => {
    setInitializing(true);
    try {
      const createResponse = await fetch('/api/whatsapp/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: SESSION_ID }),
      });

      const createData = await createResponse.json();
      if (createData.success || createResponse.status === 409) {
        await fetchSession();
      } else {
        throw new Error(createData.error || 'Error inicializando sesión');
      }
    } catch {
      await fetchSession();
    } finally {
      setInitializing(false);
    }
  }, []);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/whatsapp/sessions/${SESSION_ID}`);
      const data = await response.json();

      if (!data.success) {
        if (response.status === 404) {
          setSession(null);
          return;
        }
        throw new Error(data.error || 'Error cargando sesión');
      }

      setSession(data.data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error cargando sesión';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar configuración de prompts
  const fetchPromptConfig = useCallback(async () => {
    setPromptLoading(true);
    try {
      const response = await fetch('/api/crm-whatsapp/prompt-config');
      const data = await response.json();
      if (data.success) {
        setPromptConfig(data.data);
      }
    } catch (err) {
      console.error('Error cargando config:', err);
    } finally {
      setPromptLoading(false);
    }
  }, []);

  // Guardar configuración
  const handleSavePromptConfig = async (key: string, value: string | object) => {
    try {
      const response = await fetch('/api/crm-whatsapp/prompt-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config_key: key, config_value: value }),
      });

      if (!response.ok) throw new Error('Error guardando');

      // Recargar en sesiones activas
      await fetch('/api/crm-whatsapp/prompt-config', { method: 'POST' });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error guardando:', err);
      throw err;
    }
  };

  useEffect(() => {
    initializeSession();
    fetchPromptConfig();
  }, [initializeSession, fetchPromptConfig]);

  // Polling para actualizaciones (cada 2 segundos)
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, [session?.email, fetchSession]);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      const response = await fetch(`/api/whatsapp/sessions/${SESSION_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error ejecutando acción');

      await fetchSession();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error ejecutando acción';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {initializing ? 'Inicializando sesión...' : 'Cargando...'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Success Toast */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/25 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Configuración guardada
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30"
              >
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  CRM WhatsApp
                </h1>
                <div className="mt-1">
                  <StatusIndicator status={session?.status || 'disconnected'} size="md" />
                </div>
              </div>
            </div>

            {session?.phone && session.status === 'connected' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <span className="text-sm text-green-700 dark:text-green-400">
                  <span className="font-medium">{session.phone}</span>
                </span>
              </motion.div>
            )}
          </div>
        </motion.header>

        {/* View Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="inline-flex p-1 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('session')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'session'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Sesión
              </span>
            </button>
            <button
              onClick={() => setViewMode('prompts')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'prompts'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Configuración IA
              </span>
            </button>
          </div>
        </motion.div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'session' ? (
            <motion.div
              key="session"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* QR Code Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Código QR
                  </h2>
                </div>
                <div className="p-6">
                  <QRCodeDisplay qrCode={session?.qrCode || null} status={session?.status || 'disconnected'} />
                </div>
              </motion.div>

              {/* Actions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Control de Sesión
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {session?.status !== 'connected' && session?.status !== 'connecting' && (
                      <ActionButton
                        variant="success"
                        onClick={() => handleAction('start')}
                        loading={actionLoading === 'start'}
                        disabled={actionLoading !== null}
                        icon={
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        }
                      >
                        Iniciar
                      </ActionButton>
                    )}

                    {(session?.status === 'connected' || session?.status === 'connecting') && (
                      <ActionButton
                        variant="warning"
                        onClick={() => handleAction('stop')}
                        loading={actionLoading === 'stop'}
                        disabled={actionLoading !== null}
                        icon={
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                          </svg>
                        }
                      >
                        Detener
                      </ActionButton>
                    )}

                    <ActionButton
                      variant="danger"
                      onClick={() => handleAction('logout')}
                      loading={actionLoading === 'logout'}
                      disabled={actionLoading !== null}
                      icon={
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      }
                    >
                      Cerrar Sesión
                    </ActionButton>

                    <ActionButton
                      variant="secondary"
                      onClick={fetchSession}
                      disabled={actionLoading !== null}
                      icon={
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      }
                    >
                      Actualizar
                    </ActionButton>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ayuda
                    </h3>
                    <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <li><strong className="text-gray-600 dark:text-gray-300">Iniciar:</strong> Conecta y genera el código QR</li>
                      <li><strong className="text-gray-600 dark:text-gray-300">Detener:</strong> Pausa sin perder la sesión</li>
                      <li><strong className="text-gray-600 dark:text-gray-300">Cerrar Sesión:</strong> Desconecta y elimina credenciales</li>
                    </ul>
                  </div>

                  {/* Connection Info */}
                  {session?.connectedAt && session?.status === 'connected' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Conectado desde{' '}
                            {new Date(session.connectedAt).toLocaleString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="prompts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-200 dark:border-gray-700 overflow-hidden"
              style={{ minHeight: '600px' }}
            >
              <PromptEditor
                config={promptConfig}
                loading={promptLoading}
                onSave={handleSavePromptConfig}
                onReload={fetchPromptConfig}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
