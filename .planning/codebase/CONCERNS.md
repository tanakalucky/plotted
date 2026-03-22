# Codebase Concerns

**Analysis Date:** 2026-03-22

## Test Coverage Gaps

**Unit test absence:**

- What's not tested: Utility functions, hooks, API integration logic
- Files: `src/shared/lib/`, `src/features/todo/lib/use-todo-*.ts`, `src/shared/api/`
- Risk: Changes to shared utilities and data fetching hooks could break undetected; mutations and queries in `src/shared/api/convex/todos.ts` lack unit coverage
- Priority: High - Core business logic has no unit test protection

**Limited browser test coverage:**

- What's not tested: Form validation edge cases, error state handling, accessibility features
- Files: `src/features/todo/ui/add-todo/AddTodo.tsx`, `src/features/todo/ui/todo-item/TodoItem.tsx`
- Risk: Regressions in form behavior, error messages, and A11y attributes can occur without detection
- Priority: Medium - Browser tests exist but only cover core happy paths

**E2E test coverage minimal:**

- What's not tested: Authentication flow, page navigation, API error scenarios, concurrent mutations
- Files: `e2e/todo.spec.ts` covers basic CRUD only
- Risk: Real-world scenarios like network failures, race conditions, and auth edge cases are untested
- Priority: Medium - Application functions but lacks integration test safety

## Fragile Areas

**TodoItem component complexity with useActionState:**

- Files: `src/features/todo/ui/todo-item/TodoItem.tsx`
- Why fragile: Component mixes UI rendering, form submission, and mutation state (lines 20-51). Uses `useActionState` for both edit and delete intents, making the logic conditional and tightly coupled. Error handling is minimal (generic catch blocks), and no retry mechanism exists.
- Safe modification: Extract submit logic into separate handlers, add intent-specific error messages, test each mutation path independently. Consider using a custom hook to encapsulate the mutation logic.
- Test coverage: 1 test file exists (`TodoItem.browser.test.tsx`) but only covers render state changes, not edge cases

**AddTodo form lacks validation:**

- Files: `src/features/todo/ui/add-todo/AddTodo.tsx`
- Why fragile: Validation is only a check for empty string (line 20). No length limits, special character handling, or trimming inconsistency (trimmed on submission but not validated before). Form resets are implicit (relies on `useActionState` clearing).
- Safe modification: Add explicit validation schema (Valibot is available), validate on change and submit, add visible feedback for validation errors, add max-length input constraint
- Test coverage: Tests exist but don't cover validation edge cases

**Field component error handling with useMemo:**

- Files: `src/shared/ui/Field/Field.tsx` (lines 173-193)
- Why fragile: FieldError uses `useMemo` to deduplicate errors via Map, but relies on error message string as key (line 182). If two errors have same message text, one silently deduplicates. No TypeScript guarantee that errors array contains valid message properties.
- Safe modification: Use error id or index as key instead of message, add explicit null/undefined checks before rendering, add type guards
- Test coverage: No unit tests for error deduplication logic

## Known Bugs

**AddTodo form doesn't reset after successful submission:**

- Symptoms: Input field retains focus and previous value after adding a TODO; user must manually clear
- Files: `src/features/todo/ui/add-todo/AddTodo.tsx`
- Trigger: Submit form with valid TODO text, then try to add another
- Workaround: Manually clear the input field
- Impact: Poor UX - form state is not cleared; relies on implicit reset via `useActionState`

**Type safety gap in Id casting:**

- Symptoms: Runtime type errors if TodoItem receives invalid id type
- Files: `src/features/todo/ui/todo-item/TodoItem.tsx` (line 26), `src/features/todo/lib/use-todo-query.ts` (line 20)
- Trigger: Passing todo object with string id instead of proper Convex Id type
- Workaround: None - cast is unsafe `as Id<"todos">`
- Impact: Type system doesn't prevent errors; relies on runtime behavior

## Performance Bottlenecks

**Homepage re-renders on every todo change:**

- Problem: HomePage renders full TodoItem list even when single item changes; no memoization on todo items
- Files: `src/pages/home/ui/HomePage.tsx` (line 49-51)
- Cause: `todos.map()` is inline, TodoItem has no memo wrapper, Convex query re-triggers on any mutation
- Improvement path: Wrap TodoItem with `React.memo()`, consider virtualizing list if scaling to 100+ items, optimize Convex query caching

**Field error deduplication creates unnecessary Map on every render:**

- Problem: Field component's FieldError creates new Map and processes errors on every render
- Files: `src/shared/ui/Field/Field.tsx` (line 182)
- Cause: useMemo has children and errors as dependencies; if errors object is recreated each render, deduplication runs repeatedly
- Improvement path: Memoize error processing result, ensure errors array is stable, consider extracting to custom hook

**No pagination or lazy loading for todo lists:**

- Problem: Loads all todos at once via `getTodos` query
- Files: `src/shared/api/convex/todos.ts` (line 10-14)
- Cause: Simple query with no limit or offset, browser test shows 5 hardcoded skeleton items
- Improvement path: Add cursor-based pagination with limit parameter (e.g., 20 items per page), implement infinite scroll or "Load more" button

## Security Considerations

**No access control validation on mutations:**

- Risk: Any user can delete or edit any todo if they know the ID
- Files: `src/shared/api/convex/todos.ts` (lines 39-46, 48-58)
- Current mitigation: Convex server-side validation not visible in source; assumes authentication is enforced elsewhere
- Recommendations: Verify that Convex mutations check `ctx.auth` before allowing delete/update, add explicit userId validation in mutation handlers, log unauthorized access attempts

