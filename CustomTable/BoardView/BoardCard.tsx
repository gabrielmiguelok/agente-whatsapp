'use client';

import React, { useContext, useState } from 'react';
import { getBadgeColors, getColorFromString } from '../CustomTableColumnsConfig';
import { TableEditContext } from '../index';

export type BoardCardProps = {
  row: any;
  rowId: string;
  columnsDef: any[];
  groupByField: string;
  isDarkMode: boolean;
  titleField?: string;
  subtitleField?: string;
  onDragStart?: (e: React.DragEvent, rowId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
};

/**
 * BoardCard - Tarjeta individual del tablero Kanban
 * Muestra los datos de una fila en formato tarjeta con campos configurables
 */
export default function BoardCard({
  row,
  rowId,
  columnsDef,
  groupByField,
  isDarkMode,
  titleField,
  subtitleField,
  onDragStart,
  onDragEnd,
}: BoardCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const context = useContext(TableEditContext);

  // Obtener el campo de título (primer campo de texto o el especificado)
  const getTitleValue = () => {
    if (titleField && row[titleField]) return row[titleField];

    // Buscar el primer campo tipo text o avatar
    const textCol = columnsDef.find(col =>
      col.type === 'text' || col.type === 'avatar'
    );
    return textCol ? row[textCol.accessorKey] : rowId;
  };

  // Obtener el campo de subtítulo
  const getSubtitleValue = () => {
    if (subtitleField && row[subtitleField]) return row[subtitleField];

    // Buscar el segundo campo de texto
    const textCols = columnsDef.filter(col =>
      (col.type === 'text' || col.type === 'avatar') &&
      col.accessorKey !== getTitleField()
    );
    return textCols[0] ? row[textCols[0].accessorKey] : null;
  };

  const getTitleField = () => {
    if (titleField) return titleField;
    const textCol = columnsDef.find(col => col.type === 'text' || col.type === 'avatar');
    return textCol?.accessorKey || 'id';
  };

  // Campos a mostrar (excluir el campo de agrupación y campos de sistema)
  const visibleFields = columnsDef.filter(col =>
    col.accessorKey !== groupByField &&
    col.accessorKey !== '_selectIndex' &&
    col.accessorKey !== getTitleField() &&
    col.accessorKey !== subtitleField
  );

  // Formatear valor según tipo de columna
  const formatValue = (col: any, value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span style={{ color: isDarkMode ? '#6b7280' : '#9ca3af', fontStyle: 'italic' }}>-</span>;
    }

    switch (col.type) {
      case 'badge':
      case 'select': {
        const colors = getBadgeColors(String(value), isDarkMode);
        return (
          <span style={{
            backgroundColor: colors.bg,
            color: colors.text,
            padding: '2px 8px',
            borderRadius: '3px',
            fontSize: '10px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            {value}
          </span>
        );
      }
      case 'currency': {
        const symbol = col.currencySymbol || '$';
        const formatted = Number(value).toLocaleString(col.currencyLocale || 'es-AR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return <span style={{ fontWeight: 500 }}>{symbol} {formatted}</span>;
      }
      case 'date': {
        try {
          const date = new Date(value);
          return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
          return value;
        }
      }
      case 'numeric': {
        return Number(value).toLocaleString('es-AR');
      }
      case 'percentage': {
        return `${Number(value).toLocaleString('es-AR', { maximumFractionDigits: 2 })}%`;
      }
      default:
        return String(value).length > 50 ? `${String(value).substring(0, 50)}...` : value;
    }
  };

  const cardBg = isDarkMode ? 'oklch(0.18 0.01 240)' : '#ffffff';
  const cardBorder = isDarkMode ? 'oklch(0.25 0.02 240)' : '#e5e7eb';
  const textPrimary = isDarkMode ? 'oklch(0.98 0.002 240)' : '#1f2937';
  const textSecondary = isDarkMode ? 'oklch(0.7 0.02 240)' : '#6b7280';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, rowId)}
      onDragEnd={onDragEnd}
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        cursor: 'grab',
        transition: 'all 150ms ease',
        boxShadow: isDarkMode
          ? '0 1px 3px rgba(0,0,0,0.3)'
          : '0 1px 3px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = isDarkMode
          ? '0 4px 12px rgba(18,124,243,0.2)'
          : '0 4px 12px rgba(18,124,243,0.15)';
        e.currentTarget.style.borderColor = 'rgba(18,124,243,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isDarkMode
          ? '0 1px 3px rgba(0,0,0,0.3)'
          : '0 1px 3px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = cardBorder;
      }}
    >
      {/* Título */}
      <div style={{
        fontSize: '13px',
        fontWeight: 600,
        color: textPrimary,
        marginBottom: getSubtitleValue() ? '4px' : '8px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {getTitleValue() || `#${rowId}`}
      </div>

      {/* Subtítulo */}
      {getSubtitleValue() && (
        <div style={{
          fontSize: '11px',
          color: textSecondary,
          marginBottom: '8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {getSubtitleValue()}
        </div>
      )}

      {/* Campos visibles (mostrar los primeros 3 o todos si está expandido) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        {(isExpanded ? visibleFields : visibleFields.slice(0, 3)).map(col => {
          const value = row[col.accessorKey];
          if (value === null || value === undefined || value === '') return null;

          return (
            <div
              key={col.accessorKey}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
              }}
            >
              <span style={{
                color: textSecondary,
                minWidth: '60px',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {col.header || col.accessorKey}
              </span>
              <span style={{ color: textPrimary }}>
                {formatValue(col, value)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Indicador de expansión si hay más campos */}
      {visibleFields.length > 3 && (
        <div style={{
          marginTop: '8px',
          fontSize: '10px',
          color: '#127CF3',
          textAlign: 'center',
          cursor: 'pointer',
        }}>
          {isExpanded ? 'Ver menos' : `+${visibleFields.length - 3} campos más`}
        </div>
      )}
    </div>
  );
}
