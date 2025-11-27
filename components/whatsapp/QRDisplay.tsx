/************************************************************
 * components/whatsapp/QRDisplay.tsx
 * Componente para mostrar QR de WhatsApp
 ************************************************************/

'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRDisplayProps {
  qrCode: string | null;
  status: string;
}

export function QRDisplay({ qrCode, status }: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!qrCode || !canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, qrCode, {
      width: 280,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then(() => setError(null))
      .catch((err) => setError(err.message));
  }, [qrCode]);

  if (status === 'connected') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-lg font-medium text-green-700 dark:text-green-300">Conectado</p>
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-medium text-blue-700 dark:text-blue-300">Conectando...</p>
        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Esperando código QR</p>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m10 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Sin QR</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Inicia la sesión para ver el QR</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">Error generando QR: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <canvas ref={canvasRef} className="rounded" />
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
        Escanea este código con WhatsApp en tu teléfono
      </p>
    </div>
  );
}

export default QRDisplay;
