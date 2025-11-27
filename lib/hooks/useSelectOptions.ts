// lib/hooks/useSelectOptions.ts
/**
 * ═══════════════════════════════════════════════════════════════════
 * HOOK PARA GESTIÓN DINÁMICA DE OPCIONES DE SELECT
 * ═══════════════════════════════════════════════════════════════════
 *
 * Este hook es completamente independiente y reutilizable.
 * Maneja:
 * - Carga de opciones desde la API
 * - Creación de nuevas opciones
 * - Cache local para evitar requests innecesarios
 * - Estado de loading y error
 *
 * USO:
 * ```ts
 * const { options, loading, createOption } = useSelectOptions({
 *   dataset: 'empleados',
 *   field: 'departamento',
 *   initialOptions: ['Ventas', 'Marketing'], // Opcional
 * });
 * ```
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSelectOptionsParams {
  dataset: string;
  field: string;
  initialOptions?: string[];
  enableDynamicFetch?: boolean; // Si false, solo usa initialOptions
}

interface UseSelectOptionsReturn {
  options: string[];
  loading: boolean;
  error: string | null;
  createOption: (value: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Hook para gestionar opciones de select de forma dinámica
 */
export function useSelectOptions({
  dataset,
  field,
  initialOptions = [],
  enableDynamicFetch = true,
}: UseSelectOptionsParams): UseSelectOptionsReturn {
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cache para evitar fetches duplicados
  const cacheKey = `${dataset}:${field}`;
  const hasFetchedRef = useRef<Set<string>>(new Set());

  /**
   * Fetch opciones desde la API
   */
  const fetchOptions = useCallback(async () => {
    // Si ya se hizo fetch para este dataset/field, no volver a hacer
    if (hasFetchedRef.current.has(cacheKey)) {
      return;
    }

    // Si no está habilitado el fetch dinámico, usar initialOptions
    if (!enableDynamicFetch) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `/api/select-options?dataset=${encodeURIComponent(
        dataset
      )}&field=${encodeURIComponent(field)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        // Si la API no existe o falla, usar initialOptions sin error
        console.warn(
          `No se pudo cargar opciones desde API para ${dataset}.${field}, usando opciones iniciales`
        );
        hasFetchedRef.current.add(cacheKey);
        return;
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.options)) {
        // Combinar opciones de la API con initialOptions (sin duplicados)
        const combined = Array.from(
          new Set([...initialOptions, ...result.options])
        );
        setOptions(combined);
        hasFetchedRef.current.add(cacheKey);
      } else {
        console.warn('Respuesta inesperada de la API, usando opciones iniciales');
      }
    } catch (err: any) {
      console.warn(
        `Error al cargar opciones para ${dataset}.${field}:`,
        err.message
      );
      // No establecer error, simplemente usar initialOptions
    } finally {
      setLoading(false);
    }
  }, [dataset, field, initialOptions, enableDynamicFetch, cacheKey]);

  /**
   * Crear nueva opción
   */
  const createOption = useCallback(
    async (value: string): Promise<boolean> => {
      try {
        // Validación básica
        if (!value || value.trim().length === 0) {
          return false;
        }

        const trimmedValue = value.trim();

        // Si la opción ya existe, no hacer nada
        if (options.includes(trimmedValue)) {
          return true;
        }

        // Si no está habilitado el fetch dinámico, solo agregar localmente
        if (!enableDynamicFetch) {
          setOptions((prev) => [...prev, trimmedValue]);
          return true;
        }

        // Intentar validar con la API
        const response = await fetch('/api/select-options', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dataset,
            field,
            value: trimmedValue,
          }),
        });

        if (!response.ok) {
          // Si la API falla, agregar localmente de todas formas
          console.warn(
            'API no disponible, agregando opción localmente'
          );
          setOptions((prev) => [...prev, trimmedValue]);
          return true;
        }

        const result = await response.json();

        if (result.success) {
          // Agregar la nueva opción a la lista local
          setOptions((prev) => [...prev, trimmedValue]);
          return true;
        }

        return false;
      } catch (err: any) {
        console.warn('Error al crear opción, agregando localmente:', err.message);
        // En caso de error, agregar localmente
        setOptions((prev) => [...prev, value.trim()]);
        return true;
      }
    },
    [dataset, field, options, enableDynamicFetch]
  );

  /**
   * Refetch manual
   */
  const refetch = useCallback(async () => {
    hasFetchedRef.current.delete(cacheKey);
    await fetchOptions();
  }, [fetchOptions, cacheKey]);

  // Fetch inicial al montar
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    options,
    loading,
    error,
    createOption,
    refetch,
  };
}
