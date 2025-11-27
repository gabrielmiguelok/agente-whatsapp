/************************************************************
 * components/whatsapp/SessionCard.tsx
 * Tarjeta de sesión en la lista
 ************************************************************/

'use client';

import Link from 'next/link';
import { SessionStatus } from './SessionStatus';
import type { SessionStatus as StatusType } from '@/lib/whatsapp/types';

interface SessionCardProps {
  email: string;
  status: StatusType;
  phone?: string | null;
  connectedAt?: Date | string | null;
  inMemory?: boolean;
}

export function SessionCard({ email, status, phone, connectedAt, inMemory }: SessionCardProps) {
  const formattedDate = connectedAt
    ? new Date(connectedAt).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <Link href={`/whatsapp/${encodeURIComponent(email)}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">{email}</h3>
            <div className="mt-2">
              <SessionStatus status={status} phone={phone} />
            </div>
            {formattedDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Última conexión: {formattedDate}
              </p>
            )}
          </div>
          <div className="ml-4 flex flex-col items-end gap-1">
            {inMemory && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                En memoria
              </span>
            )}
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SessionCard;
