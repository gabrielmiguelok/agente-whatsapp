import { useState, useEffect, useMemo } from 'react';
import ExcelJS from 'exceljs';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
} from '@tanstack/react-table';

import { useDebouncedValue } from './useDebouncedValue';
import {
  FilterFlow,
  applySorting,
  getExportColumnsDef,
  getExportValue,
  type SimpleColumnDef,
  type ColumnFiltersMap,
} from './filterFlow';
import getIndexColumn from './IndexColumn';
import { COLUMN_CONFIG, TABLE_CONFIG, EXPORT_CONFIG } from '../config';

export interface UseCustomTableLogicParams<T extends Record<string, any>> {
  data: T[];
  columnsDef: SimpleColumnDef[];
  pageSize: number;
}

export function useCustomTableLogic<T extends Record<string, any>>({
  data,
  columnsDef,
  pageSize,
}: UseCustomTableLogicParams<T>) {
  // 1) Columnas finales (usuario)
  const columnHelper = createColumnHelper<T>();
  const finalColumns: SimpleColumnDef[] = useMemo(
    () => (Array.isArray(columnsDef) && columnsDef.length ? columnsDef : []),
    [columnsDef]
  );

  const indexedColumns: ColumnDef<T, unknown>[] = useMemo(() => {
    const indexColumn = getIndexColumn<T>({
      headerText: '',
      minWidth: COLUMN_CONFIG.INDEX_COLUMN_MIN_WIDTH,
      width: COLUMN_CONFIG.INDEX_COLUMN_WIDTH
    });
    const userColumns = finalColumns.map((col) => {
      // CRÍTICO: Pasar TODAS las propiedades personalizadas al columnDef
      const customProps: any = {};

      // Propiedades para campos SELECT
      if ((col as any).options) customProps.options = (col as any).options;
      if ((col as any).editType) customProps.editType = (col as any).editType;
      if ((col as any).editable !== undefined) customProps.editable = (col as any).editable;

      // Propiedades para campos NUMERIC/HEATMAP/PROGRESS/RATING
      if ((col as any).min !== undefined) customProps.min = (col as any).min;
      if ((col as any).max !== undefined) customProps.max = (col as any).max;

      // Propiedades para HEATMAP
      if ((col as any).colorScale) customProps.colorScale = (col as any).colorScale;

      // Propiedades numéricas
      if (col.isNumeric) customProps.isNumeric = true;
      if (col.isDate) customProps.isDate = true;

      // Tipo de columna (para dropdown personalizado)
      if ((col as any).type) customProps.type = (col as any).type;

      return columnHelper.accessor(col.accessorKey as keyof T, {
        header: col.header,
        cell: col.cell as any,
        meta: {
          minWidth: col.minWidth ?? undefined,
          flex: col.flex ?? undefined,
          filterMode: col.filterMode ?? 'contains',
          isNumeric: !!col.isNumeric,
        },
        // EXTREMADAMENTE IMPORTANTE: Pasar TODAS las props personalizadas
        ...customProps,
      });
    });
    return [indexColumn, ...userColumns];
  }, [finalColumns, columnHelper]);

  // 2) Filtros por columna
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersMap>({});

  // 3) Filtro global (debounced)
  const [tempGlobalFilter, setTempGlobalFilter] = useState<string>('');
  const debouncedGlobalFilter = useDebouncedValue(tempGlobalFilter, TABLE_CONFIG.FILTER_DEBOUNCE_TIME);

  // 4) Ordenamiento simple (colId + dirección)
  const [sorting, setSorting] = useState<{ columnId: string; direction: '' | 'asc' | 'desc' }>({
    columnId: '',
    direction: '',
  });
  const toggleSort = (colId: string) => {
    setSorting((prev) => {
      if (prev.columnId !== colId) return { columnId: colId, direction: 'desc' };
      if (prev.direction === 'desc') return { columnId: colId, direction: 'asc' };
      if (prev.direction === 'asc') return { columnId: '', direction: '' };
      return { columnId: colId, direction: 'desc' };
    });
  };

  // 5) Forzar 'range' si hay min/max en columnas numéricas
  useEffect(() => {
    Object.keys(columnFilters).forEach((colId) => {
      const colDef = finalColumns.find((c) => c.accessorKey === colId);
      if (colDef?.isNumeric) {
        const cf = columnFilters[colId] || {};
        const { operator, min, max } = cf;
        if ((min != null || max != null) && !operator) {
          setColumnFilters((prev) => ({
            ...prev,
            [colId]: { ...prev[colId], operator: 'range' },
          }));
        }
      }
    });
  }, [columnFilters, finalColumns]);

  // 6) Filtrado + búsqueda global + sort
  const filteredData = useMemo(() => {
    const flow = new FilterFlow<T>({
      data,
      columnsDef: finalColumns,
      columnFilters,
      globalFilter: debouncedGlobalFilter,
    });
    const step1 = flow._applyColumnFilters([...data]);
    const step2 = flow._applyGlobalFilter(step1);
    const step3 = flow._applyColumnSorting(step2);
    return sorting.columnId && sorting.direction
      ? applySorting(step3, sorting, finalColumns)
      : step3;
  }, [data, finalColumns, columnFilters, debouncedGlobalFilter, sorting]);

  // 7) Orden de columnas (para drag & drop)
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  // Inicializar orden de columnas al cargar
  useEffect(() => {
    if (columnOrder.length === 0 && indexedColumns.length > 0) {
      const order = indexedColumns.map((col: any) => col.id || col.accessorKey).filter(Boolean);
      setColumnOrder(order);
    }
  }, [indexedColumns, columnOrder.length]);

  // 8) Instancia react-table (ID REAL por fila)
  const table = useReactTable<T>({
    data: filteredData,
    columns: indexedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => String((row as any).id ?? ''),
    pageCount: Math.ceil(filteredData.length / pageSize),
    manualPagination: false,
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
    initialState: { pagination: { pageSize, pageIndex: 0 } },
  });

  // 8) Exportar a Excel
  const handleDownloadExcel = async () => {
    try {
      const exportCols = getExportColumnsDef(finalColumns);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(EXPORT_CONFIG.sheetName);

      worksheet.addRow(exportCols.map((c) => c.header ?? c.accessorKey.toUpperCase()));
      filteredData.forEach((row) => {
        worksheet.addRow(exportCols.map((col) => getExportValue(row, col)));
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.columns.forEach((col) => {
        col.width = 15;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: EXPORT_CONFIG.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = EXPORT_CONFIG.defaultFileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando Excel:', err);
    }
  };

  // 9) Ancho de columnas - inicializar con los anchos definidos en columnsDef
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const initialWidths: Record<string, number> = {};
    finalColumns.forEach((col: any) => {
      if (col.accessorKey && col.width) {
        initialWidths[col.accessorKey] = col.width;
      }
    });
    return initialWidths;
  });
  const handleSetColumnWidth = (colId: string, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [colId]: Math.max(COLUMN_CONFIG.MIN_WIDTH, width) }));
  };

  return {
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
    filteredData,
    columnOrder,
    setColumnOrder,
  };
}
