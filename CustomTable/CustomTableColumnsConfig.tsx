// components/CustomTable/CustomTableColumnsConfig.tsx

// Imports de banderas de países
import AR from 'country-flag-icons/react/3x2/AR';
import BR from 'country-flag-icons/react/3x2/BR';
import CL from 'country-flag-icons/react/3x2/CL';
import CO from 'country-flag-icons/react/3x2/CO';
import MX from 'country-flag-icons/react/3x2/MX';
import ES from 'country-flag-icons/react/3x2/ES';
import US from 'country-flag-icons/react/3x2/US';
import DE from 'country-flag-icons/react/3x2/DE';
import FR from 'country-flag-icons/react/3x2/FR';
import GB from 'country-flag-icons/react/3x2/GB';
import CN from 'country-flag-icons/react/3x2/CN';
import JP from 'country-flag-icons/react/3x2/JP';
import IN from 'country-flag-icons/react/3x2/IN';
import CA from 'country-flag-icons/react/3x2/CA';
import AU from 'country-flag-icons/react/3x2/AU';

export type FieldType =
  | 'link'
  | 'numeric'
  | 'text'
  | 'select'
  | 'date'
  | 'heatmap'      // Mapa de calor con gradiente de colores
  | 'progress'     // Barra de progreso visual
  | 'sparkline'    // Gráfico de línea mini dentro de celda
  | 'country'      // Bandera + nombre de país
  | 'badge'        // Badge con color según valor
  | 'avatar'       // Avatar circular con iniciales
  | 'rating'       // Estrellas de calificación
  | 'currency'     // Valor monetario con formato
  | 'percentage'   // Porcentaje con símbolo %
  | 'foreignKey';  // Foreign key con select dinámico que muestra nombres pero guarda IDs

export type SelectOption = {
  value: string;
  label: string;
};

export type FieldDef = {
  type?: FieldType;
  header?: string;
  width?: number;
  options?: SelectOption[];
  min?: number;        // Para heatmap, progress y rating (valor mínimo)
  max?: number;        // Para heatmap, progress y rating (valor máximo)
  colorScale?: 'red-yellow-green' | 'blue-white-red' | 'purple-orange';  // Para heatmap
  editable?: boolean;  // Si el campo es editable (se detecta automáticamente)
  editType?: 'text' | 'numeric' | 'select';  // Tipo de edición
  textAlign?: 'left' | 'center' | 'right';  // Alineación del texto en la celda
  allowCreate?: boolean;  // Permite crear nuevas opciones en badges (estilo Notion)
  currencySymbol?: string;  // Símbolo de moneda (default: '$')
  currencyLocale?: string;  // Locale para formato de moneda (default: 'es-ES')
  useDynamicOptions?: boolean;  // ← NUEVO: Si debe cargar opciones dinámicas desde la API
  dataset?: string;  // ← NUEVO: Dataset para opciones dinámicas (revendedores, clientes, etc.)
  onCreateOption?: (value: string) => Promise<void>;  // ← NUEVO: Callback para crear opción
  foreignKeyField?: string;  // ← NUEVO: Campo ID en la base de datos (ej: 'responsable_id')
  displayField?: string;     // ← NUEVO: Campo nombre para mostrar (ej: 'responsable_nombre')
};

export type FieldsDefinition = Record<string, FieldDef>;

function isHttpUrl(url?: string) {
  return !!url && (url.startsWith('http://') || url.startsWith('https://'));
}

function normalizeUrl(url?: string) {
  if (!url) return '';
  return isHttpUrl(url) ? url : `https://${url}`;
}

function renderLinkCell(info: { getValue: () => any }) {
  const url = info.getValue() as string | undefined;
  if (!url) return null;
  const href = normalizeUrl(url);
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a href={href} target="_blank" rel="noopener noreferrer">
      Ver enlace
    </a>
  );
}

function formatDate(dateValue: any): string {
  if (!dateValue) return '';

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
}

function renderDateCell(info: { getValue: () => any }) {
  const dateValue = info.getValue();
  return formatDate(dateValue);
}

