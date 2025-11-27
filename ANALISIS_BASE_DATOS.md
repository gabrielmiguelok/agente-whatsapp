# Análisis Completo de Base de Datos - Sistema de Control

## Información General del Sistema

### Entorno de Base de Datos
- **Motor:** MariaDB 10.6.22
- **Base de datos:** `control_db`
- **Charset:** UTF8MB4 (Unicode completo)
- **Collation:** utf8mb4_unicode_ci
- **Motor de almacenamiento:** InnoDB (todas las tablas)
- **Formato de filas:** Dynamic

### Configuración de Conexión (lib/db.ts)
```typescript
Pool de conexiones MariaDB:
- Host: process.env.DB_HOST || 'localhost'
- Puerto: process.env.DB_PORT || 3306
- Usuario: process.env.DB_USER || 'emprendi2'
- Contraseña: process.env.DB_PASSWORD || '56Ghambju!'
- Base de datos: process.env.DB_NAME || 'control_db'
- Límite de conexiones: 10
- Timeout de adquisición: 30000ms (30 segundos)
- Timeout de inactividad: 60000ms (60 segundos)
```

**NOTA DE SEGURIDAD:** Las credenciales están hardcodeadas como fallback. Se recomienda usar exclusivamente variables de entorno en producción.

---

## Arquitectura de Datos

### Modelo de Relaciones

El sistema implementa una jerarquía de tres niveles con relaciones bien definidas:

```
REVENDEDORES (entidad independiente)
    ↓ (1:N)
CLIENTES (referencia a revendedores)
    ↓ (1:N)
SUCURSALES (referencia a clientes y revendedores)

OPERACIONES_COMPRA (entidad independiente, sin FK)
```

**Flujo lógico:**
1. Los **revendedores** son la entidad raíz (responsables y despachantes)
2. Los **clientes** tienen un responsable asignado
3. Las **sucursales** pertenecen a un cliente y pueden tener responsable y despachante
4. Las **operaciones de compra** son registros independientes sin relaciones FK

---

## Análisis Detallado por Tabla

### 1. TABLA: revendedores

**Propósito:** Almacena los responsables y despachantes del sistema.

#### Estructura de Campos
| Campo | Tipo | Nulo | Default | Extra |
|-------|------|------|---------|-------|
| id | INT(11) | NO | - | AUTO_INCREMENT |
| nombre | VARCHAR(255) | NO | - | - |
| telefono | VARCHAR(50) | YES | NULL | - |
| email | VARCHAR(255) | YES | NULL | - |
| fecha_alta | DATE | YES | CURRENT_DATE | - |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | ON UPDATE |

#### Índices
- **PRIMARY KEY:** `id` (BTREE)
- **Total índices:** 16 KB

#### Características
- **Clave primaria:** Auto-incremental
- **Campos obligatorios:** Solo `nombre`
- **Campos opcionales:** telefono, email
- **Auditoría temporal:** created_at, updated_at automáticos
- **Fecha de alta:** Se asigna automáticamente al día actual si no se proporciona

#### Relaciones
**Es referenciada por:**
- `clientes.responsable_id` → ON DELETE SET NULL
- `sucursales.responsable_id` → ON DELETE SET NULL
- `sucursales.despachante_id` → ON DELETE SET NULL

#### Estadísticas
- **Registros actuales:** 3
- **Tamaño en disco:** 16 KB (datos)
- **Auto_increment actual:** 4

#### Diseño y Decisiones
1. **Soft delete implícito:** Al eliminar un revendedor, las referencias se ponen en NULL (no se elimina en cascada)
2. **Reutilización:** Un mismo revendedor puede actuar como responsable o despachante
3. **Validación mínima:** Solo el nombre es obligatorio, los demás campos son opcionales

---

### 2. TABLA: clientes

**Propósito:** Almacena los clientes del sistema, cada uno con un responsable asignado.

#### Estructura de Campos
| Campo | Tipo | Nulo | Default | Extra |
|-------|------|------|---------|-------|
| id | INT(11) | NO | - | AUTO_INCREMENT |
| nombre | VARCHAR(255) | NO | - | - |
| telefono | VARCHAR(50) | YES | NULL | - |
| email | VARCHAR(255) | YES | NULL | - |
| fecha | DATE | YES | CURRENT_DATE | - |
| responsable_id | INT(11) | YES | NULL | - |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | ON UPDATE |

#### Índices
- **PRIMARY KEY:** `id` (BTREE)
- **INDEX:** `responsable_id` (BTREE) - Para optimizar JOINs
- **Total índices:** 16 KB

#### Claves Foráneas
```sql
CONSTRAINT clientes_ibfk_1
  FOREIGN KEY (responsable_id)
  REFERENCES revendedores(id)
  ON DELETE SET NULL
  ON UPDATE RESTRICT
```

