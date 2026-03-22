# Coding Conventions

**Analysis Date:** 2026-03-22

## Naming Patterns

**Files:**

- React components: PascalCase (e.g., `TodoItem.tsx`, `Button.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useTodoMutation.ts`, `useTodoQuery.ts`)
- Utilities/helpers: camelCase (e.g., `utils.ts`, `validation.ts`)
- Type/model files: camelCase (e.g., `form-state.ts`, `todo.ts`)
- Test files: suffix pattern with environment (e.g., `TodoItem.browser.test.tsx`, `*.unit.test.ts`, `*.spec.ts`)

**Functions:**

- React components: PascalCase
- Regular functions: camelCase
- Callback handlers: `on[Event]` pattern (e.g., `onError`, `resetErrorBoundary`)
- Utility functions: descriptive camelCase (e.g., `getErrorMessage`, `cn`)

**Variables:**

- Local variables: camelCase
- Constants: camelCase (const keywords enforce immutability)
- Destructured props: camelCase
- Boolean/state flags: camelCase (e.g., `isEditing`, `isPending`, `isLoaded`)

**Types:**

- Interfaces: PascalCase (e.g., `Props`, `Todo`, `FormState`)
- Type aliases: PascalCase
- Discriminated union fields: snake_case values (e.g., `intent: "delete" | "update"`)

## Code Style

**Formatting:**

- Tool: `oxfmt` (see `.oxfmtrc.json`)
- Tailwind class sorting enabled via `sortTailwindcss`
- Import sorting enabled via `sortImports`
- Package.json sorting enabled

**Linting:**

- Tool: `oxlint` with TypeScript support (see `.oxlintrc.json`)
- Run with: `bun run lint`
- CI mode: `bun run lint:ci` (no auto-fix)
- Key rules:
  - Tailwind CSS shorthand and canonical class enforcement
  - TypeScript strict mode enabled
  - No unused locals or parameters allowed (enforced via tsconfig)
  - No unguarded side-effect imports

**Run Before Commit:**

```bash
bun run lint  # Auto-fixes formatting and linting issues
```

## Import Organization

**Order:**

1. React and external libraries (e.g., `import { useState } from "react"`)
2. External third-party packages (e.g., `import { Button as ButtonPrimitive } from "@base-ui/react/button"`)
3. Icon libraries (e.g., `import { Check, Pencil, Trash2 } from "lucide-react"`)
4. Internal aliases using `@/` (e.g., `import { cn } from "@/shared/lib/utils"`)
5. Relative imports within same slice (lowest priority, use only for same-slice dependencies)

**Path Aliases:**

- Primary alias: `@/*` → `src/*` (defined in `tsconfig.app.json`)
- Use `@/` for all cross-slice imports
- Use relative paths ONLY within same slice to avoid circular dependencies

**Example from `src/features/todo/ui/todo-item/TodoItem.tsx`:**

```typescript
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useActionState, useState } from "react";

import { Id } from "@/shared/api";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/Button";
import { FieldError } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Item, ItemActions, ItemContent, ItemDescription } from "@/shared/ui/Item";

import { useTodoMutation } from "../../lib/use-todo-mutation";
import { FormState } from "../../model/form-state";
import { Todo } from "../../model/todo";
```

## Error Handling

**Patterns:**

- **try-catch with explicit error messages**: Catch blocks return user-friendly error messages
  - Example from `src/features/todo/ui/add-todo/AddTodo.tsx`:
    ```typescript
    try {
      await addTodo({ content: content.trim(), userId });
    } catch (error) {
      console.error("TODOの追加に失敗しました", error);
      return { error: "TODOの追加に失敗しました" };
    }
    ```

- **Form state error handling**: Errors stored in form state and displayed to users
  - `FormState` interface defines error field: `interface FormState { error?: string; }`
  - Rendered via `<FieldError>` component

- **Error Boundary**: Global error handling with `ErrorBoundary` component at app root
  - Location: `src/app/providers/ErrorBoundary/ErrorBoundary.tsx`
  - Uses `react-error-boundary` library
  - Logs errors with `console.error("ErrorBoundary caught an error:", error)`
  - Provides user-friendly fallback UI with error details toggle

- **Type narrowing for errors**: `getErrorMessage()` utility handles unknown error types
  ```typescript
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  };
  ```

## Logging

**Framework:** `console` (no logging library imported)

**Patterns:**

- Errors logged to console with context prefix:
  - `console.error("ErrorBoundary caught an error:", error)`
  - `console.error("TODOの追加に失敗しました", error)`
- Use `console.error()` for error cases, not generic logging
- No info/debug/warn levels observed in codebase

## Comments

**When to Comment:**

- Comments avoided in tested components—test names and code structure should be self-documenting
- Comments used in setup files for clarity (e.g., `// 認証してストレージに状態を保存` in e2e setup)
- Comments used for non-obvious workarounds or important context

**JSDoc/TSDoc:**

- Not consistently used
- Interfaces and functions lack JSDoc annotations
- Type inference and naming conventions serve as documentation

## Function Design

**Size:** Functions are small and focused, typically 10-40 lines max

**Parameters:**

- Prefer object destructuring for props in React components
  ```typescript
  export const TodoItem = ({ todo }: { todo: Todo }) => { ... }
  ```
- Destructure hook returns: `const [state, action, isPending] = useActionState(...)`
- Named arguments using object syntax for clarity

**Return Values:**

- React components return JSX
- Hooks return objects with named exports: `{ addTodo, editTodo, deleteTodo }`
- Utility functions return single values or objects
- Error states returned as objects with `error` property

## Module Design

**Exports:**

- Named exports preferred: `export const Button = (...)`
- Barrel files used at slice level: `export { AddTodo } from "./ui/add-todo/AddTodo"`
- Avoid exporting from segment-level (ui/, model/, lib/) to prevent circular dependencies
- Each UI component or utility has single named export

**Barrel Files:**

- Used at slice level only (`features/todo/index.ts`)
- Each segment (ui/, model/, lib/) keeps own `index.ts` for component-level exports
- Shared UI components have minimal barrel exports: `export { Button, buttonVariants }`
- Limits barrel file scope to prevent performance issues in large projects

**Example from `src/shared/ui/Button/index.ts`:**

```typescript
export { Button, buttonVariants };
```

## React Patterns

**State Management:**

- `useState()` for local component state (e.g., `isEditing` flag)
- `useActionState()` for form submission state with async actions
- No global state management visible (uses Convex client for data)

**Form Handling:**

- Server action pattern with `useActionState()`:
  ```typescript
  const [state, action, isPending] = useActionState<FormState, FormData>(async (_, formData) => {
    // validation and business logic
    return { error?: string };
  }, {});
  ```
- Form data extracted via `formData.get(key)`
- Intent-based actions using form field values (e.g., `intent: "delete" | "update"`)

**Prop Types:**

- Inline prop types for simple components
- Separate interfaces for complex component props (e.g., `interface Props { children: ReactNode }`)

## Accessibility

**ARIA attributes:**

- Buttons require `aria-label` for icon-only buttons: `aria-label="編集"`
- Form inputs use `aria-label` for accessibility: `aria-label="TODO"`
- Alerts use `role="alert"` for error messages
- Lists use semantic roles: `role="list"`, `role="listitem"`

**Semantic HTML:**

- `<form>` elements wrap form submission
- `<details>` and `<summary>` for expandable error details
- Icon components from `lucide-react` for visual indicators

---

_Convention analysis: 2026-03-22_