function renderNumericCell(info: { getValue: () => any }) {
  const value = info.getValue();

  // Si el valor es null, undefined o vacío, mostrar "-"
  if (value === null || value === undefined || value === '') {
    return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>-</span>;
  }

  const numValue = Number(value);

  // Si no es un número válido, mostrar el valor original
  if (isNaN(numValue)) {
    return <span style={{ color: '#ef4444' }}>{String(value)}</span>;
  }

  // Formatear el número con separadores de miles
  // La alineación a la derecha se maneja en TableBody.tsx
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {numValue.toLocaleString('es-ES')}
    </span>
  );
}

// ==================== HEATMAP CELL ====================
function getHeatmapColor(value: number, min: number, max: number, colorScale: string = 'red-yellow-green'): string {
  const normalized = (value - min) / (max - min);

  if (colorScale === 'red-yellow-green') {
    // Rojo (0) -> Amarillo (0.5) -> Verde (1)
    if (normalized < 0.5) {
      const r = 220;
      const g = Math.round(220 * (normalized * 2));
      return `rgb(${r}, ${g}, 50)`;
    } else {
      const r = Math.round(220 * (1 - (normalized - 0.5) * 2));
      const g = 220;
      return `rgb(${r}, ${g}, 50)`;
    }
  } else if (colorScale === 'blue-white-red') {
    // Azul (0) -> Blanco (0.5) -> Rojo (1)
    if (normalized < 0.5) {
      const intensity = Math.round(255 * (normalized * 2));
      return `rgb(${intensity}, ${intensity}, 255)`;
    } else {
      const intensity = Math.round(255 * (1 - (normalized - 0.5) * 2));
      return `rgb(255, ${intensity}, ${intensity})`;
    }
  } else {
    // purple-orange
    if (normalized < 0.5) {
      return `rgb(${Math.round(156 + 99 * (normalized * 2))}, ${Math.round(39 + 71 * (normalized * 2))}, ${Math.round(176 - 46 * (normalized * 2))})`;
    } else {
      return `rgb(${Math.round(255)}, ${Math.round(110 + 49 * ((normalized - 0.5) * 2))}, ${Math.round(130 - 130 * ((normalized - 0.5) * 2))})`;
    }
  }
}

function renderHeatmapCell(info: { getValue: () => any; column: any }) {
  const value = info.getValue();
  const numValue = Number(value);

  if (isNaN(numValue)) return <span>-</span>;

  const columnDef = info.column.columnDef as any;
  const min = columnDef.min || 0;
  const max = columnDef.max || 100;
  const colorScale = columnDef.colorScale || 'red-yellow-green';

  const bgColor = getHeatmapColor(numValue, min, max, colorScale);
  const textColor = (numValue - min) / (max - min) > 0.5 ? '#ffffff' : '#000000';

  return (
    <div style={{
      backgroundColor: bgColor,
      color: textColor,
      padding: '2px 6px',
      margin: '-2px -6px',
      fontWeight: 600,
      textAlign: 'center',
      borderRadius: '2px',
    }}>
      {numValue.toFixed(0)}
    </div>
  );
}

// ==================== PROGRESS BAR CELL ====================
function renderProgressCell(info: { getValue: () => any; column: any }) {
  const value = info.getValue();
  const numValue = Number(value);

  if (isNaN(numValue)) return <span>-</span>;

  const columnDef = info.column.columnDef as any;
  const min = columnDef.min || 0;
  const max = columnDef.max || 100;
  const percentage = Math.min(100, Math.max(0, ((numValue - min) / (max - min)) * 100));

  // Color based on percentage - SIN AZUL, MÁS ROJO EXTENDIDO
  // Rojo: 0-40% (extendido)
  // Amarillo: 41-70%
  // Verde: 71-100%
  let barColor = '#ef4444'; // red
  if (percentage >= 71) barColor = '#10b981'; // green
  else if (percentage >= 41) barColor = '#f59e0b'; // yellow/orange
  // else: rojo (0-40%)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
      <div style={{
        flex: 1,
        height: '12px',
        backgroundColor: '#e5e7eb',
        borderRadius: '6px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: barColor,
          transition: 'width 0.3s ease',
          borderRadius: '6px',
        }} />
      </div>
      <span style={{ fontSize: '10px', fontWeight: 600, minWidth: '35px', textAlign: 'right' }}>
        {percentage.toFixed(0)}%
      </span>
    </div>
  );
}

