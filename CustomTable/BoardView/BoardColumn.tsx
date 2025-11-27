'use client';

import React, { useState } from 'react';
import { getBadgeColors } from '../CustomTableColumnsConfig';
import BoardCard from './BoardCard';

export type BoardColumnProps = {
  groupValue: string;
  items: any[];
  columnsDef: any[];
  groupByField: string;
  isDarkMode: boolean;
  titleField?: string;
  subtitleField?: string;
  onDrop?: (rowId: string, newGroupValue: string) => void;
  onDragStart?: (e: React.DragEvent, rowId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  columnWidth?: number;
};

/**
 * BoardColumn - Columna del tablero Kanban
 * Agrupa las tarjetas por valor del campo seleccionado
 */
export default function BoardColumn({
  groupValue,
  items,
  columnsDef,
  groupByField,
  isDarkMode,
  titleField,
  subtitleField,
  onDrop,
  onDragStart,
  onDragEnd,
  columnWidth = 280,
}: BoardColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const rowId = e.dataTransfer.getData('text/plain');
    if (rowId && onDrop) {
      onDrop(rowId, groupValue);
    }
  };

  // Colores para el header de la columna
  const headerColors = getBadgeColors(groupValue || 'Sin valor', isDarkMode);

  // Colores del tema
  const columnBg = isDarkMode ? 'oklch(0.14 0.01 240)' : '#f8fafc';
  const columnBorder = isDarkMode ? 'oklch(0.22 0.02 240)' : '#e2e8f0';
  const textPrimary = isDarkMode ? 'oklch(0.98 0.002 240)' : '#1f2937';
  const textSecondary = isDarkMode ? 'oklch(0.7 0.02 240)' : '#64748b';

  // Estilo cuando se arrastra sobre la columna
  const dragOverStyle = isDragOver ? {
    backgroundColor: isDarkMode ? 'rgba(18,124,243,0.15)' : 'rgba(18,124,243,0.08)',
    borderColor: 'rgba(18,124,243,0.4)',
  } : {};

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: columnWidth,
        minWidth: columnWidth,
        maxWidth: columnWidth,
        backgroundColor: columnBg,
        borderRadius: '10px',
        border: `1px solid ${columnBorder}`,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
        transition: 'all 150ms ease',
        ...dragOverStyle,
      }}
    >
      {/* Header de la columna */}
      <div style={{
        padding: '12px 14px',
        borderBottom: `1px solid ${columnBorder}`,
        position: 'sticky',
        top: 0,
        backgroundColor: columnBg,
        borderRadius: '10px 10px 0 0',
        zIndex: 1,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}>
          {/* Badge con el valor del grupo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflow: 'hidden',
          }}>
            <span style={{
              backgroundColor: headerColors.bg,
              color: headerColors.text,
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '180px',
            }}>
              {groupValue || 'Sin valor'}
            </span>
          </div>

          {/* Contador de items */}
          <span style={{
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            color: textSecondary,
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 600,
            minWidth: '24px',
            textAlign: 'center',
          }}>
            {items.length}
          </span>
        </div>
      </div>

      {/* Contenedor de tarjetas con scroll */}
      <div style={{
        flex: 1,
        padding: '8px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {items.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: textSecondary,
            fontSize: '12px',
            fontStyle: 'italic',
          }}>
            Sin elementos
          </div>
        ) : (
          items.map((item) => {
            const rowId = String(item.id || item._id || Math.random());
            return (
              <BoardCard
                key={rowId}
                row={item}
                rowId={rowId}
                columnsDef={columnsDef}
                groupByField={groupByField}
                isDarkMode={isDarkMode}
                titleField={titleField}
                subtitleField={subtitleField}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
