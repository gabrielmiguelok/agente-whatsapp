// LICENSE: MIT
import { useEffect, useState } from 'react';
import type { CellCoord } from '../index';

export default function useClipboardCopy(
  containerRef: React.RefObject<HTMLElement>,
  selectedCells: CellCoord[],
  data: any[],
  _columnsDef: any[]
) {
  const [copiedCells, setCopiedCells] = useState<CellCoord[]>([]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (!selectedCells.length) return;
        try {
          const dataById = new Map<string, any>(data.map((d) => [String(d.id), d]));
          const rowsMap = new Map<string, string[]>();
          selectedCells.forEach((cell) => {
            const rowData = dataById.get(String(cell.id));
            if (!rowData) return;
            const arr = rowsMap.get(cell.id) || [];
            arr.push(String(rowData[cell.colField] ?? ''));
            rowsMap.set(cell.id, arr);
          });
          const lines: string[] = [];
          for (const [, rowCells] of rowsMap.entries()) lines.push(rowCells.join('\t'));
          await navigator.clipboard.writeText(lines.join('\n'));
          setCopiedCells([...selectedCells]);
        } catch (err) {
          console.error('Error copying to clipboard:', err);
        }
      }
    };

    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [selectedCells, data, containerRef]);

  return { copiedCells, setCopiedCells };
}
