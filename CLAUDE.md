# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sistema de Control** - A Next.js 15 application with two main subsystems:
1. **CustomTable (Tableros)** - Advanced table component with inline editing, 15 column types, and Kanban view
2. **WhatsApp CRM** - Multi-session WhatsApp automation with AI conversations and sequences

**Stack:** Next.js 15 | React 19 | TypeScript 5 | Tailwind CSS 4 | MariaDB | Baileys (WhatsApp) | OpenAI GPT

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Next.js dev server (port 4850)
pnpm build            # Production build
pnpm start            # Production server (port 4444)
pnpm lint             # ESLint
```

## Production URL

**https://crm.onia.agency** (puerto 4444)

## Architecture

### Key Directories

```
app/
├── api/
│   ├── whatsapp/sessions/       # Session management (start/stop/logout)
│   ├── whatsapp/triggers/       # Reload sequence triggers
│   └── {table}/route.ts         # CRUD for each table
├── whatsapp/                    # WhatsApp UI pages
└── sistema-control/page.tsx     # Main CRM tabs page

lib/
├── db.ts                        # MariaDB pool (mysql2/promise)
├── validators/                  # SOLID validators (Strategy + Composer)
├── hooks/                       # useTableData, useDynamicColumns, useSelectOptions
└── whatsapp/
    ├── types.ts                 # All TypeScript interfaces
    ├── config.ts                # Constants and env vars
    ├── models/                  # DB entities with static methods
    ├── services/                # Business logic (DataStore, SequenceEngine, AIConversation)
    ├── client/WhatsAppClient.ts # Baileys wrapper
    └── manager/WhatsAppSessionManager.ts  # Singleton for multi-session

CustomTable/
├── index.tsx                    # Root component with TableEditContext
├── CustomTableColumnsConfig.tsx # 15 column type renderers + buildColumnsFromDefinition()
├── TableView/                   # Table mode (selection, resize, inline edit)
├── BoardView/                   # Kanban mode
├── hooks/                       # useCustomTableLogic, useCellEditingOrchestration
├── toolbar/                     # FiltersToolbar + filter components
├── services/CellDataService.ts  # Edit orchestrator
└── repositories/                # Local + Remote data repos
```

## CustomTable - Advanced Data Table Component

### Architecture Overview

CustomTable is a feature-rich table component built on `@tanstack/react-table` with:

```
CustomTable/
├── index.tsx                     # Root: TableEditContext provider, view switching
├── CustomTableColumnsConfig.tsx  # Column types + buildColumnsFromDefinition()
├── TableView/                    # Spreadsheet mode
│   ├── index.tsx                 # Main table renderer
│   ├── hooks/
│   │   ├── useInlineCellEdit.ts  # Cell editing with keyboard navigation
│   │   ├── useCellSelection.ts   # Multi-cell selection (like Excel)
│   │   ├── useColumnResize.ts    # Drag-to-resize columns
│   │   └── useClipboardCopy.ts   # Copy selected cells
│   ├── subcomponents/
│   │   ├── TableHeader.tsx       # Sortable headers
│   │   ├── TableBody.tsx         # Cell rendering + inline editing
│   │   ├── CustomSelectDropdown.tsx  # Badge/select editor with Notion colors
│   │   └── ColumnFilterPopover.tsx   # Per-column filtering
│   └── logic/
│       ├── selectionLogic.ts     # Selection state management
│       └── dragLogic.ts          # Drag selection handling
├── BoardView/                    # Kanban mode
│   ├── index.tsx                 # Kanban container
│   ├── BoardColumn.tsx           # Single column with cards
│   └── BoardCard.tsx             # Draggable card
├── hooks/
│   ├── useCustomTableLogic.ts    # Core: filtering, sorting, pagination, export
│   ├── useCellEditingOrchestration.ts  # Edit lifecycle management
│   └── filterFlow.ts             # Filter pipeline
├── services/CellDataService.ts   # Orchestrator: local + remote updates
├── repositories/
│   ├── LocalTableDataRepository.ts   # LocalStorage persistence
│   └── RemoteCellUpdateRepository.ts # API PUT calls
└── theme/colors.ts               # SYNARA color palette (light/dark)
```

### Component Props (CustomTableProps)

```typescript
<CustomTable
  data={rows}                    // Array of objects with 'id' field
  columnsDef={columns}           // From buildColumnsFromDefinition()
  pageSize={50}                  // Rows per page (default: 500)
  loading={false}                // Show loading overlay
  showFiltersToolbar={true}      // Show search + export bar
  containerHeight="100%"         // CSS height
  rowHeight={26}                 // Row height in pixels
  onCellEdit={handleEdit}        // (rowId, colId, newValue) => void
  onRefresh={refetch}            // Refresh button handler
  onAddRecord={handleAdd}        // Add button handler
  addRecordState="idle"          // 'idle' | 'loading' | 'success' | 'error'
