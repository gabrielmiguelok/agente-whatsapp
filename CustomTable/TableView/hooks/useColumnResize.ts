// LICENSE: MIT
import { useRef } from 'react';
import { COLUMN_CONFIG } from '../../config';

type Params = {
  columnWidths: Record<string, number>;
  setColumnWidth: (colId: string, width: number) => void;
  originalColumnsDef: { accessorKey: string; width?: number }[];
};

export default function useColumnResize({ columnWidths, setColumnWidth, originalColumnsDef }: Params) {
  const resizeState = useRef<{ isResizing: boolean; startX: number; colId: string | null; startWidth: number }>({
    isResizing: false,
    startX: 0,
    colId: null,
    startWidth: 0,
  });

  const handleMouseDownResize = (e: MouseEvent, colId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const initialWidth =
      columnWidths[colId] ??
      (originalColumnsDef.find((c) => c.accessorKey === colId)?.width ?? COLUMN_CONFIG.DEFAULT_WIDTH);
    resizeState.current = { isResizing: true, startX: e.clientX, colId, startWidth: initialWidth };
    document.addEventListener('mousemove', handleMouseMoveResize);
    document.addEventListener('mouseup', handleMouseUpResize);
  };

  const handleMouseMoveResize = (e: MouseEvent) => {
    if (!resizeState.current.isResizing || !resizeState.current.colId) return;
    const diff = e.clientX - resizeState.current.startX;
    const newWidth = Math.max(COLUMN_CONFIG.MIN_WIDTH, Math.round(resizeState.current.startWidth + diff));
    setColumnWidth(resizeState.current.colId, newWidth);
  };

  const handleMouseUpResize = () => {
    resizeState.current.isResizing = false;
    document.removeEventListener('mousemove', handleMouseMoveResize);
    document.removeEventListener('mouseup', handleMouseUpResize);
  };

  return { handleMouseDownResize };
}