#### Características
- **Integridad referencial:** Si se elimina un revendedor, el campo se pone en NULL
- **Restricción de actualización:** No permite actualizar el ID de un revendedor si está siendo referenciado
- **Fecha automática:** El campo `fecha` se asigna automáticamente al día actual

#### Relaciones
**Depende de:**
- `revendedores` vía `responsable_id`

**Es referenciada por:**
- `sucursales.cliente_id` → ON DELETE CASCADE

#### Estadísticas
- **Registros actuales:** 16
- **Tamaño en disco:** 32 KB total (16 KB datos + 16 KB índices)
- **Auto_increment actual:** 17
- **Avg_row_length:** 1092 bytes

#### Consultas Optimizadas
El sistema realiza JOINs frecuentes para obtener el nombre del responsable:
```sql
SELECT c.*, r.nombre as responsable_nombre
FROM clientes c
LEFT JOIN revendedores r ON c.responsable_id = r.id
```

#### Diseño y Decisiones
1. **Responsable opcional:** Un cliente puede existir sin responsable asignado
2. **Eliminación protegida:** Si un cliente tiene sucursales, la eliminación falla (integridad referencial)
3. **Índice en FK:** Mejora el rendimiento de búsquedas por responsable

---

### 3. TABLA: sucursales

**Propósito:** Almacena las sucursales/ubicaciones de cada cliente, con información geográfica y asignación de responsables y despachantes.

#### Estructura de Campos
| Campo | Tipo | Nulo | Default | Extra |
|-------|------|------|---------|-------|
| id | INT(11) | NO | - | AUTO_INCREMENT |
| cliente_id | INT(11) | NO | - | - |
| provincia | VARCHAR(100) | NO | - | - |
| localidad | VARCHAR(100) | NO | - | - |
| domicilio | VARCHAR(255) | NO | - | - |
| responsable_id | INT(11) | YES | NULL | - |
| despachante_id | INT(11) | YES | NULL | - |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | ON UPDATE |

#### Índices
- **PRIMARY KEY:** `id` (BTREE)
- **INDEX:** `cliente_id` (BTREE)
- **INDEX:** `responsable_id` (BTREE)
- **INDEX:** `despachante_id` (BTREE)
- **Total índices:** 48 KB (importante: 75% del tamaño total es índices)

#### Claves Foráneas
```sql
CONSTRAINT sucursales_ibfk_1
  FOREIGN KEY (cliente_id)
  REFERENCES clientes(id)
  ON DELETE CASCADE
  ON UPDATE RESTRICT

CONSTRAINT sucursales_ibfk_2
  FOREIGN KEY (responsable_id)
  REFERENCES revendedores(id)
  ON DELETE SET NULL
  ON UPDATE RESTRICT

CONSTRAINT sucursales_ibfk_3
  FOREIGN KEY (despachante_id)
  REFERENCES revendedores(id)
  ON DELETE SET NULL
  ON UPDATE RESTRICT
```

#### Características
- **Eliminación en cascada:** Si se elimina un cliente, todas sus sucursales se eliminan automáticamente
- **Múltiples referencias a revendedores:** Permite asignar diferentes roles (responsable y despachante)
- **Campos geográficos obligatorios:** provincia, localidad y domicilio son requeridos
- **Alta densidad de índices:** 3 índices secundarios para optimizar JOINs

#### Relaciones
**Depende de:**
- `clientes` vía `cliente_id` (CASCADE DELETE)
- `revendedores` vía `responsable_id` (SET NULL)
- `revendedores` vía `despachante_id` (SET NULL)

#### Estadísticas
- **Registros actuales:** 3
- **Tamaño en disco:** 64 KB total (16 KB datos + 48 KB índices)
- **Ratio índices/datos:** 3:1 (muy alto)
- **Auto_increment actual:** 4

#### Consultas Optimizadas
El sistema realiza JOINs múltiples para obtener nombres relacionados:
```sql
SELECT
  s.*,
  c.nombre as cliente_nombre,
  r1.nombre as responsable_nombre,
  r2.nombre as despachante_nombre
FROM sucursales s
LEFT JOIN clientes c ON s.cliente_id = c.id
LEFT JOIN revendedores r1 ON s.responsable_id = r1.id
LEFT JOIN revendedores r2 ON s.despachante_id = r2.id
```

#### Diseño y Decisiones
1. **Cascada de eliminación:** Decisión crítica - eliminar un cliente borra todas sus sucursales
2. **Dos roles de revendedores:** Permite separar responsabilidades (responsable vs despachante)
3. **Índices múltiples:** Preparado para búsquedas complejas y reportes por responsable/despachante
4. **Overhead de índices:** Los índices ocupan más espacio que los datos (trade-off: velocidad vs espacio)

---

### 4. TABLA: operaciones_compra ⭐ (TABLA ESPECIAL)

**Propósito:** Registra operaciones de compra con cálculos automáticos mediante columnas generadas.

