import { useCallback } from 'react';

export interface CellDataServiceLike<T extends Record<string, any> = Record<string, any>> {
  updateCellValue: (
    currentRows: T[],
    localRowIndex: number,
    colId: string,
    newValue: string
  ) => Promise<T[]>;
  loadLocalDataOrDefault: (currentRows: T[]) => T[];
}

export function useCellEditingOrchestration<T extends Record<string, any>>(
  cellDataService: CellDataServiceLike<T>
) {
  const handleConfirmCellEdit = useCallback(
    async (
      rowId: string | number,
      colId: string,
      newValue: string,
      tableData: T[],
      setTableData: (rows: T[]) => void
    ) => {
      // Buscar la fila por su ID real (string match) en el array actual
      const rowIndex = tableData.findIndex((r: any) => String(r?.id) === String(rowId));
      if (rowIndex === -1) {
        console.warn(`handleConfirmCellEdit: no se encontró la fila con id=${rowId}`);
        return;
      }
      const updatedRows = await cellDataService.updateCellValue(
        tableData,
        rowIndex,
        colId,
        newValue
      );
      setTableData(updatedRows);
    },
    [cellDataService]
  );

  const loadLocalDataOrDefault = useCallback(
    (currentRows: T[]) => cellDataService.loadLocalDataOrDefault(currentRows),
    [cellDataService]
  );

  return { handleConfirmCellEdit, loadLocalDataOrDefault };
}
