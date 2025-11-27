export interface SimpleColumnDef {
  accessorKey: string;
  header?: string;
  isNumeric?: boolean;
  isDate?: boolean;
  // props opcionales usados para export/instancias
  minWidth?: number;
  flex?: number;
  filterMode?: 'contains' | 'startsWith' | 'endsWith' | 'equals';
  // renderer (se respeta pero no se usa aquí)
  cell?: (info: any) => any;
}

export interface ColumnFilterState {
  operator?: 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'range' | 'exact' | 'dateRange';
  value?: string;
  min?: number;
  max?: number;
  exact?: number;
  dateFrom?: string;
  dateTo?: string;
  sortDirection?: 'none' | 'asc' | 'desc';
}

export type ColumnFiltersMap = Record<string, ColumnFilterState>;

interface FilterFlowCtor<T extends Record<string, any>> {
  data: T[];
  columnsDef: SimpleColumnDef[];
  columnFilters: ColumnFiltersMap;
  globalFilter?: string;
}

export class FilterFlow<T extends Record<string, any> = Record<string, any>> {
  private data: T[];
  private columnsDef: SimpleColumnDef[];
  private columnFilters: ColumnFiltersMap;
  private globalFilter: string;

  constructor({ data, columnsDef, columnFilters, globalFilter }: FilterFlowCtor<T>) {
    this.data = data || [];
    this.columnsDef = columnsDef || [];
    this.columnFilters = columnFilters || {};
    this.globalFilter = (globalFilter || '').trim().toLowerCase();
  }

  applyAll(): T[] {
    let rows = [...this.data];
    rows = this._applyColumnFilters(rows);
    rows = this._applyGlobalFilter(rows);
    rows = this._applyColumnSorting(rows);
    return rows;
  }

  _applyColumnFilters(rows: T[]): T[] {
    if (!rows.length) return rows;

    const hasAny = Object.keys(this.columnFilters).some((k) => {
      const f = this.columnFilters[k];
      return f && (f.value || f.min != null || f.max != null || f.exact != null || f.dateFrom || f.dateTo);
    });
    if (!hasAny) return rows;

    return rows.filter((row) =>
      this.columnsDef.every((col) => {
        const colKey = col.accessorKey;
        const filter = this.columnFilters[colKey];
        if (!filter) return true;

        const { operator, value, min, max, exact, dateFrom, dateTo } = filter;
        const cellVal = (row as any)[colKey];
        const colIsNum = !!col.isNumeric;
        const colIsDate = !!col.isDate;

        if (colIsDate) {
          if (operator === 'dateRange') {
            const cellDate = cellVal ? new Date(cellVal).getTime() : null;
            if (!cellDate || isNaN(cellDate)) return false;

            if (dateFrom) {
              const fromTime = new Date(dateFrom).getTime();
              if (!isNaN(fromTime) && cellDate < fromTime) return false;
            }
            if (dateTo) {
              const toTime = new Date(dateTo).getTime();
              if (!isNaN(toTime) && cellDate > toTime) return false;
            }
          }
        } else if (colIsNum) {
          // Convertir el valor de celda a número
          const numCellVal = Number(cellVal);

          // Si el valor no es un número válido, excluirlo del filtrado
          if (isNaN(numCellVal)) return false;

          if (operator === 'range') {
            if (min != null && numCellVal < min) return false;
            if (max != null && numCellVal > max) return false;
          } else if (operator === 'exact') {
            if (exact != null && numCellVal !== exact) return false;
          }
        } else {
          const valStr = String(cellVal ?? '').toLowerCase();
          const srch = String(value ?? '').toLowerCase();
          if (!srch) return true;
          switch (operator) {
            case 'startsWith': return valStr.startsWith(srch);
            case 'endsWith':   return valStr.endsWith(srch);
            case 'equals':     return valStr === srch;
            default:           return valStr.includes(srch);
          }
        }
        return true;
      })
    );
  }

  _applyGlobalFilter(rows: T[]): T[] {
    if (!this.globalFilter) return rows;
    return rows.filter((row) =>
      this.columnsDef.some((col) => {
        const val = (row as any)[col.accessorKey];
        return val && String(val).toLowerCase().includes(this.globalFilter);
      })
    );
  }

  _applyColumnSorting(rows: T[]): T[] {
    for (const colKey of Object.keys(this.columnFilters)) {
      const f = this.columnFilters[colKey];
      if (!f) continue;
      if (f.sortDirection === 'asc' || f.sortDirection === 'desc') {
        const colDef = this.columnsDef.find((c) => c.accessorKey === colKey);
        if (colDef) {
          return applySorting(rows, { columnId: colKey, direction: f.sortDirection }, this.columnsDef);
        }
      }
    }
    return rows;
  }
}

export function applySorting<T extends Record<string, any>>(
  rows: T[],
  sorting: { columnId?: string; direction?: 'asc' | 'desc' },
  columnsDef: SimpleColumnDef[]
): T[] {
  const { columnId, direction } = sorting || {};
  if (!columnId || !direction) return rows;

  const colDef = columnsDef.find((c) => c.accessorKey === columnId);
  const isNumeric = !!colDef?.isNumeric;
  const isDate = !!colDef?.isDate;
  const sorted = [...rows];

  sorted.sort((a, b) => {
    const valA = a[columnId];
    const valB = b[columnId];

    // Manejo de valores null/undefined consistente
    const isAEmpty = valA === null || valA === undefined || valA === '';
    const isBEmpty = valB === null || valB === undefined || valB === '';

    if (isAEmpty && isBEmpty) return 0;
    if (isAEmpty) return 1; // Los valores vacíos van al final
    if (isBEmpty) return -1;

    if (isDate) {
      const dateA = new Date(valA).getTime();
      const dateB = new Date(valB).getTime();
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1; // Fechas inválidas al final
      if (isNaN(dateB)) return -1;
      return dateA - dateB;
    }

    if (isNumeric) {
      const numA = Number(valA);
      const numB = Number(valB);
      if (isNaN(numA) && isNaN(numB)) return 0;
      if (isNaN(numA)) return 1; // Números inválidos al final
      if (isNaN(numB)) return -1;
      return numA - numB;
    }

    // Para texto: normalización robusta
    const strA = String(valA).toLowerCase().trim();
    const strB = String(valB).toLowerCase().trim();

    // Comparación lexicográfica correcta
    if (strA === strB) return 0;
    return strA < strB ? -1 : 1;
  });

  return direction === 'desc' ? sorted.reverse() : sorted;
}

/** Expande 'redes_sociales' en varias columnas para export. */
export function getExportColumnsDef(columnsDef: SimpleColumnDef[]): SimpleColumnDef[] {
  return columnsDef.reduce<SimpleColumnDef[]>((acc, col) => {
    if (col.accessorKey !== 'redes_sociales') {
      acc.push(col);
    } else {
      acc.push({ accessorKey: 'wp',        header: 'WHATSAPP'  });
      acc.push({ accessorKey: 'facebook',  header: 'FACEBOOK'  });
      acc.push({ accessorKey: 'instagram', header: 'INSTAGRAM' });
      acc.push({ accessorKey: 'twitter',   header: 'TWITTER'   });
      acc.push({ accessorKey: 'tiktok',    header: 'TIKTOK'    });
      acc.push({ accessorKey: 'youtube',   header: 'YOUTUBE'   });
      acc.push({ accessorKey: 'linkedin',  header: 'LINKEDIN'  });
    }
    return acc;
  }, []);
}

export function getExportValue<T extends Record<string, any>>(row: T, col: SimpleColumnDef): string {
  return String(row[col.accessorKey] ?? '');
}
