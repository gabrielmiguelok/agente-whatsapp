/**
 * CustomTable Theme Colors - Docheck 2025
 *
 * Paleta de colores centralizada para CustomTable
 * Basada en los colores del logo de Docheck/Synara:
 * - #127CF3 (medium blue) - PRIMARY
 * - #28A8FF (light blue)
 * - #0056E8 (dark blue)
 * - #0D47FF (text blue)
 *
 * Usando formato oklch para mejor consistencia con globals.css
 */

export const DOCHECK_COLORS = {
  // Color primario del logo (medium blue #127CF3)
  primary: {
    hex: '#127CF3',
    rgb: 'rgb(18, 124, 243)',
    oklch: 'oklch(0.6 0.18 240)',
    light: 'oklch(0.65 0.16 235)',
    dark: 'oklch(0.55 0.2 245)',
  },

  // Color claro (light blue #28A8FF)
  accent: {
    hex: '#28A8FF',
    rgb: 'rgb(40, 168, 255)',
    oklch: 'oklch(0.7 0.15 230)',
    light: 'oklch(0.75 0.13 228)',
    dark: 'oklch(0.65 0.17 232)',
  },

  // Azul claro más suave
  accentLight: {
    hex: '#28A8FF',
    rgb: 'rgb(40, 168, 255)',
    oklch: 'oklch(0.7 0.15 230)',
    light: 'oklch(0.75 0.13 228)',
    dark: 'oklch(0.65 0.17 232)',
  },

  // Color oscuro (dark blue #0056E8)
  accentDark: {
    hex: '#0056E8',
    rgb: 'rgb(0, 86, 232)',
    oklch: 'oklch(0.5 0.2 250)',
    light: 'oklch(0.55 0.18 248)',
    dark: 'oklch(0.45 0.22 252)',
  },
} as const;

// Alias para compatibilidad
export const SYNARA_COLORS = DOCHECK_COLORS;
export const ROPURRA_COLORS = DOCHECK_COLORS;

// Tema claro
export const LIGHT_THEME = {
  // Textos
  text: {
    primary: 'oklch(0.2 0.04 240)',      // Texto principal con tinte azul
    secondary: 'oklch(0.5 0.02 240)',    // Texto secundario
    muted: 'oklch(0.6 0.02 240)',        // Texto apagado
    inverse: 'oklch(0.99 0.002 240)',    // Texto sobre fondos oscuros
  },

  // Fondos
  bg: {
    primary: 'oklch(1 0 0)',             // Fondo principal (blanco)
    secondary: 'oklch(0.99 0.002 240)',  // Fondo secundario
    paper: 'oklch(0.985 0 0)',           // Fondo de tarjetas
    hover: 'oklch(0.96 0.004 240)',      // Hover suave
    selected: 'oklch(0.94 0.006 240)',   // Estado seleccionado
  },

  // Bordes y divisores
  border: {
    primary: 'oklch(0.92 0.004 240)',    // Borde principal
    secondary: 'oklch(0.95 0.002 240)',  // Borde suave
    focus: DOCHECK_COLORS.primary.oklch,  // Borde de foco
  },

  // Estados interactivos
  interactive: {
    hover: 'rgba(18, 124, 243, 0.08)',    // Hover sobre elementos
    active: 'rgba(18, 124, 243, 0.12)',   // Estado activo
    focus: 'rgba(18, 124, 243, 0.15)',    // Estado de foco
    disabled: 'oklch(0.85 0.002 240)',    // Deshabilitado
  },

  // Sombras
  shadow: {
    sm: '0 1px 2px rgba(18, 124, 243, 0.06)',
    md: '0 4px 8px rgba(18, 124, 243, 0.08)',
    lg: '0 10px 24px rgba(18, 124, 243, 0.1)',
    xl: '0 20px 40px rgba(18, 124, 243, 0.12)',
  },
} as const;

// Tema oscuro
export const DARK_THEME = {
  // Textos
  text: {
    primary: 'oklch(0.98 0.002 240)',    // Texto principal
    secondary: 'oklch(0.7 0.02 240)',    // Texto secundario
    muted: 'oklch(0.6 0.02 240)',        // Texto apagado
    inverse: 'oklch(0.12 0.01 240)',     // Texto sobre fondos claros
  },

  // Fondos
  bg: {
    primary: 'oklch(0.12 0.01 240)',     // Fondo principal
    secondary: 'oklch(0.15 0.01 240)',   // Fondo secundario
    paper: 'oklch(0.18 0.01 240)',       // Fondo de tarjetas
    hover: 'oklch(0.22 0.02 240)',       // Hover suave
    selected: 'oklch(0.25 0.03 240)',    // Estado seleccionado
  },

  // Bordes y divisores
  border: {
    primary: 'oklch(0.22 0.02 240)',     // Borde principal
    secondary: 'oklch(0.18 0.01 240)',   // Borde suave
    focus: DOCHECK_COLORS.primary.oklch,  // Borde de foco
  },

  // Estados interactivos
  interactive: {
    hover: 'rgba(18, 124, 243, 0.12)',    // Hover sobre elementos
    active: 'rgba(18, 124, 243, 0.18)',   // Estado activo
    focus: 'rgba(18, 124, 243, 0.22)',    // Estado de foco
    disabled: 'oklch(0.3 0.02 240)',      // Deshabilitado
  },

  // Sombras
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 8px rgba(0, 0, 0, 0.35)',
    lg: '0 10px 24px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.45)',
  },
} as const;

/**
 * Helper function to get theme colors
 * @param isDark - Whether dark mode is enabled
 * @returns Theme object with colors
 */
export function getTableTheme(isDark: boolean) {
  return isDark ? DARK_THEME : LIGHT_THEME;
}

/**
 * Helper function to get primary color with opacity
 * @param opacity - Opacity value between 0 and 1
 * @returns RGBA color string
 */
export function getPrimaryWithOpacity(opacity: number): string {
  return `rgba(18, 124, 243, ${opacity})`;
}

/**
 * Helper function to get accent color with opacity
 * @param opacity - Opacity value between 0 and 1
 * @returns RGBA color string
 */
export function getAccentWithOpacity(opacity: number): string {
  return `rgba(40, 168, 255, ${opacity})`;
}

// Exportar tipo para TypeScript
export type TableTheme = typeof LIGHT_THEME;
export type DocheckColors = typeof DOCHECK_COLORS;
export type SynaraColors = typeof SYNARA_COLORS; // Alias para compatibilidad
export type RopurraColors = typeof ROPURRA_COLORS; // Alias para compatibilidad