#### Estructura de Campos
| Campo | Tipo | Nulo | Default | Extra |
|-------|------|------|---------|-------|
| id | INT(11) | NO | - | AUTO_INCREMENT |
| fecha | DATE | NO | - | - |
| producto | VARCHAR(255) | NO | - | - |
| proveedor | VARCHAR(255) | YES | NULL | - |
| unidades | INT(11) | NO | 1 | - |
| precio_unitario | DECIMAL(12,2) | NO | - | - |
| con_iva | TINYINT(1) | NO | 0 | Boolean flag |
| porcentaje_iva | DECIMAL(5,2) | YES | 21.00 | - |
| costo_variable_porcentaje | DECIMAL(5,2) | YES | 0.00 | - |
| **subtotal** | DECIMAL(12,2) | YES | NULL | **GENERATED STORED** |
| **monto_iva** | DECIMAL(12,2) | YES | NULL | **GENERATED STORED** |
| **costo_variable** | DECIMAL(12,2) | YES | NULL | **GENERATED STORED** |
| **total** | DECIMAL(12,2) | YES | NULL | **GENERATED STORED** |
| observaciones | TEXT | YES | NULL | - |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | ON UPDATE |

#### Índices
- **PRIMARY KEY:** `id` (BTREE)
- **Total índices:** 0 KB (sin índices secundarios)
- **Observación:** No hay índices en fecha, proveedor o producto

#### Características Especiales

**NO TIENE CLAVES FORÁNEAS:**
Esta tabla es independiente y no mantiene relaciones FK con otras tablas. Los proveedores se almacenan como texto libre.

**COLUMNAS GENERADAS (STORED):**
Esta es la característica más importante de la tabla. Los cálculos se realizan automáticamente en la base de datos.

#### Fórmulas de Cálculo

##### 1. Subtotal
```sql
subtotal = unidades * precio_unitario
```
**Ejemplo:** 5 unidades × $450,000 = $2,250,000

##### 2. Monto IVA
```sql
monto_iva = CASE WHEN con_iva
            THEN unidades * precio_unitario * porcentaje_iva / 100
            ELSE 0
            END
```
**Ejemplo:**
- Con IVA: $2,250,000 × 21% = $472,500
- Sin IVA: $0

##### 3. Costo Variable
```sql
costo_variable = unidades * precio_unitario * costo_variable_porcentaje / 100
```
**Ejemplo:** $2,250,000 × 3.5% = $78,750

##### 4. Total
```sql
total = unidades * precio_unitario
        + CASE WHEN con_iva
            THEN unidades * precio_unitario * porcentaje_iva / 100
            ELSE 0
          END
        + unidades * precio_unitario * costo_variable_porcentaje / 100
```
**Ejemplo:** $2,250,000 + $472,500 + $78,750 = **$2,801,250**

#### Ventajas de las Columnas Generadas

1. **Integridad de datos garantizada:** Los cálculos siempre están sincronizados
2. **Sin lógica en aplicación:** El frontend solo envía campos base
3. **STORED vs VIRTUAL:** Son STORED, ocupan espacio pero mejoran el rendimiento de consultas
4. **Actualización automática:** Al modificar unidades o precio_unitario, todo se recalcula automáticamente
5. **Consultas simples:** No necesitan calcular en tiempo real, solo leen el valor almacenado

#### Proveedores
**Gestión de proveedores:**
- No existe tabla separada de proveedores
- Se almacenan como texto libre en VARCHAR(255)
- El sistema obtiene lista de proveedores únicos mediante:
```sql
SELECT DISTINCT proveedor
FROM operaciones_compra
WHERE proveedor IS NOT NULL
ORDER BY proveedor
```

**Proveedores actuales en el sistema:**
- AudioPro
- CompuPartes
- ElectroMax
- ImportDirect
- Mercado Mayorista
- MueblesOficina
- TechStore SA

#### Estadísticas
- **Registros actuales:** 30
- **Tamaño en disco:** 16 KB (solo datos, sin índices)
- **Auto_increment actual:** 31
- **Avg_row_length:** 546 bytes

#### Ejemplo de Registro Real
```
ID: 1
Fecha: 2024-01-15
Producto: Laptop Dell Inspiron
Proveedor: TechStore SA
Unidades: 5
Precio unitario: $450,000.00
Con IVA: Sí
Porcentaje IVA: 21.00%
Costo variable %: 3.50%
---
Subtotal: $2,250,000.00 (calculado)
Monto IVA: $472,500.00 (calculado)
Costo variable: $78,750.00 (calculado)
Total: $2,801,250.00 (calculado)
```

#### Flujo de Trabajo

**Al crear/actualizar una operación:**
1. Frontend envía: fecha, producto, proveedor, unidades, precio_unitario, con_iva, porcentaje_iva, costo_variable_porcentaje
2. MariaDB calcula automáticamente: subtotal, monto_iva, costo_variable, total
3. Respuesta incluye valores calculados
4. Frontend actualiza UI con valores completos

