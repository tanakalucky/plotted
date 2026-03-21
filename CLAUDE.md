# 開発フロー

**すべてのパッケージ管理とスクリプト実行コマンドには、`npm`、`npx`、`yarn`の代わりに常に`bun`と`bunx`を使用すること。**

# 1.変更を加える

bun run ui:add <ComponentName> # shadcnのコンポーネントをコードベースに追加

# 2.型チェック

bun run typecheck

# 3.テスト実行

bun run test

# 4.ブラウザ動作確認（探索的テスト）

自動テストで検出しにくい問題を発見するため、変更箇所に関連する画面をブラウザで確認する。

## 開発サーバーの起動

### 1. 起動状態の確認

`lsof -i :5173` でポート5173が使用中か確認する。

### 2. 未起動の場合はバックグラウンドで起動

`bun run dev` をBashツールの `run_in_background` オプションで実行する。

### 3. 準備完了の確認

`curl -s -o /dev/null -w '%{http_code}' http://localhost:5173` を実行し、HTTPステータスコード200が返ることを確認する。
起動直後はサーバーの準備が完了していない場合があるため、200が返るまで数秒待って再試行する。

## チェックリスト

- [ ] **表示確認**: 変更に関連するページが正しく表示されること（スクリーンショットで目視確認）
- [ ] **操作確認**: ボタンクリック・フォーム入力・画面遷移など、ユーザー操作が期待通り動作すること
- [ ] **コンソール確認**: ブラウザコンソールにエラーや警告が出力されていないこと
- [ ] **ネットワーク確認**: APIリクエストが正常に完了し、期待するレスポンスが返ること

バグを発見した場合はその場で修正し、ステップ2（型チェック）から再実行する。

# 5.コミット前

bun run lint

# 6.PR作成前

bun run lint && bun run test

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Plotted.**

マーダーミステリー向けのアリバイ管理Webアプリ。キャラクターの位置情報を時系列・マップ別に記録し、プレイヤーが目視で矛盾を発見できるようにする。オンライン（Discord等）マダミスプレイヤーが対象。

**Core Value:** キャラクターの位置をマップ上にプロットし、時系列で追跡できること。

### Constraints

