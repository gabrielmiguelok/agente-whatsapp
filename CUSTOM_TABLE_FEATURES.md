# 🎉 CustomTable - Funcionalidades Implementadas

## ✅ Problema de Scroll - SOLUCIONADO

### Problema Original
Cuando abrías el modal de select en una celda, si la tabla hacía scroll internamente (`.tv-scroll`), el modal se movía con el scroll y no quedaba fijo en la posición de la celda.

### Solución Implementada
**Archivo**: `CustomTable/TableView/subcomponents/CustomSelectDropdown.tsx:288-375`

```typescript
// Guardar posición inicial del scroll cuando se abre el dropdown
const initialScrollPositionRef = useRef<{ top: number; left: number } | null>(null);

// Prevenir scroll del contenedor mientras el dropdown está abierto
const preventScroll = (e: Event) => {
  if (!scrollContainer || !isOpen) return;

  // Restaurar posición de scroll si cambió
  if (initialScrollPositionRef.current) {
    scrollContainer.scrollTop = initialScrollPositionRef.current.top;
    scrollContainer.scrollLeft = initialScrollPositionRef.current.left;
  }
};
```

**Resultado**: El modal ahora permanece fijo en la posición donde se abrió, sin moverse con el scroll interno de la tabla.

---

## ✅ Opciones Dinámicas desde MariaDB - IMPLEMENTADO

### Descripción
Ahora puedes configurar columnas tipo `badge` o `country` para que:
1. Carguen sus opciones automáticamente desde MariaDB
2. Permitan crear nuevas opciones en tiempo real
3. Las nuevas opciones se validen en el backend y se agreguen a la BD

### Estructura de Archivos

#### 1. API Genérica - `/app/api/select-options/route.ts`
API completamente independiente que gestiona opciones de select:

- **GET**: Obtener opciones únicas de una columna
  ```
  GET /api/select-options?dataset=empleados&field=departamento
  → { success: true, options: ['Ventas', 'Marketing', ...] }
  ```

- **POST**: Validar nueva opción
  ```
  POST /api/select-options
  Body: { dataset: 'empleados', field: 'departamento', value: 'IT' }
  → { success: true, value: 'IT', exists: false }
  ```

- **DELETE**: Eliminar opción (setea NULL)
  ```
  DELETE /api/select-options?dataset=empleados&field=departamento&value=IT
  → { success: true, affectedRows: 5 }
  ```

**Seguridad**:
- Lista blanca de tablas y columnas permitidas
- Prevención de SQL injection
- Validación de longitud (máx 100 caracteres)

#### 2. Hook para Opciones - `/lib/hooks/useSelectOptions.ts`
Hook reutilizable para cargar y gestionar opciones:

```typescript
const { options, loading, createOption } = useSelectOptions({
  dataset: 'empleados',
  field: 'departamento',
  initialOptions: ['Ventas', 'Marketing'],
  enableDynamicFetch: true,
});
```

Características:
- Cache local para evitar requests duplicados
- Fallback a opciones iniciales si la API falla
- Combina opciones de API + opciones iniciales

#### 3. Hook para Enriquecer Columnas - `/lib/hooks/useDynamicColumns.ts`
Toma definiciones de columnas y las enriquece con:
- Callback `onCreateOption` para crear nuevas opciones
- Dataset para identificar la tabla
- Compatibilidad total con columnas estáticas

```typescript
const enrichedColumns = useDynamicColumns(baseColumns, 'empleados');
```

### Uso en Definición de Columnas

**Antes** (solo opciones estáticas):
```typescript
departamento: {
  type: 'badge',
  header: 'DEPARTAMENTO',
  allowCreate: true,
  options: [
    { value: 'Ventas', label: 'Ventas' },
    { value: 'Marketing', label: 'Marketing' },
  ]
}
```

**Ahora** (opciones dinámicas desde MariaDB):
```typescript
departamento: {
  type: 'badge',
  header: 'DEPARTAMENTO',
  allowCreate: true,
  useDynamicOptions: true,  // ← NUEVO
  dataset: 'empleados',      // ← NUEVO
  options: [
    { value: 'Ventas', label: 'Ventas' },  // ← Fallback si API falla
    { value: 'Marketing', label: 'Marketing' },
  ]
}
```

