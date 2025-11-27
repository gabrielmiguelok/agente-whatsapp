'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { SessionStatus } from '@/lib/whatsapp/types';

interface StatusIndicatorProps {
  status: SessionStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const statusConfig: Record<SessionStatus, { color: string; bg: string; label: string; pulse: boolean }> = {
  connected: {
    color: 'rgb(34, 197, 94)',
    bg: 'rgba(34, 197, 94, 0.15)',
    label: 'Conectado',
    pulse: true,
  },
  connecting: {
    color: 'rgb(234, 179, 8)',
    bg: 'rgba(234, 179, 8, 0.15)',
    label: 'Conectando...',
    pulse: true,
  },
  qr_pending: {
    color: 'rgb(59, 130, 246)',
    bg: 'rgba(59, 130, 246, 0.15)',
    label: 'Esperando QR',
    pulse: true,
  },
  disconnected: {
    color: 'rgb(156, 163, 175)',
    bg: 'rgba(156, 163, 175, 0.15)',
    label: 'Desconectado',
    pulse: false,
  },
};

const sizes = {
  sm: { dot: 8, text: 'text-xs', gap: 'gap-1.5' },
  md: { dot: 10, text: 'text-sm', gap: 'gap-2' },
  lg: { dot: 12, text: 'text-base', gap: 'gap-2.5' },
};

export function StatusIndicator({ status, size = 'md', showLabel = true }: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizeConfig = sizes[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center ${sizeConfig.gap}`}
    >
      <span
        className="relative flex items-center justify-center"
        style={{ width: sizeConfig.dot, height: sizeConfig.dot }}
      >
        {config.pulse && (
          <motion.span
            className="absolute rounded-full"
            style={{
              width: sizeConfig.dot,
              height: sizeConfig.dot,
              backgroundColor: config.color,
            }}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        <span
          className="relative rounded-full"
          style={{
            width: sizeConfig.dot,
            height: sizeConfig.dot,
            backgroundColor: config.color,
          }}
        />
      </span>

      <AnimatePresence mode="wait">
        {showLabel && (
          <motion.span
            key={status}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            className={`font-medium ${sizeConfig.text}`}
            style={{ color: config.color }}
          >
            {config.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
