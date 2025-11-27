// CustomTable/ErrorModal.tsx
// Modal personalizado para mostrar errores de validación

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  message,
  onClose,
  isDarkMode = false
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: isDarkMode ? '#1a2332' : '#ffffff',
            borderRadius: '8px',
            boxShadow: isDarkMode
              ? '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(239, 68, 68, 0.3)'
              : '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.2)',
            maxWidth: '500px',
            width: '90%',
            position: 'relative',
            zIndex: 9999,
            border: `2px solid ${isDarkMode ? '#ef4444' : '#f87171'}`,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: `1px solid ${isDarkMode ? '#2d4a6f' : '#e5e7eb'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle
                  size={18}
                  color={isDarkMode ? '#fca5a5' : '#ef4444'}
                  strokeWidth={2.5}
                />
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 600,
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                }}
              >
                Error de Validación
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              padding: '24px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.6',
                color: isDarkMode ? '#d1d5db' : '#4b5563',
              }}
            >
              {message}
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '16px 24px',
              borderTop: `1px solid ${isDarkMode ? '#2d4a6f' : '#e5e7eb'}`,
            }}
          >
            <button
              onClick={onClose}
              style={{
                backgroundColor: isDarkMode ? '#ef4444' : '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#dc2626' : '#dc2626';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#ef4444' : '#ef4444';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
