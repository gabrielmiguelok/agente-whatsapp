// --- FILE: components/CustomTable/index.tsx ---
'use client';
/************************************************************************************
 * LICENSE: MIT
 * Tabla con tema claro/oscuro, filtros/sorting y edición local/remota.
 * Branding Synara 2025: Azules del logo (#127CF3, #0D47FF, #28A8FF, #0056E8).
 * Cambios:
 *  - Toggle de tema usa next-themes → afecta a toda la página.
 *  - Contenedor full-width/full-height; experiencia integrada (sin panel extra).
 *  - Export por columnas + resize independiente por columna.
 *  - Endpoint remoto: /api/registros/update (silencioso si no existe).
 *  - Paleta de colores actualizada para coincidir con Synara.
 ************************************************************************************/

import React, { useRef, useState, useEffect, createContext, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useCustomTableLogic } from './hooks/useCustomTableLogic';
import FiltersToolbar from './toolbar/FiltersToolbar';
import TableSection from './TableView';
import BoardView from './BoardView';
import { useCellEditingOrchestration } from './hooks/useCellEditingOrchestration';

import { LocalTableDataRepository } from './repositories/LocalTableDataRepository';
import { RemoteCellUpdateRepository } from './repositories/RemoteCellUpdateRepository';
import { CellDataService } from './services/CellDataService';
import { SYNARA_COLORS, getTableTheme, getPrimaryWithOpacity } from './theme/colors';
import { ErrorModal } from './ErrorModal';
import type { AddRecordState, ViewMode, SelectFieldOption } from './toolbar/FiltersToolbar';

export const TableEditContext = createContext<{
  handleConfirmCellEdit?: (rowId: string, colId: string, newValue: string) => void;
  showError?: (message: string) => void;
} | null>(null);

export type CustomTableProps = {
  data: any[];
  columnsDef: Array<{ accessorKey: string; header?: string; width?: number; isNumeric?: boolean; cell?: any }>;
  themeMode?: 'light' | 'dark'; // se mantiene por compat, pero el tema real viene de next-themes
  pageSize?: number;
  loading?: boolean;
  filtersToolbarProps?: Record<string, any>;
  onRefresh?: () => void;
  showFiltersToolbar?: boolean;
  onHideColumns?: (ids: string[]) => void;
  onHideRows?: (rowIndexes: number[]) => void;
  containerHeight?: string;
  rowHeight?: number;
  loadingText?: string;
  noResultsText?: string;
  autoCopyDelay?: number;
  onCellEdit?: (rowId: string, colId: string, newValue: string) => void;
  onAddRecord?: () => void;
  addRecordState?: AddRecordState;
  onAddColumn?: (columnName: string) => Promise<boolean>;
};