### Cambios en Componentes

#### CustomSelectDropdown.tsx
- Nuevo prop `onCreateOption?: (value: string) => Promise<void>`
- Nuevo prop `dataset?: string`
- Al seleccionar una opción nueva, llama automáticamente a `onCreateOption`

#### TableBody.tsx
- Pasa `onCreateOption` y `dataset` al dropdown
- Recibe callbacks desde la metadata de la columna

#### CustomTableColumnsConfig.tsx
- Nuevos campos en `FieldDef`:
  - `useDynamicOptions?: boolean`
  - `dataset?: string`
  - `onCreateOption?: (value: string) => Promise<void>`

### Integración en app/page.tsx

```typescript
import { useDynamicColumns } from '@/lib/hooks/useDynamicColumns';

// Obtener columnas base
const baseColumns = buildColumnsFromDefinition({...});

// ✨ Enriquecer con opciones dinámicas
const enrichedColumns = useDynamicColumns(baseColumns, apiDataset);

// Usar en CustomTable
<CustomTable
  data={data}
  columnsDef={enrichedColumns}  // ← Usar columnas enriquecidas
  onCellEdit={updateCell}
/>
```

---

## 🏗️ Arquitectura - Completamente Independiente

### Principio SOLID aplicado
El sistema está diseñado para ser **completamente independiente** y **reutilizable**:

1. **CustomTable** no conoce nada sobre MariaDB ni tu estructura de datos
2. **API de opciones** es genérica y funciona con cualquier tabla/columna
3. **Hooks** son reutilizables en cualquier proyecto
4. **Compatibilidad**: Columnas sin `useDynamicOptions` funcionan exactamente igual que antes

### Cómo usar en otro proyecto

1. Copiar `CustomTable/` completo
2. Copiar `/lib/hooks/useSelectOptions.ts` y `/lib/hooks/useDynamicColumns.ts`
3. (Opcional) Copiar `/app/api/select-options/route.ts` si quieres opciones dinámicas
4. Configurar conexión a tu BD en `/lib/db.ts`
5. Listo - funciona sin cambios adicionales

---

## 📋 Checklist de Testing

- [ ] Abrir dropdown de select → Scroll la tabla → El dropdown NO se mueve
- [ ] Editar celda tipo badge con `allowCreate: true` → Escribir nuevo valor → Se crea correctamente
- [ ] Verificar en MariaDB que la nueva opción aparece: `SELECT DISTINCT departamento FROM empleados`
- [ ] Probar sin `useDynamicOptions` → Funciona con opciones estáticas
- [ ] Probar con `useDynamicOptions: true` → Carga opciones desde BD
- [ ] Probar sin conexión a BD → Usa opciones fallback sin error

---

## 🎯 Próximas Mejoras

- [ ] Agregar UI para gestionar opciones (agregar/eliminar/renombrar)
- [ ] Caché de opciones en localStorage para mejor performance
- [ ] Soporte para opciones con íconos personalizados
- [ ] Soporte para opciones con colores personalizados
- [ ] Sincronización en tiempo real (WebSockets) cuando otro usuario crea opciones

---

## 🔧 Configuración de Lista Blanca

Para permitir opciones dinámicas en una nueva tabla/campo:

**Editar**: `/app/api/select-options/route.ts`

```typescript
const ALLOWED_CONFIG: Record<string, { table: string; allowedFields: string[] }> = {
  empleados: {
    table: 'empleados',
    allowedFields: ['pais', 'departamento', 'nivel'],  // ← Agregar campos aquí
  },
  productos: {
    table: 'productos',
    allowedFields: ['categoria'],
  },
  // ← Agregar nuevas tablas aquí
};
```

---

## 📖 Documentación Adicional

- [CustomTable README](./CustomTable/README.md)
- [API Routes](./app/api/README.md)
- [Hooks Documentation](./lib/hooks/README.md)

---

**Fecha de implementación**: 2025-11-20
**Autor**: Claude Code
**Versión**: 2.0.0
