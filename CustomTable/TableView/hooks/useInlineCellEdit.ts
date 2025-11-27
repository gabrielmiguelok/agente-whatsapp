// LICENSE: MIT
'use client';

/**
 * Hook para manejar la edición inline de celdas en CustomTable
 *
 * Características:
 * - Edición con un solo clic (configurable)
 * - Cursor posicionado al final del texto automáticamente
 * - Soporte para Enter, Tab y Escape
 * - Auto-guardado al perder foco (blur)
 * - Manejo de estados de edición con prevención de race conditions
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja lógica de edición de celdas
 * - Open/Closed: Extensible mediante configuración sin modificar código
 * - Interface Segregation: API minimalista y clara
 */

import { useState, useCallback, useContext, useRef, useEffect } from 'react';
import { TableEditContext } from '../../index';

type EditingCell = { rowId: string; colId: string } | null;

/**
 * Configuración del hook de edición
 */
interface CellEditConfig {
  /** Si true, permite edición con un solo clic. Si false, requiere doble clic */
  singleClickEdit?: boolean;
  /** Delay en ms antes de confirmar edición (para debouncing). Default: 0 */
  confirmDelay?: number;
  /** Callback para navegar a la siguiente celda al presionar Enter */
  onNavigateNext?: (currentRowId: string, currentColId: string) => void;
  /** Callback para navegar hacia arriba (Arrow Up) */
  onNavigateUp?: (currentRowId: string, currentColId: string) => void;
  /** Callback para navegar hacia abajo (Arrow Down) */
  onNavigateDown?: (currentRowId: string, currentColId: string) => void;
  /** Callback para navegar hacia la izquierda (Arrow Left) */
  onNavigateLeft?: (currentRowId: string, currentColId: string) => void;
  /** Callback para navegar hacia la derecha (Arrow Right) */
  onNavigateRight?: (currentRowId: string, currentColId: string) => void;
}

