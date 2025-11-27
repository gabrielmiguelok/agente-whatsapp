// LICENSE: MIT
import { useState } from 'react';
import type { Table as TanTable } from '@tanstack/react-table';
import type { CellCoord } from '../index';

type Params = {
  selectedCells: CellCoord[];
  doCopyCells: (cells: CellCoord[]) => Promise<void>;
  onHideColumns?: (colIds: string[]) => void;
  onHideRows?: (rowIndexes: number[]) => void;
  table: TanTable<any>;
  rows: any[];
};

export default function useTableViewContextMenu({
  selectedCells,
  doCopyCells,
  onHideColumns,
  onHideRows,
  table,
  rows,
}: Params) {
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const [clickedHeaderIndex, setClickedHeaderIndex] = useState<number | null>(null);
  const [clickedRowIndex, setClickedRowIndex] = useState<number | null>(null);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const headerEl = target.closest('[data-header-index]') as HTMLElement | null;
    const rowEl = target.closest('[data-rowindex]') as HTMLElement | null;

    const foundHeaderIndex = headerEl ? parseInt(headerEl.getAttribute('data-header-index') || '', 10) : null;
    const foundRowIndex = !headerEl && rowEl ? parseInt(rowEl.getAttribute('data-rowindex') || '', 10) : null;

    setClickedHeaderIndex(Number.isNaN(foundHeaderIndex as number) ? null : foundHeaderIndex);
    setClickedRowIndex(Number.isNaN(foundRowIndex as number) ? null : foundRowIndex);

    setContextMenu(contextMenu === null ? { mouseX: e.clientX + 2, mouseY: e.clientY - 6 } : null);
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setClickedHeaderIndex(null);
    setClickedRowIndex(null);
  };

  const handleCopyFromMenu = async () => {
    handleCloseContextMenu();
    if (!selectedCells?.length) return;
    await doCopyCells(selectedCells);
  };

  const handleHideColumn = () => {
    handleCloseContextMenu();
    if (!onHideColumns || clickedHeaderIndex == null) return;
    const col = table.getVisibleFlatColumns()[clickedHeaderIndex];
    if (!col || col.id === '_selectIndex') return;
    onHideColumns([col.id]);
  };

  const handleHideRow = () => {
    handleCloseContextMenu();
    if (!onHideRows || clickedRowIndex == null) return;

    const selectedRowIndexes = new Set(
      selectedCells
        .map((cell) => rows.findIndex((r) => r.id === cell.id))
        .filter((idx) => idx !== -1)
    );
    const clickedIsSelected = selectedRowIndexes.has(clickedRowIndex);

    if (clickedIsSelected && selectedRowIndexes.size > 1) {
      onHideRows(Array.from(selectedRowIndexes));
    } else {
      onHideRows([clickedRowIndex]);
    }
  };

  return {
    contextMenu,
    clickedHeaderIndex,
    clickedRowIndex,
    handleContextMenu,
    handleCloseContextMenu,
    handleCopyFromMenu,
    handleHideColumn,
    handleHideRow,
  };
}
