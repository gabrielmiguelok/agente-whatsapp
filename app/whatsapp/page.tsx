/************************************************************
 * app/whatsapp/page.tsx
 * Sesión única de WhatsApp - Sin selección de email
 ************************************************************/

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { QRDisplay, SessionStatus } from '@/components/whatsapp';
import type { SessionStatus as StatusType } from '@/lib/whatsapp/types';

// Identificador fijo para la sesión única
const SESSION_ID = 'crm-onia';

interface SessionData {
  email: string;
  status: StatusType;
  phone: string | null;
  qrCode: string | null;
  connectedAt: string | null;
  inMemory: boolean;
}

export default function WhatsAppPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);

  // Crear o obtener la sesión
  const initializeSession = useCallback(async () => {
    setInitializing(true);
    try {
      // Intentar crear la sesión (si ya existe, la API debería manejarlo)
      const createResponse = await fetch('/api/whatsapp/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: SESSION_ID }),
      });

      const createData = await createResponse.json();

      // Si se creó o ya existía, obtener el estado actual
      if (createData.success || createResponse.status === 409) {
        await fetchSession();
      } else {
        throw new Error(createData.error || 'Error inicializando sesión');
      }
    } catch (err: any) {
      // Si falla la creación, intentar obtener la sesión existente
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
          // Sesión no existe, crearla
          setSession(null);
          return;
        }
        throw new Error(data.error || 'Error cargando sesión');
      }

      setSession(data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error cargando sesión');
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicializar al montar
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

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

      if (!data.success) {
        throw new Error(data.error || 'Error ejecutando acción');
      }

      await fetchSession();
    } catch (err: any) {
      setError(err.message || 'Error ejecutando acción');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || initializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {initializing ? 'Inicializando sesión...' : 'Cargando...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Back to CRM link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al CRM
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp CRM
              </h1>
              <div className="mt-3">
                <SessionStatus status={session?.status || 'disconnected'} phone={session?.phone} />
              </div>
            </div>
            {session?.inMemory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                En memoria
              </span>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* QR Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Código QR
          </h2>
          <QRDisplay qrCode={session?.qrCode || null} status={session?.status || 'disconnected'} />
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Acciones
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {session?.status !== 'connected' && session?.status !== 'connecting' && (
              <button
                onClick={() => handleAction('start')}
                disabled={actionLoading !== null}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading === 'start' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                Iniciar Sesión
              </button>
            )}

            {(session?.status === 'connected' || session?.status === 'connecting') && (
              <button
                onClick={() => handleAction('stop')}
                disabled={actionLoading !== null}
                className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading === 'stop' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    />
                  </svg>
                )}
                Detener
              </button>
            )}

            <button
              onClick={() => handleAction('logout')}
              disabled={actionLoading !== null}
              className="px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {actionLoading === 'logout' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              )}
              Cerrar Sesión
            </button>

            <button
              onClick={fetchSession}
              disabled={actionLoading !== null}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Actualizar
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Iniciar:</strong> Conecta WhatsApp y genera el código QR.
              <br />
              <strong>Detener:</strong> Pausa la conexión sin perder la sesión.
              <br />
              <strong>Cerrar Sesión:</strong> Desconecta y elimina las credenciales (requerirá escanear QR de nuevo).
            </p>
          </div>
        </div>

        {/* Connection info */}
        {session?.connectedAt && session?.status === 'connected' && (
          <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
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
                {session.phone && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Teléfono: {session.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