// ==================== SPARKLINE CELL - GRÁFICO DE BARRAS ====================
// Cambiado de línea a barras NO acumulativas (cada valor es independiente)
function renderSparklineCell(info: { getValue: () => any }) {
  const value = info.getValue();

  if (!Array.isArray(value) || value.length === 0) return <span>-</span>;

  const data = value.map((v: number) => Number(v)).filter((v: number) => !isNaN(v));
  if (data.length === 0) return <span>-</span>;

  const min = 0; // Empezar desde 0 para que las barras tengan sentido
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 20;
  const barWidth = (width / data.length) * 0.7; // 70% del espacio disponible por barra
  const spacing = (width / data.length) * 0.3; // 30% para espaciado

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {data.map((val: number, idx: number) => {
        const barHeight = ((val - min) / range) * height;
        const x = idx * (width / data.length) + spacing / 2;
        const y = height - barHeight;

        return (
          <rect
            key={idx}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill="#3b82f6"
            rx="1"
          />
        );
      })}
    </svg>
  );
}

// ==================== COUNTRY CELL ====================
const countryFlags: Record<string, any> = {
  'Argentina': AR,
  'Brasil': BR,
  'Chile': CL,
  'Colombia': CO,
  'México': MX,
  'España': ES,
  'Estados Unidos': US,
  'Alemania': DE,
  'Francia': FR,
  'Reino Unido': GB,
  'China': CN,
  'Japón': JP,
  'India': IN,
  'Canadá': CA,
  'Australia': AU,
};

function renderCountryCell(info: { getValue: () => any }) {
  const countryName = String(info.getValue() || '');
  const FlagComponent = countryFlags[countryName];

  if (!FlagComponent) {
    return <span>{countryName}</span>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <FlagComponent style={{ width: '18px', height: '12px', borderRadius: '2px' }} />
      <span>{countryName}</span>
    </div>
  );
}

// ==================== BADGE CELL ====================
// Sistema de generación automática de colores estilo Notion
// MEJORADO: Colores optimizados para modo claro Y oscuro con mejor contraste
export const NOTION_COLOR_PALETTE = [
  { bg: 'rgba(219, 237, 219, 0.4)', text: '#0b6e0b', darkBg: 'rgba(76, 175, 80, 0.25)', darkText: '#a5d6a7' },  // Verde
  { bg: 'rgba(221, 215, 255, 0.4)', text: '#6940a5', darkBg: 'rgba(149, 117, 205, 0.25)', darkText: '#b39ddb' },  // Púrpura
  { bg: 'rgba(253, 236, 200, 0.4)', text: '#b87503', darkBg: 'rgba(255, 193, 7, 0.25)', darkText: '#ffd54f' },  // Amarillo
  { bg: 'rgba(211, 229, 239, 0.4)', text: '#0b6e99', darkBg: 'rgba(33, 150, 243, 0.25)', darkText: '#90caf9' },  // Azul
  { bg: 'rgba(255, 226, 221, 0.4)', text: '#d44c47', darkBg: 'rgba(244, 67, 54, 0.25)', darkText: '#ef9a9a' },  // Rojo/Naranja
  { bg: 'rgba(245, 224, 233, 0.4)', text: '#ad1a72', darkBg: 'rgba(233, 30, 99, 0.25)', darkText: '#f48fb1' },  // Rosa
  { bg: 'rgba(232, 222, 238, 0.4)', text: '#6940a5', darkBg: 'rgba(156, 39, 176, 0.25)', darkText: '#ce93d8' },  // Violeta
  { bg: 'rgba(227, 226, 224, 0.5)', text: '#37352f', darkBg: 'rgba(158, 158, 158, 0.25)', darkText: '#bdbdbd' },  // Gris
];

