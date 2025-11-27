import { useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
} from '@tanstack/react-table';

export interface SimpleCol<TData> {
  accessorKey: keyof TData & string;
  header?: string;
  cell?: (info: any) => any;
  minWidth?: number;
  flex?: number;
  filterMode?: 'contains' | 'startsWith' | 'endsWith' | 'equals';
}

export default function useReactTableInstance<TData extends Record<string, any>>(
  data: TData[],
  columnsDef: SimpleCol<TData>[],
  pageSize: number
) {
  const columnHelper = createColumnHelper<TData>();

  const indexedColumnsDef: ColumnDef<TData, unknown>[] = useMemo(() => {
    const selectIndexColumn: ColumnDef<TData, unknown> = {
      id: '_selectIndex',
      header: '',
      cell: (info) => info.row.index + 1,
      meta: { isSelectIndex: true, minWidth: 32, width: 32 },
    };

    const userColumns = columnsDef.map((col) =>
      columnHelper.accessor(col.accessorKey as keyof TData, {
        header: col.header,
        cell: col.cell as any,
        meta: { minWidth: col.minWidth, flex: col.flex, filterMode: col.filterMode || 'contains' },
      })
    );

    return [selectIndexColumn, ...userColumns];
  }, [columnsDef, columnHelper]);

  const table = useReactTable<TData>({
    data,
    columns: indexedColumnsDef,
    // ID REAL por fila para que edición/selección apunte a la fila correcta
    getRowId: (row) => String((row as any).id ?? ''),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(data.length / pageSize),
    manualPagination: false,
    initialState: { pagination: { pageSize, pageIndex: 0 } },
  });

  return table;
}
