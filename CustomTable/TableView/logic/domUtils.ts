// LICENSE: MIT
import type { Table as TanTable } from '@tanstack/react-table';

export type DomCellInfo = {
  id: string;       // rowId
  colField: string; // column id
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getCellsInfo(containerRef: React.RefObject<HTMLElement>, table: TanTable<any>): DomCellInfo[] {
  if (!containerRef?.current) return [];
  const cellEls = containerRef.current.querySelectorAll('[data-rowid][data-colindex]');
  const visibleCols = table.getVisibleFlatColumns?.() || [];
  const cells: DomCellInfo[] = [];

  cellEls.forEach((el) => {
    const rect = (el as HTMLElement).getBoundingClientRect();
    const rowId = (el as HTMLElement).getAttribute('data-rowid') || '';
    const cIndex = parseInt((el as HTMLElement).getAttribute('data-colindex') || '', 10);
    if (!rowId || Number.isNaN(cIndex) || rect.width <= 0 || rect.height <= 0) return;
    const colObj = visibleCols[cIndex];
    if (!colObj) return;
    cells.push({
      id: rowId,
      colField: colObj.id,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
  });

  return cells;
}
