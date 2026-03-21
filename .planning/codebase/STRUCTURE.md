# Codebase Structure

**Analysis Date:** 2026-03-22

## Directory Layout

```
plotted/
├── src/
│   ├── app/                          # Application bootstrap and routing
│   │   ├── index.tsx                 # Entry point, provider setup
│   │   ├── routes/
│   │   │   ├── index.ts              # Routes barrel export
│   │   │   └── routes.tsx            # Routing logic, auth-based rendering
│   │   ├── providers/
│   │   │   ├── ErrorBoundary/        # Global error boundary wrapper
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts              # Providers barrel export
│   │   └── styles/
│   │       └── index.css             # Global styles, Tailwind setup
│   │
│   ├── pages/                        # Page-level components (full screen compositions)
│   │   └── home/
│   │       ├── index.ts              # HomePage barrel export
│   │       └── ui/
│   │           └── HomePage.tsx      # Home page component
│   │
│   ├── widgets/                      # Large reusable UI blocks
│   │   └── header/
│   │       ├── index.ts              # Header barrel export
│   │       └── ui/
│   │           └── Header.tsx        # App header with branding and user menu
│   │
│   ├── features/                     # User-executable features with business value
│   │   └── todo/
│   │       ├── index.ts              # AddTodo, TodoItem barrel exports
│   │       ├── lib/                  # Feature-specific hooks
│   │       │   ├── use-todo-query.ts # Query hook for fetching todos
│   │       │   └── use-todo-mutation.ts # Mutation hook for CRUD operations
│   │       ├── model/                # Business logic and data models
│   │       │   ├── todo.ts           # Todo interface definition
│   │       │   └── form-state.ts     # Form state interface
│   │       └── ui/
│   │           ├── add-todo/
│   │           │   └── AddTodo.tsx   # Add todo form component
│   │           └── todo-item/
│   │               └── TodoItem.tsx  # Todo item display and edit component
│   │
│   ├── shared/                       # Project-wide shared utilities (no business domain)
│   │   ├── api/
│   │   │   ├── index.ts              # API barrel, exports convexApi and Id type
│   │   │   └── convex/
│   │   │       ├── _generated/       # Auto-generated Convex types (DO NOT EDIT)
│   │   │       │   ├── api.d.ts      # Type-safe API reference
│   │   │       │   ├── dataModel.d.ts # Database schema types
│   │   │       │   └── server.d.ts   # Server-side type definitions
│   │   │       ├── auth.config.ts    # Convex Clerk auth configuration
│   │   │       ├── schema.ts         # Convex database schema definition
│   │   │       └── todos.ts          # Todo queries and mutations
│   │   ├── lib/
│   │   │   ├── index.ts              # Utility exports
│   │   │   └── utils.ts              # Helper functions (cn for classname merging)
│   │   └── ui/
│   │       ├── Button/
│   │       │   ├── Button.tsx        # Button component with CVA variants
│   │       │   └── index.ts
│   │       ├── Field/
│   │       │   ├── Field.tsx         # Form field wrapper component
│   │       │   └── index.ts
│   │       ├── Input/
│   │       │   ├── Input.tsx         # Input field component
│   │       │   └── index.ts
│   │       ├── Item/
│   │       │   ├── Item.tsx          # Compound list item component
│   │       │   └── index.ts
│   │       ├── Label/
│   │       │   ├── Label.tsx         # Form label component
│   │       │   └── index.ts
│   │       ├── Separator/
│   │       │   ├── Separator.tsx     # Visual divider component
│   │       │   └── index.ts
│   │       └── Skeleton/
│   │           ├── Skeleton.tsx      # Loading placeholder component
│   │           └── index.ts
│   │
│   └── vite-env.d.ts                # Vite type declarations
│
├── index.html                        # HTML entry point
├── vite.config.ts                    # Vite build and dev server config
├── tsconfig.json                     # TypeScript root config
├── tsconfig.app.json                # TypeScript app config
├── package.json                      # Dependencies and scripts
├── convex.json                       # Convex backend configuration
├── playwright.config.ts              # E2E test configuration
└── [Config files]                    # ESLint, Prettier, Tailwind, Wrangler, etc.
```

## Directory Purposes

**src/app:**

- Purpose: Application bootstrap, route setup, global error handling
- Contains: React StrictMode wrapper, provider composition (Clerk, Convex), routing logic, global CSS
- Key files: `index.tsx` (entry point), `routes/routes.tsx` (conditional routing based on auth)

**src/pages:**

- Purpose: Full-page screen components representing distinct routes
- Contains: Page-level UI compositions, page-specific layout
- Key files: `home/ui/HomePage.tsx` (main authenticated app view)

**src/widgets:**

- Purpose: Large, independently useful UI blocks combining multiple features
- Contains: Header with user menu, potentially sidebars, footers
- Key files: `header/ui/Header.tsx` (app header with branding and user auth UI)

**src/features:**

- Purpose: Self-contained, user-facing features (CRUD operations, interactions)
- Contains: Feature-specific UI, hooks, business logic tied to feature domain
- Key files: `todo/lib/` (query/mutation hooks), `todo/ui/` (components), `todo/model/` (types)

**src/shared:**

- Purpose: Reusable utilities available to all layers; project-specific but domain-agnostic
- Contains: UI component library, API client configuration, helper functions
- Key files: `api/convex/` (backend integration), `ui/` (shadcn-style components), `lib/` (utilities)

**src/shared/api/convex:**

- Purpose: Backend API integration using Convex real-time database
- Contains: Query/mutation definitions, database schema, auto-generated types
- Key files: `todos.ts` (CRUD operations), `schema.ts` (table definitions), `auth.config.ts` (Clerk integration)

## Key File Locations

