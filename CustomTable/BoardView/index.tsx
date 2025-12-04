'use client';

import React, { useState, useMemo, useContext, useCallback } from 'react';
import { Box } from '@mui/material';
import BoardColumn from './BoardColumn';
import { TableEditContext } from '../index';
import { getTableTheme } from '../theme/colors';

export type BoardViewProps = {
  data: any[];
  columnsDef: any[];
  groupByField: string;
  isDarkMode: boolean;
  titleField?: string;
  subtitleField?: string;
  onCellEdit?: (rowId: string, colId: string, newValue: string) => void;
  globalFilter?: string;
};

/**
 * BoardView - Vista de tablero tipo Kanban
 *
 * Agrupa los datos por un campo tipo select/badge y los muestra
 * en columnas arrastrables estilo Notion/Trello
 */
export default function BoardView({
  data,
  columnsDef,
  groupByField,
  isDarkMode,
  titleField,
  subtitleField,
  onCellEdit,
  globalFilter = '',
}: BoardViewProps) {
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [draggedColumnValue, setDraggedColumnValue] = useState<string | null>(null);
  const [dropTargetColumnValue, setDropTargetColumnValue] = useState<string | null>(null);
  const [columnOrderState, setColumnOrderState] = useState<string[] | null>(null);
  const context = useContext(TableEditContext);
  const theme = getTableTheme(isDarkMode);

  // Obtener la definición de la columna de agrupación
  const groupColumn = useMemo(() =>
    columnsDef.find(col => col.accessorKey === groupByField),
    [columnsDef, groupByField]
  );

  // Filtrar datos por filtro global
  const filteredData = useMemo(() => {
    if (!globalFilter) return data;

    const lowerFilter = globalFilter.toLowerCase();
    return data.filter(row => {
      return Object.values(row).some(value =>
        value !== null &&
        value !== undefined &&
        String(value).toLowerCase().includes(lowerFilter)
      );
    });
  }, [data, globalFilter]);

  // Obtener todos los valores únicos del campo de agrupación
  const baseGroupValues = useMemo(() => {
    const values = new Set<string>();

    // Agregar valores de las opciones definidas (si existen)
    if (groupColumn?.options && Array.isArray(groupColumn.options)) {
      groupColumn.options.forEach((opt: any) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        if (val) values.add(String(val));
      });
    }

    // Agregar valores de los datos
    filteredData.forEach(row => {
      const value = row[groupByField];
      if (value !== null && value !== undefined && value !== '') {
        values.add(String(value));
      }
    });

    // Siempre incluir "Sin valor" para items sin el campo asignado
    values.add('');

    return Array.from(values).sort((a, b) => {
      // "Sin valor" (string vacío) siempre al final
      if (a === '') return 1;
      if (b === '') return -1;
      return a.localeCompare(b);
    });
  }, [filteredData, groupByField, groupColumn]);

  // Usar orden personalizado si existe, sino usar el orden base
  const groupValues = useMemo(() => {
    if (!columnOrderState) return baseGroupValues;

    // Ordenar según el estado guardado, agregando nuevos valores al final
    const ordered = [...columnOrderState].filter(v => baseGroupValues.includes(v));
    const newValues = baseGroupValues.filter(v => !columnOrderState.includes(v));
    return [...ordered, ...newValues];
  }, [baseGroupValues, columnOrderState]);

  // Handlers para drag & drop de columnas
  const handleColumnDragStart = useCallback((columnValue: string) => {
    setDraggedColumnValue(columnValue);
  }, []);

  const handleColumnDragOver = useCallback((columnValue: string) => {
    if (columnValue !== draggedColumnValue) {
      setDropTargetColumnValue(columnValue);
    }
  }, [draggedColumnValue]);

  const handleColumnDragEnd = useCallback(() => {
    setDraggedColumnValue(null);
    setDropTargetColumnValue(null);
  }, []);

  const handleColumnDrop = useCallback((targetColumnValue: string) => {
    if (!draggedColumnValue || draggedColumnValue === targetColumnValue) {
      handleColumnDragEnd();
      return;
    }

    const currentOrder = [...groupValues];
    const dragIndex = currentOrder.indexOf(draggedColumnValue);
    const dropIndex = currentOrder.indexOf(targetColumnValue);

    if (dragIndex === -1 || dropIndex === -1) {
      handleColumnDragEnd();
      return;
    }

    currentOrder.splice(dragIndex, 1);
    currentOrder.splice(dropIndex, 0, draggedColumnValue);

    setColumnOrderState(currentOrder);
    handleColumnDragEnd();
  }, [draggedColumnValue, groupValues, handleColumnDragEnd]);

  // Agrupar datos por el campo seleccionado
  const groupedData = useMemo(() => {
    const groups: Record<string, any[]> = {};

    // Inicializar todos los grupos
    groupValues.forEach(value => {
      groups[value] = [];
    });

    // Distribuir datos en grupos
    filteredData.forEach(row => {
      const value = row[groupByField];
      const groupKey = (value !== null && value !== undefined && value !== '')
        ? String(value)
        : '';
      if (groups[groupKey]) {
        groups[groupKey].push(row);
      }
    });

    return groups;
  }, [filteredData, groupByField, groupValues]);

  // Manejador de drag & drop
  const handleDragStart = (e: React.DragEvent, rowId: string) => {
    setDraggedRowId(rowId);
    e.dataTransfer.setData('text/plain', rowId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedRowId(null);
  };

  const handleDrop = (rowId: string, newGroupValue: string) => {
    if (onCellEdit) {
      // Llamar al handler de edición con el nuevo valor
      onCellEdit(rowId, groupByField, newGroupValue);
    }
    if (context?.handleConfirmCellEdit) {
      context.handleConfirmCellEdit(rowId, groupByField, newGroupValue);
    }
    setDraggedRowId(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        backgroundColor: theme.bg.primary,
      }}
    >
      {/* Header con información del tablero */}
      <Box
        sx={{
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.border.primary}`,
          backgroundColor: theme.bg.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            fontSize: '13px',
            color: theme.text.secondary,
          }}>
            Agrupado por:
          </span>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: theme.text.primary,
            backgroundColor: isDarkMode ? 'rgba(18,124,243,0.15)' : 'rgba(18,124,243,0.1)',
            padding: '4px 10px',
            borderRadius: '4px',
          }}>
            {groupColumn?.header || groupByField}
          </span>
        </div>

        <span style={{
          fontSize: '12px',
          color: theme.text.secondary,
        }}>
          {filteredData.length} elementos en {groupValues.length} grupos
        </span>
      </Box>

      {/* Contenedor de columnas con scroll horizontal */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          padding: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          '&::-webkit-scrollbar': {
            width: '12px',
            height: '12px',
          },
          '&::-webkit-scrollbar-track': {
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            borderRadius: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            borderRadius: '6px',
            border: '2px solid transparent',
            backgroundClip: 'content-box',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            backgroundClip: 'content-box',
          },
        }}
      >
        {groupValues.map(groupValue => (
          <BoardColumn
            key={groupValue || '_empty'}
            groupValue={groupValue}
            items={groupedData[groupValue] || []}
            columnsDef={columnsDef}
            groupByField={groupByField}
            isDarkMode={isDarkMode}
            titleField={titleField}
            subtitleField={subtitleField}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            isColumnDragging={draggedColumnValue === groupValue}
            isColumnDropTarget={dropTargetColumnValue === groupValue && draggedColumnValue !== groupValue}
            onColumnDragStart={handleColumnDragStart}
            onColumnDragOver={handleColumnDragOver}
            onColumnDragEnd={handleColumnDragEnd}
            onColumnDrop={handleColumnDrop}
          />
        ))}
      </Box>
    </Box>
  );
}