#### Diseño y Decisiones
1. **Sin índices secundarios:** Optimizado para escritura, puede afectar búsquedas por proveedor/fecha
2. **Proveedores sin normalizar:** Decisión de diseño para permitir flexibilidad (allowCreate en UI)
3. **STORED vs VIRTUAL:** Se eligió STORED para mejorar rendimiento de consultas y reportes
4. **Precisión decimal:** DECIMAL(12,2) permite hasta $9,999,999,999.99
5. **Boolean como TINYINT:** MariaDB no tiene tipo BOOLEAN nativo, usa TINYINT(1)

#### Mejoras Potenciales
1. **Índices recomendados:**
   - INDEX en `fecha` para reportes por período
   - INDEX en `proveedor` para búsquedas por proveedor
   - INDEX compuesto `(fecha, proveedor)` para reportes detallados

2. **Normalización de proveedores:**
   - Crear tabla `proveedores` separada
   - Agregar FK `proveedor_id` en operaciones_compra
   - Mejorar integridad referencial

3. **Particionamiento:**
   - Considerar particiones por año si el volumen crece significativamente
   - Mejoraría rendimiento de consultas históricas

---

## Integridad Referencial - Resumen

### Políticas de Eliminación

```
revendedores (id)
├─ ON DELETE → SET NULL en clientes.responsable_id
├─ ON DELETE → SET NULL en sucursales.responsable_id
└─ ON DELETE → SET NULL en sucursales.despachante_id

clientes (id)
└─ ON DELETE → CASCADE en sucursales.cliente_id

sucursales (id)
└─ (sin dependencias)

operaciones_compra (id)
└─ (sin dependencias)
```

### Escenarios de Eliminación

**1. Eliminar un revendedor:**
- ✅ Permitido
- 📝 Efecto: Campos relacionados en clientes y sucursales se ponen en NULL
- ⚠️ No hay validación de si tiene asignaciones activas

**2. Eliminar un cliente:**
- ✅ Permitido (con precaución)
- 📝 Efecto: Todas sus sucursales se eliminan en cascada
- ⚠️ Irreversible - pérdida de datos geográficos

**3. Eliminar una sucursal:**
- ✅ Permitido
- 📝 Efecto: Sin impacto en otras tablas

**4. Eliminar una operación de compra:**
- ✅ Permitido
- 📝 Efecto: Sin impacto en otras tablas

### Políticas de Actualización

**Todas las FK tienen:** `ON UPDATE RESTRICT`
- No se puede cambiar el ID de una entidad referenciada
- Protege contra modificaciones accidentales de claves primarias

---

## Análisis de Índices

### Resumen de Indexación

| Tabla | Índice PK | Índices FK | Total Índices | Ratio índices/datos |
|-------|-----------|------------|---------------|---------------------|
| revendedores | ✅ | 0 | 0 KB | 0:1 |
| clientes | ✅ | 1 | 16 KB | 1:1 |
| sucursales | ✅ | 3 | 48 KB | 3:1 |
| operaciones_compra | ✅ | 0 | 0 KB | 0:1 |

### Análisis por Tabla

**revendedores:**
- Solo PRIMARY KEY
- Entidad raíz, no necesita índices adicionales
- Bajo volumen de datos (3 registros)

**clientes:**
- INDEX en `responsable_id`
- Optimiza JOIN con revendedores
- Ratio balanceado 1:1

**sucursales:**
- 3 índices secundarios (cliente_id, responsable_id, despachante_id)
- Ratio muy alto 3:1 (índices más grandes que los datos)
- Justificado por consultas complejas con múltiples JOINs

**operaciones_compra:**
- Sin índices secundarios
- ⚠️ PROBLEMA POTENCIAL: Búsquedas por fecha o proveedor pueden ser lentas
- Optimizado para escritura, no para lectura

### Recomendaciones de Índices

**Alta prioridad - operaciones_compra:**
```sql
-- Búsquedas por fecha (reportes mensuales/anuales)
CREATE INDEX idx_fecha ON operaciones_compra(fecha);

-- Búsquedas por proveedor
CREATE INDEX idx_proveedor ON operaciones_compra(proveedor);

-- Reportes combinados
CREATE INDEX idx_fecha_proveedor ON operaciones_compra(fecha, proveedor);
```

**Media prioridad:**
```sql
-- Si se hacen búsquedas por provincia
CREATE INDEX idx_provincia ON sucursales(provincia);

-- Si se busca por email/teléfono frecuentemente
CREATE INDEX idx_email ON clientes(email);
```

---

## Análisis de Tipos de Datos

### Tipos Numéricos

**INT(11):**
- Usado para: IDs, unidades, referencias FK
- Rango: -2,147,483,648 a 2,147,483,647
- ✅ Adecuado para el sistema

**TINYINT(1):**
- Usado para: con_iva (boolean)
- Valores: 0 (false), 1 (true)
- ✅ Correcto para flags booleanos

