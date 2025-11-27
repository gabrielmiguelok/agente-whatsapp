// components/CustomTable/services/CellDataService.ts

import type { RegistrationType } from "../repositories/RemoteCellUpdateRepository";

export interface LocalRepo<T> {
  getAllRows(): T[];
  saveAllRows(rows: T[]): void;
}

export interface RemoteRepo {
  updateCell(
    rowId: number | string,
    field: string,
    newValue: string,
    type?: RegistrationType
  ): Promise<boolean>;
}

export class CellDataService<T extends { id?: number | string } = Record<string, any>> {
  constructor(private localRepo: LocalRepo<T>, private remoteRepo: RemoteRepo) {}

  async updateCellValue(
    currentRows: T[],
    localRowIndex: number,
    colId: string,
    newValue: string
  ): Promise<T[]> {
    if (!Array.isArray(currentRows)) {
      console.warn('CellDataService.updateCellValue: currentRows no es un array.');
      return currentRows;
    }
    if (localRowIndex < 0 || localRowIndex >= currentRows.length) {
      console.warn(`CellDataService.updateCellValue: Índice inválido = ${localRowIndex}`);
      return currentRows;
    }

    const row = currentRows[localRowIndex] as any;
    const oldValue = (row as any)[colId] ?? '';
    const safeNewValue = String(newValue || '').trim();

    if (!safeNewValue) {
      console.warn(`Valor nuevo vacío. No se actualiza [${localRowIndex}, ${colId}].`);
      return currentRows;
    }
    if (safeNewValue === String(oldValue).trim()) {
      console.warn(`Sin cambios en la celda [${localRowIndex}, ${colId}].`);
      return currentRows;
    }

    // Edición optimista (UI primero)
    const updatedRows = [...currentRows];
    updatedRows[localRowIndex] = { ...row, [colId]: safeNewValue } as T;

    this.localRepo.saveAllRows(updatedRows);

    const dbId = row.id;
    const type: RegistrationType | undefined = row?._tipo; // <- normalizado en tus endpoints

    if (dbId == null) {
      console.warn(`Fila sin 'id' (localRowIndex=${localRowIndex}). No se hace POST remoto.`);
    } else {
      try {
        await this.remoteRepo.updateCell(dbId, colId, safeNewValue, type);
      } catch (error) {
        console.error('Error actualizando en la DB:', error);
      }
    }

    return updatedRows;
  }

  loadLocalDataOrDefault(currentRows: T[]): T[] {
    const savedRows = this.localRepo.getAllRows();
    if (Array.isArray(savedRows) && savedRows.length > 0) return savedRows;
    return currentRows;
  }
}
