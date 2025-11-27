# CustomTable - Documentación Completa

## Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Configuración](#configuración)
4. [Componentes Principales](#componentes-principales)
5. [Hooks](#hooks)
6. [Flujo de Datos](#flujo-de-datos)
7. [Guía de Modificación](#guía-de-modificación)
8. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Descripción General

CustomTable es un componente de tabla avanzado y personalizable construido con React y TanStack Table (anteriormente React Table). Proporciona funcionalidades como:

- ✅ Filtrado por columna y global
- ✅ Ordenamiento
- ✅ Paginación
- ✅ Redimensionamiento de columnas
- ✅ Selección de celdas
- ✅ Edición en línea
- ✅ Exportación a Excel
- ✅ Diseño responsive
- ✅ Tema personalizado (Synara brand)

---

## Estructura de Archivos

```
components/CustomTable/
├── config.ts                          # ⚙️ CONFIGURACIÓN CENTRALIZADA (EMPEZAR AQUÍ)
├── README.md                          # 📖 Esta documentación
├── index.tsx                          # 🎯 Punto de entrada principal del componente
│
├── hooks/                             # Custom hooks para lógica de la tabla
│   ├── useCustomTableLogic.ts         # Hook principal que orquesta toda la lógica
│   ├── useReactTableInstance.ts       # Configuración de TanStack Table
│   ├── useDebouncedValue.ts           # Debounce para filtros
│   ├── filterFlow.ts                  # Lógica de filtrado y ordenamiento
│   ├── IndexColumn.ts                 # Definición de columna de índice
│   └── useThemeMode.ts                # Manejo de tema claro/oscuro
│
├── TableView/                         # Componente de vista de tabla
│   ├── index.tsx                      # Componente principal de la vista
│   ├── hooks/
│   │   ├── useColumnResize.ts         # Lógica de redimensionamiento
│   │   ├── useCellSelection.ts        # Selección de celdas
│   │   ├── useInlineCellEdit.ts       # Edición en línea
│   │   ├── useClipboardCopy.ts        # Copiar/pegar
│   │   └── useTableViewContextMenu.ts # Menú contextual
│   ├── subcomponents/
│   │   ├── TableHeader.tsx            # Encabezado de columnas
│   │   ├── TableBody.tsx              # Cuerpo de la tabla (filas y celdas)
│   │   ├── Pagination.tsx             # Controles de paginación
│   │   ├── LoadingOverlay.tsx         # Overlay de carga
│   │   ├── NoResultsOverlay.tsx       # Mensaje cuando no hay datos
│   │   └── ColumnFilterPopover.tsx    # Popup de filtros por columna
│   ├── logic/                         # Utilidades de lógica
│   │   ├── selectionLogic.ts          # Lógica de selección
│   │   ├── dragLogic.ts               # Lógica de arrastre
│   │   └── domUtils.ts                # Utilidades del DOM
│   └── utils/
│       └── getSafeDisplayValue.ts     # Formateo seguro de valores
│
├── toolbar/                           # Barra de herramientas y filtros
│   ├── FiltersToolbar.tsx             # Barra principal de filtros
│   └── components/
│       ├── AdvancedFiltersModal.tsx   # Modal de filtros avanzados
│       ├── FilterAutocomplete.tsx     # Autocompletado de filtros
│       ├── FilterSocialNetworks.tsx   # Filtros de redes sociales
│       ├── IconFilterDropdown.tsx     # Dropdown de iconos
│       ├── ToggleFilterButtons.tsx    # Botones de toggle
│       └── ApplyResetGroup.tsx        # Botones aplicar/resetear
│
├── theme/
│   └── colors.ts                      # Definición de colores del tema
│
├── repositories/                      # Capa de datos
│   ├── LocalTableDataRepository.ts    # Repositorio de datos local
│   └── RemoteCellUpdateRepository.ts  # Actualización remota de celdas
│
├── services/
│   └── CellDataService.ts             # Servicio de datos de celda
│
├── ColumnConfiguration.tsx            # Configuración de columnas (UI)
├── CustomTableColumnsConfig.tsx       # Configuración de definición de columnas
└── FieldsDefinition.ts                # Definiciones de campos (ejemplo)
```

---

## Configuración

### 📝 Archivo Central: `config.ts`

**IMPORTANTE:** Este es el archivo más importante para modificar comportamientos globales. Todos los valores configurables están centralizados aquí.

#### Configuración de Columnas
```typescript
COLUMN_CONFIG = {
  MIN_WIDTH: 20,              // Ancho mínimo de columnas
  DEFAULT_WIDTH: 30,          // Ancho por defecto
  INDEX_COLUMN_WIDTH: 32,     // Ancho de columna de índice
  INDEX_COLUMN_MIN_WIDTH: 32, // Mínimo de columna de índice
}
```

#### Configuración de Estilos
```typescript
STYLES_CONFIG = {
  header: {
    padding: '4px 6px',       // Padding del header
    gap: '2px',               // Espacio entre elementos
    fontSize: '10px',         // Tamaño de fuente
    letterSpacing: '0.02em',  // Espaciado
  },
  cell: {
    padding: '6px 8px',       // Padding de celdas
    fontSize: '12px',         // Tamaño de fuente
  },
  resizeHandle: {
    width: '6px',             // Ancho del handle de resize
    rightOffset: '-3px',      // Offset desde el borde
  },
}
```

#### Configuración de Tabla
```typescript
TABLE_CONFIG = {
  DEFAULT_ROW_HEIGHT: 40,       // Altura de filas
  DEFAULT_PAGE_SIZE: 50,        // Filas por página
  FILTER_DEBOUNCE_TIME: 500,    // Tiempo de debounce (ms)
}
```

#### Configuración de Exportación
```typescript
EXPORT_CONFIG = {
  defaultFileName: 'tabla_exportada.xlsx',
  sheetName: 'Datos',
}
```

---

## Componentes Principales

### 1. `index.tsx` - Componente Principal

**Ubicación:** `components/CustomTable/index.tsx`

**Propósito:** Punto de entrada que recibe props y renderiza la tabla completa.

**Props principales:**
```typescript
interface CustomTableProps {
  data: any[];                    // Datos a mostrar
  columnsDef: SimpleColumnDef[];  // Definición de columnas
  pageSize?: number;              // Tamaño de página
  loading?: boolean;              // Estado de carga
  showFiltersToolbar?: boolean;   // Mostrar barra de filtros
  containerHeight?: string;       // Altura del contenedor
  rowHeight?: number;             // Altura de cada fila
  loadingText?: string;           // Texto de carga
  noResultsText?: string;         // Texto sin resultados
}
```

**Ejemplo de columna:**
```typescript
{
  accessorKey: 'nombre',
  header: 'NOMBRE',
  width: 30,
  isNumeric: false,
  enableResizing: true,
  cell: ({ row }) => row.original.nombre,
}
```

---

### 2. `TableView/index.tsx` - Vista de Tabla

**Propósito:** Renderiza la tabla HTML con todas las funcionalidades.

**Responsabilidades:**
- Renderizar `<table>` con colgroup para anchos de columnas
- Manejar eventos de selección y edición
- Gestionar el scroll virtual
- Aplicar estilos del tema

**Secciones clave:**
- **colgroup:** Define anchos de columnas dinámicamente
- **TableHeader:** Renderiza encabezados
- **TableBody:** Renderiza filas y celdas
- **Pagination:** Controles de navegación

---

### 3. `TableHeader.tsx` - Encabezado

**Ubicación:** `components/CustomTable/TableView/subcomponents/TableHeader.tsx`

**Propósito:** Renderizar los encabezados de columnas con capacidad de ordenamiento y filtrado.

**Características:**
- Iconos de filtro por columna
- Manejadores de resize (manija derecha)
- Estilos brand Synara
- Tooltip con nombre completo de columna

**Estilos críticos:**
```css
th.custom-th {
  white-space: normal;          /* Permite wrap del texto */
  overflow: hidden;
  text-overflow: ellipsis;
}
```

---

### 4. `TableBody.tsx` - Cuerpo de Tabla

**Ubicación:** `components/CustomTable/TableView/subcomponents/TableBody.tsx`

**Propósito:** Renderizar todas las filas y celdas de datos.

**Características:**
- Selección de celdas
- Edición en línea (doble click)
- Estilos de hover
- Clases para celdas seleccionadas/copiadas

---

## Hooks

### `useCustomTableLogic.ts` - Hook Principal

**Propósito:** Orquesta toda la lógica de la tabla.

**Retorna:**
```typescript
{
  table,                  // Instancia de TanStack Table
  columnFilters,          // Estado de filtros por columna
  setColumnFilters,       // Setter de filtros
  tempGlobalFilter,       // Filtro global temporal
  setTempGlobalFilter,    // Setter de filtro global
  sorting,                // Estado de ordenamiento
  toggleSort,             // Función para cambiar orden
  handleDownloadExcel,    // Función para exportar
  columnWidths,           // Anchos actuales de columnas
  handleSetColumnWidth,   // Función para cambiar ancho
  finalColumns,           // Columnas procesadas
  filteredData,           // Datos filtrados
}
```

**Flujo de procesamiento:**
1. Procesa columnsDef y crea columnas indexadas
2. Aplica filtros por columna
3. Aplica filtro global (debounced)
4. Aplica ordenamiento
5. Crea instancia de TanStack Table con paginación

---

### `useColumnResize.ts` - Redimensionamiento

**Propósito:** Manejar el arrastre de columnas para cambiar su ancho.

**Lógica:**
1. `handleMouseDownResize`: Inicia el resize
2. `handleMouseMoveResize`: Calcula nuevo ancho mientras se arrastra
3. `handleMouseUpResize`: Finaliza el resize

**Restricciones:**
- Ancho mínimo: `COLUMN_CONFIG.MIN_WIDTH` (20px)
- Sin ancho máximo

---

## Flujo de Datos

### 1. Inicialización
```
Usuario pasa data + columnsDef
    ↓
useCustomTableLogic procesa
    ↓
Crea instancia de TanStack Table
    ↓
TableView renderiza
```

### 2. Filtrado
```
Usuario escribe en filtro
    ↓
setTempGlobalFilter actualiza estado
    ↓
useDebouncedValue espera 500ms
    ↓
FilterFlow aplica filtros
    ↓
filteredData se actualiza
    ↓
Tabla se re-renderiza
```

### 3. Redimensionamiento
```
Usuario arrastra handle de resize
    ↓
useColumnResize detecta movimiento
    ↓
Calcula nuevo ancho (min: 20px)
    ↓
setColumnWidth actualiza estado
    ↓
colgroup aplica nuevo ancho
    ↓
Columna se redimensiona
```

---

## Guía de Modificación

### ❓ ¿Cómo cambiar el ancho mínimo de las columnas?

**Archivo:** `config.ts`
```typescript
COLUMN_CONFIG = {
  MIN_WIDTH: 15,  // Cambiar de 20 a 15
}
```

### ❓ ¿Cómo cambiar el padding del header?

**Archivo:** `config.ts`
```typescript
STYLES_CONFIG = {
  header: {
    padding: '6px 8px',  // Aumentar padding
  }
}
```

Luego aplicar en `TableHeader.tsx`:
```typescript
import { STYLES_CONFIG } from '../../config';

// En el style jsx:
.column-header-content {
  padding: ${STYLES_CONFIG.header.padding};
}
```

### ❓ ¿Cómo cambiar el tiempo de debounce de filtros?

**Archivo:** `config.ts`
```typescript
TABLE_CONFIG = {
  FILTER_DEBOUNCE_TIME: 300,  // Más rápido
}
```

### ❓ ¿Cómo cambiar el tamaño de fuente de las celdas?

**Archivo:** `config.ts`
```typescript
STYLES_CONFIG = {
  cell: {
    fontSize: '14px',  // Más grande
  }
}
```

Luego aplicar en `TableBody.tsx` (si es necesario importar y usar).

### ❓ ¿Cómo añadir una nueva columna personalizada?

**Archivo:** Tu componente (ej. `hero.tsx`)
```typescript
const columnsDef = [
  ...columnas existentes,
  {
    accessorKey: 'miCampo',
    header: 'MI CAMPO',
    width: 100,
    cell: ({ row }) => (
      <div>Contenido personalizado: {row.original.miCampo}</div>
    ),
  },
]
```

### ❓ ¿Cómo cambiar el color primario de la tabla?

**Archivo:** `config.ts`
```typescript
COLORS_CONFIG = {
  primary: 'rgb(255, 0, 0)',  // Rojo
}
```

---

## Ejemplos de Uso

### Ejemplo Básico

```typescript
import CustomTable from '@/components/CustomTable';

const data = [
  { id: 1, nombre: 'Juan', edad: 25 },
  { id: 2, nombre: 'María', edad: 30 },
];

const columnsDef = [
  { accessorKey: 'nombre', header: 'NOMBRE', width: 30 },
  { accessorKey: 'edad', header: 'EDAD', width: 30, isNumeric: true },
];

<CustomTable
  data={data}
  columnsDef={columnsDef}
  pageSize={10}
  showFiltersToolbar={true}
/>
```

### Ejemplo con Celda Personalizada

```typescript
const columnsDef = [
  {
    accessorKey: 'rating',
    header: 'RATING',
    width: 60,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400" />
        <span>{row.original.rating.toFixed(1)}</span>
      </div>
    ),
  },
];
```

### Ejemplo con Links

```typescript
const columnsDef = [
  {
    accessorKey: 'web',
    header: 'WEB',
    width: 80,
    cell: ({ row }) => (
      <a href={row.original.web} target="_blank">
        🌐 Visitar
      </a>
    ),
  },
];
```

---

## Troubleshooting

### ❌ Las columnas no se redimensionan

**Solución:** Verifica que `enableResizing: true` esté en columnsDef y que `useColumnResize` esté conectado.

### ❌ Los filtros no funcionan

**Solución:** Asegúrate de que `showFiltersToolbar={true}` y que los datos tengan las keys correctas.

### ❌ Las columnas son muy anchas

**Solución:** Modifica `config.ts` → `COLUMN_CONFIG.DEFAULT_WIDTH` y `COLUMN_CONFIG.MIN_WIDTH`.

### ❌ El texto del header no se ve completo

**Solución:** Aumenta el ancho de la columna o ajusta el `fontSize` en `config.ts`.

---

## Licencia

MIT License

---

## Changelog

### v2.0.0 (2025)
- ✨ Configuración centralizada en `config.ts`
- ✨ Soporte para columnas ultra compactas (30px)
- ✨ Redimensionamiento mejorado sin mínimos restrictivos
- ✨ Estilos optimizados para brand Synara
- 📖 Documentación completa en README.md

---

**Creado con ❤️ para Synara**