**DECIMAL(12,2):**
- Usado para: precio_unitario, subtotal, monto_iva, costo_variable, total
- Rango: -9,999,999,999.99 a 9,999,999,999.99
- Precisión: 2 decimales
- ✅ Adecuado para moneda argentina

**DECIMAL(5,2):**
- Usado para: porcentaje_iva, costo_variable_porcentaje
- Rango: -999.99 a 999.99
- ✅ Suficiente para porcentajes

### Tipos de Texto

**VARCHAR(255):**
- Usado para: nombres, email, producto, proveedor
- ✅ Estándar para campos de texto medio

**VARCHAR(50):**
- Usado para: telefono
- ✅ Suficiente para números internacionales con formato

**VARCHAR(100):**
- Usado para: provincia, localidad
- ✅ Adecuado para nombres geográficos

**TEXT:**
- Usado para: observaciones
- Sin límite práctico
- ✅ Correcto para contenido largo

### Tipos Temporales

**DATE:**
- Usado para: fecha, fecha_alta
- Formato: YYYY-MM-DD
- ✅ Correcto para fechas sin hora

**TIMESTAMP:**
- Usado para: created_at, updated_at
- Auto-actualizable
- ✅ Estándar para auditoría

---

## Tamaños y Estadísticas

### Tamaño Total del Sistema

| Tabla | Datos | Índices | Total | % del Total |
|-------|-------|---------|-------|-------------|
| sucursales | 16 KB | 48 KB | 64 KB | 50% |
| clientes | 16 KB | 16 KB | 32 KB | 25% |
| operaciones_compra | 16 KB | 0 KB | 16 KB | 12.5% |
| revendedores | 16 KB | 0 KB | 16 KB | 12.5% |
| **TOTAL** | **64 KB** | **64 KB** | **128 KB** | **100%** |

### Observaciones

1. **Sistema muy pequeño:** 128 KB total (datos de prueba)
2. **Ratio índices/datos global:** 1:1 (balanceado)
3. **Tabla más grande:** sucursales (principalmente por índices)
4. **Tabla más pesada en datos:** operaciones_compra (30 registros)

### Proyección de Crecimiento

**Escenario: 10,000 operaciones de compra**
- Tamaño estimado por registro: 546 bytes
- Total estimado: 5.2 MB
- **Con índices recomendados:** ~10-15 MB

**Escenario: 1,000 clientes + 5,000 sucursales**
- Clientes: ~1 MB
- Sucursales: ~5 MB (incluyendo índices)
- **Total estimado:** ~6 MB

**Sistema a escala completa (1 año operativo):**
- Estimación total: 50-100 MB
- Muy manejable para MariaDB

---

## Auditoría y Timestamps

### Campos de Auditoría

**Todas las tablas incluyen:**
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### Comportamiento

1. **created_at:** Se establece automáticamente al insertar
2. **updated_at:** Se actualiza automáticamente en cada UPDATE
3. **No requiere lógica en aplicación:** Gestionado por MariaDB

### Ejemplo de Uso

```sql
-- Obtener registros modificados hoy
SELECT * FROM operaciones_compra
WHERE DATE(updated_at) = CURDATE();

-- Obtener registros creados en los últimos 7 días
SELECT * FROM clientes
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### Limitaciones

- No hay registro de quién modificó (falta user_id)
- No hay historial de cambios (sin tabla de auditoría)
- No hay soft delete (sin campo deleted_at)

---

## Consultas SQL Comunes

### 1. Listado de Clientes con Responsable
```sql
SELECT
  c.id,
  c.nombre,
  c.telefono,
  c.email,
  c.fecha,
  r.nombre as responsable_nombre
FROM clientes c
LEFT JOIN revendedores r ON c.responsable_id = r.id
ORDER BY c.nombre;
```

### 2. Sucursales con Información Completa
```sql
SELECT
  s.id,
  c.nombre as cliente_nombre,
  s.provincia,
  s.localidad,
  s.domicilio,
  r1.nombre as responsable_nombre,
  r2.nombre as despachante_nombre
FROM sucursales s
INNER JOIN clientes c ON s.cliente_id = c.id
LEFT JOIN revendedores r1 ON s.responsable_id = r1.id
LEFT JOIN revendedores r2 ON s.despachante_id = r2.id
ORDER BY c.nombre, s.provincia, s.localidad;
```

### 3. Reporte de Operaciones por Proveedor
```sql
SELECT
  proveedor,
  COUNT(*) as total_operaciones,
  SUM(unidades) as total_unidades,
  SUM(total) as monto_total
FROM operaciones_compra
WHERE proveedor IS NOT NULL
GROUP BY proveedor
ORDER BY monto_total DESC;
```

### 4. Operaciones por Mes
```sql
SELECT
  DATE_FORMAT(fecha, '%Y-%m') as mes,
  COUNT(*) as operaciones,
  SUM(unidades) as unidades_totales,
  SUM(subtotal) as subtotal,
  SUM(monto_iva) as iva,
  SUM(costo_variable) as costos_variables,
  SUM(total) as total
