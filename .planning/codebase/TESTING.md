# Testing Patterns

**Analysis Date:** 2026-03-22

## Test Framework

**Runner:**

- Vitest 4.1.0 (configured in `vite.config.ts`)
- Supports both unit and browser testing via projects
- Config: `vite.config.ts` with test configuration

**Assertion Library:**

- Vitest built-in `expect()` (compatible with Jest matchers)
- Custom matchers: `expect.element()` for browser tests
- Browser testing extensions from `vitest-browser-react`

**Run Commands:**

```bash
bun run test                          # Run all test projects (unit + browser + e2e)
bun run dev                           # Start dev server (needed for browser/e2e tests)
bun run lint                          # Run linting (must pass before commit)
bun run typecheck                     # Type check
```

**Test Invocation Pattern:**

The main `test` script runs three test suites in parallel:

```bash
"test": "vitest --project unit & vitest --project browser & dotenvx run -f .env.dev -- bun run playwright test"
```

## Test File Organization

**Location:**

- Co-located with source files (same directory as component)
- Browser tests: `**/*.browser.test.{ts,tsx}`
- Unit tests: `**/*.unit.test.{ts,tsx}`
- E2E tests: `e2e/` directory at root

**Naming:**

- Pattern: `[ComponentName].browser.test.tsx` for Vitest browser tests
- Pattern: `[name].unit.test.ts` for Vitest unit tests
- Pattern: `[feature].spec.ts` for Playwright E2E tests

**Structure:**

```
src/
├── features/todo/
│   ├── ui/
│   │   ├── todo-item/
│   │   │   ├── TodoItem.tsx
│   │   │   └── TodoItem.browser.test.tsx    # Browser test
│   │   └── add-todo/
│   │       ├── AddTodo.tsx
│   │       └── AddTodo.browser.test.tsx     # Browser test
│   ├── lib/
│   │   └── use-todo-mutation.ts
│   └── model/
│       └── form-state.ts
e2e/
├── global.setup.ts                          # Auth setup
└── todo.spec.ts                             # E2E tests
```

## Test Structure

**Suite Organization:**

Browser tests use `describe()` blocks with nested `it()` statements:

```typescript
describe("TodoItem", () => {
  describe("TODOの編集", () => {
    it("編集ボタン押下で、入力項目に切り替わること", async () => {
      // Arrange
      const mockEditTodo = vi.fn();
      mockUseTodoMutation.mockReturnValue({ ... });

      // Act
      const screen = await render(<TodoItem todo={...} />);
      await userEvent.click(editButton);

      // Assert
      expect(input).toBeInTheDocument();
    });
  });
});
```

**Patterns:**

- **Arrange-Act-Assert (AAA) pattern**: Comments clearly mark each section
- **Async/await**: All browser tests are async, using `await` for user interactions
- **Setup in test**: Mock setup happens inside each test case (not in `beforeEach`)
- **Nesting describe blocks**: Feature grouping (e.g., "TODOの編集", "TODOの削除")

## Mocking

**Framework:** Vitest's built-in `vi` object

**Patterns:**

Hook mocking at module level (before tests):

```typescript
vi.mock("../../lib/use-todo-mutation", () => ({
  useTodoMutation: vi.fn().mockReturnValue({ addTodo: vi.fn() }),
}));

const mockUseTodoMutation = vi.mocked(useTodoMutation);
```

External library mocking:

```typescript
vi.mock("@clerk/react", () => ({
  useAuth: vi.fn().mockReturnValue({ userId: "user123" }),
}));
```

Per-test mock customization:

```typescript
it("should handle error", async () => {
  const mockEditTodo = vi.fn().mockRejectedValue(new Error("failed"));
  mockUseTodoMutation.mockReturnValue({
    editTodo: mockEditTodo as unknown as ReturnType<typeof useTodoMutation>["editTodo"],
    // ... other mocks
  });
  // test code
});
```

**What to Mock:**

- External hooks/APIs: `useTodoMutation()`, `useAuth()`
- External libraries: `@clerk/react`
- Mutations and async operations
- Anything that would require backend/external service

**What NOT to Mock:**

- UI components from `@/shared/ui/` (use real components)
- Internal utilities like `cn()` (use real implementations)
- Form and input elements (test real behavior)
- React hooks like `useState`, `useActionState` (let them run)

## Fixtures and Factories

**Test Data:**

Inline mock objects created per test:

```typescript
const mockTodo = { id: "test-id", content: "アプリを作る" };
const screen = await render(<TodoItem todo={mockTodo} />);
```

Return type assertions used for type safety:

```typescript
mockUseTodoMutation.mockReturnValue({
  addTodo: mockAddTodo as unknown as ReturnType<typeof useTodoMutation>["addTodo"],
});
```

**Location:**

- No separate fixtures directory
- Test data created inline within test cases
- Shared test utilities: None observed (each test is self-contained)

## Coverage

**Requirements:** Not enforced (no coverage threshold in vite.config.ts)

