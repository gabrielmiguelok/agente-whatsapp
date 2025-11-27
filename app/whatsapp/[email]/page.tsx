/************************************************************
 * app/whatsapp/[email]/page.tsx
 * Detalle de sesión con QR
 ************************************************************/

'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRDisplay, SessionStatus } from '@/components/whatsapp';
import type { SessionStatus as StatusType } from '@/lib/whatsapp/types';

interface SessionData {
  email: string;
  status: StatusType;
  phone: string | null;
  qrCode: string | null;
  connectedAt: string | null;
  inMemory: boolean;
}

interface PageProps {
  params: Promise<{ email: string }>;
}

export default function WhatsAppSessionDetailPage({ params }: PageProps) {
  const { email } = use(params);
  const decodedEmail = decodeURIComponent(email);
  const router = useRouter();

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/whatsapp/sessions/${encodeURIComponent(decodedEmail)}`);
      const data = await response.json();

      if (!data.success) {
        if (response.status === 404) {
          setError('Sesión no encontrada');
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
  }, [decodedEmail]);

  // Polling para actualizaciones (cada 2 segundos)
  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, [decodedEmail, fetchSession]);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      const response = await fetch(`/api/whatsapp/sessions/${encodeURIComponent(decodedEmail)}`, {
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

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta sesión? Esta acción no se puede deshacer.')) {
      return;
    }

    setActionLoading('delete');
    try {
      const response = await fetch(`/api/whatsapp/sessions/${encodeURIComponent(decodedEmail)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error eliminando sesión');
      }

      router.push('/whatsapp');
    } catch (err: any) {
      setError(err.message || 'Error eliminando sesión');
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <Link
            href="/whatsapp"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </Link>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Back button */}
        <Link
          href="/whatsapp"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a sesiones
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{decodedEmail}</h1>
              <div className="mt-2">
                <SessionStatus status={session?.status || 'disconnected'} phone={session?.phone} />
              </div>
            </div>
            {session?.inMemory && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                En memoria
              </span>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* QR Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Código QR</h2>
          <QRDisplay qrCode={session?.qrCode || null} status={session?.status || 'disconnected'} />
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones</h2>
          <div className="grid grid-cols-2 gap-4">
            {session?.status !== 'connected' && session?.status !== 'connecting' && (
              <button
                onClick={() => handleAction('start')}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading === 'start' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                Iniciar
              </button>
            )}

            {(session?.status === 'connected' || session?.status === 'connecting') && (
              <button
                onClick={() => handleAction('stop')}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading === 'stop' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {actionLoading === 'logout' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
              Logout
            </button>

            <button
              onClick={handleDelete}
              disabled={actionLoading !== null}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {actionLoading === 'delete' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
              Eliminar
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            <strong>Logout:</strong> Desconecta y elimina las credenciales guardadas.
            <br />
            <strong>Eliminar:</strong> Elimina la sesión completamente de la base de datos.
          </p>
        </div>

        {/* Info */}
        {session?.connectedAt && (
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Última conexión:{' '}
            {new Date(session.connectedAt).toLocaleString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
}
