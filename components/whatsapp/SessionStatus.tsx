/************************************************************
 * components/whatsapp/SessionStatus.tsx
 * Indicador de estado de sesión
 ************************************************************/

'use client';

import type { SessionStatus as StatusType } from '@/lib/whatsapp/types';

interface SessionStatusProps {
  status: StatusType;
  phone?: string | null;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<StatusType, { color: string; bg: string; label: string }> = {
  disconnected: {
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-700',
    label: 'Desconectado',
  },
  connecting: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Conectando',
  },
  qr_pending: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Esperando QR',
  },
  connected: {
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    label: 'Conectado',
  },
  error: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    label: 'Error',
  },
};

export function SessionStatus({ status, phone, showLabel = true }: SessionStatusProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.disconnected;

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <span
          className={`w-2 h-2 rounded-full ${
            status === 'connected'
              ? 'bg-green-500'
              : status === 'connecting'
              ? 'bg-blue-500 animate-pulse'
              : status === 'qr_pending'
              ? 'bg-yellow-500 animate-pulse'
              : status === 'error'
              ? 'bg-red-500'
              : 'bg-gray-400'
          }`}
        />
        {showLabel && config.label}
      </span>
      {phone && status === 'connected' && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          +{phone}
        </span>
      )}
    </div>
  );
}

export default SessionStatus;