// Función para generar un color basado en el hash del string
// EXPORTADA para usarla en CustomSelectDropdown
// MEJORADO: Ahora soporta modo oscuro
export function getColorFromString(str: string, isDarkMode: boolean = false): { bg: string; text: string } {
  if (!str) {
    const palette = NOTION_COLOR_PALETTE[7];
    return {
      bg: isDarkMode ? palette.darkBg : palette.bg,
      text: isDarkMode ? palette.darkText : palette.text,
    };
  }

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % NOTION_COLOR_PALETTE.length;
  const palette = NOTION_COLOR_PALETTE[index];

  return {
    bg: isDarkMode ? palette.darkBg : palette.bg,
    text: isDarkMode ? palette.darkText : palette.text,
  };
}

// Colores predefinidos (para mantener consistencia en valores comunes)
// EXPORTADO para usarla en CustomSelectDropdown
// MEJORADO: Ahora con soporte para modo oscuro
export const PREDEFINED_BADGE_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  'Activo': { bg: 'rgba(219, 237, 219, 0.4)', text: '#0b6e0b', darkBg: 'rgba(76, 175, 80, 0.25)', darkText: '#a5d6a7' },
  'Inactivo': { bg: 'rgba(255, 235, 230, 0.4)', text: '#d44c47', darkBg: 'rgba(244, 67, 54, 0.25)', darkText: '#ef9a9a' },
  'Pendiente': { bg: 'rgba(253, 236, 200, 0.4)', text: '#b87503', darkBg: 'rgba(255, 193, 7, 0.25)', darkText: '#ffd54f' },
  'Completado': { bg: 'rgba(211, 229, 239, 0.4)', text: '#0b6e99', darkBg: 'rgba(33, 150, 243, 0.25)', darkText: '#90caf9' },
  'En Proceso': { bg: 'rgba(221, 215, 255, 0.4)', text: '#6940a5', darkBg: 'rgba(149, 117, 205, 0.25)', darkText: '#b39ddb' },
  'Cancelado': { bg: 'rgba(255, 226, 221, 0.4)', text: '#d44c47', darkBg: 'rgba(244, 67, 54, 0.25)', darkText: '#ef9a9a' },
  'Alta': { bg: 'rgba(255, 226, 221, 0.4)', text: '#d44c47', darkBg: 'rgba(244, 67, 54, 0.25)', darkText: '#ef9a9a' },
  'Media': { bg: 'rgba(253, 236, 200, 0.4)', text: '#b87503', darkBg: 'rgba(255, 193, 7, 0.25)', darkText: '#ffd54f' },
  'Baja': { bg: 'rgba(219, 237, 219, 0.4)', text: '#0b6e0b', darkBg: 'rgba(76, 175, 80, 0.25)', darkText: '#a5d6a7' },
  'Crítico': { bg: 'rgba(212, 76, 71, 0.15)', text: '#d44c47', darkBg: 'rgba(244, 67, 54, 0.25)', darkText: '#ef9a9a' },
};

// Helper para obtener colores (con fallback a generación automática)
// MEJORADO: Ahora con soporte para modo oscuro
export function getBadgeColors(value: string, isDarkMode: boolean = false): { bg: string; text: string } {
  const predefined = PREDEFINED_BADGE_COLORS[value];

  if (predefined) {
    return {
      bg: isDarkMode ? predefined.darkBg : predefined.bg,
      text: isDarkMode ? predefined.darkText : predefined.text,
    };
  }

  return getColorFromString(value, isDarkMode);
}

