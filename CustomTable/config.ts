/**
 * ═══════════════════════════════════════════════════════════════════
 * CONFIGURACIÓN CENTRALIZADA DE CUSTOMTABLE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Este archivo contiene TODAS las configuraciones globales del componente CustomTable.
 * Modificar estos valores afectará el comportamiento de toda la tabla.
 *
 * IMPORTANTE: Este es el ÚNICO lugar donde debes modificar valores de configuración.
 * No modifiques valores directamente en los componentes.
 *
 * ═══════════════════════════════════════════════════════════════════
 */

// ==================== CONFIGURACIÓN DE COLUMNAS ====================
export const COLUMN_CONFIG = {
  // Ancho mínimo permitido para cualquier columna (en px)
  MIN_WIDTH: 20,

  // Ancho por defecto si no se especifica en columnsDef (en px)
  DEFAULT_WIDTH: 30,

  // Ancho de la columna de índice (primera columna con números de fila)
  INDEX_COLUMN_WIDTH: 32,
  INDEX_COLUMN_MIN_WIDTH: 32,
};

// ==================== CONFIGURACIÓN DE ESTILOS ====================
export const STYLES_CONFIG = {
  // ===== Header (encabezado de columnas) =====
  header: {
    padding: '1px 6px',        // Padding interno del header (compacto)
    gap: '2px',                // Espacio entre elementos del header
    fontSize: '10px',          // Tamaño de fuente del texto del header
    letterSpacing: '0.02em',   // Espaciado entre letras
    fontWeight: 500,           // Peso de fuente normal (700 para columna index)
    indexFontWeight: 700,      // Peso de fuente para columna de índice
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',  // Sombra del header
    whiteSpace: 'normal',      // Permite wrap del texto
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  // ===== Cells (celdas de datos) =====
  cell: {
    padding: '0px 6px',        // Padding interno de las celdas (mínimo vertical)
    fontSize: '11px',          // Tamaño de fuente del texto de las celdas (reducido)
    whiteSpace: 'normal',      // Permite wrap del texto
    wordWrap: 'break-word',    // Rompe palabras largas
    wordBreak: 'break-word',   // Fuerza el quiebre de palabras
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    numericAlign: 'right',     // Alineación para columnas numéricas
  },

  // ===== Resize Handle (manija de redimensionamiento) =====
  resizeHandle: {
    width: '6px',              // Ancho del área clickeable para redimensionar
    rightOffset: '-3px',       // Offset desde el borde derecho
    height: '100%',
    background: 'transparent',
    hoverBackground: 'rgba(18,124,243,0.25)', // Color al hacer hover
  },

  // ===== Scrollbar (barra de desplazamiento) =====
  scrollbar: {
    width: '12px',
    height: '12px',
    trackBackground: 'rgba(0,0,0,0.05)',
    trackBackgroundDark: 'rgba(255,255,255,0.05)',
    thumbBackground: 'rgba(0,0,0,0.2)',
    thumbBackgroundDark: 'rgba(255,255,255,0.2)',
    thumbHoverBackground: 'rgba(0,0,0,0.3)',
    thumbHoverBackgroundDark: 'rgba(255,255,255,0.3)',
    thumbBorderRadius: '6px',
    trackBorderRadius: '0px',
  },

  // ===== Table Container =====
  container: {
    borderRadius: 0,
    boxShadow: 'none',
    border: '0px solid var(--color-divider)',
  },

  // ===== Input Styles (para edición en línea) =====
  input: {
    width: '100%',
    borderRadius: '4px',
    padding: '2px 4px',
    fontSize: 'inherit',
  },

  // ===== Select Styles (para campos select) =====
  select: {
    width: '100%',
    padding: 0,
    fontSize: 'inherit',
  },
};

// ==================== CONFIGURACIÓN DE TABLA ====================
export const TABLE_CONFIG = {
  // Altura por defecto de las filas (en px) - reducido para diseño compacto
  DEFAULT_ROW_HEIGHT: 26,

  // Tamaño de página por defecto (número de filas por página)
  DEFAULT_PAGE_SIZE: 50,

  // Tiempo de debounce para filtros globales (en ms)
  FILTER_DEBOUNCE_TIME: 500,

  // Configuración de la tabla HTML
  table: {
    width: 'auto',             // Auto: permite que las columnas definan el ancho total
    minWidth: '100%',          // Min 100%: evita espacios blancos si las columnas son muy estrechas
    tableLayout: 'fixed',      // Layout fijo para respetar anchos de colgroup
    borderCollapse: 'collapse',
    borderSpacing: 0,
  },
};

// ==================== CONFIGURACIÓN DE COLORES ====================
export const COLORS_CONFIG = {
  // ===== Color primario de la marca (Synara blue) =====
  primary: 'rgb(18, 124, 243)',
  primaryWithOpacity: (opacity: number) => `rgba(18, 124, 243, ${opacity})`,

  // ===== Colores de selección =====
  selection: {
    background: 'rgba(18, 124, 243, 0.04)',
    boxShadow: 'inset 0 0 0 1px rgba(18, 124, 243, 0.3)',
  },

  // ===== Colores de copiado =====
  copied: {
    background: 'rgba(40, 168, 255, 0.12)',
    hoverBackground: 'rgba(40, 168, 255, 0.18)',
    selectedBackground: 'rgba(40, 168, 255, 0.05)',
  },

  // ===== Colores de hover =====
  hover: {
    rowBackground: 'var(--color-interactive-hover)',
  },

  // ===== Variables CSS del tema =====
  cssVars: {
    bgPaper: 'var(--color-bg-paper)',
    text: 'var(--color-text)',
    divider: 'var(--color-divider)',
    primary: 'var(--color-primary)',
    tableHeader: 'var(--color-table-header)',
    tableIndexHeader: 'var(--color-table-index-header)',
    tableIndexColgroup: 'var(--color-table-index-colgroup)',
    interactiveHover: 'var(--color-interactive-hover)',
  },
};

// ==================== CONFIGURACIÓN DE EXPORT ====================
export const EXPORT_CONFIG = {
  // Nombre por defecto del archivo exportado
  defaultFileName: 'tabla_exportada.xlsx',

  // Nombre de la hoja en el archivo Excel
  sheetName: 'Datos',

  // Tipo MIME del archivo
  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

// ==================== CONFIGURACIÓN DE SELECCIÓN ====================
export const SELECTION_CONFIG = {
  // Clases CSS para celdas seleccionadas y copiadas
  selectedCellClass: 'selected-cell',
  copiedCellClass: 'copied-cell',

  // Configuración de focus
  focusBoxShadow: (primaryColor: string) => `inset 0 0 0 2px ${primaryColor}`,
};

// ==================== CONFIGURACIÓN DE TOOLBAR ====================
export const TOOLBAR_CONFIG = {
  // Altura de la barra de herramientas
  height: '48px',

  // Padding de la barra
  padding: '0 8px',

  // Gap entre elementos
  gap: '8px',

  // Configuración del input de búsqueda global
  searchInput: {
    width: '220px',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '0.875rem',
  },

  // Configuración de botones
  buttons: {
    fontSize: '18px',
    iconSize: '14px',
    padding: '0 4px',
  },

  // Configuración de texto
  text: {
    fontSize: '13px',
  },
};

// ==================== CONFIGURACIÓN DE MODALES ====================
export const MODAL_CONFIG = {
  // Modal de filtros avanzados
  advancedFilters: {
    width: 'min(90vw, 600px)',
    bgcolor: '#ffffff',
    borderRadius: '8px',
    boxShadow: 24,
  },

  // Popovers
  popover: {
    width: '220px',
    padding: '8px',
    gap: '8px',
    borderRadius: '8px',
    boxShadow: '0 8px 22px rgba(155,89,255,.10)',
    fontSize: '0.8rem',
  },
};

// ==================== CONFIGURACIÓN DE FILTROS ====================
export const FILTER_CONFIG = {
  // Autocomplete
  autocomplete: {
    width: '130px',
    borderRadius: '6px',
    padding: '0 6px',
    labelFontSize: '0.75rem',
    labelPadding: '4px 0',
    inputFontSize: '0.65rem',
    popupHeight: '200px',
    listItemPadding: '4px 8px',
    listItemFontSize: '0.8rem',
    listItemGap: '6px',
  },

  // Dropdown de iconos
  iconDropdown: {
    width: '200px',
    padding: '4px',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    background: '#fff',
    minHeight: '32px',
    fontSize: '0.8rem',
    optionPadding: '4px 8px',
  },

  // Badges/chips de filtros
  badge: {
    color: '#0055aa',
    borderRadius: '6px',
    padding: '1px 6px',
    fontSize: '0.7rem',
  },

  // Range inputs (para filtros numéricos)
  rangeInput: {
    width: '60px',
    fontSize: '0.8rem',
    padding: '4px',
    borderRadius: '6px',
  },
};

// ==================== CONFIGURACIÓN DE LOADING/EMPTY STATES ====================
export const OVERLAY_CONFIG = {
  // Loading overlay
  loading: {
    spinnerSize: 14,
    spinnerBorder: '2px solid',
    spinnerBorderRadius: '50%',
    messageMarginTop: 16,
    indicatorWidth: 36,
    indicatorHeight: 3,
    indicatorBorderRadius: 2,
  },

  // No results overlay
  noResults: {
    iconSize: 48,
    messageMarginTop: 16,
    indicatorWidth: 36,
    indicatorHeight: 3,
    indicatorBorderRadius: 2,
  },
};

// ==================== CONFIGURACIÓN DE PAGINACIÓN ====================
export const PAGINATION_CONFIG = {
  // Select de tamaño de página
  pageSize: {
    minWidth: '70px',
    fontSize: '0.75rem',
    padding: '4px',
  },

  // Texto de información
  info: {
    fontSize: '13px',
  },
};

// ==================== CONFIGURACIÓN DE ANIMACIONES ====================
export const ANIMATION_CONFIG = {
  // Transiciones
  transitions: {
    cell: 'background-color 150ms ease, box-shadow 150ms ease',
    button: 'all 0.2s ease',
  },

  // Duraciones
  durations: {
    fast: '150ms',
    medium: '300ms',
    slow: '500ms',
  },
};

// ==================== UTILIDADES ====================
/**
 * Obtiene un valor de configuración de forma segura
 * @param path - Ruta del valor (ej: 'STYLES_CONFIG.header.padding')
 * @param defaultValue - Valor por defecto si no se encuentra
 */
export function getConfigValue(path: string, defaultValue?: any): any {
  const parts = path.split('.');
  let current: any = {
    COLUMN_CONFIG,
    STYLES_CONFIG,
    TABLE_CONFIG,
    COLORS_CONFIG,
    EXPORT_CONFIG,
    SELECTION_CONFIG,
    TOOLBAR_CONFIG,
    MODAL_CONFIG,
    FILTER_CONFIG,
    OVERLAY_CONFIG,
    PAGINATION_CONFIG,
    ANIMATION_CONFIG,
  };

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return defaultValue;
    }
  }

  return current;
}

/**
 * Exportación consolidada de toda la configuración
 */
export const CONFIG = {
  COLUMN: COLUMN_CONFIG,
  STYLES: STYLES_CONFIG,
  TABLE: TABLE_CONFIG,
  COLORS: COLORS_CONFIG,
  EXPORT: EXPORT_CONFIG,
  SELECTION: SELECTION_CONFIG,
  TOOLBAR: TOOLBAR_CONFIG,
  MODAL: MODAL_CONFIG,
  FILTER: FILTER_CONFIG,
  OVERLAY: OVERLAY_CONFIG,
  PAGINATION: PAGINATION_CONFIG,
  ANIMATION: ANIMATION_CONFIG,
} as const;

export default CONFIG;