**User ID from client is not validated:**

- Risk: User can query todos for another user by changing userId parameter
- Files: `src/shared/api/convex/todos.ts` (line 5-14), `src/pages/home/ui/HomePage.tsx` (line 10)
- Current mitigation: Assumes Clerk authentication validates userId matches token
- Recommendations: Extract userId from auth context server-side rather than accepting from client, validate userId matches authenticated user in Convex queries

**Client-side auth check insufficient:**

- Risk: AddTodo component returns nothing if !userId, but no permission boundary wraps pages
- Files: `src/features/todo/ui/add-todo/AddTodo.tsx` (line 13-14), `src/pages/home/ui/HomePage.tsx` (line 10)
- Current mitigation: Relies on router/app-level guards (not visible in src/)
- Recommendations: Add explicit access control layer in app/providers, implement role-based access for future features, audit all API endpoints for auth checks

## Tech Debt

**useActionState pattern duplicated across components:**

- Issue: Both AddTodo and TodoItem implement nearly identical `useActionState` boilerplate for form handling
- Files: `src/features/todo/ui/add-todo/AddTodo.tsx` (line 18-30), `src/features/todo/ui/todo-item/TodoItem.tsx` (line 20-51)
- Impact: Code duplication increases maintenance burden; changes to error handling must be made in multiple places
- Fix approach: Extract form submission logic into custom hook (e.g., `useTodoForm()`) that returns action, state, and isPending; reduces duplication by ~40%

**Generic error catching with console.error:**

- Issue: Error handlers catch all errors and log generic message
- Files: `src/features/todo/ui/add-todo/AddTodo.tsx` (line 25), `src/features/todo/ui/todo-item/TodoItem.tsx` (lines 28-31, 43-46)
- Impact: Developers cannot distinguish between network errors, validation errors, permission errors; logs unhelpful to debugging
- Fix approach: Create error classification utility, parse Convex error responses, return specific error messages to user

**Convex schema lacks timestamps:**

- Issue: Todo table has no createdAt or updatedAt fields
- Files: `src/shared/api/convex/schema.ts`
- Impact: Cannot sort todos by creation date, cannot detect stale data, no audit trail
- Fix approach: Add `createdAt: v.number()` and `updatedAt: v.number()` to schema, update mutation handlers to set timestamps automatically

**Type generation coupling to \_generated folder:**

- Issue: Convex types are auto-generated in `src/shared/api/convex/_generated/`; hand-edits will be overwritten
- Files: `src/shared/api/convex/_generated/api.d.ts`, `src/shared/api/convex/_generated/dataModel.d.ts`
- Impact: Type definitions are fragile; API changes may require schema re-sync, cannot customize types for frontend
- Fix approach: Create wrapper types that extend generated types, use type guards for safe casting, add pre-commit hook to verify schema matches types

**Hard-coded error messages in Japanese:**

- Issue: Error strings like "削除に失敗しました" are scattered across components
- Files: `src/features/todo/ui/add-todo/AddTodo.tsx` (lines 20, 26), `src/features/todo/ui/todo-item/TodoItem.tsx` (lines 30, 45)
- Impact: i18n is not possible, error messages cannot be reused, consistency is difficult
- Fix approach: Move error messages to shared constants file (e.g., `src/shared/config/messages.ts`), consider i18n library (react-intl, next-i18n-router)

## Scaling Limits

**Single index on todos table:**

- Current capacity: Assumes <10k todos per user; `by_user` index is only optimization
- Limit: Query will slow down linearly as user's todo count increases; no compound indices for sorting/filtering
- Scaling path: Add compound indices for `by_user + createdAt`, add pagination with cursor, consider denormalizing counts to users table

**No rate limiting on mutations:**

- Current capacity: Assumes honest users; API accepts unlimited add/edit/delete requests
- Limit: Malicious user can spam mutations, causing database load spikes
- Scaling path: Implement Convex rate limiting (check ctx.auth.getIdentity() uniqueness), add client-side debouncing, track mutation counts per user

**Convex free tier constraints not documented:**

- Current capacity: Unknown (Convex free tier has 1GB storage, 1M documents)
- Limit: No warning when approaching quota, no monitoring setup visible
- Scaling path: Add monitoring dashboard, implement data retention policy, plan migration to paid tier before hitting limits

## Dependencies at Risk

**Clerk authentication version pinned:**

- Risk: `@clerk/react@^6.1.2` is relatively new; breaking changes in minor versions possible
- Impact: Authentication failures, SSO issues, session handling breaks
- Migration plan: Lock version to exact `6.1.2`, add changelog monitoring, test clerk@7 when released, consider switch to Supabase Auth if Clerk pricing increases

**Convex package management:**

- Risk: `convex@^1.34.0` uses caret (allows minor updates); version mismatch between client and backend possible
- Impact: API mismatches, type generation failures, real-time subscription breaks
- Migration plan: Sync convex versions across package.json and convex.json, use lockfile strictly, add version check in CI

## Missing Critical Features

**No offline support:**

- Problem: App is unusable without network connection; no local caching of todos
- Blocks: Progressive web app status, mobile reliability
- Impact: Medium - acceptable for SaaS app but limits use cases

**No undo/redo functionality:**

- Problem: Users cannot recover deleted todos; no soft delete or recycle bin
- Blocks: Better UX, reduces accidental deletion complaints
- Impact: Medium - desired but not critical

**No bulk operations:**

- Problem: Users must delete/edit todos one-by-one; no select-all, delete multiple, batch edit
- Blocks: Productivity for power users
- Impact: Low - acceptable for small todo lists

---

_Concerns audit: 2026-03-22_