FROM operaciones_compra
GROUP BY DATE_FORMAT(fecha, '%Y-%m')
ORDER BY mes DESC;
```

### 5. Clientes sin Sucursales
```sql
SELECT c.*
FROM clientes c
LEFT JOIN sucursales s ON c.id = s.cliente_id
WHERE s.id IS NULL;
```

### 6. Revendedores con Asignaciones
```sql
SELECT
  r.id,
  r.nombre,
  COUNT(DISTINCT c.id) as clientes_responsables,
  COUNT(DISTINCT s1.id) as sucursales_responsable,
  COUNT(DISTINCT s2.id) as sucursales_despachante
FROM revendedores r
LEFT JOIN clientes c ON r.id = c.responsable_id
LEFT JOIN sucursales s1 ON r.id = s1.responsable_id
LEFT JOIN sucursales s2 ON r.id = s2.despachante_id
GROUP BY r.id, r.nombre
ORDER BY r.nombre;
```

---

## Normalización y Diseño

### Nivel de Normalización

**Análisis por forma normal:**

**1NF (Primera Forma Normal):** ✅ CUMPLE
- Todos los valores son atómicos
- No hay grupos repetitivos
- Cada columna tiene valores del mismo tipo

**2NF (Segunda Forma Normal):** ✅ CUMPLE
- Está en 1NF
- No hay dependencias parciales (todas las FK dependen de PK completa)

**3NF (Tercera Forma Normal):** ⚠️ PARCIAL
- Está en 2NF
- **PROBLEMA:** `proveedor` en operaciones_compra debería ser FK a tabla proveedores
- Las columnas generadas no violan 3NF (son derivaciones matemáticas, no dependencias transitivas)

**BCNF (Boyce-Codd):** ✅ CUMPLE
- Todas las dependencias funcionales tienen clave candidata como determinante

### Violaciones de Normalización

**1. Proveedores sin normalizar:**
- **Problema:** proveedor almacenado como texto libre
- **Consecuencia:** Inconsistencias (TechStore vs TechStore SA)
- **Solución:** Tabla proveedores + FK

**2. Información geográfica sin normalizar:**
- **Problema:** provincia/localidad como texto libre
- **Consecuencia:** Variaciones de escritura
- **Solución:** Tablas provincias/localidades + FK

### Trade-offs del Diseño Actual

**Ventajas:**
- ✅ Simplicidad de implementación
- ✅ Flexibilidad para nuevos proveedores
- ✅ No requiere mantener catálogos
- ✅ Menos JOINs en consultas simples

**Desventajas:**
- ❌ Posibles inconsistencias en nombres
- ❌ Sin información adicional de proveedores
- ❌ Más difícil hacer reportes consolidados
- ❌ Sin validación de datos geográficos

---

## Características Avanzadas de MariaDB Utilizadas

### 1. Columnas Generadas (Generated Columns)
```sql
subtotal DECIMAL(12,2) GENERATED ALWAYS AS (unidades * precio_unitario) STORED
```
- Versión requerida: MariaDB 10.2+
- Tipo: STORED (se calcula al insertar/actualizar)
- Alternativa: VIRTUAL (se calcula al consultar)

### 2. Valores por Defecto Dinámicos
```sql
fecha_alta DATE DEFAULT (CURRENT_DATE)
```
- Usa funciones SQL como defaults
- Más flexible que defaults estáticos

### 3. Actualización Automática de Timestamps
```sql
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```
- Actualización automática sin triggers
- Feature nativa de MariaDB/MySQL

### 4. Integridad Referencial Completa
- ON DELETE CASCADE
- ON DELETE SET NULL
- ON UPDATE RESTRICT

### 5. Motor InnoDB
- Transacciones ACID
- Bloqueo a nivel de fila
- Claves foráneas soportadas

---

## Estrategia de Conexión (Pool)

### Configuración del Pool

```typescript
mariadb.createPool({
  connectionLimit: 10,      // Máximo 10 conexiones simultáneas
  acquireTimeout: 30000,    // 30s para obtener conexión
  idleTimeout: 60000,       // 60s antes de cerrar conexión inactiva
})
```

### Análisis de Capacidad

**Con 10 conexiones:**
- Cada conexión soporta 1 operación a la vez
- Capacidad teórica: ~100-1000 req/s (dependiendo de complejidad)
- Para sistema actual: MÁS QUE SUFICIENTE

**Cuándo aumentar connectionLimit:**
- Más de 50 usuarios concurrentes
- Operaciones con queries lentos
- Múltiples instancias de la aplicación

### Timeouts

**acquireTimeout: 30000ms**
- Tiempo máximo esperando una conexión libre
- Si se supera: error "POOL_ENQUEUED_TIMEOUT"
- Indica: Pool saturado o queries muy lentos

**idleTimeout: 60000ms**
- Conexión sin usar se cierra después de 60s
- Libera recursos en el servidor
- Balance entre reutilización y recursos

### Helpers de DB

**query<T>()** - Para SELECT
```typescript
const clientes = await query<Cliente>('SELECT * FROM clientes')
// Retorna: Cliente[]
```

**execute()** - Para INSERT/UPDATE/DELETE
```typescript
const result = await execute(
  'INSERT INTO clientes (nombre) VALUES (?)',
  ['Nuevo Cliente']
)
// Retorna: UpsertResult con insertId, affectedRows, etc.
```

**formatDateForDB()** - Conversión de fechas
```typescript
formatDateForDB('2024-01-15') // → '2024-01-15'
formatDateForDB(new Date())   // → '2024-11-24'
formatDateForDB(null)         // → null
```

---

## Seguridad

### Vulnerabilidades Actuales

**1. Credenciales hardcodeadas (lib/db.ts:6-8)**
```typescript
user: process.env.DB_USER || 'emprendi2',
password: process.env.DB_PASSWORD || '56Ghambju!',
```
- ⚠️ CRÍTICO: Credenciales en código fuente
- ⚠️ Visibles en repositorio
- ⚠️ Pueden ser comprometidas

**Solución:**
```typescript
user: process.env.DB_USER!,  // Sin fallback
password: process.env.DB_PASSWORD!,
```
Y validar al inicio:
```typescript
if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
  throw new Error('DB credentials not configured')
}
```

### Protección contra SQL Injection

**✅ BIEN IMPLEMENTADO:**
El sistema usa placeholders (?) en todas las queries:
```typescript
await query('SELECT * FROM clientes WHERE id = ?', [id])
```

**NO se encontraron:**
- Concatenación de strings SQL
- Inyección directa de valores

### Permisos de Usuario DB

**Usuario actual: emprendi2**
- Se recomienda verificar permisos con:
```sql
SHOW GRANTS FOR 'emprendi2'@'localhost';
```

**Principio de mínimo privilegio:**
- Solo necesita: SELECT, INSERT, UPDATE, DELETE
- NO necesita: DROP, CREATE, ALTER, GRANT

### Recomendaciones Adicionales

1. **Usar SSL/TLS para conexión:**
```typescript
ssl: {
  ca: fs.readFileSync('/path/to/ca.pem'),
}
```

2. **Implementar rate limiting** en API endpoints

3. **Auditoría de acceso:**
- Agregar campo `modified_by_user_id`
- Log de operaciones críticas (eliminaciones)

4. **Backup automático:**
```bash
mysqldump -u root control_db > backup_$(date +%Y%m%d).sql
```

---

## Recomendaciones de Mejora

### Prioridad Alta

**1. Agregar índices en operaciones_compra**
```sql
CREATE INDEX idx_fecha ON operaciones_compra(fecha);
CREATE INDEX idx_proveedor ON operaciones_compra(proveedor);
```
**Impacto:** Mejora drástica en reportes y búsquedas

**2. Normalizar proveedores**
```sql
CREATE TABLE proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE operaciones_compra
  ADD COLUMN proveedor_id INT,
  ADD FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);