function renderBadgeCell(info: { getValue: () => any; column: any }) {
  const rawValue = info.getValue();
  // Convertir a string, pero manejar correctamente null/undefined vs 0
  const value = rawValue !== null && rawValue !== undefined ? String(rawValue) : '';

  // Buscar el label correspondiente en las opciones si existen
  const columnDef = info.column.columnDef as any;
  const options = columnDef.options || [];
  const option = options.find((opt: SelectOption) => opt.value === value);
  const displayValue = option ? option.label : value;

  // Detectar modo oscuro desde el DOM
  const isDarkMode = typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  const colors = getBadgeColors(displayValue, isDarkMode);

  return (
    <span style={{
      backgroundColor: colors.bg,
      color: colors.text,
      padding: '3px 8px',
      borderRadius: '3px',
      fontSize: '11px',
      fontWeight: 500,
      display: 'inline-block',
      whiteSpace: 'nowrap',
      lineHeight: '1.2',
    }}>
      {displayValue}
    </span>
  );
}

// ==================== AVATAR CELL ====================
function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#6366f1'
  ];
  if (!name) return '#9ca3af';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function renderAvatarCell(info: { getValue: () => any }) {
  const name = String(info.getValue() || '');
  if (!name) {
    return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>-</span>;
  }
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 700,
      }}>
        {initials}
      </div>
      <span>{name}</span>
    </div>
  );
}

// ==================== FOREIGN KEY CELL ====================
// Muestra avatar + nombre pero es editable con select dinámico
function renderForeignKeyCell(info: { getValue: () => any }) {
  const name = String(info.getValue() || '');
  if (!name) {
    return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Sin asignar</span>;
  }
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 700,
      }}>
        {initials}
      </div>
      <span>{name}</span>
    </div>
  );
}

// ==================== CURRENCY CELL ====================
function renderCurrencyCell(info: { getValue: () => any; column: any }) {
  const value = info.getValue();
  const numValue = Number(value);

  if (value === null || value === undefined || value === '' || isNaN(numValue)) {
    return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>-</span>;
  }

  const columnDef = info.column.columnDef as any;
  const symbol = columnDef.currencySymbol || '$';
  const locale = columnDef.currencyLocale || 'es-ES';

  // Formatear con separadores de miles y decimales
  const formatted = numValue.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <span style={{
      fontVariantNumeric: 'tabular-nums',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2px',
    }}>
      <span style={{ fontWeight: 500 }}>{symbol}</span>
      <span>{formatted}</span>
    </span>
  );
}

// ==================== PERCENTAGE CELL ====================
function renderPercentageCell(info: { getValue: () => any }) {
  const value = info.getValue();
  const numValue = Number(value);

  if (value === null || value === undefined || value === '' || isNaN(numValue)) {
    return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>-</span>;
  }

  // Formatear con 2 decimales máximo
  const formatted = numValue.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <span style={{
      fontVariantNumeric: 'tabular-nums',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '2px',
    }}>
      <span>{formatted}</span>
      <span style={{ fontWeight: 500, fontSize: '11px' }}>%</span>
    </span>
  );
}