/>
```

### Column Types (15 available)

| Type | Description | Key Props | Editable |
|------|-------------|-----------|----------|
| `text` | Plain text | - | Yes |
| `numeric` | Formatted numbers (locale) | - | Yes (numeric input) |
| `currency` | Money with symbol | `currencySymbol`, `currencyLocale` | Yes |
| `percentage` | Value + % symbol | - | Yes |
| `date` | DD/MM/YYYY format | - | Yes |
| `badge` | Notion-style colored tags | `options`, `allowCreate` | Yes (dropdown) |
| `avatar` | Circle initials + name | - | Yes |
| `select` | Dropdown selector | `options`, `useDynamicOptions` | Yes |
| `foreignKey` | FK with avatar display | `foreignKeyField`, `displayField`, `dataset` | Yes (dropdown) |
| `rating` | Star rating (0-5) | `min`, `max` | No |
| `progress` | Color-coded progress bar | `min`, `max` | No |
| `heatmap` | Gradient background | `min`, `max`, `colorScale` | No |
| `sparkline` | Mini bar chart | - | No |
| `country` | Flag + country name | - | No |
| `link` | Clickable URL | - | No |

### FieldDef Interface (Column Configuration)

```typescript
type FieldDef = {
  type?: FieldType;              // Column type (default: 'text')
  header?: string;               // Column header text
  width?: number;                // Column width in pixels
  editable?: boolean;            // Override editability (auto-detected)
  textAlign?: 'left'|'center'|'right';

  // For badge/select types
  options?: Array<{value: string, label: string}>;
  allowCreate?: boolean;         // Allow creating new options (Notion-style)
  useDynamicOptions?: boolean;   // Load options from API
  dataset?: string;              // API endpoint for dynamic options
  onCreateOption?: (value: string) => Promise<void>;

  // For foreignKey type
  foreignKeyField?: string;      // ID column in DB (e.g., 'responsable_id')
  displayField?: string;         // Name column from JOIN (e.g., 'responsable_nombre')

  // For numeric types (heatmap, progress, rating)
  min?: number;
  max?: number;
  colorScale?: 'red-yellow-green' | 'blue-white-red' | 'purple-orange';

  // For currency type
  currencySymbol?: string;       // Default: '$'
  currencyLocale?: string;       // Default: 'es-ES'
};
```

### Column Definition Example

```typescript
import { buildColumnsFromDefinition } from '@/CustomTable/CustomTableColumnsConfig';

