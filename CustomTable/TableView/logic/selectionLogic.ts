// LICENSE: MIT
import type { Column, Row } from '@tanstack/react-table';

type VisibleCol = Column<any, unknown>;

export function selectColumnRange({
  rows,
  visibleCols,
  start,
  end,
}: {
  rows: Row<any>[];
  visibleCols: VisibleCol[];
  start: number;
  end: number;
}) {
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const sel: { id: string; colField: string }[] = [];
  rows.forEach((r) => {
    for (let c = min; c <= max; c++) {
      const col = visibleCols[c];
      if (!col || col.id === '_selectIndex') continue;
      sel.push({ id: String(r.id), colField: col.id });
    }
  });
  return sel;
}

export function selectRowRange({
  rows,
  visibleCols,
  start,
  end,
}: {
  rows: Row<any>[];
  visibleCols: VisibleCol[];
  start: number;
  end: number;
}) {
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const sel: { id: string; colField: string }[] = [];
  for (let r = min; r <= max; r++) {
    const rowObj = rows[r];
    if (!rowObj) continue;
    visibleCols.forEach((col) => {
      if (col.id !== '_selectIndex') sel.push({ id: String(rowObj.id), colField: col.id });
    });
  }
  return sel;
}

export function selectEntireRow({
  rowIndex,
  rowId,
  visibleCols,
}: {
  rowIndex: number;
  rowId: string;
  visibleCols: VisibleCol[];
}) {
  return visibleCols
    .filter((c) => c.id !== '_selectIndex')
    .map((c) => ({ id: rowId, colField: c.id }));
}

export function selectEntireColumn({ rows, colId }: { rows: Row<any>[]; colId: string }) {
  return rows.map((r) => ({ id: String(r.id), colField: colId }));
}

export function selectAllCells({ rows, visibleCols }: { rows: Row<any>[]; visibleCols: VisibleCol[] }) {
  const all: { id: string; colField: string }[] = [];
  rows.forEach((r) => {
    visibleCols.forEach((col) => {
      if (col.id !== '_selectIndex') all.push({ id: String(r.id), colField: col.id });
    });
  });
  return all;
}