```
**Impacto:** Integridad de datos, información adicional de proveedores

**3. Remover credenciales hardcodeadas**
**Impacto:** Seguridad crítica

### Prioridad Media

**4. Agregar soft delete**
```sql
ALTER TABLE clientes ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE revendedores ADD COLUMN deleted_at TIMESTAMP NULL;
```
**Impacto:** Recuperación de datos eliminados accidentalmente

**5. Normalizar geografía**
```sql
CREATE TABLE provincias (id INT PRIMARY KEY, nombre VARCHAR(100));
CREATE TABLE localidades (id INT PRIMARY KEY, provincia_id INT, nombre VARCHAR(100));
```
**Impacto:** Consistencia de datos, búsquedas más eficientes

**6. Agregar tabla de auditoría**
```sql
CREATE TABLE audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(50),
  record_id INT,
  action ENUM('INSERT', 'UPDATE', 'DELETE'),
  old_values JSON,
  new_values JSON,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Impacto:** Trazabilidad completa de cambios

### Prioridad Baja

**7. Agregar validaciones a nivel DB**
```sql
ALTER TABLE clientes
  ADD CONSTRAINT chk_email_format
  CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');
```

**8. Implementar particionamiento** (solo si crece mucho)
```sql
ALTER TABLE operaciones_compra
PARTITION BY RANGE (YEAR(fecha)) (
  PARTITION p2023 VALUES LESS THAN (2024),
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026)
);
```

---

## Monitoreo y Mantenimiento

### Queries de Monitoreo

**1. Tamaño de tablas**
```sql
SELECT
  table_name,
  ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Tamaño MB'
FROM information_schema.tables
WHERE table_schema = 'control_db'
ORDER BY (data_length + index_length) DESC;
```