const columns = buildColumnsFromDefinition({
  id: { type: 'numeric', header: 'ID', width: 60, editable: false },
  nombre: { type: 'avatar', header: 'NOMBRE', width: 200 },
  departamento: {
    type: 'badge',
    header: 'DEPARTAMENTO',
    allowCreate: true,  // Users can add new options
    options: [{ value: 'Ventas', label: 'Ventas' }],
  },
  responsable_nombre: {
    type: 'foreignKey',
    header: 'RESPONSABLE',
    foreignKeyField: 'responsable_id',   // ID column in DB
    displayField: 'responsable_nombre',  // Display name (from JOIN)
    dataset: 'revendedores',             // API endpoint for options
  },
  salario: {
    type: 'currency',
    header: 'SALARIO',
    currencySymbol: '$',
    currencyLocale: 'es-AR',
    textAlign: 'right',
  },
  progreso: {
    type: 'progress',
    header: 'AVANCE',
    min: 0,
    max: 100,
  },
  total: { type: 'currency', header: 'TOTAL', editable: false },
});
```

### Key Features

**Inline Editing:**
- Single-click to edit (configurable)
- Keyboard navigation: Enter (save + next row), Tab (save), Escape (cancel), Arrow keys
- Auto-positioned cursor at end of text
- Optimistic updates (UI first, then API)

**Kanban/Board View:**
- Group by any badge/select column
- Drag & drop cards between columns
- Automatic grouping by field values
- Toggle via toolbar button

**Selection & Clipboard:**
- Multi-cell selection (click + drag)
- Copy selection to clipboard
- Excel-like behavior

**Filtering & Sorting:**
- Global search with debouncing
- Per-column filters (popover)
- Click header to sort (desc → asc → none)
- Numeric range filters

**Export:**
- One-click Excel export (.xlsx)
- Exports filtered data
- Uses sheet.js (xlsx library)

### Extending CustomTable

**Adding a New Column Type:**
1. Add type to `FieldType` union in `CustomTableColumnsConfig.tsx:20`
2. Create render function `renderXxxCell(info)`
3. Add case in `buildColumnsFromDefinition()` switch (line 641)
4. Define editability behavior (line 686-713)

**Adding Badge Color:**
Edit `PREDEFINED_BADGE_COLORS` in `CustomTableColumnsConfig.tsx:361` or use automatic hash-based colors.

**Customizing Theme:**
Edit `theme/colors.ts`:
- `SYNARA_COLORS` - Brand colors
- `LIGHT_THEME` / `DARK_THEME` - Full theme objects
- `getTableTheme(isDark)` - Theme selector

**Custom Cell Renderer:**
```typescript
const columns = buildColumnsFromDefinition({
  custom: {
    type: 'text',
    header: 'CUSTOM',
    // Override with custom renderer
    cell: (info) => <MyComponent value={info.getValue()} />,
  },
});
```

### Data Flow (Cell Edit)

```
User edits cell
    ↓
useInlineCellEdit.confirmEdit()
    ↓
TableEditContext.handleConfirmCellEdit()
    ↓
onCellEdit prop (if provided) OR useCellEditingOrchestration
    ↓
CellDataService.updateCellValue()
    ├── LocalTableDataRepository.saveAllRows() [localStorage]
    └── RemoteCellUpdateRepository.updateCell() [API PUT]
```

### Badge Color System (Notion-style)

Automatic color assignment based on string hash:
- `getColorFromString(value, isDarkMode)` - Hash-based color
- `getBadgeColors(value, isDarkMode)` - With predefined fallbacks
- `NOTION_COLOR_PALETTE` - 8 color pairs (light/dark modes)
- Colors are consistent: same value = same color always

## Adding New Tables

### 1. Create API Route (`app/api/mi-tabla/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { TableFieldValidator } from '@/lib/validators/TableFieldValidator';

export const dynamic = 'force-dynamic';
const validator = new TableFieldValidator();

