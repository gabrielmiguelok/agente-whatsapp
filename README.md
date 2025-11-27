# Tableros - CustomTable

> **Componente de tabla avanzado y personalizable para React y Next.js**

Un componente de tabla potente con soporte completo para **tema claro/oscuro**, **edición en línea**, **13 tipos de columnas**, **filtros avanzados**, **exportación a Excel** y **creación dinámica de badges estilo Notion**.

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat&logo=react)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TanStack Table](https://img.shields.io/badge/TanStack_Table-v8-ff4154?style=flat)](https://tanstack.com/table)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![CustomTable Demo](https://via.placeholder.com/1200x630/127CF3/FFFFFF?text=CustomTable+Demo)

---

## 📚 Tabla de Contenidos

- [Características](#-características)
- [Demo en Vivo](#-demo-en-vivo)
- [Instalación](#-instalación)
- [Inicio Rápido](#-inicio-rápido)
- [Tipos de Columnas](#-tipos-de-columnas)
- [Configuración de Columnas](#️-configuración-de-columnas)
- [Tema Claro/Oscuro](#-tema-clarooscuro)
- [Edición en Línea](#️-edición-en-línea)
- [Creación Dinámica de Badges](#-creación-dinámica-de-badges-estilo-notion)
- [Propiedades del Componente](#️-propiedades-del-componente)
- [Ejemplos Avanzados](#-ejemplos-avanzados)
- [Características Avanzadas](#-características-avanzadas)
- [Stack Tecnológico](#-stack-tecnológico)
- [Desarrollo](#-desarrollo)
- [Licencia](#-licencia)
- [Contribuciones](#-contribuciones)

---

## ✨ Características

### 🎨 **Interfaz y Experiencia de Usuario**
- 🌓 **Tema Claro/Oscuro**: Cambio automático con detección del sistema operativo
- 🎯 **Botón de Cambio de Tema**: Toggle visible en la interfaz para cambiar entre modos
- 📱 **Responsive**: Se adapta perfectamente a móviles, tablets y desktop
- ⚡ **Redimensionamiento de Columnas**: Arrastra los bordes para ajustar anchos
- 🎯 **Alineación Personalizable**: Control total sobre `left`, `center`, `right` en cada columna

### ✏️ **Edición y Manipulación de Datos**
- ✏️ **Edición en Línea**: Edita celdas directamente con doble clic
- 🔍 **Búsqueda Global**: Filtra todo el contenido de la tabla instantáneamente
- 🎯 **Filtros por Columna**: Click en encabezados para filtros específicos
- 🔄 **Ordenamiento**: Click en encabezados para ordenar ascendente/descendente
- 📦 **Export a Excel**: Exporta tus datos con un solo clic
- ⌨️ **Navegación por Teclado**: Enter, Escape, Flechas para navegar entre celdas

### 📊 **Tipos de Columnas y Visualizaciones**
- **13 tipos de columnas diferentes**: texto, numérico, fecha, moneda, badges, avatares, países, rating, progreso, heatmap, sparkline, links, select
- 🎨 **Badges con Colores Automáticos**: Sistema hash-based estilo Notion con 8 colores suaves
- 💰 **Formato de Moneda**: Con separadores de miles y símbolos personalizables (`$ 15.000,00`)
- 🌍 **Banderas de Países**: 15 países con banderas renderizadas
- 📈 **Visualizaciones Avanzadas**: Barras de progreso, mapas de calor, gráficos sparkline, estrellas de rating
- 👤 **Avatares**: Generación automática de iniciales con colores únicos

### ✨ **Creación Dinámica (Estilo Notion)**
- ✨ **Botón "Crear nuevo" siempre visible**: Para columnas badge con `allowCreate: true`
- 🔍 **Búsqueda en tiempo real**: Filtra opciones existentes mientras escribes
- 🎨 **Vista previa del color**: Muestra el color que tendrá el badge antes de crearlo
- 🚀 **Sin configuración extra**: Los colores se generan automáticamente
- ⌨️ **Navegación por teclado**: Flechas, Enter, Escape para interactuar
- 🔒 **Principios SOLID**: Arquitectura robusta con responsabilidad única

---

## 🌐 Demo en Vivo

Visita **[tableros.dev](https://tableros.dev)** para ver el componente en acción.

---

## 🚀 Instalación

### Requisitos

- Node.js 18+
- React 19+
- Next.js 15+

### Instalar Dependencias

```bash
# Con npm
npm install

# Con pnpm (recomendado)
pnpm install

# Con yarn
yarn install
```

### Dependencias Principales

```json
{
  "react": "^19.0.0",
  "next": "^15.2.4",
  "@tanstack/react-table": "^8.x",
  "next-themes": "^0.x",
  "xlsx": "^0.x",
  "country-flag-icons": "^1.x"
}
```

---

## 🏁 Inicio Rápido

### 1. Importa el componente

```tsx
import CustomTable from '@/CustomTable';
import { buildColumnsFromDefinition } from '@/CustomTable/CustomTableColumnsConfig';
```

### 2. Define tus columnas

```tsx
const columns = buildColumnsFromDefinition({
  nombre: {
    type: 'text',
    header: 'NOMBRE',
    width: 200
  },
  edad: {
    type: 'numeric',
    header: 'EDAD',
    width: 100,
    textAlign: 'right'
  },
  email: {
    type: 'text',
    header: 'EMAIL',
    width: 250
  }
});
```

### 3. Define tus datos

```tsx
const data = [
  { id: 1, nombre: 'Ana García', edad: 28, email: 'ana@example.com' },
  { id: 2, nombre: 'Carlos López', edad: 35, email: 'carlos@example.com' },
  { id: 3, nombre: 'María Silva', edad: 42, email: 'maria@example.com' },
];
```

### 4. Renderiza el componente

```tsx
export default function MiTabla() {
  return (
    <div style={{ height: '600px' }}>
      <CustomTable
        data={data}
        columnsDef={columns}
        pageSize={50}
        showFiltersToolbar={true}
      />
    </div>
  );
}
```

---

## 🎨 Tipos de Columnas

CustomTable soporta **13 tipos de columnas diferentes**:

| Tipo | Descripción | Icono |
|------|-------------|-------|
| `text` | Texto simple sin formato | 📝 |
| `numeric` | Números con separadores de miles | 🔢 |
| `currency` | Moneda con símbolo y formato localizado | 💰 |
| `date` | Fechas formateadas (DD/MM/YYYY) | 📅 |
| `badge` | Etiquetas coloridas con creación dinámica | 🏷️ |
| `avatar` | Avatares circulares con iniciales | 👤 |
| `country` | Banderas de países con nombre | 🇦🇷 |
| `rating` | Estrellas de calificación | ⭐ |
| `progress` | Barra de progreso visual | 📊 |
| `heatmap` | Celda con color según valor | 🌡️ |
| `sparkline` | Mini gráfico de tendencia | 📈 |
| `link` | Enlaces clicables | 🔗 |
| `select` | Dropdown con opciones | ⬇️ |

---

### 1. `text` - Texto Simple

Texto básico sin formato especial.

```tsx
nombre: {
  type: 'text',
  header: 'NOMBRE',
  width: 200
}
```

---

### 2. `numeric` - Números

Números con separadores de miles automáticos.

```tsx
edad: {
  type: 'numeric',
  header: 'EDAD',
  width: 80,
  textAlign: 'right'  // Alineación típica para números
}
```

**Ejemplo visual**: `1.234.567`

---

### 3. `currency` - Moneda 💰

Formato de moneda con símbolo y separadores localizados.

```tsx
precio: {
  type: 'currency',
  header: 'PRECIO',
  width: 140,
  textAlign: 'center',       // center, left o right
  currencySymbol: '$',        // Símbolo de moneda (default: '$')
  currencyLocale: 'es-ES'     // Locale para formato (default: 'es-ES')
}
```

**Resultado visual**: `$ 15.000,00` (formato español)

**Otros locales**:
- `en-US`: `$15,000.00` (formato estadounidense)
- `de-DE`: `15.000,00 €` (formato alemán)
- `pt-BR`: `R$ 15.000,00` (formato brasileño)

---

### 4. `date` - Fechas

Fechas formateadas como DD/MM/YYYY.

```tsx
fecha_ingreso: {
  type: 'date',
  header: 'FECHA INGRESO',
  width: 140
}
```

**Formato de entrada**: `'2024-01-15'` → **Salida**: `15/01/2024`

---

### 5. `badge` - Etiquetas con Color 🏷️

Badges coloridos con generación automática de colores estilo Notion.

```tsx
departamento: {
  type: 'badge',
  header: 'DEPARTAMENTO',
  width: 140,
  allowCreate: true,  // ⭐ Permite crear nuevas opciones al escribir
  options: [
    { value: 'Ingeniería', label: 'Ingeniería' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Ventas', label: 'Ventas' },
    { value: 'RRHH', label: 'RRHH' },
    { value: 'Finanzas', label: 'Finanzas' },
  ]
}
```

**Características:**
- ✅ **Colores automáticos** para valores no definidos (basados en hash del string)
- ✅ **Búsqueda en tiempo real** con input de filtrado
- ✅ **Creación dinámica**: `allowCreate: true` permite escribir y crear nuevos valores
- ✅ **Botón "✨ Crear nuevo" siempre visible**: Hardcodeado para aparecer siempre primero
- ✅ **Interfaz estilo Notion** con vista previa del color al crear
- ✅ **Paleta de 8 colores** suaves estilo Notion (verde, púrpura, amarillo, azul, rojo, rosa, violeta, gris)
- ✅ **Fuente única de verdad**: Colores centralizados y consistentes en toda la aplicación

---

### 6. `avatar` - Avatares con Iniciales

Avatares circulares con iniciales generadas automáticamente y color único por nombre.

```tsx
nombre: {
  type: 'avatar',
  header: 'NOMBRE',
  width: 180
}
```

**Ejemplo**: `"Ana García"` → Avatar circular con `AG` y color único

---

### 7. `country` - Países con Banderas 🇦🇷

Banderas de países con nombre.

```tsx
pais: {
  type: 'country',
  header: 'PAÍS',
  width: 140,
  options: [
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Brasil', label: 'Brasil' },
    { value: 'Chile', label: 'Chile' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'México', label: 'México' },
    { value: 'España', label: 'España' },
    { value: 'Estados Unidos', label: 'Estados Unidos' },
    // ... más países
  ]
}
```

**Países soportados** (15 total):
Argentina, Brasil, Chile, Colombia, México, España, Estados Unidos, Alemania, Francia, Reino Unido, China, Japón, India, Canadá, Australia.

---

### 8. `rating` - Estrellas de Calificación ⭐

Estrellas visuales para calificaciones.

```tsx
rating: {
  type: 'rating',
  header: 'CALIFICACIÓN',
  width: 140,
  min: 0,
  max: 5
}
```

**Ejemplo visual**: ⭐⭐⭐⭐☆ (4 de 5 estrellas)

---

### 9. `progress` - Barra de Progreso

Barra de progreso visual con porcentaje.

```tsx
completado: {
  type: 'progress',
  header: 'COMPLETADO',
  width: 150,
  min: 0,
  max: 100
}
```

**Ejemplo visual**: `█████████░░ 85%`

---

### 10. `heatmap` - Mapa de Calor

Celda con color de fondo según el valor.

```tsx
rendimiento: {
  type: 'heatmap',
  header: 'RENDIMIENTO',
  width: 130,
  min: 0,
  max: 100,
  colorScale: 'red-yellow-green'  // o 'blue-white-red', 'purple-orange'
}
```

**Escalas de color disponibles**:
- `red-yellow-green`: 🔴 → 🟡 → 🟢 (ideal para rendimiento/calidad)
- `blue-white-red`: 🔵 → ⚪ → 🔴 (ideal para variaciones positivas/negativas)
- `purple-orange`: 🟣 → 🟠 (ideal para categorías alternativas)

---

### 11. `sparkline` - Gráfico de Línea Mini

Mini gráfico de tendencia dentro de la celda.

```tsx
tendencia: {
  type: 'sparkline',
  header: 'TENDENCIA 7D',
  width: 100
}
```

**Formato de datos**: Array de números
```tsx
const data = [
  { id: 1, tendencia: [65, 68, 72, 75, 78, 82, 87] },
  { id: 2, tendencia: [90, 88, 85, 83, 80, 78, 75] },
];
```

---

### 12. `link` - Enlaces

Enlaces clicables que abren en nueva pestaña.

```tsx
url: {
  type: 'link',
  header: 'SITIO WEB',
  width: 180
}
```

---

### 13. `select` - Campo de Selección

Dropdown con opciones predefinidas (sin creación dinámica).

```tsx
estado: {
  type: 'select',
  header: 'ESTADO',
  width: 120,
  options: [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'pendiente', label: 'Pendiente' }
  ]
}
```

---

## ⚙️ Configuración de Columnas

### Propiedades Disponibles

Cada columna puede tener las siguientes propiedades:

```tsx
type FieldDef = {
  // ========== BÁSICAS ==========
  type?: FieldType;          // Tipo de columna (13 opciones)
  header?: string;           // Texto del encabezado
  width?: number;            // Ancho en pixels

  // ========== OPCIONES (select, badge, country) ==========
  options?: SelectOption[];  // Array de { value, label }
  allowCreate?: boolean;     // ⭐ Permite crear nuevas opciones (solo badge)

  // ========== RANGOS (numeric, heatmap, progress, rating) ==========
  min?: number;              // Valor mínimo
  max?: number;              // Valor máximo

  // ========== VISUALIZACIÓN ==========
  colorScale?: 'red-yellow-green' | 'blue-white-red' | 'purple-orange';  // Escala de color para heatmap
  textAlign?: 'left' | 'center' | 'right';  // ⭐ Alineación del texto

  // ========== MONEDA (currency) ==========
  currencySymbol?: string;   // ⭐ Símbolo de moneda (default: '$')
  currencyLocale?: string;   // ⭐ Locale para formato (default: 'es-ES')

  // ========== EDICIÓN ==========
  editable?: boolean;        // Si la columna es editable (detectado automáticamente)
  editType?: 'text' | 'numeric' | 'select';  // Tipo de editor
}
```

---

### Ejemplos de Configuración Avanzada

#### Precio con Formato de Moneda Centrado

```tsx
precio: {
  type: 'currency',
  header: 'PRECIO',
  width: 140,
  textAlign: 'center',        // Centrado horizontalmente
  currencySymbol: '$',
  currencyLocale: 'es-ES'     // Formato: 1.234,56
}
```

#### Badge con Creación Dinámica de Opciones

```tsx
categoria: {
  type: 'badge',
  header: 'CATEGORÍA',
  width: 150,
  allowCreate: true,          // ⭐ Permite escribir nuevas categorías
  options: [
    { value: 'Electrónica', label: 'Electrónica' },
    { value: 'Ropa', label: 'Ropa' },
    { value: 'Hogar', label: 'Hogar' },
    { value: 'Deportes', label: 'Deportes' }
  ]
}
```

**Al hacer doble clic:**
1. Se abre dropdown con input de búsqueda
2. **Botón "✨ Crear nuevo" siempre visible como primer elemento**
3. Al escribir, se filtra la lista y se muestra preview del color
4. Enter o click para crear y guardar con color automático

#### Número Alineado a la Derecha

```tsx
cantidad: {
  type: 'numeric',
  header: 'CANTIDAD',
  width: 100,
  textAlign: 'right'          // Alineación típica para números
}
```

---

## 🌓 Tema Claro/Oscuro

CustomTable tiene soporte completo para temas con `next-themes`.

### Configuración Automática

El layout ya incluye el ThemeProvider:

```tsx
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Botón de Cambio de Tema

Usa el componente `ThemeToggle` incluido:

```tsx
import { ThemeToggle } from '@/components/theme-toggle';

export default function MyPage() {
  return (
    <div>
      <ThemeToggle />  {/* Botón sol/luna para cambiar tema */}
      <CustomTable data={data} columnsDef={columns} />
    </div>
  );
}
```

**Características del tema:**
- ✅ Detección automática del tema del sistema operativo
- ✅ Persistencia en localStorage
- ✅ Sin flicker al cargar la página (suppressHydrationWarning)
- ✅ Transiciones suaves entre temas
- ✅ Sincronización en todos los componentes

---

## ✏️ Edición en Línea

### Modo Básico (Edición Interna)

Por defecto, CustomTable maneja la edición internamente:

```tsx
<CustomTable
  data={data}
  columnsDef={columns}
/>
```

**Cómo editar:**
1. Haz **doble clic** en cualquier celda editable
2. Escribe o selecciona el nuevo valor
3. Presiona **Enter** para guardar o **Escape** para cancelar
4. El valor se actualiza automáticamente en el estado interno

---

### Modo Personalizado con Handler

Para control total sobre la edición (ej: guardar en backend):

```tsx
const [tableData, setTableData] = useState(initialData);

const handleCellEdit = (rowId: string, colId: string, newValue: string) => {
  // 1. Actualizar estado local (optimistic update)
  setTableData(current =>
    current.map(row =>
      String(row.id) === String(rowId)
        ? { ...row, [colId]: newValue }
        : row
    )
  );

  // 2. Opcional: Guardar en backend
  fetch(`/api/update/${rowId}`, {
    method: 'PATCH',
    body: JSON.stringify({ [colId]: newValue })
  })
    .then(response => response.json())
    .then(data => console.log('Guardado exitoso:', data))
    .catch(error => console.error('Error al guardar:', error));
};

<CustomTable
  data={tableData}
  columnsDef={columns}
  onCellEdit={handleCellEdit}  // ← Handler personalizado
/>
```

---

### Navegación con Teclado

| Tecla | Acción |
|-------|--------|
| **Doble Click** | Inicia edición en la celda |
| **Enter** | Guarda y navega a la siguiente fila (misma columna) |
| **Shift + Enter** | Guarda sin mover el foco |
| **Escape** | Cancela la edición y restaura el valor original |
| **Tab** | Guarda y navega a la siguiente celda (misma fila) |
| **Shift + Tab** | Guarda y navega a la celda anterior (misma fila) |
| **Flechas ↑↓←→** | Navega entre celdas (solo cuando no está editando) |

---

## ✨ Creación Dinámica de Badges (Estilo Notion)

### ¿Cómo funciona?

Con `allowCreate: true` en columnas de tipo `badge`:

```tsx
departamento: {
  type: 'badge',
  header: 'DEPARTAMENTO',
  width: 140,
  allowCreate: true,  // ← Habilita creación dinámica
  options: [
    { value: 'Ingeniería', label: 'Ingeniería' },
    { value: 'Marketing', label: 'Marketing' },
  ]
}
```

### Flujo de Creación

1. **Doble click** en la celda badge
2. Se abre dropdown con:
   - **Input de búsqueda** (placeholder: "Buscar o crear...")
   - **Botón "✨ Crear nuevo" siempre visible** (primer elemento)
   - Lista de opciones existentes filtradas

3. **Sin texto escrito**:
   - Botón muestra: `"✨ Escribe para crear nueva opción..."`
   - No es clickeable (requiere texto primero)

4. **Con texto escrito**:
   - Botón muestra: `"✨ [Badge con color] Crear nuevo"`
   - Vista previa del color que tendrá el badge
   - Clickeable para crear

5. **Presionar Enter o click**:
   - Crea el nuevo badge
   - Asigna color automáticamente (hash-based)
   - Guarda el valor en la celda
   - Cierra el dropdown

### Ventajas del Sistema

- ✅ **Búsqueda instantánea** en opciones existentes mientras escribes
- ✅ **Creación rápida** de nuevas etiquetas sin configuración previa
- ✅ **Colores consistentes y automáticos** (mismo texto = mismo color siempre)
- ✅ **Vista previa** del color antes de crear
- ✅ **Navegación por teclado** completa (flechas, Enter, Escape)
- ✅ **Arquitectura SOLID** con principio de responsabilidad única
- ✅ **Botón hardcodeado** para máxima confiabilidad

### Arquitectura del Botón "Crear nuevo"

Implementado siguiendo **principios SOLID**:

```tsx
// 🔒 HARDCODED: Botón SIEMPRE visible para badge columns
const shouldShowCreateButton = allowCreate && columnType === 'badge';

// ✅ Componente separado con responsabilidad única
function CreateNewButton({
  searchTerm,
  onSelect,
  isHighlighted,
  onMouseEnter,
  isDarkMode
}: CreateNewButtonProps) {
  const hasText = searchTerm.trim().length > 0;

  return (
    <li onClick={() => hasText && onSelect(searchTerm)}>
      {hasText ? (
        // Preview con color del badge
        <>
          <span>✨</span>
          <Badge color={getBadgeColors(searchTerm)}>
            {searchTerm}
          </Badge>
          <span>Crear nuevo</span>
        </>
      ) : (
        // Placeholder instructivo
        <>
          <span>✨</span>
          <span>Escribe para crear nueva opción...</span>
        </>
      )}
    </li>
  );
}
```

---

## 🎛️ Propiedades del Componente

```tsx
interface CustomTableProps {
  // ========== DATOS Y COLUMNAS (requerido) ==========
  data: any[];                      // Array de objetos con los datos
  columnsDef: ColumnDef[];          // Definición de columnas (de buildColumnsFromDefinition)

  // ========== CONFIGURACIÓN VISUAL ==========
  themeMode?: 'light' | 'dark';     // Tema (usa next-themes automáticamente)
  containerHeight?: string;         // Altura del contenedor (default: '750px')
  rowHeight?: number;               // Altura de filas (default: 26px)

  // ========== PAGINACIÓN ==========
  pageSize?: number;                // Filas por página (default: 50)

  // ========== ESTADOS ==========
  loading?: boolean;                // Muestra overlay de carga
  loadingText?: string;             // Texto de carga (default: 'Cargando...')
  noResultsText?: string;           // Texto sin resultados (default: 'No se encontraron resultados')

  // ========== TOOLBAR ==========
  showFiltersToolbar?: boolean;     // Muestra barra de herramientas (default: true)
  filtersToolbarProps?: object;     // Props adicionales para toolbar

  // ========== EDICIÓN ==========
  onCellEdit?: (rowId: string, colId: string, newValue: string) => void;  // Handler de edición

  // ========== CALLBACKS ==========
  onRefresh?: () => void;           // Callback al refrescar
  onHideColumns?: (ids: string[]) => void;     // Callback al ocultar columnas
  onHideRows?: (indexes: number[]) => void;    // Callback al ocultar filas

  // ========== OTROS ==========
  autoCopyDelay?: number;           // Delay para auto-copy (default: 1000ms)
}
```

---

## 📊 Ejemplos Avanzados

### Tabla de Empleados Completa

```tsx
import CustomTable from '@/CustomTable';
import { buildColumnsFromDefinition } from '@/CustomTable/CustomTableColumnsConfig';

const employeesColumns = buildColumnsFromDefinition({
  nombre: {
    type: 'avatar',
    header: 'NOMBRE',
    width: 180
  },
  pais: {
    type: 'country',
    header: 'PAÍS',
    width: 140,
    options: [
      { value: 'Argentina', label: 'Argentina' },
      { value: 'España', label: 'España' },
      { value: 'México', label: 'México' },
    ]
  },
  departamento: {
    type: 'badge',
    header: 'DEPARTAMENTO',
    width: 140,
    allowCreate: true,  // ⭐ Creación dinámica
    options: [
      { value: 'Ingeniería', label: 'Ingeniería' },
      { value: 'Marketing', label: 'Marketing' },
      { value: 'Ventas', label: 'Ventas' },
      { value: 'RRHH', label: 'RRHH' },
    ]
  },
  nivel: {
    type: 'badge',
    header: 'NIVEL',
    width: 100,
    allowCreate: true,
    options: [
      { value: 'Junior', label: 'Junior' },
      { value: 'Mid', label: 'Mid' },
      { value: 'Senior', label: 'Senior' },
      { value: 'Lead', label: 'Lead' },
    ]
  },
  edad: {
    type: 'numeric',
    header: 'EDAD',
    width: 80,
    textAlign: 'right'
  },
  salario: {
    type: 'currency',  // ⭐ Formato de moneda
    header: 'SALARIO',
    width: 140,
    textAlign: 'center',
    currencySymbol: '$',
    currencyLocale: 'es-ES'
  },
  rendimiento: {
    type: 'progress',
    header: 'RENDIMIENTO',
    width: 140,
    min: 0,
    max: 100
  },
  fecha_ingreso: {
    type: 'date',
    header: 'FECHA INGRESO',
    width: 140
  },
  email: {
    type: 'text',
    header: 'EMAIL',
    width: 220
  }
});

const employeesData = [
  {
    id: 1,
    nombre: 'Ana García',
    pais: 'España',
    departamento: 'Ingeniería',
    nivel: 'Senior',
    edad: 28,
    salario: 75000,
    rendimiento: 92,
    fecha_ingreso: '2020-03-15',
    email: 'ana.garcia@empresa.com'
  },
  // ... más empleados
];

export default function EmpleadosPage() {
  return (
    <div style={{ height: '700px' }}>
      <CustomTable
        data={employeesData}
        columnsDef={employeesColumns}
        pageSize={50}
        showFiltersToolbar={true}
      />
    </div>
  );
}
```

---

### Tabla de Productos con Precios

```tsx
const productsColumns = buildColumnsFromDefinition({
  producto: {
    type: 'text',
    header: 'PRODUCTO',
    width: 200
  },
  categoria: {
    type: 'badge',
    header: 'CATEGORÍA',
    width: 140,
    allowCreate: true,
    options: [
      { value: 'Electrónica', label: 'Electrónica' },
      { value: 'Smartphones', label: 'Smartphones' },
      { value: 'Audio', label: 'Audio' },
      { value: 'Gaming', label: 'Gaming' },
    ]
  },
  precio: {
    type: 'currency',
    header: 'PRECIO',
    width: 140,
    textAlign: 'center',
    currencySymbol: '$',
    currencyLocale: 'es-ES'
  },
  stock: {
    type: 'progress',
    header: 'STOCK',
    width: 140,
    min: 0,
    max: 1000
  },
  rating: {
    type: 'rating',
    header: 'RATING',
    width: 140,
    min: 0,
    max: 5
  },
  fecha_lanzamiento: {
    type: 'date',
    header: 'FECHA LANZAMIENTO',
    width: 160
  },
  url: {
    type: 'link',
    header: 'SITIO WEB',
    width: 180
  }
});
```

---

### Tabla de Analytics Dashboard

```tsx
const analyticsColumns = buildColumnsFromDefinition({
  proyecto: {
    type: 'text',
    header: 'PROYECTO',
    width: 200
  },
  manager: {
    type: 'avatar',
    header: 'MANAGER',
    width: 180
  },
  pais: {
    type: 'country',
    header: 'PAÍS',
    width: 140,
    options: [/* 15 países */]
  },
  prioridad: {
    type: 'badge',
    header: 'PRIORIDAD',
    width: 100,
    options: [
      { value: 'Baja', label: 'Baja' },
      { value: 'Media', label: 'Media' },
      { value: 'Alta', label: 'Alta' },
      { value: 'Crítico', label: 'Crítico' },
    ]
  },
  estado: {
    type: 'badge',
    header: 'ESTADO',
    width: 120,
    allowCreate: true,
    options: [
      { value: 'Activo', label: 'Activo' },
      { value: 'En Proceso', label: 'En Proceso' },
      { value: 'Completado', label: 'Completado' },
    ]
  },
  rendimiento: {
    type: 'heatmap',
    header: 'RENDIMIENTO',
    width: 130,
    min: 0,
    max: 100,
    colorScale: 'red-yellow-green'
  },
  completado: {
    type: 'progress',
    header: 'COMPLETADO',
    width: 150,
    min: 0,
    max: 100
  },
  satisfaccion: {
    type: 'rating',
    header: 'SATISFACCIÓN',
    width: 140,
    min: 0,
    max: 5
  },
  tendencia: {
    type: 'sparkline',
    header: 'TENDENCIA 7D',
    width: 100
  }
});
```

---

## 🎯 Características Avanzadas

### Sistema de Colores Automáticos (Hash-based)

Los badges generan colores automáticamente usando un **algoritmo hash del texto**:

```tsx
// Algoritmo interno (no necesitas usarlo directamente)
export function getColorFromString(str: string): { bg: string; text: string } {
  if (!str) return NOTION_COLOR_PALETTE[7]; // Gris por defecto

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;  // Convertir a entero de 32 bits
  }

  const index = Math.abs(hash) % NOTION_COLOR_PALETTE.length;
  return NOTION_COLOR_PALETTE[index];
}
```

**Ventajas:**
- ✅ El **mismo texto siempre tendrá el mismo color** (deterministico)
- ✅ Colores **consistentes entre recargas** de página
- ✅ **Paleta de 8 colores** suaves estilo Notion
- ✅ **No necesitas definir colores manualmente**
- ✅ **Fuente única de verdad**: Colores centralizados en `CustomTableColumnsConfig.tsx`

**Paleta Notion:**
1. 🟢 Verde: `rgba(219, 237, 219, 0.4)` → `#0b6e0b`
2. 🟣 Púrpura: `rgba(221, 215, 255, 0.4)` → `#6940a5`
3. 🟡 Amarillo: `rgba(253, 236, 200, 0.4)` → `#b87503`
4. 🔵 Azul: `rgba(211, 229, 255, 0.4)` → `#0055cc`
5. 🔴 Rojo: `rgba(255, 226, 221, 0.4)` → `#d44c47`
6. 🌸 Rosa: `rgba(245, 224, 233, 0.4)` → `#c14b8a`
7. 🟣 Violeta: `rgba(232, 222, 238, 0.4)` → `#9065b0`
8. ⚪ Gris: `rgba(227, 226, 224, 0.4)` → `#7c7c7c`

---

### Formato de Moneda Inteligente

El tipo `currency` usa `toLocaleString()` para formato localizado:

```tsx
// Ejemplo con diferentes locales
precio: {
  type: 'currency',
  currencySymbol: '$',
  currencyLocale: 'es-ES'  // España/Latinoamérica
}
// Resultado: $ 15.000,00 (punto para miles, coma para decimales)

precio: {
  type: 'currency',
  currencySymbol: '$',
  currencyLocale: 'en-US'  // Estados Unidos
}
// Resultado: $15,000.00 (coma para miles, punto para decimales)

precio: {
  type: 'currency',
  currencySymbol: '€',
  currencyLocale: 'de-DE'  // Alemania
}
// Resultado: 15.000,00 € (punto para miles, coma para decimales)
```

**Características:**
- ✅ Formatea automáticamente con separadores de miles
- ✅ Muestra **siempre 2 decimales**
- ✅ Soporta **cualquier locale** de JavaScript
- ✅ Símbolo personalizable
- ✅ Se puede **centrar** con `textAlign: 'center'`

---

### Exportación a Excel

Usa **SheetJS (xlsx)** para exportar:

```tsx
// Automático desde el toolbar
<CustomTable
  data={data}
  columnsDef={columns}
  showFiltersToolbar={true}  // ← Muestra botón de export
/>
```

**Características de la exportación:**
- ✅ Exporta **datos visibles** (respeta filtros)
- ✅ Mantiene **formato de columnas** (fechas, monedas)
- ✅ **Nombres de columnas** desde headers
- ✅ Descarga automática en formato `.xlsx`
- ✅ Compatible con Excel, Google Sheets, LibreOffice

---

## 🛠 Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.0 | Biblioteca UI |
| **Next.js** | 15.2 | Framework SSR/SSG |
| **TypeScript** | 5.x | Tipado estático |
| **TanStack Table** | v8 | Lógica de tabla |
| **next-themes** | 0.x | Sistema de temas |
| **Tailwind CSS** | 4.x | Estilos utility-first |
| **SheetJS (xlsx)** | 0.x | Exportación Excel |
| **country-flag-icons** | 1.x | Banderas SVG |

---

## 🚀 Desarrollo

### Scripts Disponibles

```bash
# Modo desarrollo (puerto 3000)
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint

# Formateo de código
npm run format
```

### Estructura del Proyecto

```
customtable/
├── app/
│   ├── layout.tsx           # Layout raíz con ThemeProvider
│   ├── page.tsx             # Página demo
│   └── globals.css          # Estilos globales
├── CustomTable/
│   ├── index.tsx            # Componente principal
│   ├── CustomTableColumnsConfig.tsx  # Configuración de columnas y colores
│   ├── TableView/
│   │   ├── TableView.tsx
│   │   └── subcomponents/
│   │       ├── TableBody.tsx
│   │       ├── TableHeader.tsx
│   │       ├── CustomSelectDropdown.tsx  # Dropdown con creación dinámica
│   │       └── ...
│   └── config.ts            # Configuración global
├── components/
│   ├── theme-provider.tsx   # Provider de next-themes
│   └── theme-toggle.tsx     # Botón de cambio de tema
└── README.md                # Este archivo
```

---

## 📝 Licencia

MIT License

Copyright (c) 2025 Tableros

Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia
de este software y archivos de documentación asociados (el "Software"), para usar
el Software sin restricciones, incluyendo sin limitación los derechos de usar,
copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender
copias del Software.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas!

### Cómo Contribuir

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Reportar Issues

Si encuentras un bug o tienes una sugerencia:
- Abre un **Issue** en GitHub
- Describe el problema o feature request claramente
- Incluye screenshots si es posible

---

## 📞 Contacto y Recursos

- **Website**: [tableros.dev](https://tableros.dev)
- **Email**: contacto@tableros.dev
- **GitHub**: [github.com/tableros/customtable](https://github.com)

---

## 🙏 Agradecimientos

- **TanStack Table** por la excelente lógica de tabla
- **Notion** por la inspiración en el sistema de colores y UX
- **Vercel** por el hosting y Next.js
- **Comunidad de React** por el feedback continuo

---

<div align="center">

**Desarrollado con ❤️ para la comunidad de React y Next.js**

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!

</div>
