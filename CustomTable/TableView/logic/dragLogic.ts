// LICENSE: MIT
import type { Row } from '@tanstack/react-table';

export function initDragListeners({
  containerRef,
  setIsDraggingColumns,
  setIsDraggingRows,
  setStartColIndex,
  setStartRowIndex,
  dragStateRef,
  rows,
  selectColumnRangeFn,
  selectRowRangeFn,
}: {
  containerRef: React.RefObject<HTMLElement>;
  setIsDraggingColumns: (v: boolean) => void;
  setIsDraggingRows: (v: boolean) => void;
  setStartColIndex: (v: number | null) => void;
  setStartRowIndex: (v: number | null) => void;
  dragStateRef: React.MutableRefObject<{
    isDraggingCols: boolean;
    isDraggingRows: boolean;
    startColIndex: number | null;
    startRowIndex: number | null;
  }>;
  rows: Row<any>[];
  selectColumnRangeFn: (stCol: number, currentIndex: number) => void;
  selectRowRangeFn: (stRow: number, currentRow: number) => void;
}) {
  const handlePointerMove = (clientX: number, clientY: number, e: MouseEvent | TouchEvent) => {
    const { isDraggingCols, isDraggingRows, startColIndex: stCol, startRowIndex: stRow } =
      dragStateRef.current;
    if (!containerRef?.current) return;

    if (isDraggingCols) {
      e.preventDefault();
      const colEls = containerRef.current.querySelectorAll('thead tr:first-child th');
      let currentIndex: number | null = null;
      colEls.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
          currentIndex = i;
        }
      });
      if (currentIndex != null && stCol != null) selectColumnRangeFn(stCol, currentIndex);
    } else if (isDraggingRows) {
      e.preventDefault();
      const rowIndexCells = containerRef.current.querySelectorAll('tbody tr td[data-colindex="0"]');
      let currentRow: number | null = null;
      rowIndexCells.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
          currentRow = i;
        }
      });
      if (currentRow != null && stRow != null) selectRowRangeFn(stRow, currentRow);
    }
  };

  const handleMouseMove = (evt: MouseEvent) => {
    const { isDraggingCols, isDraggingRows } = dragStateRef.current;
    if (!isDraggingCols && !isDraggingRows) return;
    handlePointerMove(evt.clientX, evt.clientY, evt);
  };

  const endDrag = () => {
    dragStateRef.current.isDraggingCols = false;
    dragStateRef.current.isDraggingRows = false;
    dragStateRef.current.startColIndex = null;
    dragStateRef.current.startRowIndex = null;
    setIsDraggingColumns(false);
    setIsDraggingRows(false);
    setStartColIndex(null);
    setStartRowIndex(null);
  };

  const handleMouseUp = endDrag;

  const handleTouchMove = (evt: TouchEvent) => {
    const { isDraggingCols, isDraggingRows } = dragStateRef.current;
    if (!isDraggingCols && !isDraggingRows) return;
    if (evt.touches.length === 1) {
      const t = evt.touches[0];
      handlePointerMove(t.clientX, t.clientY, evt);
    }
  };

  const handleTouchEnd = endDrag;

  document.addEventListener('mousemove', handleMouseMove, { passive: false });
  document.addEventListener('mouseup', handleMouseUp, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
}

export function handleHeaderMouseDown(
  evt: MouseEvent,
  colIndex: number,
  colId: string,
  dragStateRef: React.MutableRefObject<any>,
  setIsDraggingColumns: (v: boolean) => void,
  setStartColIndex: (v: number | null) => void
) {
  const target = evt.target as HTMLElement;
  if (target.classList.contains('resize-handle')) return;
  if (colId === '_selectIndex') return;
  dragStateRef.current.isDraggingCols = true;
  dragStateRef.current.startColIndex = colIndex;
  setIsDraggingColumns(true);
  setStartColIndex(colIndex);
}

export function handleHeaderTouchStart(
  evt: TouchEvent,
  colIndex: number,
  colId: string,
  dragStateRef: React.MutableRefObject<any>,
  setIsDraggingColumns: (v: boolean) => void,
  setStartColIndex: (v: number | null) => void
) {
  const target = evt.target as HTMLElement;
  if (colId === '_selectIndex') return;
  if (target.classList.contains('resize-handle')) return;
  if (evt.touches.length === 1) {
    dragStateRef.current.isDraggingCols = true;
    dragStateRef.current.startColIndex = colIndex;
    setIsDraggingColumns(true);
    setStartColIndex(colIndex);
  }
}

export function handleRowIndexMouseDown(
  evt: MouseEvent,
  rowIndex: number,
  rowId: string,
  selectEntireRowFn: (rowIndex: number, rowId: string) => void,
  dragStateRef: React.MutableRefObject<any>,
  setIsDraggingRows: (v: boolean) => void,
  setStartRowIndex: (v: number | null) => void
) {
  evt.stopPropagation();
  evt.preventDefault();
  selectEntireRowFn(rowIndex, rowId);
  dragStateRef.current.isDraggingRows = true;
  dragStateRef.current.startRowIndex = rowIndex;
  setIsDraggingRows(true);
  setStartRowIndex(rowIndex);
}

export function handleRowIndexTouchStart(
  evt: TouchEvent,
  rowIndex: number,
  rowId: string,
  selectEntireRowFn: (rowIndex: number, rowId: string) => void,
  dragStateRef: React.MutableRefObject<any>,
  setIsDraggingRows: (v: boolean) => void,
  setStartRowIndex: (v: number | null) => void
) {
  evt.stopPropagation();
  evt.preventDefault();
  if (evt.touches.length === 1) {
    selectEntireRowFn(rowIndex, rowId);
    dragStateRef.current.isDraggingRows = true;
    dragStateRef.current.startRowIndex = rowIndex;
    setIsDraggingRows(true);
    setStartRowIndex(rowIndex);
  }
}