export default function useInlineCellEdit(config: CellEditConfig = {}) {
  const {
    singleClickEdit = true,
    confirmDelay = 0,
    onNavigateNext,
    onNavigateUp,
    onNavigateDown,
    onNavigateLeft,
    onNavigateRight,
  } = config;

  const ctx = useContext(TableEditContext) || {};
  const handleConfirmCellEdit =
    (ctx as { handleConfirmCellEdit?: (rowId: string, colId: string, newValue: string) => Promise<void> | void })
      .handleConfirmCellEdit;

  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // CRÍTICO: Ref para tener SIEMPRE el valor más reciente, sin esperar re-renders
  const editingValueRef = useRef<string>('');

  // Ref para rastrear si hay una edición en progreso (prevenir race conditions)
  const isConfirmingRef = useRef<boolean>(false);
  const confirmTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ref para el input/textarea para posicionar cursor
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  /**
   * Limpia el timer de confirmación si existe
   */
  const clearConfirmTimer = useCallback(() => {
    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
  }, []);

  /**
   * Cleanup al desmontar
   */
  useEffect(() => {
    return () => {
      clearConfirmTimer();
    };
  }, [clearConfirmTimer]);

  /**
   * Verifica si una celda específica está en modo edición
   */
  const isEditingCell = useCallback(
    (rowId: string, colId: string) =>
      !!(editingCell && editingCell.rowId === rowId && editingCell.colId === colId),
    [editingCell]
  );

  /**
   * Posiciona el cursor al final del texto en el input/textarea
   * Esto mejora la UX significativamente
   */
  const positionCursorAtEnd = useCallback((element: HTMLInputElement | HTMLTextAreaElement) => {
    // Usar requestAnimationFrame para asegurar que el DOM esté listo
    requestAnimationFrame(() => {
      const length = element.value.length;
      element.setSelectionRange(length, length);
      element.scrollTop = element.scrollHeight; // Para textareas, scroll al final
    });
  }, []);

  /**
   * Inicia el modo de edición para una celda
   * Soporta tanto un solo clic como doble clic según configuración
   */
  const startEditing = useCallback((rowId: string, colId: string, initialValue: string | number = '') => {
    // Cancelar cualquier confirmación pendiente
    clearConfirmTimer();

    // IMPORTANTE: Manejar valores vacíos/undefined/null correctamente
    const safeInitialValue = initialValue === null || initialValue === undefined || initialValue === ''
      ? ''
      : String(initialValue);

    // Iniciar edición
    setEditingCell({ rowId, colId });
    setEditingValue(safeInitialValue);
    editingValueRef.current = safeInitialValue; // CRÍTICO: Sincronizar ref también

    console.log('📝 [CELL-EDIT] Iniciando edición:', { rowId, colId, initialValue, safeInitialValue });
  }, [clearConfirmTimer]);

  /**
   * Handler para un solo clic (nuevo comportamiento)
   */
  const handleSingleClick = useCallback((rowId: string, colId: string, initialValue: string | number = '') => {
    if (singleClickEdit) {
      startEditing(rowId, colId, initialValue);
    }
  }, [singleClickEdit, startEditing]);

  /**
   * Handler para doble clic (comportamiento legacy, mantener compatibilidad)
   */
  const handleDoubleClick = useCallback((rowId: string, colId: string, initialValue: string | number = '') => {
    if (!singleClickEdit) {
      startEditing(rowId, colId, initialValue);
    }
  }, [singleClickEdit, startEditing]);

  /**
   * Handler para cambios en el input/textarea/select
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    console.log('📝 [HOOK] handleChange:', {
      newValue,
      editingCell,
    });

    // CRÍTICO: Actualizar AMBOS - estado Y ref para tener valor sincronizado
    setEditingValue(newValue);
    editingValueRef.current = newValue;
  }, [editingCell]);

  /**
   * Confirma la edición y guarda el valor
   * Incluye protección contra race conditions
   */
  const confirmEdit = useCallback(async () => {
    // Prevenir confirmaciones múltiples simultáneas
    if (isConfirmingRef.current) {
      console.log('⚠️ [CELL-EDIT] Confirmación ya en progreso, ignorando...');
      return;
    }

    const cell = editingCell;
    if (!cell) {
      console.log('ℹ️ [CELL-EDIT] No hay celda en edición, saltando confirmación');
      return;
    }

    if (!handleConfirmCellEdit) {
      console.error('🔴 [CELL-EDIT] No hay handler de confirmación disponible');
      return;
    }

    try {
      isConfirmingRef.current = true;
      clearConfirmTimer();

      // CRÍTICO: Usar el ref que tiene el valor MÁS RECIENTE, no el estado que puede estar stale
      const value = String(editingValueRef.current ?? '').trim();
      console.log('✅ [CELL-EDIT] Confirmando edición:', {
        rowId: cell.rowId,
        colId: cell.colId,
        value,
        stateValue: editingValue,
        refValue: editingValueRef.current,
      });

      // Llamar al handler (puede ser async)
      await handleConfirmCellEdit(cell.rowId, cell.colId, value);

      // Limpiar estado solo después de confirmar exitosamente
      setEditingCell(null);
      setEditingValue('');
      editingValueRef.current = ''; // CRÍTICO: Limpiar ref también

      console.log('✅ [CELL-EDIT] Edición confirmada y guardada');
    } catch (error: any) {
      console.error('🔴 [CELL-EDIT] Error al confirmar edición:', error.message);
      // No limpiar estado en caso de error para que el usuario pueda reintentar
    } finally {
      isConfirmingRef.current = false;
    }
  }, [editingCell, editingValue, handleConfirmCellEdit, clearConfirmTimer]);

  /**
   * Cancela la edición sin guardar cambios
   */
  const cancelEdit = useCallback(() => {
    clearConfirmTimer();
    setEditingCell(null);
    setEditingValue('');
    editingValueRef.current = ''; // CRÍTICO: Limpiar ref también
    console.log('❌ [CELL-EDIT] Edición cancelada');
  }, [clearConfirmTimer]);

  /**
   * Handler para teclas especiales (Enter, Tab, Escape, Arrow Keys)
   *
   * Comportamientos:
   * - Enter: Guarda y navega a la fila siguiente (misma columna)
   * - Tab: Guarda y cierra edición (comportamiento estándar)
   * - Escape: Cancela edición sin guardar
   * - Arrow Up: Guarda y navega a la fila anterior (misma columna)
   * - Arrow Down: Guarda y navega a la fila siguiente (misma columna)
   * - Arrow Left: Guarda y navega a la columna anterior (misma fila)
   * - Arrow Right: Guarda y navega a la columna siguiente (misma fila)
   */
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      // Guardar la celda actual
      await confirmEdit();

      // Si hay callback de navegación y tenemos celda en edición, navegar a la siguiente
      if (onNavigateNext && editingCell) {
        console.log('🔽 [CELL-EDIT] Enter presionado, navegando a siguiente fila');
        onNavigateNext(editingCell.rowId, editingCell.colId);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      await confirmEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancelEdit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      await confirmEdit();
      if (onNavigateUp && editingCell) {
        console.log('⬆️ [CELL-EDIT] Arrow Up presionado, navegando a fila anterior');
        onNavigateUp(editingCell.rowId, editingCell.colId);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      await confirmEdit();
      if (onNavigateDown && editingCell) {
        console.log('⬇️ [CELL-EDIT] Arrow Down presionado, navegando a fila siguiente');
        onNavigateDown(editingCell.rowId, editingCell.colId);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      await confirmEdit();
      if (onNavigateLeft && editingCell) {
        console.log('⬅️ [CELL-EDIT] Arrow Left presionado, navegando a columna anterior');
        onNavigateLeft(editingCell.rowId, editingCell.colId);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      await confirmEdit();
      if (onNavigateRight && editingCell) {
        console.log('➡️ [CELL-EDIT] Arrow Right presionado, navegando a columna siguiente');
        onNavigateRight(editingCell.rowId, editingCell.colId);
      }
    }
  }, [confirmEdit, cancelEdit, onNavigateNext, onNavigateUp, onNavigateDown, onNavigateLeft, onNavigateRight, editingCell]);

  /**
   * Handler para blur (perder foco)
   * Usa delay configurable para evitar conflictos con otros eventos
   */
  const handleBlur = useCallback(() => {
    // Limpiar cualquier timer anterior
    clearConfirmTimer();

    if (confirmDelay > 0) {
      // Usar delay para prevenir race conditions con otros handlers
      confirmTimerRef.current = setTimeout(() => {
        confirmEdit();
      }, confirmDelay);
    } else {
      // Confirmar inmediatamente
      confirmEdit();
    }
  }, [confirmDelay, confirmEdit, clearConfirmTimer]);

  /**
   * Callback ref para el input/textarea
   * Automáticamente posiciona el cursor al final cuando se monta
   */
  const setInputRef = useCallback((element: HTMLInputElement | HTMLTextAreaElement | null) => {
    inputRef.current = element;
    if (element) {
      element.focus();
      positionCursorAtEnd(element);
    }
  }, [positionCursorAtEnd]);

  return {
    editingCell,
    editingValue,
    isEditingCell,
    handleSingleClick,     // ← NUEVO: Handler para un solo clic
    handleDoubleClick,     // ← Mantener para compatibilidad
    handleChange,
    handleKeyDown,
    handleBlur,
    cancelEdit,
    setInputRef,           // ← NUEVO: Ref callback para posicionar cursor
  };
}