// ==================== RATING CELL ====================
function renderRatingCell(info: { getValue: () => any }) {
  const value = Number(info.getValue());

  if (isNaN(value)) return <span>-</span>;

  const rating = Math.min(5, Math.max(0, value));
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[...Array(5)].map((_, idx) => {
        if (idx < fullStars) {
          // Estrella completa
          return <span key={idx} style={{ color: '#f59e0b', fontSize: '14px' }}>★</span>;
        } else if (idx === fullStars && hasHalfStar) {
          // Media estrella usando gradiente CSS (compatible con mobile)
          return (
            <span
              key={idx}
              style={{
                position: 'relative',
                display: 'inline-block',
                fontSize: '14px',
                lineHeight: 1,
              }}
            >
              {/* Estrella vacía de fondo */}
              <span style={{ color: '#d1d5db' }}>★</span>
              {/* Estrella dorada con clip al 50% */}
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  color: '#f59e0b',
                  width: '50%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                ★
              </span>
            </span>
          );
        } else {
          // Estrella vacía
          return <span key={idx} style={{ color: '#d1d5db', fontSize: '14px' }}>★</span>;
        }
      })}
      <span style={{ fontSize: '10px', marginLeft: '4px', color: '#6b7280' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

/**
 * Genera columnas desde un objeto de definición.
 * Soporta todos los tipos avanzados: link, numeric, text, select, date, heatmap, progress, sparkline, country, badge, avatar, rating
 */
export function buildColumnsFromDefinition(fieldsDefinition: FieldsDefinition) {
  if (!fieldsDefinition || typeof fieldsDefinition !== 'object') return [];

  return Object.keys(fieldsDefinition).map((fieldKey) => {
    const def = fieldsDefinition[fieldKey];
    const type = def.type || 'text';

    let cellRenderer: any = undefined;

    // Mapeo de renderers por tipo
    switch (type) {
      case 'link':
        cellRenderer = renderLinkCell;
        break;
      case 'date':
        cellRenderer = renderDateCell;
        break;
      case 'numeric':
        cellRenderer = renderNumericCell;
        break;
      case 'currency':
        cellRenderer = renderCurrencyCell;
        break;
      case 'heatmap':
        cellRenderer = renderHeatmapCell;
        break;
      case 'progress':
        cellRenderer = renderProgressCell;
        break;
      case 'sparkline':
        cellRenderer = renderSparklineCell;
        break;
      case 'country':
        cellRenderer = renderCountryCell;
        break;
      case 'badge':
        cellRenderer = renderBadgeCell;
        break;
      case 'avatar':
        cellRenderer = renderAvatarCell;
        break;
      case 'rating':
        cellRenderer = renderRatingCell;
        break;
      case 'percentage':
        cellRenderer = renderPercentageCell;
        break;
      case 'foreignKey':
        cellRenderer = renderForeignKeyCell;
        break;
    }

    const isNumeric = type === 'numeric' || type === 'heatmap' || type === 'progress' || type === 'rating' || type === 'currency' || type === 'percentage';
    const isDate = type === 'date';

    // Detectar automáticamente la editabilidad y tipo de edición
    // IMPORTANTE: Si el usuario especifica explícitamente editable, respetarlo
    let editable = def.editable !== undefined ? def.editable : true;
    let editType: 'text' | 'numeric' | 'select' = 'text';

    // Campos NO editables por defecto (solo si no se especificó explícitamente)
    // NOTA: 'avatar' ya NO está en esta lista - es editable como texto
    if (def.editable === undefined && (type === 'link' || type === 'sparkline')) {
      editable = false;
    }

    // foreignKey es SIEMPRE editable con select
    if (type === 'foreignKey') {
      editable = true;
      editType = 'select';
    } else if (def.options && def.options.length > 0) {
      // Si tiene opciones estáticas, es un select
      editType = 'select';
    } else if (def.useDynamicOptions === true) {
      // Si tiene opciones dinámicas, también es un select
      editType = 'select';
    } else if (type === 'numeric' || type === 'heatmap' || type === 'progress' || type === 'rating') {
      // Tipos numéricos
      editType = 'numeric';
    } else {
      // Por defecto, texto
      editType = 'text';
    }

    return {
      accessorKey: fieldKey,
      header: def.header || fieldKey.toUpperCase(),
      width: def.width || 100,
      isNumeric,
      isDate,
      cell: cellRenderer,
      options: def.options || [],
      min: def.min,
      max: def.max,
      colorScale: def.colorScale,
      editable,
      editType,
      type,  // ← IMPORTANTE: Pasar el tipo de columna para el dropdown personalizado
      textAlign: def.textAlign,  // ← Alineación del texto
      allowCreate: def.allowCreate,  // ← Permite crear nuevas opciones
      currencySymbol: def.currencySymbol,  // ← Símbolo de moneda
      currencyLocale: def.currencyLocale,  // ← Locale para formato
      useDynamicOptions: def.useDynamicOptions,  // ← NUEVO: Opciones dinámicas
      dataset: def.dataset,  // ← NUEVO: Dataset
      onCreateOption: def.onCreateOption,  // ← NUEVO: Callback crear
      foreignKeyField: def.foreignKeyField,  // ← NUEVO: Campo ID (responsable_id)
      displayField: def.displayField,  // ← NUEVO: Campo nombre (responsable_nombre)
    };
  });
}
