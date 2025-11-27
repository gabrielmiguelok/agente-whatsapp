// --- FILE: components/CustomTable/TableView/index.tsx ---
/************************************************************************************
 * LICENSE: MIT
 * Cambios:
 *  - <table> usa minWidth: 100% y width: max-content → full page width,
 *    permitiendo manejo independiente del ancho de cada columna (colgroup).
 ************************************************************************************/
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import type { Table as TanTable } from '@tanstack/react-table';

import useCellSelection from './hooks/useCellSelection';
import useClipboardCopy from './hooks/useClipboardCopy';
import useColumnResize from './hooks/useColumnResize';
import useInlineCellEdit from './hooks/useInlineCellEdit';
import useTableViewContextMenu from './hooks/useTableViewContextMenu';

import {
  initDragListeners,
  handleHeaderMouseDown,
  handleHeaderTouchStart,
  handleRowIndexMouseDown,
  handleRowIndexTouchStart,
} from './logic/dragLogic';

import {
  selectColumnRange,
  selectRowRange,
  selectEntireRow as _selectEntireRow,
  selectEntireColumn as _selectEntireColumn,
  selectAllCells as _selectAllCells,
} from './logic/selectionLogic';

import { getCellsInfo } from './logic/domUtils';
import getSafeDisplayValue from './utils/getSafeDisplayValue';

import LoadingOverlay from './subcomponents/LoadingOverlay';
import NoResultsOverlay from './subcomponents/NoResultsOverlay';
import TableHeader from './subcomponents/TableHeader';
import TableBody from './subcomponents/TableBody';
import ContextualMenu from './subcomponents/ContextualMenu';
import ColumnFilterPopover from './subcomponents/ColumnFilterPopover';
import Pagination from './subcomponents/Pagination';

export type CellCoord = { id: string; colField: string };
export type ColWidthMap = Record<string, number>;

export type TableViewProps = {
  table: TanTable<any>;
  loading: boolean;
  columnFilters: Record<string, any>;
  updateColumnFilter: (colId: string, patch: Record<string, any>) => void;
  columnsDef: any[];
  originalColumnsDef?: any[];
  columnWidths: ColWidthMap;
  setColumnWidth: (colId: string, width: number) => void;
  onHideColumns?: (colIds: string[]) => void;
  onHideRows?: (rowIndexes: number[]) => void;
  sorting: any[];
  toggleSort: (colId: string) => void;
  containerHeight?: string;
  rowHeight?: number;
  loadingText?: string;
  noResultsText?: string;
  autoCopyDelay?: number;
  containerRef: React.RefObject<HTMLElement>;
  isDarkMode?: boolean;
};

