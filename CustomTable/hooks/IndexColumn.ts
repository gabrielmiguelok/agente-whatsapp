import { createColumnHelper, ColumnDef } from '@tanstack/react-table';

export type AnyRow = Record<string, unknown>;

/**
 * getIndexColumn(options?: { headerText?: string, minWidth?: number, width?: number })
 * @returns {ColumnDef}
 */
export default function getIndexColumn<T extends AnyRow = AnyRow>(options: {
  headerText?: string;
  minWidth?: number;
  width?: number;
} = {}): ColumnDef<T, unknown> {
  const { headerText = '', minWidth = 32, width = 32 } = options;
  const columnHelper = createColumnHelper<T>();

  return columnHelper.display({
    id: '_selectIndex',
    header: headerText,
    cell: (info) => info.row.index + 1,
    meta: { isSelectIndex: true, minWidth, width },
  });
}