**2. Estado de índices**
```sql
SELECT
  table_name,
  index_name,
  cardinality,
  CASE
    WHEN cardinality = 0 THEN 'ÍNDICE NO USADO'
    ELSE 'OK'
  END as estado
FROM information_schema.statistics
WHERE table_schema = 'control_db';
```

**3. Conexiones activas**
```sql
SHOW PROCESSLIST;
```

**4. Queries lentos**
```sql
-- Habilitar slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2; -- queries > 2 segundos
```

### Tareas de Mantenimiento

**Diario:**
- ✅ Verificar backups automáticos

**Semanal:**
- ✅ Revisar slow query log
- ✅ Verificar tamaño de tablas

**Mensual:**
- ✅ OPTIMIZE TABLE (si hay muchas eliminaciones/actualizaciones)
```sql
OPTIMIZE TABLE operaciones_compra;
```
- ✅ Revisar plan de ejecución de queries críticos
```sql
EXPLAIN SELECT ... ;
```

**Trimestral:**
- ✅ Analizar índices no utilizados
- ✅ Revisar estrategia de particionamiento (si aplica)

---

## Backup y Recuperación

### Estrategia de Backup Recomendada

**1. Backup completo diario**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root control_db \
  --single-transaction \
  --quick \
  --lock-tables=false \
  | gzip > /backups/control_db_$DATE.sql.gz

# Retener últimos 30 días
find /backups -name "control_db_*.sql.gz" -mtime +30 -delete
```

**2. Backup incremental (binlog)**
```bash
# Habilitar binary logging en MariaDB config
[mysqld]
log-bin=mysql-bin
expire_logs_days=7
```

**3. Backup de estructura**
```bash
mysqldump -u root control_db \
  --no-data \
  --routines \
  --triggers \
  > schema_only.sql
```

### Restauración

**Restauración completa:**
```bash
mysql -u root control_db < backup.sql
```

**Restauración de tabla individual:**
```bash
mysql -u root control_db < backup.sql --one-database \
  -e "SOURCE backup.sql; DROP TABLE IF EXISTS clientes; CREATE TABLE clientes ..."
```

### Verificación de Backups

```bash
# Restaurar en DB temporal y verificar
mysql -u root -e "CREATE DATABASE test_restore"
mysql -u root test_restore < backup.sql
mysql -u root -e "SELECT COUNT(*) FROM test_restore.operaciones_compra"
mysql -u root -e "DROP DATABASE test_restore"
```

---

## Resumen Ejecutivo

### Estado Actual del Sistema

**✅ Fortalezas:**
1. Diseño relacional claro y bien estructurado
2. Integridad referencial bien implementada
3. Uso inteligente de columnas generadas para cálculos automáticos
4. Auditoría temporal en todas las tablas
5. Uso correcto de prepared statements (protección SQL injection)
6. Pool de conexiones bien configurado

**⚠️ Áreas de Mejora:**
1. Credenciales hardcodeadas (CRÍTICO)
2. Falta de índices en operaciones_compra
3. Proveedores sin normalizar
4. Geografía sin normalizar
5. Sin historial de cambios (audit log)
6. Sin soft delete

**📊 Métricas Clave:**
- Tablas: 4
- Relaciones FK: 4
- Columnas generadas: 4
- Tamaño actual: 128 KB
- Tamaño proyectado (1 año): 50-100 MB
- Nivel de normalización: 2NF-3NF (parcial)

### Arquitectura de Datos

```
JERARQUÍA:
revendedores (entidad raíz)
  ↓
clientes (1:N desde revendedores)
  ↓
sucursales (1:N desde clientes, N:1 hacia revendedores)

operaciones_compra (independiente)
```

### Decisiones de Diseño Destacadas

1. **Columnas generadas STORED:** Garantiza integridad de cálculos
2. **SET NULL en lugar de CASCADE:** Protege datos históricos
3. **Sin tabla de proveedores:** Flexibilidad vs normalización
4. **Índices selectivos:** Optimizado para escritura en operaciones

### Próximos Pasos Recomendados

1. **Inmediato:** Remover credenciales hardcodeadas
2. **Corto plazo:** Agregar índices en operaciones_compra
3. **Medio plazo:** Normalizar proveedores
4. **Largo plazo:** Implementar audit log y soft delete

---

## Conclusión

El sistema está bien diseñado para su propósito actual, con decisiones arquitectónicas inteligentes como el uso de columnas generadas y una jerarquía relacional clara. Las principales áreas de mejora están en seguridad (credenciales), optimización de queries (índices) y normalización completa (proveedores y geografía).

El diseño permite escalar fácilmente y las mejoras propuestas son incrementales, sin necesidad de refactorizaciones mayores.

---

**Documento generado:** 2025-11-24
**Base de datos:** control_db
**Versión MariaDB:** 10.6.22
**Análisis realizado por:** Claude Code