export default function CustomTable({
  data,
  columnsDef,
  themeMode = 'light',
  pageSize = 500,
  loading = false,
  filtersToolbarProps,
  onRefresh,
  showFiltersToolbar = true,
  onHideColumns,
  onHideRows,
  containerHeight = '750px',
  rowHeight = 15,
  loadingText = 'Cargando...',
  noResultsText = 'Sin resultados',
  autoCopyDelay = 1000,
  onCellEdit,
  onAddRecord,
  addRecordState = 'idle',
  onAddColumn,
}: CustomTableProps) {
  /* Repos + servicio */
  const localRepo = new LocalTableDataRepository('myTableData');
  const remoteRepo = new RemoteCellUpdateRepository('/api/registros/update'); // ← actualizado
  const cellDataService = new CellDataService(localRepo, remoteRepo);
  const { handleConfirmCellEdit, loadLocalDataOrDefault } = useCellEditingOrchestration(cellDataService);

  const [tableData, setTableData] = useState<any[]>(data);
  const [isHydrated, setIsHydrated] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Estado para vista de tablero (Kanban)
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [groupByField, setGroupByField] = useState<string>('');

  // Detectar campos tipo select/badge disponibles para agrupar
  const selectFields = useMemo<SelectFieldOption[]>(() => {
    return columnsDef
      .filter((col: any) =>
        col.type === 'badge' ||
        col.type === 'select' ||
        (col.editType === 'select' && (col.options?.length > 0 || col.useDynamicOptions))
      )
      .map((col: any) => ({
        accessorKey: col.accessorKey,
        header: col.header || col.accessorKey,
      }));
  }, [columnsDef]);

  const showError = (message: string) => {
    setErrorMessage(message);
    setErrorModalOpen(true);
  };

  const closeErrorModal = () => {
    setErrorModalOpen(false);
    setErrorMessage('');
  };

  useEffect(() => {
    setIsHydrated(true);
    // Solo usar tableData interno si NO hay onCellEdit personalizado
    if (!onCellEdit) {
      const loaded = loadLocalDataOrDefault(data);
      if (loaded) setTableData(loaded);
    }
  }, [data, loadLocalDataOrDefault, onCellEdit]);

  const handleConfirmEditCellContext = (rowId: string, colId: string, newValue: string) => {
    if (!isHydrated) return;

    // Si se proporciona un handler personalizado, usarlo en lugar del default
    if (onCellEdit) {
      onCellEdit(rowId, colId, newValue);
    } else {
      handleConfirmCellEdit(rowId, colId, newValue, tableData, setTableData);
    }
  };

  /* Tema global: next-themes */
  const { theme: currentTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted ? currentTheme === 'dark' : themeMode === 'dark';

  const handleGlobalThemeToggle = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  /* Theme colors from centralized config */
  const theme = getTableTheme(isDarkMode);
  const BRAND = SYNARA_COLORS.primary.hex;

  const {
    table,
    columnFilters,
    setColumnFilters,
    tempGlobalFilter,
    setTempGlobalFilter,
    sorting,
    toggleSort,
    handleDownloadExcel,
    columnWidths,
    handleSetColumnWidth,
    finalColumns,
    columnOrder,
    setColumnOrder,
  } = useCustomTableLogic({
    data: onCellEdit ? data : tableData,
    columnsDef,
    pageSize,
  });

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dropTargetColumn, setDropTargetColumn] = useState<string | null>(null);

  const handleDragStart = useCallback((columnId: string) => {
    if (columnId === '_selectIndex') return;
    setDraggedColumn(columnId);
  }, []);

  const handleDragOver = useCallback((columnId: string) => {
    if (columnId === '_selectIndex') return;
    if (columnId !== draggedColumn) {
      setDropTargetColumn(columnId);
    }
  }, [draggedColumn]);

  const handleDragEnd = useCallback(() => {
    setDraggedColumn(null);
    setDropTargetColumn(null);
  }, []);

  const handleDrop = useCallback((targetColumnId: string) => {
    if (!draggedColumn || draggedColumn === targetColumnId) {
      handleDragEnd();
      return;
    }

    if (targetColumnId === '_selectIndex' || draggedColumn === '_selectIndex') {
      handleDragEnd();
      return;
    }

    const currentOrder = [...columnOrder];
    const dragIndex = currentOrder.indexOf(draggedColumn);
    const dropIndex = currentOrder.indexOf(targetColumnId);

    if (dragIndex === -1 || dropIndex === -1) {
      handleDragEnd();
      return;
    }

    currentOrder.splice(dragIndex, 1);
    currentOrder.splice(dropIndex, 0, draggedColumn);

    setColumnOrder(currentOrder);
    handleDragEnd();
  }, [draggedColumn, columnOrder, setColumnOrder, handleDragEnd]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <TableEditContext.Provider value={{ handleConfirmCellEdit: handleConfirmEditCellContext, showError }}>
      <div
        className={`customTableContainer ${isDarkMode ? 'tabla-dark' : 'tabla-light'}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          minHeight: 0,
          borderRadius: 0,
          boxShadow: 'none',
          border: `1px solid ${theme.border.primary}`,
          color: theme.text.primary,
          background: theme.bg.primary,
        }}
      >
        {showFiltersToolbar && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              left: 0,
              zIndex: 9999,
              backgroundColor: theme.bg.primary,
              borderBottom: `1px solid ${theme.border.primary}`,
              boxShadow: theme.shadow.md,
            }}
          >
            <FiltersToolbar
              {...(filtersToolbarProps || {})}
              globalFilterValue={tempGlobalFilter}
              onGlobalFilterChange={setTempGlobalFilter}
              onDownloadExcel={handleDownloadExcel}
              onRefresh={onRefresh}
              isDarkMode={isDarkMode}
              onThemeToggle={handleGlobalThemeToggle}
              onAddRecord={onAddRecord}
              addRecordState={addRecordState}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              selectFields={selectFields}
              groupByField={groupByField}
              onGroupByFieldChange={setGroupByField}
              onAddColumn={onAddColumn}
            />
          </div>
        )}

        <div
          ref={containerRef}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            background: theme.bg.primary,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {viewMode === 'board' && groupByField ? (
            <BoardView
              data={onCellEdit ? data : tableData}
              columnsDef={finalColumns}
              groupByField={groupByField}
              isDarkMode={isDarkMode}
              onCellEdit={onCellEdit}
              globalFilter={tempGlobalFilter}
            />
          ) : (
            <TableSection
              table={table as any}
              loading={loading}
              columnFilters={columnFilters}
              updateColumnFilter={(colId, filterValue) =>
                setColumnFilters((prev) => ({ ...prev, [colId]: { ...prev[colId], ...filterValue } }))
              }
              columnsDef={finalColumns}
              originalColumnsDef={finalColumns}
              columnWidths={columnWidths}
              setColumnWidth={handleSetColumnWidth}
              onHideColumns={onHideColumns}
              onHideRows={onHideRows}
              sorting={sorting as any}
              toggleSort={toggleSort}
              containerHeight="100%"
              rowHeight={rowHeight}
              loadingText={loadingText}
              noResultsText={noResultsText}
              autoCopyDelay={autoCopyDelay}
              containerRef={containerRef}
              isDarkMode={isDarkMode}
              draggedColumn={draggedColumn}
              dropTargetColumn={dropTargetColumn}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          )}
        </div>

        {loading && (
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '20px',
              backgroundColor: isDarkMode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s ease-in-out',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                padding: '8px 16px',
                backgroundColor: theme.bg.primary,
                borderRadius: 8,
                border: `1px solid ${getPrimaryWithOpacity(0.22)}`,
                boxShadow: theme.shadow.lg,
                display: 'flex',
                alignItems: 'center',
                fontSize: 14,
                color: theme.text.primary,
                animation: 'pulse 1.2s infinite',
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: `2px solid ${getPrimaryWithOpacity(0.35)}`,
                  borderTopColor: BRAND,
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin .8s linear infinite',
                }}
              />
              <span>{loadingText || 'Actualizando...'}</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: translateZ(0) scale(1); }
          50% { transform: translateZ(0) scale(1.06); }
          100% { transform: translateZ(0) scale(1); }
        }
        @keyframes spin {
          0% { transform: rotate(0); }
          100% { transform: rotate(360deg); }
        }

        /* Estética base (sin CSS vars) */
        :global(table.custom-table) {
          border-collapse: collapse;
          border-spacing: 0;
          width: auto !important;
          min-width: 100% !important;
          table-layout: fixed !important;
        }
        :global(th.custom-th),
        :global(td.custom-td) {
          border-bottom: 1px solid ${theme.border.primary};
          border-right: none;
          border-left: none;
          border-top: none;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          word-wrap: break-word !important;
        }
        :global(tr:hover td.custom-td) {
          background: ${theme.interactive.hover};
        }
        :global(.custom-table:focus) {
          box-shadow: inset 0 0 0 1px ${BRAND};
        }
      `}</style>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModalOpen}
        message={errorMessage}
        onClose={closeErrorModal}
        isDarkMode={isDarkMode}
      />
    </TableEditContext.Provider>
  );
}
