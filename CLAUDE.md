# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nexus CRM** - Next.js 15 application for WhatsApp automation with AI conversations.

**Stack:** Next.js 15 | React 19 | TypeScript 5 | Tailwind CSS 4 | MariaDB | Baileys (WhatsApp) | OpenAI GPT

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server (port 9999)
pnpm build            # Production build
pnpm start            # Production server (port 26000)
pnpm lint             # ESLint
```

## Production

- **URL:** https://delegar.space
- **PM2:** `pm2 restart agentewhatsapp`

## Architecture

```
app/
├── page.tsx                     # Landing page (public)
├── login/                       # Google OAuth login
├── agente-whatsapp/             # Main dashboard (protected)
├── crm-whatsapp/                # WhatsApp CRM interface
└── api/
    ├── auth/                    # login, register, verify, logout, google/, pre-register/
    ├── whatsapp/sessions/       # Session management (start/stop/logout)
    ├── whatsapp/triggers/       # Reload sequence triggers
    ├── crm-whatsapp/prompt-config/  # AI prompt configuration
    └── {table}/route.ts         # CRUD endpoints

lib/
├── auth.ts                      # JWT + bcrypt authentication
├── auth-client.ts               # Frontend auth utilities
├── db.ts                        # MariaDB pool (mysql2/promise)
├── validators/                  # TableFieldValidator (SOLID pattern)
└── whatsapp/
    ├── config.ts                # Constants and feature flags
    ├── types.ts                 # TypeScript interfaces
    ├── models/                  # DB entities (Contact, Message, Sequence)
    ├── services/                # DataStore, SequenceEngine, AIConversation
    ├── client/WhatsAppClient.ts # Baileys wrapper
    ├── manager/WhatsAppSessionManager.ts  # Singleton for sessions
    └── utils/sessionValidator.ts # Check if credentials exist

CustomTable/                     # Advanced table component (@tanstack/react-table)
├── CustomTableColumnsConfig.tsx # 15 column types + buildColumnsFromDefinition()
├── TableView/                   # Spreadsheet mode (inline edit, selection)
├── BoardView/                   # Kanban mode
├── hooks/                       # useCustomTableLogic, useCellEditingOrchestration
└── services/CellDataService.ts  # Local + remote updates

components/
├── landing/                     # Hero, Features, Pricing, FAQ, etc.
├── crm-whatsapp/                # StatusIndicator, QRCodeDisplay, PromptEditor
└── ui/                          # Radix UI components
```

## Authentication

- **Method:** JWT (cookie `auth_token`, 7 days)
- **Password:** bcryptjs
- **Roles:** `admin` | `user`
- **Public routes:** `/`, `/login`, `/api/auth/*`, `/no-autorizado`
- **Google OAuth:** `/api/auth/google/`

```typescript
// middleware.ts protects all routes except PUBLIC_PATHS
// lib/auth.ts handles JWT creation/verification
```

## WhatsApp Integration

### Auto-Start (instrumentation.ts)

```typescript
// Only auto-connects if valid credentials exist in auth-ts/{SESSION_ID}/
const hasSession = hasValidSession(SESSION_ID);
if (hasSession) {
  setTimeout(() => manager.startSession(SESSION_ID), 3000);
}
```

### Message Flow

```
Incoming → Dedup check → DataStore.logMessage()
    → AIConversation.shouldStartConversation() (GPT decision)
    → SequenceEngine.onIncomingMessage() (trigger matching)
```

### Key Config (lib/whatsapp/config.ts)

```typescript
SEQUENCES_ENABLED = true        // Feature flag
WAIT_SILENCE_MS = 20_000        // Between sequence steps
QR_TIMEOUT_MAX_RETRIES = 3      // QR scan attempts
REPLACED_RETRY_LIMIT = 3        // Reconnection attempts
```

## CustomTable

15 column types: `text`, `numeric`, `currency`, `percentage`, `date`, `badge`, `avatar`, `select`, `foreignKey`, `rating`, `progress`, `heatmap`, `sparkline`, `country`, `link`

```typescript
import { buildColumnsFromDefinition } from '@/CustomTable/CustomTableColumnsConfig';

const columns = buildColumnsFromDefinition({
  id: { type: 'numeric', header: 'ID', editable: false },
  nombre: { type: 'avatar', header: 'NOMBRE' },
  estado: { type: 'badge', header: 'ESTADO', allowCreate: true },
  responsable_nombre: {
    type: 'foreignKey',
    foreignKeyField: 'responsable_id',
    displayField: 'responsable_nombre',
    dataset: 'revendedores',
  },
});
```

## API Patterns

```
GET    /api/{table}           # List with JOINs
POST   /api/{table}           # Create with validation
PUT    /api/{table}           # Update { id, field, value }
DELETE /api/{table}?id=X      # Delete
```

## Database

**Name:** `agentewhatsapp_db`

```bash
sudo mysql -u root agentewhatsapp_db -e "SELECT * FROM users;"
```

**Key tables:** `users`, `contacts`, `messages`, `sequences`, `sequence_steps`, `outbox`, `ai_prompt_config`, `ai_ignored_contacts`

## Environment Variables

```bash
DB_HOST=localhost
DB_NAME=agentewhatsapp_db
DB_USER=<user>
DB_PASSWORD=<password>

NEXT_PUBLIC_BASE_URL=https://delegar.space
OPENAI_API_KEY=<key>

JWT_SECRET=<secret>
DEFAULT_ADMIN_EMAIL=<email>
DEFAULT_ADMIN_PASSWORD=<password>

GOOGLE_CLIENT_ID=<client_id>
GOOGLE_CLIENT_SECRET=<client_secret>

WHATSAPP_SESSION_ID=agentewhatsapp
```

## Critical Rules

### CSS/Layout
- NO `transform` animations on containers with CustomTable (breaks fixed positioning)
- Use `style={{ transform: 'none' }}` on motion.div with CustomTable
- CustomTable modals use Portal with zIndex 99999

### Code
1. **Dedup key format:** `WA:{id}` or `GEN:{hash}`
2. **JID format:** `{phone}@s.whatsapp.net`
3. **serverExternalPackages** in next.config.js required for Baileys
4. **Auth credentials:** stored in `auth-ts/{SESSION_ID}/` (gitignored)
5. **Cookie name:** `auth_token` must match in middleware.ts and lib/auth.ts
6. **JWT_SECRET:** must match in middleware.ts and lib/auth.ts

## Conventions

- **Imports:** Use `@/` alias
- **Components:** PascalCase
- **Hooks:** camelCase with `use` prefix
- **Logs:** Emoji prefixes (`📥`, `✅`, `❌`, `🔧`, `💾`)