// GET - List all with JOINs for foreign keys
export async function GET() {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT t.*, r.nombre as responsable_nombre
    FROM mi_tabla t
    LEFT JOIN revendedores r ON t.responsable_id = r.id
  `);
  return NextResponse.json(rows);
}

// PUT - Update single field with validation
export async function PUT(request: NextRequest) {
  const { id, field, value } = await request.json();

  const result = await validator.validateField('mi_tabla', field, value);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  await pool.execute(`UPDATE mi_tabla SET ${field} = ? WHERE id = ?`, [result.data, id]);
  return NextResponse.json({ success: true });
}
```

### 2. Add Validators (`lib/validators/TableFieldValidator.ts`)

```typescript
this.validators.set('mi_tabla', new Map([
  ['nombre', { validators: [new TextValidator(2, 200, false)] }],
  ['email', { validators: [new EmailValidator()] }],
  ['responsable_id', {
    validators: [this.fkValidator],
    context: { tableName: 'revendedores', allowNull: true },
  }],
]));
```

### 3. Define Columns (`sistema-control/page.tsx`)

```typescript
const miTablaColumns = buildColumnsFromDefinition({
  id: { type: 'numeric', header: 'ID', editable: false },
  nombre: { type: 'avatar', header: 'NOMBRE' },
  // ... more columns
});
```

### 4. Add Tab with CustomTable

```tsx
<CustomTable
  data={miTablaData}
  columnsDef={miTablaColumns}
  loading={loading}
  onRefresh={fetchMiTabla}
  onCellEdit={handleCellEdit}
/>
```

## WhatsApp Architecture (Pure Next.js)

```
Next.js API Routes + WhatsAppSessionManager (singleton)
    ├── Single "default" session (auto-created)
    ├── Shared triggersMap across all sessions
    └── Per-session: DataStore, SendQueue, SequenceEngine, AIConversation, WhatsAppClient

Polling: UI polls /api/whatsapp/sessions every 2 seconds for status updates
Session state stored in memory (WhatsAppSessionManager)
```

### Message Flow

```
Incoming Message → WhatsAppClient.messages.upsert
    ↓
Dedup check (WA:{id} or GEN:{sha1})
    ↓
DataStore.logMessage() → Outbox → Message.create()
    ↓
AIConversation.shouldStartConversation() (IA decision)
    ├── Check VIP phones (trigger_vip_phones)
    ├── Check ignored contacts list
    └── GPT analyzes message with trigger_* config
    ↓ (if should start)
AIConversation.startConversation() → GPT response
    ↓ (if not handled)
SequenceEngine.onIncomingMessage()
    ↓
Trigger matching: exact → substring → word → fuzzy 70%
    ↓
SequenceLog.startSequence() + silence detection loop
```

## Key Business Rules

1. **Contact Name Filter**: Auto-sequences only trigger for contacts with allowed names (configured in `ContactValidator.ts`)
2. **24h Contact Age**: Auto-sequences only for contacts created within 24 hours
3. **AI Conversation Mission**: Obtain 3 data points naturally: zona, acción (COMPRA/ALQUILER), presupuesto
4. **Trigger Matching Priority**: Exact → Substring → Word boundary → Fuzzy (70% words)
5. **Silence Detection**: Steps 2+ wait for 20s of silence before sending
6. **Outbox Pattern**: Messages queued, flushed every 3s, max 8 retries with exponential backoff

## Important Constants (lib/whatsapp/config.ts)

```typescript
SEQUENCES_ENABLED = false       // Feature flag: enable/disable auto-sequences
WAIT_SILENCE_MS = 20_000        // Silence between sequence steps
BETWEEN_SUB_MS = 2_000          // Delay between sub-messages
SEND_RATE_MIN_DELAY_MS = 2000   // Rate limit
OUTBOX_MAX_ATTEMPTS = 8         // Max retries
POLL_INTERVAL_MS = 60_000       // Agenda poll interval
```

**Note:** When `SEQUENCES_ENABLED = false`:
- Message logging continues (contacts + messages tables)
- Agenda polling continues (action_status = 'ENVIAR')
- AIConversation and SequenceEngine are disabled
- Manual sequence polling is disabled

## API Patterns

### CRUD APIs
```
GET    /api/{table}           # List all (returns array or { success, data })
POST   /api/{table}           # Create { nombre, ... }
PUT    /api/{table}           # Update { id, field, value }
DELETE /api/{table}?id=X      # Delete
```

### Response Format
```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: "message", code?: "VALIDATION_ERROR" }
```

### WhatsApp APIs
```
GET  /api/whatsapp/sessions              # List all sessions
POST /api/whatsapp/sessions              # Create + start { email }
POST /api/whatsapp/sessions/{email}      # Actions { action: start|stop|logout }
DELETE /api/whatsapp/sessions/{email}    # Delete session
POST /api/whatsapp/triggers              # Reload triggers in all sessions
```

## Database Tables

**Base de datos:** `crm_onia`

**WhatsApp CRM:**
- `contacts` - Contactos de WhatsApp
- `messages` - Historial de mensajes
- `sequences` - Secuencias automáticas
- `sequence_steps` - Pasos de secuencias
- `contact_sequence_log` - Log de secuencias por contacto
- `contact_sequence_history` - Historial de secuencias
- `dedup_cache` - Cache de deduplicación
- `outbox` - Cola de mensajes salientes
- `whatsapp_sessions` - Sesiones de WhatsApp

**IA Configuration:**
- `ai_prompt_config` - Configuración de prompts de IA (14 campos)
- `ai_ignored_contacts` - Contactos ignorados temporalmente

## Critical: Don't Break

1. **Method signatures** in `DataStore`, `SequenceEngine`, `WhatsAppClient`, `AIConversation`
2. **DB column names** hardcoded in models (zona, accion, presupuesto)
3. **Dedup key format**: `WA:{id}` or `GEN:{hash}`
4. **JID format**: Always `{phone}@s.whatsapp.net` for 1:1 chats
5. **serverExternalPackages** in next.config.js - Required for Baileys/ws
6. **AIConversation state**: `conversations` Map keys are phone digits, not JIDs
7. **Auth paths**: `auth-ts/{email}/` for WhatsApp credentials (excluded from git)
8. **CustomTable column types**: Renderers in `CustomTableColumnsConfig.tsx`
9. **ForeignKey pattern**: `foreignKeyField` stores ID, `displayField` shows name from JOIN
10. **SEQUENCES_ENABLED flag**: Controls SequenceEngine in `WhatsAppClient.ts`
11. **shouldStartConversation()**: Must use this method (not deprecated isTrigger()) for AI decision

## Conventions

- **Imports:** Use `@/` alias (e.g., `import { Button } from '@/components/ui/button'`)
- **Components:** PascalCase
- **Hooks:** camelCase with `use` prefix
- **API logs:** Use emoji prefixes (`📥`, `✅`, `❌`, `🔧`, `💾`)

## Environment Variables

```bash
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=emprendi2
DB_PASSWORD=56Ghambju!
DB_NAME=crm_onia

# Aplicación
NEXT_PUBLIC_BASE_URL=https://crm.onia.agency
APP_PASSWORD=LOCK                 # Password para desbloquear la app
OPENAI_API_KEY=                   # Para conversaciones con IA
```

## Database Access

```bash
# MariaDB - Sin contraseña
sudo mysql -u root

# Ejemplo de uso
sudo mysql crm_onia -e "SELECT * FROM ai_prompt_config;"
```

## PM2 Production

```bash
pm2 start pnpm --name crm-onia -- start
pm2 logs crm-onia
pm2 restart crm-onia
pm2 flush crm-onia         # Clear logs
```

---

## CRM WhatsApp - Página Premium (`/crm-whatsapp`)

Nueva interfaz premium con Framer Motion para gestión de WhatsApp y configuración de IA.

### Arquitectura

```
app/crm-whatsapp/page.tsx           # Página principal premium
components/crm-whatsapp/
├── StatusIndicator.tsx             # Indicador de estado animado
├── QRCodeDisplay.tsx               # Display de QR con animaciones
├── ActionButton.tsx                # Botones con gradientes y efectos
├── PromptEditor.tsx                # Editor de configuración de IA
└── index.ts                        # Exports

app/api/crm-whatsapp/
└── prompt-config/route.ts          # API para configuración de prompts

lib/whatsapp/services/
└── PromptConfigService.ts          # Servicio de carga/cache de config

lib/whatsapp/types/
└── promptConfig.ts                 # Tipos para configuración de prompts
```

### Sistema de Prompts Personalizables

La IA de conversación ahora usa prompts configurables desde la base de datos.

**Tabla `ai_prompt_config`:**
```sql
CREATE TABLE ai_prompt_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  description VARCHAR(255),
  editable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Claves Editables (14 campos desde UI):**
| Key | Descripción |
|-----|-------------|
| `assistant_name` | Nombre del asistente (ej: "Ana") |
| `mission_fields` | JSON array de campos a obtener |
| `conversation_strategy` | Instrucciones de conversación |
| `question_examples` | Ejemplos de preguntas por campo |
| `mission_complete_message` | Mensaje cuando se completa la misión |
| `extraction_rules` | Reglas de extracción de datos |
| `base_identity` | Identidad base del asistente |
| `unbreakable_rules` | Reglas inquebrantables |
| `trigger_criteria` | Criterio para decidir si iniciar conversación |
| `trigger_examples_positive` | Ejemplos de mensajes que SÍ inician (separados por \|) |
| `trigger_examples_negative` | Ejemplos de mensajes que NO inician (separados por \|) |
| `trigger_vip_phones` | Teléfonos VIP que siempre inician (separados por coma) |
| `trigger_context_instructions` | Instrucciones adicionales de contexto |
| `trigger_ignore_duration_hours` | Horas que un contacto queda ignorado (default: 168) |

### API de Configuración de Prompts

```
GET  /api/crm-whatsapp/prompt-config     # Obtener toda la configuración
PUT  /api/crm-whatsapp/prompt-config     # Actualizar { config_key, config_value }
POST /api/crm-whatsapp/prompt-config     # Recargar en sesiones activas
```

### MissionField Interface

```typescript
interface MissionField {
  key: string;           // Identificador único (ej: "zona")
  label: string;         // Nombre para mostrar (ej: "ZONA")
  description: string;   // Descripción del campo
  dbColumn: string;      // Columna en tabla contacts
  type: 'string' | 'number' | 'enum';
  values?: string[];     // Solo para type='enum'
}
```

### Flujo de Recarga de Config

```
Usuario edita en PromptEditor
    ↓
PUT /api/crm-whatsapp/prompt-config
    ↓
POST /api/crm-whatsapp/prompt-config (recargar)
    ↓
WhatsAppSessionManager.reloadPromptConfig()
    ↓
AIConversation.reloadConfig() (por cada sesión)
    ↓
PromptConfigService.invalidateCache()
    ↓
Nueva config se usa en próximo mensaje
```

### Componentes Premium

**StatusIndicator**: Indicador de estado con pulso animado
```tsx
<StatusIndicator status="connected" size="md" showLabel={true} />
```

**QRCodeDisplay**: Display de QR con transiciones suaves
```tsx
<QRCodeDisplay qrCode={qrString} status="qr_pending" />
```

**ActionButton**: Botones con gradientes y efectos shimmer
```tsx
<ActionButton variant="success" onClick={handleStart} loading={false}>
  Iniciar
</ActionButton>
```

**PromptEditor**: Editor completo con tabs (Identidad, Misión, Estrategia, Reglas)
```tsx
<PromptEditor
  config={promptConfig}
  loading={false}
  onSave={handleSave}
  onReload={handleReload}
/>
```

### Vistas Disponibles

1. **Sesión**: Control de conexión WhatsApp (QR, iniciar, detener, logout)
2. **Configuración IA**: Editor de prompts con 4 tabs:
   - Identidad: Nombre del asistente
   - Misión: Campos a obtener, preguntas, reglas de extracción
   - Estrategia: Instrucciones de conversación
   - Reglas: Reglas inquebrantables (solo lectura)

### AI Trigger Decision Flow

```
Mensaje entrante
    ↓
TriggerDecisionService.decideTrigger()
    ├── 1. Check VIP (trigger_vip_phones) → Inicio automático
    ├── 2. Check ignorados (ai_ignored_contacts) → Skip
    └── 3. GPT analiza con trigger_criteria + examples
    ↓
Si shouldStart=false → addToIgnored() por trigger_ignore_duration_hours
Si shouldStart=true → AIConversation.startConversation()
```

**Tablas relacionadas:**
- `ai_prompt_config`: Configuración de prompts (14 campos)
- `ai_ignored_contacts`: Contactos ignorados temporalmente

### Critical: Don't Break (CRM WhatsApp)

12. **ai_prompt_config table**: 14 campos obligatorios (incluyendo trigger_*)
13. **PromptConfigService cache**: TTL de 60 segundos
14. **AIConversation.reloadConfig()**: Interfaz IAIConversation
15. **MissionField.dbColumn**: Mapeo a columnas de contacts
16. **TriggerDecisionService**: Usa todos los campos trigger_* de la config
17. **WhatsAppClient.shouldStartConversation()**: No usar isTrigger() deprecado
