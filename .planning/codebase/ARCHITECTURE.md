# Architecture

**Analysis Date:** 2026-03-22

## Pattern Overview

**Overall:** Feature-Sliced Design (FSD) with React + Convex Backend

The application follows Feature-Sliced Design (FSD) architectural methodology, organizing code into layers (app, pages, widgets, features, entities, shared) and slices based on business domains. This structure enables scalability and maintainability while preventing cross-feature contamination.

**Key Characteristics:**

- **Layered Architecture:** Code organized from app-level (highest) to shared utilities (lowest)
- **Business-Domain Slices:** Each feature is self-contained within its slice (e.g., `features/todo/`)
- **Public API Pattern:** Each slice exports only through `index.ts` barrel files to maintain encapsulation
- **Strict Dependency Rules:** Higher layers depend only on lower layers; same-layer slices cannot import from each other
- **Backend Integration:** Convex provides real-time database and API with automatic type generation
- **Authentication:** Clerk handles user identity; Convex integrates with Clerk for auth
- **Real-Time Data:** Convex React hooks enable reactive UI updates without manual refetching

## Layers

**app (Application Root):**

- Purpose: Application bootstrap, route setup, global providers (Clerk, Convex, error boundary)
- Location: `src/app/`
- Contains: Main entry point (`index.tsx`), routing logic, provider composition, global styles
- Depends on: All layers (highest level)
- Used by: Browser entry point

**pages (Page Components):**

- Purpose: Full-page UI compositions representing distinct routes/screens
- Location: `src/pages/`
- Contains: Page-level components, page-specific UI layout orchestration
- Depends on: widgets, features, entities, shared
- Used by: Routes component in `app/routes/`

**widgets (Reusable UI Blocks):**

- Purpose: Large, self-contained UI sections combining multiple features
- Location: `src/widgets/`
- Contains: Header component, complex composite UI blocks
- Depends on: features, entities, shared
- Used by: pages, other widgets

**features (Business Features):**

- Purpose: User-executable features with business value; domain-specific functionality
- Location: `src/features/`
- Contains: UI components, hooks, data models, business logic tied to specific domains
- Depends on: entities, shared
- Used by: pages, widgets

**shared (Shared Utilities):**

- Purpose: Reusable, project-wide utilities with no business domain dependency
- Location: `src/shared/`
- Contains: UI primitives, API clients, utility functions, configuration
- Depends on: External libraries only
- Used by: All layers

## Data Flow

**User Interaction → Component State → Convex Mutation/Query:**

1. User interacts with UI component (e.g., form submission in `AddTodo.tsx`)
2. Component uses `useActionState` or local state to manage form state
3. Form action calls mutation hook (e.g., `useTodoMutation()`)
4. Mutation hook invokes Convex mutation (e.g., `convexApi.todos.addTodo`)
5. Convex backend executes mutation in `src/shared/api/convex/todos.ts`
6. Mutation updates database via Convex ORM context
7. Query hooks (e.g., `useTodoQuery()`) automatically refetch due to Convex reactivity
8. Component re-renders with new data

**Example Flow - Add Todo:**

1. `AddTodo.tsx` → Form submission triggered
2. `useActionState` handler → Calls `useTodoMutation().addTodo()`
3. `useTodoMutation` hook → Invokes `convexApi.todos.addTodo` mutation
4. Backend `todos.ts` mutation → Inserts record into "todos" table
5. `useTodoQuery` hook in `HomePage.tsx` → Automatically refetches via Convex reactivity
6. Component state updates → UI re-renders with new todo

**State Management:**

- **Local Component State:** `useState` for UI-only state (editing mode, form visibility)
- **Form State:** `useActionState` for async form submissions with error handling
- **Server State:** Convex queries (`useQuery`) automatically sync with backend and handle loading/undefined states
- **Auth State:** Clerk's `useAuth()` hook provides userId for query/mutation context
- **No Redux/Zustand:** Convex handles server state; React hooks handle client state

## Key Abstractions

**UseTodoQuery Hook:**

- Purpose: Encapsulates todo-fetching logic with loading state
- Examples: `src/features/todo/lib/use-todo-query.ts`
- Pattern: Wraps Convex `useQuery` hook, transforms raw data, exports simple interface
- Usage: `const { todos, isLoading } = useTodoQuery(userId)`

**UseTodoMutation Hook:**

- Purpose: Centralized todo-modifying operations (create, update, delete)
- Examples: `src/features/todo/lib/use-todo-mutation.ts`
- Pattern: Wraps multiple Convex mutations, returns object with named operations
- Usage: `const { addTodo, editTodo, deleteTodo } = useTodoMutation()`

**UI Component Composition:**

- Purpose: Breaking down pages into reusable nested components
- Examples: `Item`, `ItemContent`, `ItemActions`, `Field`, `FieldError`
- Pattern: Compound component pattern from `shared/ui/`
- Usage: `<Item><ItemContent>{...}</ItemContent><ItemActions>{...}</ItemActions></Item>`

**Convex API Client:**

- Purpose: Type-safe access to backend mutations and queries
- Examples: `convexApi.todos.addTodo`, `convexApi.todos.getTodos`
- Pattern: Automatically generated from `src/shared/api/convex/_generated/api.d.ts`
- Usage: Pass to Convex hooks as first argument

## Entry Points

**Browser Entry Point:**

- Location: `src/app/index.tsx`
- Triggers: HTML root div mount in `index.html`
- Responsibilities: Instantiate Convex client, configure Clerk provider, set up error boundary, render Routes component

**Routing Entry Point:**

- Location: `src/app/routes/routes.tsx`
- Triggers: App component mount
- Responsibilities: Conditional rendering based on auth state (unauthenticated → SignIn form, authenticated → HomePage)

**Page Entry Point:**

- Location: `src/pages/home/ui/HomePage.tsx`
- Triggers: User signs in successfully
- Responsibilities: Fetch user's todos via `useTodoQuery`, render page layout with header, todo list, add-todo form

## Error Handling

**Strategy:** Defensive client-side error handling with user feedback

**Patterns:**

- **Error Boundary:** `ErrorBoundary` component (`src/app/providers/ErrorBoundary/`) wraps app root to catch React render errors
- **Form Error Handling:** `useActionState` captures mutation errors and displays to user via `FieldError` component
- **Loading States:** Convex hooks return `undefined` for loading state; components check and render skeletons
- **Try-Catch in Forms:** Form handlers wrap mutations in try-catch to handle network/validation errors
- **Error Display:** User-facing errors rendered below form fields (e.g., "TODOの追加に失敗しました")

## Cross-Cutting Concerns

**Logging:**

- Uses `console.error()` in error handlers (e.g., form error callbacks)
- No external logging service integrated

**Validation:**

- Form input validation in form handlers (e.g., checking empty content in `AddTodo`)
- Valibot available as dependency but not currently used for schemas

**Authentication:**

- Clerk manages user identity and sign-in flow
- ConvexProviderWithClerk integrates Clerk auth with Convex queries/mutations
- User ID passed explicitly to queries/mutations via function parameters

**Real-Time Sync:**

- Convex `useQuery` hooks automatically subscribe to database changes
- No manual polling or refetch triggers needed
- Mutations trigger automatic query invalidation

**Styling:**

- Tailwind CSS v4 for utility-based styling
- Class variance authority (CVA) for component variant management
- Dark mode support via `next-themes`
- Shadcn-style component library in `shared/ui/`

---

_Architecture analysis: 2026-03-22_