**Current Coverage:**

Browser tests cover:

- `src/features/todo/ui/todo-item/TodoItem.browser.test.tsx` - Edit/delete functionality
- `src/features/todo/ui/add-todo/AddTodo.browser.test.tsx` - Add/validation functionality

E2E tests cover:

- `e2e/todo.spec.ts` - Full user journeys (add, edit, delete)

No unit tests for business logic (hooks, utilities) currently present.

## Test Types

**Browser Tests (Vitest with Playwright):**

- **Environment:** Real browser (Chromium)
- **Scope:** Component behavior, user interactions, DOM state
- **Framework:** `vitest-browser-react` with `@vitest/browser-playwright`
- **Execution:** `vitest --project browser`
- **Headless:** `true` (configured in vite.config.ts)

Example from `TodoItem.browser.test.tsx`:

```typescript
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";

describe("TodoItem", () => {
  it("編集ボタン押下で、入力項目に切り替わること", async () => {
    const screen = await render(<TodoItem todo={{ id: "test-id", content: "アプリを作る" }} />);
    const editButton = screen.getByRole("button", { name: /編集/i });
    await userEvent.click(editButton);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });
});
```

**E2E Tests (Playwright):**

- **Environment:** Real browser with backend
- **Scope:** Full user journeys (authentication → add/edit/delete TODOs)
- **Framework:** Playwright Test
- **Config:** `playwright.config.ts`
- **Execution:** `dotenvx run -f .env.dev -- bun run playwright test`
- **Auth:** Global setup with Clerk authentication (`e2e/global.setup.ts`)

Example from `e2e/todo.spec.ts`:

```typescript
test("TODOの追加、編集、削除ができる", async ({ page }) => {
  // Arrange
  const list = page.getByRole("list");
  await list.waitFor();

  // Act
  await page.getByLabel("TODO").fill("新しいTODO");
  await page.getByRole("button", { name: /追加/i }).click();

  // Assert
  const items = page.getByRole("listitem");
  const newItem = items.last();
  await expect(newItem).toContainText("新しいTODO");
});
```

**Authentication Setup (E2E):**

- Global setup runs first: `e2e/global.setup.ts`
- Performs Clerk login with test credentials from environment
- Saves authenticated session state to `e2e/.auth/user.json`
- Other tests depend on this setup (configured via `dependencies: ["setup"]`)

**No Unit Tests Observed:**

- Hooks, utilities, and models have no dedicated unit test files
- Rely on browser tests to verify behavior through component integration
- No `*.unit.test.ts` files found in codebase

## Common Patterns

**Async Testing:**

All browser tests are async and use `await`:

```typescript
it("should perform async action", async () => {
  const screen = await render(<Component />);
  await userEvent.click(button);
  const result = await screen.findByText("success");
  expect(result).toBeInTheDocument();
});
```

**User Interaction:**

Using `userEvent` from `vitest/browser`:

```typescript
import { userEvent } from "vitest/browser";

await userEvent.click(button);
await userEvent.fill(input, "text value");
```

**Error Testing:**

Mocking errors and verifying error display:

```typescript
it("should display error on failure", async () => {
  const mockEditTodo = vi.fn().mockRejectedValue(new Error("failed"));
  mockUseTodoMutation.mockReturnValue({ editTodo: mockEditTodo });

  const screen = await render(<TodoItem todo={...} />);
  await userEvent.click(editButton);

  const errorAlert = screen.getByRole("alert");
  expect(errorAlert).toHaveTextContent(/保存に失敗しました/i);
});
```

**Checking Element Absence:**

```typescript
expect(mockDeleteTodo).toHaveBeenCalledWith({ todoId: "test-id" });
expect(screen.getByRole("paragraph")).not.toBeInTheDocument();
```

**Wait Patterns (E2E):**

```typescript
const list = page.getByRole("list");
await list.waitFor(); // Wait for element to appear

const items = await list.getByRole("listitem").all(); // Get all items
```

## Test Configuration Details

**Vitest Projects (from `vite.config.ts`):**

```typescript
test: {
  passWithNoTests: true,     // Allow projects with no tests
  watch: false,              // Disable watch mode
  projects: [
    {
      test: {
        name: "unit",
        environment: "node",
        include: ["**/*.unit.test.{ts,tsx}"],
      },
    },
    {
      test: {
        name: "browser",
        globals: true,         // Enable global test functions (describe, it, etc)
        browser: {
          provider: playwright(),
          instances: [{ browser: "chromium" }],
          headless: true,
          screenshotFailures: false,
        },
      },
    },
  ],
}
```

**Playwright Config (from `playwright.config.ts`):**

```typescript
testDir: "e2e",
fullyParallel: true,
retries: process.env.CI ? 2 : 0,  // Retry on CI only
reporter: "html",
webServer: {
  command: "bun run dev",
  url: "http://localhost:5173",
  reuseExistingServer: !process.env.CI,
},
```

---

_Testing analysis: 2026-03-22_