export default function TableView({
  table,
  loading,
  columnFilters,
  updateColumnFilter,
  columnsDef,
  originalColumnsDef = [],
  columnWidths,
  setColumnWidth,
  onHideColumns,
  onHideRows,
  sorting,
  toggleSort,
  containerHeight = '400px',
  rowHeight = 15,
  loadingText = 'Cargando datos...',
  noResultsText = 'Sin resultados',
  autoCopyDelay = 1000,
  containerRef,
  isDarkMode = false,
}: TableViewProps) {
  const BRAND = '#127CF3'; // Synara primary blue

  const brandVars: React.CSSProperties = isDarkMode
    ? {
        ['--color-bg-paper' as any]: 'oklch(0.12 0.01 240)',
        ['--color-bg-elevated' as any]: 'oklch(0.15 0.01 240)',
        ['--color-text' as any]: 'oklch(0.98 0.002 240)',
        ['--color-text-muted' as any]: 'oklch(0.7 0.02 240)',
        ['--color-divider' as any]: 'oklch(0.22 0.02 240)',
        ['--color-primary' as any]: BRAND,
        ['--color-primary-weak' as any]: 'rgba(18,124,243,0.12)',
        ['--color-success' as any]: '#66bb6a',
        ['--color-success-weak' as any]: 'rgba(102,187,106,0.18)',
        ['--color-table-index-colgroup' as any]: 'oklch(0.14 0.01 240)',
        ['--color-table-index-body' as any]: 'oklch(0.13 0.01 240)',
        ['--color-table-index-header' as any]: 'oklch(0.15 0.01 240)',
        ['--color-table-header' as any]: 'oklch(0.14 0.01 240)',
        ['--color-row-hover' as any]: 'rgba(18,124,243,0.08)',
        ['--color-row-highlight' as any]: 'rgba(18,124,243,0.18)',
      }
    : {
        ['--color-bg-paper' as any]: 'oklch(1 0 0)',
        ['--color-bg-elevated' as any]: 'oklch(1 0 0)',
        ['--color-text' as any]: 'oklch(0.2 0.04 240)',
        ['--color-text-muted' as any]: 'oklch(0.5 0.02 240)',
        ['--color-divider' as any]: 'oklch(0.92 0.004 240)',
        ['--color-primary' as any]: BRAND,
        ['--color-primary-weak' as any]: 'rgba(18,124,243,0.10)',
        ['--color-success' as any]: '#2e7d32',
        ['--color-success-weak' as any]: 'rgba(46,125,50,0.12)',
        ['--color-table-index-colgroup' as any]: 'oklch(0.965 0.003 235)',
        ['--color-table-index-body' as any]: 'oklch(0.985 0.001 235)',
        ['--color-table-index-header' as any]: 'oklch(0.965 0.003 235)',
        ['--color-table-header' as any]: 'oklch(0.975 0.002 235)',
        ['--color-row-hover' as any]: 'rgba(18,124,243,0.06)',
        ['--color-row-highlight' as any]: 'rgba(18,124,243,0.14)',
      };

  const localContainerRef = useRef<HTMLDivElement | null>(null);
  const rows = table.getRowModel().rows;
  const displayedData = rows.map((r) => r.original);

  // Ref para table para evitar dependencia circular
  const tableRefForCells = React.useRef(table);
  React.useEffect(() => {
    tableRefForCells.current = table;
  }, [table]);

  const _getCellsInfo = useCallback(() => getCellsInfo(localContainerRef, tableRefForCells.current), []);

  const {
    selectedCells,
    setSelectedCells,
    anchorCell,
    focusCell,
    setFocusCell,
    setAnchorCell,
    handleKeyDownArrowSelection,
  } = useCellSelection(localContainerRef, _getCellsInfo, displayedData, columnsDef, table);

  const { copiedCells, setCopiedCells } = useClipboardCopy(
    localContainerRef,
    selectedCells,
    displayedData,
    columnsDef
  );

  async function doCopyCells(cellsToCopy: CellCoord[]) {
    if (!cellsToCopy?.length) return;
    if (!document.hasFocus()) return;
    try {
      const dataMap = new Map<string, any>();
      rows.forEach((r) => dataMap.set(r.id as string, r.original));
      const rowsMap = new Map<string, string[]>();
      cellsToCopy.forEach((cell) => {
        const rowData = dataMap.get(cell.id);
        if (!rowData) return;
        const arr = rowsMap.get(cell.id) || [];
        arr.push(String(rowData[cell.colField] ?? ''));
        rowsMap.set(cell.id, arr);
      });
      const tsv = Array.from(rowsMap.values()).map((cells) => cells.join('\t')).join('\n');
      await navigator.clipboard.writeText(tsv);
      setCopiedCells([...cellsToCopy]);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }

  // Ref para almacenar handleSingleClick y evitar dependencia circular
  const handleSingleClickRef = React.useRef<((rowId: string, colId: string, initialValue?: string | number) => void) | null>(null);

  // Refs para almacenar rows y table sin causar re-renders
  const rowsRef = React.useRef(rows);
  const tableRef = React.useRef(table);

  // Actualizar refs cuando cambien
  React.useEffect(() => {
    rowsRef.current = rows;
    tableRef.current = table;
  }, [rows, table]);

  const {
    editingCell,
    editingValue,
    isEditingCell,
    handleSingleClick,  // ← NUEVO: Para edición con un solo clic
    handleDoubleClick,   // ← Mantener compatibilidad
    handleChange,
    handleKeyDown: handleEditKeyDown,
    handleBlur,
    setInputRef,         // ← NUEVO: Para posicionar cursor al final
  } = useInlineCellEdit({
    singleClickEdit: false,    // ← DESHABILITADO: Edición solo con doble clic
    confirmDelay: 0,           // ← Sin delay en confirmación
    onNavigateNext: useCallback((currentRowId: string, currentColId: string) => {
      /**
       * Navega a la siguiente fila (misma columna) al presionar Enter
       */
      const currentRows = rowsRef.current;

      // Encontrar el índice de la fila actual
      const currentRowIndex = currentRows.findIndex(row => String(row.id) === String(currentRowId));

      if (currentRowIndex === -1) {
        console.warn('⚠️ [NAV] Fila actual no encontrada:', currentRowId);
        return;
      }

      // Verificar si hay una fila siguiente
      if (currentRowIndex + 1 >= currentRows.length) {
        console.log('ℹ️ [NAV] Ya estás en la última fila');
        return;
      }

      // Obtener la siguiente fila
      const nextRow = currentRows[currentRowIndex + 1];
      const nextRowId = String(nextRow.id);

      console.log('🔽 [NAV] Navegando de fila', currentRowId, 'a fila', nextRowId, 'columna', currentColId);

      // Obtener el valor de la celda siguiente para iniciar edición
      const cellValue = nextRow.original[currentColId];

      // Usar setTimeout para asegurar que la edición anterior se complete
      setTimeout(() => {
        // Usar ref para evitar dependencia circular
        if (handleSingleClickRef.current) {
          handleSingleClickRef.current(nextRowId, currentColId, cellValue);
        }
      }, 50);
    }, []),  // ← Sin dependencias, usa refs

    // ========== NAVEGACIÓN CON FLECHAS ==========

    onNavigateUp: useCallback((currentRowId: string, currentColId: string) => {
      /**
       * Navega a la fila anterior (misma columna) al presionar Arrow Up
       */
      const currentRows = rowsRef.current;
      const currentRowIndex = currentRows.findIndex(row => String(row.id) === String(currentRowId));

      if (currentRowIndex === -1) {
        console.warn('⚠️ [NAV-UP] Fila actual no encontrada:', currentRowId);
        return;
      }

      // Verificar si hay una fila anterior
      if (currentRowIndex === 0) {
        console.log('ℹ️ [NAV-UP] Ya estás en la primera fila');
        return;
      }

      // Obtener la fila anterior
      const prevRow = currentRows[currentRowIndex - 1];
      const prevRowId = String(prevRow.id);
      const cellValue = prevRow.original[currentColId];

      console.log('⬆️ [NAV-UP] Navegando de fila', currentRowId, 'a fila', prevRowId, 'columna', currentColId);

      setTimeout(() => {
        if (handleSingleClickRef.current) {
          handleSingleClickRef.current(prevRowId, currentColId, cellValue);
        }
      }, 50);
    }, []),

    onNavigateDown: useCallback((currentRowId: string, currentColId: string) => {
      /**
       * Navega a la fila siguiente (misma columna) al presionar Arrow Down
       */
      const currentRows = rowsRef.current;
      const currentRowIndex = currentRows.findIndex(row => String(row.id) === String(currentRowId));

      if (currentRowIndex === -1) {
        console.warn('⚠️ [NAV-DOWN] Fila actual no encontrada:', currentRowId);
        return;
      }

      // Verificar si hay una fila siguiente
      if (currentRowIndex + 1 >= currentRows.length) {
        console.log('ℹ️ [NAV-DOWN] Ya estás en la última fila');
        return;
      }

      // Obtener la fila siguiente
      const nextRow = currentRows[currentRowIndex + 1];
      const nextRowId = String(nextRow.id);
      const cellValue = nextRow.original[currentColId];

      console.log('⬇️ [NAV-DOWN] Navegando de fila', currentRowId, 'a fila', nextRowId, 'columna', currentColId);

      setTimeout(() => {
        if (handleSingleClickRef.current) {
          handleSingleClickRef.current(nextRowId, currentColId, cellValue);
        }
      }, 50);
    }, []),

    onNavigateLeft: useCallback((currentRowId: string, currentColId: string) => {
      /**
       * Navega a la columna anterior (misma fila) al presionar Arrow Left
       */
      const currentRows = rowsRef.current;
      const currentTable = tableRef.current;
      const visibleCols = currentTable.getVisibleFlatColumns();

      // Filtrar columnas editables (excluir _selectIndex y otras columnas especiales)
      const editableCols = visibleCols.filter(col => col.id !== '_selectIndex');

      const currentColIndex = editableCols.findIndex(col => col.id === currentColId);

      if (currentColIndex === -1) {
        console.warn('⚠️ [NAV-LEFT] Columna actual no encontrada:', currentColId);
        return;
      }

      // Verificar si hay una columna anterior
      if (currentColIndex === 0) {
        console.log('ℹ️ [NAV-LEFT] Ya estás en la primera columna');
        return;
      }

      // Obtener la columna anterior
      const prevCol = editableCols[currentColIndex - 1];
      const prevColId = prevCol.id;

      // Buscar la fila actual
      const currentRow = currentRows.find(row => String(row.id) === String(currentRowId));
      if (!currentRow) {
        console.warn('⚠️ [NAV-LEFT] Fila actual no encontrada:', currentRowId);
        return;
      }

      const cellValue = currentRow.original[prevColId];

      console.log('⬅️ [NAV-LEFT] Navegando de columna', currentColId, 'a columna', prevColId, 'fila', currentRowId);

      setTimeout(() => {
        if (handleSingleClickRef.current) {
          handleSingleClickRef.current(currentRowId, prevColId, cellValue);
        }
      }, 50);
    }, []),

    onNavigateRight: useCallback((currentRowId: string, currentColId: string) => {
      /**
       * Navega a la columna siguiente (misma fila) al presionar Arrow Right
       */
      const currentRows = rowsRef.current;
      const currentTable = tableRef.current;
      const visibleCols = currentTable.getVisibleFlatColumns();

      // Filtrar columnas editables (excluir _selectIndex y otras columnas especiales)
      const editableCols = visibleCols.filter(col => col.id !== '_selectIndex');

      const currentColIndex = editableCols.findIndex(col => col.id === currentColId);

      if (currentColIndex === -1) {
        console.warn('⚠️ [NAV-RIGHT] Columna actual no encontrada:', currentColId);
        return;
      }

      // Verificar si hay una columna siguiente
      if (currentColIndex + 1 >= editableCols.length) {
        console.log('ℹ️ [NAV-RIGHT] Ya estás en la última columna');
        return;
      }

      // Obtener la columna siguiente
      const nextCol = editableCols[currentColIndex + 1];
      const nextColId = nextCol.id;

      // Buscar la fila actual
      const currentRow = currentRows.find(row => String(row.id) === String(currentRowId));
      if (!currentRow) {
        console.warn('⚠️ [NAV-RIGHT] Fila actual no encontrada:', currentRowId);
        return;
      }

      const cellValue = currentRow.original[nextColId];

      console.log('➡️ [NAV-RIGHT] Navegando de columna', currentColId, 'a columna', nextColId, 'fila', currentRowId);

      setTimeout(() => {
        if (handleSingleClickRef.current) {
          handleSingleClickRef.current(currentRowId, nextColId, cellValue);
        }
      }, 50);
    }, []),
  });

  // Actualizar ref cada vez que handleSingleClick cambie
  React.useEffect(() => {
    handleSingleClickRef.current = handleSingleClick;
  }, [handleSingleClick]);

  // NOTA: El sistema de navegación con flechas ahora está integrado en el hook de edición
  // Las flechas solo funcionan cuando NO estás en modo edición (para selección)
  // Cuando estás editando, las flechas navegan y auto-activan edición en la celda destino
  // Ref para evitar dependencia circular
  const editingCellRef = React.useRef(editingCell);
  React.useEffect(() => {
    editingCellRef.current = editingCell;
  }, [editingCell]);

  const handleKeyDownArrowSelectionRef = React.useRef(handleKeyDownArrowSelection);
  React.useEffect(() => {
    handleKeyDownArrowSelectionRef.current = handleKeyDownArrowSelection;
  }, [handleKeyDownArrowSelection]);

  React.useEffect(() => {
    const handleKeyDown = (evt: KeyboardEvent) => {
      if (!localContainerRef.current?.contains(document.activeElement)) return;

      // Solo usar flechas para selección si NO estamos en modo edición
      // Si estamos editando, el hook useInlineCellEdit maneja las flechas
      const isEditing = editingCellRef.current !== null;

      if (!isEditing && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(evt.key)) {
        handleKeyDownArrowSelectionRef.current(evt);
      }
    };
    localContainerRef.current?.addEventListener('keydown', handleKeyDown);
    return () => localContainerRef.current?.removeEventListener('keydown', handleKeyDown);
  }, []); // Sin dependencias, usa refs

  const { handleMouseDownResize } = useColumnResize({
    columnWidths,
    setColumnWidth,
    originalColumnsDef,
  });

  const {
    contextMenu,
    clickedHeaderIndex,
    clickedRowIndex,
    handleContextMenu,
    handleCloseContextMenu,
    handleCopyFromMenu,
    handleHideColumn,
    handleHideRow,
  } = useTableViewContextMenu({
    selectedCells,
    doCopyCells,
    onHideColumns,
    onHideRows,
    table,
    rows,
  });

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuColumnId, setMenuColumnId] = useState<string | null>(null);
  const handleOpenMenu = (evt: React.MouseEvent, columnId: string) => {
    evt.stopPropagation();
    setAnchorEl(evt.currentTarget as HTMLElement);
    setMenuColumnId(columnId);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuColumnId(null);
  };

  const [isDraggingColumns, setIsDraggingColumns] = useState(false);
  const [startColIndex, setStartColIndex] = useState<number | null>(null);
  const [isDraggingRows, setIsDraggingRows] = useState(false);
  const [startRowIndex, setStartRowIndex] = useState<number | null>(null);

  const dragStateRef = useRef({
    isDraggingCols: false,
    isDraggingRows: false,
    startColIndex: null as number | null,
    startRowIndex: null as number | null,
  });

  useEffect(() => {
    const cleanup = initDragListeners({
      containerRef: localContainerRef,
      setIsDraggingColumns,
      setIsDraggingRows,
      setStartColIndex,
      setStartRowIndex,
      dragStateRef,
      rows,
      selectColumnRangeFn: (stCol, currentIndex) => selectColumnRangeAction(stCol, currentIndex),
      selectRowRangeFn: (stRow, currentRow) => selectRowRangeAction(stRow, currentRow),
    });
    return cleanup;
  }, [rows]);

  const onHeaderMouseDown = (evt: MouseEvent, colIndex: number, colId: string) =>
    handleHeaderMouseDown(evt, colIndex, colId, dragStateRef, setIsDraggingColumns, setStartColIndex);
  const onHeaderTouchStart = (evt: TouchEvent, colIndex: number, colId: string) =>
    handleHeaderTouchStart(evt, colIndex, colId, dragStateRef, setIsDraggingColumns, setStartColIndex);

  const onRowIndexMouseDown = (
    evt: MouseEvent,
    rowIndex: number,
    rowId: string
  ) =>
    handleRowIndexMouseDown(
      evt,
      rowIndex,
      rowId,
      selectEntireRow,
      dragStateRef,
      setIsDraggingRows,
      setStartRowIndex
    );

  const onRowIndexTouchStart = (
    evt: TouchEvent,
    rowIndex: number,
    rowId: string
  ) =>
    handleRowIndexTouchStart(
      evt,
      rowIndex,
      rowId,
      selectEntireRow,
      dragStateRef,
      setIsDraggingRows,
      setStartRowIndex
    );

  function selectColumnRangeAction(start: number, end: number) {
    const visibleCols = table.getVisibleFlatColumns();
    const sel = selectColumnRange({ rows, visibleCols, start, end });
    setSelectedCells(sel);
    const idx = Math.min(start, end);
    setAnchorCell({ rowIndex: 0, colIndex: idx });
    setFocusCell({ rowIndex: 0, colIndex: idx });
  }

  function selectRowRangeAction(start: number, end: number) {
    const visibleCols = table.getVisibleFlatColumns();
    const sel = selectRowRange({ rows, visibleCols, start, end });
    const idx = Math.min(start, end);
    setSelectedCells(sel);
    setAnchorCell({ rowIndex: idx, colIndex: 1 });
    setFocusCell({ rowIndex: idx, colIndex: 1 });
  }

  function selectEntireRow(rIndex: number, rowId: string) {
    const visibleCols = table.getVisibleFlatColumns();
    const newCells = _selectEntireRow({ rowIndex: rIndex, rowId, visibleCols });
    setSelectedCells(newCells);
    setAnchorCell({ rowIndex: rIndex, colIndex: 1 });
    setFocusCell({ rowIndex: rIndex, colIndex: 1 });
  }

  function selectEntireColumn(colIndex: number, colId: string) {
    const newSelection = _selectEntireColumn({ rows, colId });
    setSelectedCells(newSelection);
    setAnchorCell({ rowIndex: 0, colIndex });
    setFocusCell({ rowIndex: 0, colIndex });
  }

  function selectAllCells() {
    const visibleCols = table.getVisibleFlatColumns();
    const allCells = _selectAllCells({ rows, visibleCols });
    setSelectedCells(allCells);
    setAnchorCell({ rowIndex: 0, colIndex: 1 });
    setFocusCell({ rowIndex: 0, colIndex: 1 });
  }

  function handleHeaderClick(evt: React.MouseEvent, colIndex: number, colId: string) {
    const target = evt.target as HTMLElement;
    if (target.classList.contains('resize-handle')) return;
    if (colId === '_selectIndex') return selectAllCells();
    selectEntireColumn(colIndex, colId);
  }

  const [highlightedRowIndex, setHighlightedRowIndex] = useState<number | null>(null);
  const handleCellClick = (rIndex: number) => setHighlightedRowIndex(rIndex);

  // Importar configuración centralizada
  const { COLUMN_CONFIG, TABLE_CONFIG } = require('../config');

  const getColumnDefWidth = (colId: string) =>
    originalColumnsDef.find((c) => c.accessorKey === colId)?.width ?? COLUMN_CONFIG.DEFAULT_WIDTH;

  const isAutoHeight = containerHeight === 'auto' || containerHeight === '100%';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        overflow: 'hidden',
        borderRadius: 0,
        border: '0px solid var(--color-divider)',
        boxShadow: 'none',
        background: 'var(--color-bg-paper)',
        ...brandVars,
      }}
    >
      <Box
        ref={localContainerRef}
        className="tv-scroll"
        onContextMenu={handleContextMenu as any}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          overflowX: 'auto',
          overflowY: 'scroll',
          position: 'relative',
          userSelect: 'none',
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          backgroundColor: 'var(--color-bg-paper)',
          outline: 'none',
          width: '100%',
          '&:focus': { boxShadow: `inset 0 0 0 2px ${BRAND}` },
          '&::-webkit-scrollbar': {
            width: '12px',
            height: '12px',
          },
          '&::-webkit-scrollbar-track': {
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            borderRadius: '0px',
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
          '&::-webkit-scrollbar-corner': {
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          },
        }}
        tabIndex={0}
      >
        {loading && <LoadingOverlay loadingText={loadingText} />}
        {!loading && rows.length === 0 && <NoResultsOverlay noResultsText={noResultsText} />}

        <table
          className="custom-table"
          style={{
            tableLayout: TABLE_CONFIG.table.tableLayout as any,
            width: TABLE_CONFIG.table.width,
            minWidth: TABLE_CONFIG.table.minWidth,
          }}
        >
          <colgroup>
            {table.getVisibleFlatColumns().map((col, cIndex) => {
              const width = columnWidths[col.id] ?? getColumnDefWidth(col.id);
              const isIndexCol = col.id === '_selectIndex';
              return (
                <col
                  key={col.id}
                  data-colindex={cIndex}
                  style={{
                    width: `${width}px`,
                    minWidth: `${width}px`,
                    maxWidth: 'none',
                    backgroundColor: isIndexCol ? 'var(--color-table-index-colgroup)' : 'transparent',
                  }}
                />
              );
            })}
          </colgroup>

          <TableHeader
            headerGroups={table.getHeaderGroups()}
            handleHeaderClick={handleHeaderClick}
            onHeaderMouseDown={onHeaderMouseDown as any}
            onHeaderTouchStart={onHeaderTouchStart as any}
            handleOpenMenu={handleOpenMenu}
            handleMouseDownResize={handleMouseDownResize}
          />

          <TableBody
            rows={rows}
            rowHeight={rowHeight}
            isEditingCell={isEditingCell}
            editingValue={editingValue}
            handleSingleClick={handleSingleClick}  // ← NUEVO: Un solo clic para editar
            handleDoubleClick={handleDoubleClick}  // ← Mantener compatibilidad
            handleChange={handleChange}
            handleEditKeyDown={handleEditKeyDown}
            handleBlur={handleBlur}
            setInputRef={setInputRef}              // ← NUEVO: Para posicionar cursor
            selectedCells={selectedCells}
            copiedCells={copiedCells}
            handleCellClick={handleCellClick}
            onRowIndexMouseDown={onRowIndexMouseDown as any}
            onRowIndexTouchStart={onRowIndexTouchStart as any}
            highlightedRowIndex={highlightedRowIndex}
            isDarkMode={isDarkMode}
          />
        </table>

        <ColumnFilterPopover
          anchorEl={anchorEl}
          menuColumnId={menuColumnId}
          handleCloseMenu={handleCloseMenu}
          columnFilters={columnFilters}
          updateColumnFilter={updateColumnFilter}
          originalColumnsDef={originalColumnsDef}
        />

        <ContextualMenu
          contextMenu={contextMenu}
          handleCloseContextMenu={handleCloseContextMenu}
          handleCopyFromMenu={handleCopyFromMenu}
          clickedHeaderIndex={clickedHeaderIndex}
          onHideColumns={onHideColumns}
          handleHideColumn={handleHideColumn}
          clickedRowIndex={clickedRowIndex}
          onHideRows={onHideRows}
          handleHideRow={handleHideRow}
        />
      </Box>

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          backgroundColor: 'var(--color-bg-paper)',
          borderTop: `1px solid var(--color-divider)`,
          zIndex: 10,
          p: '8px',
        }}
      >
        <Pagination table={table} />
      </Box>
    </Box>
  );
}
