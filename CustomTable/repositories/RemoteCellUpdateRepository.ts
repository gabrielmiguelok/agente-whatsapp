export type RegistrationType = 'congress' | 'workshop' | 'nutrition';

export class RemoteCellUpdateRepository {
  constructor(private apiEndpoint: string) {}

  async updateCell(
    rowId: number | string,
    field: string,
    newValue: string,
    type?: RegistrationType
  ): Promise<boolean> {
    try {
      const resp = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rowId, field, value: newValue, type }),
      });

      if (!resp.ok) {
        // Silencioso en cliente
        return false;
      }

      const data = await resp.json().catch(() => ({} as any));
      if ((data as any)?.error) {
        // Silencioso en cliente
        return false;
      }
      return true;
    } catch {
      // Silencioso en cliente
      return false;
    }
  }
}
