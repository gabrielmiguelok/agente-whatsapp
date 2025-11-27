// lib/hooks/useDynamicColumns.ts
/**
 * ═══════════════════════════════════════════════════════════════════
 * HOOK PARA ENRIQUECER COLUMNAS CON OPCIONES DINÁMICAS
 * ═══════════════════════════════════════════════════════════════════
 *
 * Este hook toma las definiciones de columnas y enriquece aquellas que
 * tienen `useDynamicOptions: true` con:
 * - Opciones cargadas desde la API
 * - Callback `onCreateOption` para crear nuevas opciones
 * - Dataset para identificar la tabla
 *
 * MANTIENE LA COMPATIBILIDAD: Las columnas sin `useDynamicOptions`
 * funcionan exactamente igual que antes.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelectOptions } from './useSelectOptions';

interface Column {
  accessorKey: string;
  options?: Array<{ value: string; label: string }>;
  useDynamicOptions?: boolean;
  dataset?: string;
  allowCreate?: boolean;
  onCreateOption?: (value: string) => Promise<void>;
  [key: string]: any;
}

/**
 * Hook para enriquecer columnas con opciones dinámicas
 */
export function useDynamicColumns(columns: Column[], dataset: string) {
  const [enrichedColumns, setEnrichedColumns] = useState<Column[]>(columns);

  // Identificar columnas que necesitan opciones dinámicas
  const dynamicColumns = columns.filter(
    (col) => col.useDynamicOptions === true && col.allowCreate === true
  );

  useEffect(() => {
    // Si no hay columnas dinámicas, usar las columnas originales
    if (dynamicColumns.length === 0) {
      setEnrichedColumns(columns);
      return;
    }

    // Enriquecer columnas con opciones dinámicas
    const enrichColumns = async () => {
      const enriched = await Promise.all(
        columns.map(async (col) => {
          // Si no es una columna dinámica, devolverla sin cambios
          if (!col.useDynamicOptions || !col.allowCreate) {
            return col;
          }

          // Crear callback para crear nueva opción
          const onCreateOption = async (value: string) => {
            try {
              const response = await fetch('/api/select-options', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  dataset: col.dataset || dataset,
                  field: col.accessorKey,
                  value,
                }),
              });

              if (!response.ok) {
                console.warn(
                  `No se pudo crear opción en backend para ${col.accessorKey}:`,
                  value
                );
                return;
              }

              const result = await response.json();
              console.log(`✅ Opción '${value}' validada para ${col.accessorKey}`);
            } catch (error) {
              console.warn(
                `Error al crear opción para ${col.accessorKey}:`,
                error
              );
            }
          };

          // Retornar columna enriquecida
          return {
            ...col,
            onCreateOption,
            dataset: col.dataset || dataset,
          };
        })
      );

      setEnrichedColumns(enriched);
    };

    enrichColumns();
  }, [columns, dataset, dynamicColumns.length]);

  return enrichedColumns;
}