- **Tech Stack**: React + Tailwind CSS v4 + shadcn/ui — 既存基盤を活用
- **Architecture**: Feature-Sliced Design — 既存パターンに従う
- **Deploy**: Cloudflare Pages（静的サイトのみ）
- **Storage**: localStorage only — バックエンド依存なし
- **Package Manager**: bun — npm/yarn/npx不使用
- **Maps**: 最大3枚 — UI表示領域の制約
- **Days**: Day1〜Day7 — マダミスの一般的なゲーム期間
- **Time Resolution**: 10分単位 — プレイに十分な粒度
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.3 - All source code, configuration, and build scripts
- JavaScript/JSX - React components, webpack/vite configuration
- HTML - Template and static content
- CSS - Styling through Tailwind CSS (v4.2.2)
- JSON/JSONC - Configuration files (wrangler.jsonc, tsconfig.json)
## Runtime
- Node.js (implied by package.json type "module")
- Bun - Package manager and task runner (configured in CLAUDE.md and package.json scripts)
- Bun
- Lockfile: `bun.lock` (present)
## Frameworks
- React 19.2.4 - UI framework
- Vite 8.0.1 - Build tool and development server
- React DOM 19.2.4 - React rendering library
- Wouter 3.9.0 - Client-side routing
- Convex 1.34.0 - Backend API and database
- Tailwind CSS 4.2.2 - Utility-first CSS framework
- @tailwindcss/vite 4.2.2 - Vite plugin for Tailwind CSS
- Next-themes 0.4.6 - Theme management
- @base-ui/react 1.3.0 - Headless UI components
- shadcn 4.1.0 - Component template system
- Lucide-react 0.577.0 - Icon library
- class-variance-authority 0.7.1 - CSS class composition
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.5.0 - Merge Tailwind classes intelligently
- Valibot 1.3.1 - Data validation library
- ts-pattern 5.9.0 - Pattern matching for TypeScript
- react-error-boundary 6.1.1 - React error boundary wrapper
- @fontsource-variable/noto-sans 5.2.10 - Variable font loading
## Testing
- Vitest 4.1.0 - Unit and browser test runner
- @vitest/browser-playwright 4.1.0 - Browser testing adapter
- @vitest/ui 4.1.0 - Vitest UI dashboard
- vitest-browser-react 2.1.0 - React testing utilities
- Playwright 1.58.2 - E2E test framework
- @playwright/test 1.58.2 - Playwright testing library
- @clerk/testing 2.0.6 - Clerk authentication testing utilities
## Build & Dev Tools
- @vitejs/plugin-react 6.0.1 - React Fast Refresh plugin for Vite
- @cloudflare/vite-plugin 1.30.0 - Cloudflare Workers integration
- Wrangler 4.76.0 - Cloudflare Workers CLI and bundler
- Oxlint 1.56.0 - Fast linter with type-aware features
- oxlint-tsgolint 0.17.1 - TypeScript-specific linting
- Oxfmt 0.41.0 - Code formatter
- Lefthook 2.1.4 - Git hooks manager
- TypeScript 5.9.3 - Type checking compiler
- @types/react 19.2.14 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions
- @types/node 25.5.0 - Node.js type definitions
- @typescript/native-preview 7.0.0-dev.20260321.1 - Advanced TypeScript features
- @dotenvx/dotenvx 1.57.0 - Environment variable management with encryption support
## Key Dependencies
- Convex 1.34.0 - Backend database, API, and real-time synchronization. Core to data persistence and server logic.
- React 19.2.4 - Modern React with latest features
- TypeScript 5.9.3 - Type safety across entire codebase
- Wrangler 4.76.0 - Deploy to Cloudflare Workers as edge function
- Vite 8.0.1 - Fast development server and optimized production builds
- @dotenvx/dotenvx 1.57.0 - Secure environment configuration management
- @clerk/react 6.1.2 - Clerk authentication provider
- Convex integration with Clerk for JWT validation
## Configuration
- `.env.dev` - Development environment variables
- `.env.prod` - Production environment variables
- `.env.example` - Environment variable template (reference only)
- Configured via @dotenvx/dotenvx in npm scripts (`dotenvx run -f .env.dev --`)
- `vite.config.ts` - Vite configuration with React, Cloudflare, and Tailwind plugins
- `tsconfig.json` - TypeScript compiler configuration (references tsconfig.app.json)
- `wrangler.jsonc` - Cloudflare Workers configuration with observability enabled
- `playwright.config.ts` - E2E test configuration with Chromium browser
- Oxlint configuration included (uses --type-aware flag for strict checks)
- Oxfmt for code formatting
## Platform Requirements
- Bun runtime for package management and script execution
- Node.js compatible environment
- Port 5173 for Vite dev server
- Browser with WebSocket support (for Vite HMR)
- Cloudflare Workers - Edge function deployment
- Convex backend (API and database)
- Clerk authentication backend
- Wrangler CLI for Cloudflare Workers deployment
- Assets served from `./dist/client` directory
- Single-page application (SPA) routing enabled on 404
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase (e.g., `TodoItem.tsx`, `Button.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useTodoMutation.ts`, `useTodoQuery.ts`)
- Utilities/helpers: camelCase (e.g., `utils.ts`, `validation.ts`)
- Type/model files: camelCase (e.g., `form-state.ts`, `todo.ts`)
- Test files: suffix pattern with environment (e.g., `TodoItem.browser.test.tsx`, `*.unit.test.ts`, `*.spec.ts`)
- React components: PascalCase
- Regular functions: camelCase
- Callback handlers: `on[Event]` pattern (e.g., `onError`, `resetErrorBoundary`)
- Utility functions: descriptive camelCase (e.g., `getErrorMessage`, `cn`)
- Local variables: camelCase
- Constants: camelCase (const keywords enforce immutability)
- Destructured props: camelCase
- Boolean/state flags: camelCase (e.g., `isEditing`, `isPending`, `isLoaded`)
- Interfaces: PascalCase (e.g., `Props`, `Todo`, `FormState`)
- Type aliases: PascalCase
- Discriminated union fields: snake_case values (e.g., `intent: "delete" | "update"`)
## Code Style
- Tool: `oxfmt` (see `.oxfmtrc.json`)
- Tailwind class sorting enabled via `sortTailwindcss`
- Import sorting enabled via `sortImports`
- Package.json sorting enabled
- Tool: `oxlint` with TypeScript support (see `.oxlintrc.json`)
- Run with: `bun run lint`
- CI mode: `bun run lint:ci` (no auto-fix)
- Key rules:
## Import Organization
- Primary alias: `@/*` → `src/*` (defined in `tsconfig.app.json`)
- Use `@/` for all cross-slice imports
- Use relative paths ONLY within same slice to avoid circular dependencies
## Error Handling
- **try-catch with explicit error messages**: Catch blocks return user-friendly error messages
- **Form state error handling**: Errors stored in form state and displayed to users
- **Error Boundary**: Global error handling with `ErrorBoundary` component at app root
- **Type narrowing for errors**: `getErrorMessage()` utility handles unknown error types
## Logging
- Errors logged to console with context prefix:
- Use `console.error()` for error cases, not generic logging
- No info/debug/warn levels observed in codebase
## Comments
- Comments avoided in tested components—test names and code structure should be self-documenting
- Comments used in setup files for clarity (e.g., `// 認証してストレージに状態を保存` in e2e setup)
- Comments used for non-obvious workarounds or important context
- Not consistently used
- Interfaces and functions lack JSDoc annotations
- Type inference and naming conventions serve as documentation
## Function Design
- Prefer object destructuring for props in React components
- Destructure hook returns: `const [state, action, isPending] = useActionState(...)`
- Named arguments using object syntax for clarity
- React components return JSX
- Hooks return objects with named exports: `{ addTodo, editTodo, deleteTodo }`
- Utility functions return single values or objects
- Error states returned as objects with `error` property
## Module Design
- Named exports preferred: `export const Button = (...)`
- Barrel files used at slice level: `export { AddTodo } from "./ui/add-todo/AddTodo"`
- Avoid exporting from segment-level (ui/, model/, lib/) to prevent circular dependencies
- Each UI component or utility has single named export
- Used at slice level only (`features/todo/index.ts`)
- Each segment (ui/, model/, lib/) keeps own `index.ts` for component-level exports
- Shared UI components have minimal barrel exports: `export { Button, buttonVariants }`
- Limits barrel file scope to prevent performance issues in large projects
## React Patterns
- `useState()` for local component state (e.g., `isEditing` flag)
- `useActionState()` for form submission state with async actions
- No global state management visible (uses Convex client for data)
- Server action pattern with `useActionState()`:
- Form data extracted via `formData.get(key)`
- Intent-based actions using form field values (e.g., `intent: "delete" | "update"`)
- Inline prop types for simple components
- Separate interfaces for complex component props (e.g., `interface Props { children: ReactNode }`)
## Accessibility
- Buttons require `aria-label` for icon-only buttons: `aria-label="編集"`
- Form inputs use `aria-label` for accessibility: `aria-label="TODO"`
- Alerts use `role="alert"` for error messages
- Lists use semantic roles: `role="list"`, `role="listitem"`
- `<form>` elements wrap form submission
- `<details>` and `<summary>` for expandable error details
- Icon components from `lucide-react` for visual indicators
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- **Layered Architecture:** Code organized from app-level (highest) to shared utilities (lowest)
- **Business-Domain Slices:** Each feature is self-contained within its slice (e.g., `features/todo/`)
- **Public API Pattern:** Each slice exports only through `index.ts` barrel files to maintain encapsulation
- **Strict Dependency Rules:** Higher layers depend only on lower layers; same-layer slices cannot import from each other
- **Backend Integration:** Convex provides real-time database and API with automatic type generation
- **Authentication:** Clerk handles user identity; Convex integrates with Clerk for auth
- **Real-Time Data:** Convex React hooks enable reactive UI updates without manual refetching
## Layers
- Purpose: Application bootstrap, route setup, global providers (Clerk, Convex, error boundary)
- Location: `src/app/`
- Contains: Main entry point (`index.tsx`), routing logic, provider composition, global styles
- Depends on: All layers (highest level)
- Used by: Browser entry point
- Purpose: Full-page UI compositions representing distinct routes/screens
- Location: `src/pages/`
- Contains: Page-level components, page-specific UI layout orchestration
- Depends on: widgets, features, entities, shared
- Used by: Routes component in `app/routes/`
- Purpose: Large, self-contained UI sections combining multiple features
- Location: `src/widgets/`
- Contains: Header component, complex composite UI blocks
- Depends on: features, entities, shared
- Used by: pages, other widgets
- Purpose: User-executable features with business value; domain-specific functionality
- Location: `src/features/`
- Contains: UI components, hooks, data models, business logic tied to specific domains
- Depends on: entities, shared
- Used by: pages, widgets
- Purpose: Reusable, project-wide utilities with no business domain dependency
- Location: `src/shared/`
- Contains: UI primitives, API clients, utility functions, configuration
- Depends on: External libraries only
- Used by: All layers
## Data Flow
- **Local Component State:** `useState` for UI-only state (editing mode, form visibility)
- **Form State:** `useActionState` for async form submissions with error handling
- **Server State:** Convex queries (`useQuery`) automatically sync with backend and handle loading/undefined states
- **Auth State:** Clerk's `useAuth()` hook provides userId for query/mutation context
- **No Redux/Zustand:** Convex handles server state; React hooks handle client state
## Key Abstractions
- Purpose: Encapsulates todo-fetching logic with loading state
- Examples: `src/features/todo/lib/use-todo-query.ts`
- Pattern: Wraps Convex `useQuery` hook, transforms raw data, exports simple interface
- Usage: `const { todos, isLoading } = useTodoQuery(userId)`
- Purpose: Centralized todo-modifying operations (create, update, delete)
- Examples: `src/features/todo/lib/use-todo-mutation.ts`
- Pattern: Wraps multiple Convex mutations, returns object with named operations
- Usage: `const { addTodo, editTodo, deleteTodo } = useTodoMutation()`
- Purpose: Breaking down pages into reusable nested components
- Examples: `Item`, `ItemContent`, `ItemActions`, `Field`, `FieldError`
- Pattern: Compound component pattern from `shared/ui/`
- Usage: `<Item><ItemContent>{...}</ItemContent><ItemActions>{...}</ItemActions></Item>`
- Purpose: Type-safe access to backend mutations and queries
- Examples: `convexApi.todos.addTodo`, `convexApi.todos.getTodos`
- Pattern: Automatically generated from `src/shared/api/convex/_generated/api.d.ts`
- Usage: Pass to Convex hooks as first argument
## Entry Points
- Location: `src/app/index.tsx`
- Triggers: HTML root div mount in `index.html`
- Responsibilities: Instantiate Convex client, configure Clerk provider, set up error boundary, render Routes component
- Location: `src/app/routes/routes.tsx`
- Triggers: App component mount
- Responsibilities: Conditional rendering based on auth state (unauthenticated → SignIn form, authenticated → HomePage)
- Location: `src/pages/home/ui/HomePage.tsx`
- Triggers: User signs in successfully
- Responsibilities: Fetch user's todos via `useTodoQuery`, render page layout with header, todo list, add-todo form
## Error Handling
- **Error Boundary:** `ErrorBoundary` component (`src/app/providers/ErrorBoundary/`) wraps app root to catch React render errors
- **Form Error Handling:** `useActionState` captures mutation errors and displays to user via `FieldError` component
- **Loading States:** Convex hooks return `undefined` for loading state; components check and render skeletons
- **Try-Catch in Forms:** Form handlers wrap mutations in try-catch to handle network/validation errors
- **Error Display:** User-facing errors rendered below form fields (e.g., "TODOの追加に失敗しました")
## Cross-Cutting Concerns
- Uses `console.error()` in error handlers (e.g., form error callbacks)
- No external logging service integrated
- Form input validation in form handlers (e.g., checking empty content in `AddTodo`)
- Valibot available as dependency but not currently used for schemas
- Clerk manages user identity and sign-in flow
- ConvexProviderWithClerk integrates Clerk auth with Convex queries/mutations
- User ID passed explicitly to queries/mutations via function parameters
- Convex `useQuery` hooks automatically subscribe to database changes
- No manual polling or refetch triggers needed
- Mutations trigger automatic query invalidation
- Tailwind CSS v4 for utility-based styling
- Class variance authority (CVA) for component variant management
- Dark mode support via `next-themes`
- Shadcn-style component library in `shared/ui/`
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
