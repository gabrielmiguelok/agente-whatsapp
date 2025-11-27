export class LocalTableDataRepository<T = Record<string, any>> {
  constructor(private storageKey: string = 'myTableData') {}

  /**
   * Sin persistencia: la edición es sólo en memoria.
   * Si se hace F5 / nueva consulta, siempre vuelve a DB.
   */
  getAllRows(): T[] {
    return []; // no devolvemos caché local
  }

  /**
   * No persistimos nada: si alguien intenta guardar,
   * limpiamos cualquier residuo previo por si existiera.
   */
  saveAllRows(_rows: T[]): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Error limpiando localStorage:', error);
    }
  }
}
