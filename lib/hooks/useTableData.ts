// lib/hooks/useTableData.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

type Dataset = 'empleados' | 'productos' | 'ventas' | 'analytics' | 'contacts' | 'messages' | 'sequences';

interface UseTableDataOptions {
  dataset: Dataset;
  filter?: string;
}

interface UseTableDataReturn {
  data: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateCell: (rowId: string, colId: string, newValue: string) => Promise<void>;
}

export function useTableData({ dataset, filter }: UseTableDataOptions): UseTableDataReturn {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = filter
        ? `/api/${dataset}?filter=${filter}`
        : `/api/${dataset}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Soportar tanto respuestas con { success, data } como arrays directos
      if (Array.isArray(result)) {
        setData(result);
      } else if (result.success) {
        setData(result.data);
      } else if (result.error) {
        throw new Error(result.error);
      } else {
        setData(result);
      }
    } catch (err: any) {
      console.error(`Error al cargar ${dataset}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dataset, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateCell = useCallback(
    async (rowId: string, colId: string, newValue: string) => {
      try {
        const response = await fetch(`/api/${dataset}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: rowId,
            field: colId,
            value: newValue,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          // Actualización optimista
          setData((prevData) =>
            prevData.map((row) =>
              String(row.id) === String(rowId)
                ? { ...row, [colId]: newValue }
                : row
            )
          );
        } else {
          throw new Error(result.error || 'Error al actualizar');
        }
      } catch (err: any) {
        console.error(`Error al actualizar ${dataset}:`, err);
        // Revertir cambio si falla
        await fetchData();
        throw err;
      }
    },
    [dataset, fetchData]
  );

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    updateCell,
  };
}
