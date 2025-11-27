'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variants = {
  primary: {
    bg: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    shadow: 'shadow-blue-500/25 hover:shadow-blue-500/40',
    text: 'text-white',
  },
  secondary: {
    bg: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700',
    shadow: 'shadow-gray-500/10',
    text: 'text-gray-700 dark:text-gray-200',
  },
  danger: {
    bg: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    shadow: 'shadow-red-500/25 hover:shadow-red-500/40',
    text: 'text-white',
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    shadow: 'shadow-amber-500/25 hover:shadow-amber-500/40',
    text: 'text-white',
  },
  success: {
    bg: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    shadow: 'shadow-green-500/25 hover:shadow-green-500/40',
    text: 'text-white',
  },
};

export function ActionButton({
  onClick,
  disabled = false,
  loading = false,
  variant,
  icon,
  children,
  className = '',
}: ActionButtonProps) {
  const config = variants[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`
        relative overflow-hidden px-5 py-3 rounded-xl font-medium
        flex items-center justify-center gap-2.5
        transition-all duration-200 ease-out
        shadow-lg ${config.shadow}
        ${config.bg} ${config.text}
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${className}
      `}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        }}
        animate={!disabled && !loading ? { translateX: ['100%', '-100%'] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />

      {loading ? (
        <motion.div
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        icon && <span className="w-5 h-5">{icon}</span>
      )}

      <span className="relative">{children}</span>
    </motion.button>
  );
}