**Entry Points:**

- `index.html`: Browser entry point, mounts React app to #root element
- `src/app/index.tsx`: React app initialization, provider setup, root render call
- `src/app/routes/routes.tsx`: Route logic, conditional rendering based on auth state

**Configuration:**

- `convex.json`: Convex backend config, points to `src/shared/api/convex/`
- `vite.config.ts`: Build config, Tailwind/React/Cloudflare plugins, test setup
- `tsconfig.json`: TypeScript compiler options, references `tsconfig.app.json`
- `package.json`: Dependencies (React 19, Convex, Clerk, Tailwind), scripts (dev, build, test, lint)

**Core Logic:**

- `src/features/todo/lib/use-todo-query.ts`: Fetch todos with loading state
- `src/features/todo/lib/use-todo-mutation.ts`: Mutation hooks for add/edit/delete
- `src/shared/api/convex/todos.ts`: Backend query/mutation handlers
- `src/shared/api/convex/schema.ts`: Database table and index definitions

**Testing:**

- `playwright.config.ts`: E2E test configuration
- `.env.dev`, `.env.prod`: Environment variables for different environments

## Naming Conventions

**Files:**

- **PascalCase for components:** `HomePage.tsx`, `AddTodo.tsx`, `TodoItem.tsx`
- **kebab-case for directories:** `add-todo/`, `todo-item/`, `form-state.ts`
- **camelCase for utilities/hooks:** `use-todo-query.ts`, `use-todo-mutation.ts`, `utils.ts`
- **kebab-case for CSS/config files:** `.env.dev`, `playwright.config.ts`

**Directories:**

- **Plural for layer/slice containers:** `src/pages/`, `src/features/`, `src/widgets/`, `src/shared/`
- **Singular for specific slices:** `src/pages/home/`, `src/features/todo/`, `src/widgets/header/`
- **Lowercase for segments:** `ui/`, `lib/`, `model/`, `api/`

**Components:**

- **Compound components (composed in other components):** `Item`, `ItemContent`, `ItemActions`, `Field`, `FieldError`
- **Standalone page/feature components:** `HomePage`, `AddTodo`, `TodoItem`, `Header`
- **Primitive UI from `shared/ui/`:** `Button`, `Input`, `Label`, `Skeleton`

## Where to Add New Code

**New Feature (e.g., adding "Notes" feature):**

```
src/features/notes/
├── index.ts                    # Public API: export { NotesList } from "./ui/NotesList"
├── lib/
│   ├── use-notes-query.ts      # Hook to fetch notes
│   └── use-notes-mutation.ts   # Hook to CRUD notes
├── model/
│   ├── note.ts                 # Interface: Note { id, title, content }
│   └── form-state.ts           # Interface: FormState { error? }
└── ui/
    ├── add-note/
    │   └── AddNote.tsx         # Form component to create note
    └── note-item/
        └── NoteItem.tsx        # Component to display/edit note
```

- Primary code: `src/features/notes/`
- Hooks: `src/features/notes/lib/use-*.ts`
- Models/types: `src/features/notes/model/`
- UI components: `src/features/notes/ui/`

**New Page (e.g., Settings page):**

```
src/pages/settings/
├── index.ts                    # Public API: export { SettingsPage } from "./ui/SettingsPage"
└── ui/
    └── SettingsPage.tsx        # Page component
```

- Implementation: `src/pages/settings/ui/SettingsPage.tsx`
- Add route in `src/app/routes/routes.tsx`

**New Shared Component (e.g., Modal component):**

```
src/shared/ui/Modal/
├── Modal.tsx                   # Component implementation
└── index.ts                    # Export: export { Modal } from "./Modal"
```

- One component per directory with independent `index.ts`
- Import as: `import { Modal } from "@/shared/ui/Modal"`

**New Utility Function (e.g., date formatting):**

- Location: `src/shared/lib/dates.ts` or similar
- Export from: `src/shared/lib/index.ts` (optional, depends on usage frequency)
- Import as: `import { formatDate } from "@/shared/lib/dates"` or via barrel

**Backend Query/Mutation (e.g., Notes API):**

```
src/shared/api/convex/
├── notes.ts                    # export const getNotes = query(...), addNote = mutation(...)
└── schema.ts                   # Add notes table definition
```

- Define in new file or existing file depending on domain
- Update `schema.ts` to include new tables/indexes
- Types auto-generate in `_generated/api.d.ts` after deployment

## Special Directories

**src/shared/api/convex/\_generated/:**

- Purpose: Auto-generated Convex type definitions
- Generated: Yes (by `convex deploy` or `convex dev`)
- Committed: Yes (tracked in version control)
- Action: Do NOT manually edit; regenerate via Convex CLI

**src/app/styles/:**

- Purpose: Global styles and Tailwind CSS setup
- Generated: No
- Committed: Yes
- Content: Global CSS, base styles, CSS variables

**Public/static assets:**

- Purpose: Static files served directly (images, icons, etc.)
- Location: `public/`
- Committed: Yes
- Access: Root-relative paths (e.g., `/vite.svg`)

**.env files:**

- Purpose: Environment variables for different environments
- Location: `.env.dev` (development), `.env.prod` (production), `.env.example` (template)
- Committed: `.env.example` only (for reference); `.env.*` in `.gitignore`
- Usage: `dotenvx run -f .env.dev -- vite` (loaded via dotenvx)

**Convex backend functions:**

- Purpose: Server-side queries, mutations, scheduled functions
- Location: `src/shared/api/convex/`
- Deployed: Via `wrangler deploy` (Cloudflare Workers) with Convex backend
- Type-safe client: Auto-generated in `_generated/api.d.ts`

---

_Structure analysis: 2026-03-22_
