# Phase 1: Foundation - Research

**Researched:** 2026-03-22
**Domain:** React + Tailwind CSS v4 + shadcn/ui + localStorage/IndexedDB state architecture
**Confidence:** HIGH

## Summary

Phase 1 strips the existing Todo/Convex/Clerk boilerplate and replaces it with a self-contained application core: a `useReducer`-driven state model persisted to localStorage, IndexedDB image storage via idb-keyval, and a classic noir visual theme applied through Tailwind CSS v4 `@theme` tokens mapped into the shadcn/ui CSS variable system.

The cleanup scope is well-defined — every Convex, Clerk, wouter, and next-themes reference must be excised from `src/`, `package.json`, and `wrangler.jsonc`. What remains is the React + Vite + Tailwind + shadcn scaffolding (ErrorBoundary, `shared/ui/*`, `shared/lib/utils.ts`) plus the new Plotted-specific foundation.

The theme work requires converting 10 hex design tokens into OKLCH values (Tailwind v4's native color space), mapping them into shadcn's CSS variable contract (`--background`, `--foreground`, `--card`, `--border`, `--primary`, etc.) inside `:root`, and bridging those into Tailwind utility classes via the `@theme inline` directive in `index.css`. Dark mode support is deliberately dropped; the `.dark` block and `next-themes` are removed.

**Primary recommendation:** Build in order — (1) clean + verify build, (2) define State type and reducer in `shared/model/`, (3) wire localStorage persistence hook, (4) install idb-keyval and create IndexedDB image hook, (5) replace CSS theme tokens. Each step produces a compilable checkpoint.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** クリーンアップ後の初期画面はタイトル「Plotted.」を左上に小さく配置したミニマルな空ページ。ヘッダーバーは作らない
- **D-02:** タイトルはsans-serif（UI全般と同じシステムフォント）で表示
- **D-03:** `wouter`は削除し、1コンポーネントを直接レンダリングする（SPAで1ページのみ）
- **D-04:** 破損データ（JSONパースエラー、スキーマ不一致）はサイレントリセット — ユーザー通知なしで初期状態で起動
- **D-05:** バリデーションは最低限 — JSONパース成功 + トップレベルキー（`chars`, `maps`, `logs`, `days`等）の存在チェックのみ。Valibotによる厳密な値域検証はしない
- **D-06:** IndexedDBアクセス不可時はマップ画像なしで起動（他の機能は使える）
- **D-07:** データマイグレーション機構は不要。v1完成までデータ構造は変えない前提
- **D-08:** Phase 1でページ全体にノワールテーマを適用する（背景色: 羊皮紙ベージュ、テキスト色: ダークブラウンが効いている状態）
- **D-09:** shadcn/uiコンポーネントもPhase 1でテーマカスタマイズする。CSS変数をshadcnの変数体系にマッピングし、全コンポーネントがノワールテーマで表示される状態にする
- **D-10:** Tailwind CSS v4の`@theme`ディレクティブでセマンティックなトークン名を定義する（例: `--color-bg`, `--color-surface` → `bg-bg`, `text-ink-dark`として使用可能）
- **D-11:** ダークモードは対応しない。`next-themes`は削除。ノワールテーマ1本のみ

### Claude's Discretion

- shadcn/ui CSS変数マッピングの具体的な変数名設計
- `@theme`のトークン命名の詳細（セマンティック名のバリエーション）
- 初期画面のタイトル周りのスタイリング詳細（フォントサイズ、余白等）
- useReducerのアクション設計とディスパッチ構造
- localStorage保存のデバウンス戦略

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID       | Description                                                                                      | Research Support                                                                      |
| -------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| SETUP-01 | 既存のTodoアプリ・Convex・Clerk関連コードを全て削除し、ビルドが通る状態にする                    | Cleanup inventory below; files and packages identified                                |
| SETUP-02 | アプリ全体の状態をuseReducerで管理し、全操作後にlocalStorageへ自動保存・リロード時に自動復元する | State type from PROJECT.md, useEffect + useReducer pattern documented                 |
| SETUP-03 | マップ画像をIndexedDB（idb-keyval）に保存し、localStorage容量制限を回避する                      | idb-keyval 6.2.2 API verified; install and usage patterns documented                  |
| SETUP-04 | クラシック・ノワールのカラーテーマ・タイポグラフィ・UIルールをTailwind CSS変数として定義する     | Tailwind v4 @theme + shadcn CSS variable contract documented; OKLCH conversion mapped |

</phase_requirements>

---

## Standard Stack

### Core (already installed)

| Library                  | Version       | Purpose             | Why Standard      |
| ------------------------ | ------------- | ------------------- | ----------------- |
| React                    | 19.2.4        | UI framework        | Already installed |
| Tailwind CSS             | 4.2.2         | Utility CSS         | Already installed |
| shadcn (components)      | 4.1.0         | UI component system | Already installed |
| class-variance-authority | 0.7.1         | Component variants  | Already installed |
| clsx + tailwind-merge    | 2.1.1 / 3.5.0 | Class composition   | Already installed |

### New Dependency Required

| Library    | Version | Purpose                   | When to Use                       |
| ---------- | ------- | ------------------------- | --------------------------------- |
| idb-keyval | 6.2.2   | IndexedDB key-value store | SETUP-03: storing map image Blobs |

**Installation:**

```bash
bun add idb-keyval
```

**Version verification:** `npm view idb-keyval version` → 6.2.2 (verified 2026-03-22)

### Packages to Remove (from package.json dependencies)

| Package        | Why Remove                     |
| -------------- | ------------------------------ |
| `convex`       | Backend removed entirely       |
| `@clerk/react` | Auth removed entirely          |
| `wouter`       | Single page, no routing needed |
| `next-themes`  | Dark mode dropped (D-11)       |

### devDependencies to Remove

| Package                   | Why Remove                                      |
| ------------------------- | ----------------------------------------------- |
| `@clerk/testing`          | No Clerk, no Clerk tests                        |
| `@cloudflare/vite-plugin` | Cloudflare Workers not used (static Pages only) |
| `wrangler`                | Workers CLI not needed for static Pages         |
| `@dotenvx/dotenvx`        | No env vars needed after removing Convex/Clerk  |

> **Note on Cloudflare plugin:** The project deploys to Cloudflare Pages (static). The `@cloudflare/vite-plugin` adds Workers integration which is unused. Remove it from `vite.config.ts` and `package.json`. Verify `vite build` still works without it.

### Alternatives Considered

| Instead of | Could Use   | Tradeoff                                                                                         |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------ |
| idb-keyval | localforage | localforage is larger (27kB vs 0.6kB); idb-keyval is sufficient and matches REQUIREMENTS.md spec |
| useReducer | Zustand     | Zustand requires extra install; useReducer + context is zero-dependency per STATE.md decision    |

---

## Architecture Patterns

### Recommended Project Structure (after cleanup)

```
src/
├── app/
│   ├── index.tsx          # Entry: createRoot only, no providers
│   ├── providers/
│   │   └── ErrorBoundary/ # Keep as-is
│   └── styles/
│       └── index.css      # Replace with noir @theme tokens
├── pages/
│   └── home/
│       └── ui/
│           └── HomePage.tsx  # Replace with minimal Plotted. page
├── shared/
│   ├── model/             # NEW: state type + reducer + persistence hooks
│   │   ├── state.ts       # State type definition (from PROJECT.md)
│   │   ├── reducer.ts     # useReducer actions
│   │   ├── use-app-state.ts  # Hook: useReducer + localStorage auto-save
│   │   └── use-map-images.ts # Hook: idb-keyval image operations
│   ├── lib/
│   │   └── utils.ts       # Keep: cn() utility
│   └── ui/                # Keep: Button, Input, Field, Item, Label, Separator, Skeleton
├── features/
│   └── (empty)            # Delete features/todo/ entirely
└── widgets/
    └── (empty or delete)  # Delete widgets/header/ (no header per D-01)
```

### Pattern 1: useReducer + localStorage Auto-Save

**What:** State lives in `useReducer`; a `useEffect` watches state and writes to localStorage on every change. Initial state is loaded via the reducer's initializer function (third arg to `useReducer`).

**When to use:** Single-page app with no backend, where all state fits in localStorage.

**Example:**

```typescript
// src/shared/model/use-app-state.ts
const STORAGE_KEY = "plotted-v1";

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidState(parsed)) return initialState; // top-level key check only (D-05)
    return parsed as State;
  } catch {
    return initialState; // silent reset on parse error (D-04)
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return { state, dispatch };
}
```

> **Debounce strategy (Claude's Discretion):** For Phase 1, no debounce is needed — the app has no rapid-fire state updates yet. Add debounce in a later phase if performance issues surface. `useEffect` dependency on the full `state` object is correct; React batches concurrent updates.

### Pattern 2: Minimal State Validation (D-05)

**What:** Check JSON parse success + top-level key existence. Do NOT use Valibot for deep value validation.

```typescript
function isValidState(v: unknown): v is State {
  if (typeof v !== "object" || v === null) return false;
  const keys: (keyof State)[] = [
    "chars",
    "maps",
    "logs",
    "days",
    "activeChar",
    "activeDay",
    "currentTime",
  ];
  return keys.every((k) => k in (v as object));
}
```

### Pattern 3: idb-keyval Image Storage (SETUP-03)

**What:** Map images stored as Blobs in IndexedDB using idb-keyval. The `maps[].img` field in localStorage holds only a map ID; the actual Blob is retrieved from IndexedDB by that key.

**When to use:** Blobs/files too large for localStorage 5MB quota.

```typescript
// src/shared/model/use-map-images.ts
import { get, set, del } from "idb-keyval";

export async function saveMapImage(mapId: string, blob: Blob): Promise<void> {
  try {
    await set(`map-img-${mapId}`, blob);
  } catch {
    // D-06: IndexedDB unavailable — silently fail, image stays null
  }
}

export async function loadMapImage(mapId: string): Promise<Blob | null> {
  try {
    return (await get<Blob>(`map-img-${mapId}`)) ?? null;
  } catch {
    return null; // D-06: fail gracefully
  }
}

export async function deleteMapImage(mapId: string): Promise<void> {
  try {
    await del(`map-img-${mapId}`);
  } catch {
    // ignore
  }
}
```

### Pattern 4: Tailwind CSS v4 Noir Theme (SETUP-04)

**What:** In `index.css`, replace the default shadcn theme with noir tokens in `:root`, then use `@theme inline` to bridge them to Tailwind utility classes.

**shadcn CSS variable contract (required for shadcn components to work):**

| shadcn variable          | Noir mapping | Hex        |
| ------------------------ | ------------ | ---------- |
| `--background`           | bg           | `#F5F0E8`  |
| `--foreground`           | ink-dark     | `#2C2416`  |
| `--card`                 | card         | `#FAF6EE`  |
| `--card-foreground`      | ink-dark     | `#2C2416`  |
| `--popover`              | card         | `#FAF6EE`  |
| `--popover-foreground`   | ink-dark     | `#2C2416`  |
| `--primary`              | accent       | `#7A4F2A`  |
| `--primary-foreground`   | accent-pale  | `#F0E4CC`  |
| `--secondary`            | surface      | `#EDE7D9`  |
| `--secondary-foreground` | ink-dark     | `#2C2416`  |
| `--muted`                | surface      | `#EDE7D9`  |
| `--muted-foreground`     | ink-muted    | `#9C8B6E`  |
| `--accent`               | accent-pale  | `#F0E4CC`  |
| `--accent-foreground`    | accent       | `#7A4F2A`  |
| `--destructive`          | keep red     | (existing) |
| `--border`               | border-gold  | `#C8B99A`  |
| `--input`                | border-light | `#DDD3BE`  |
| `--ring`                 | accent       | `#7A4F2A`  |

**OKLCH conversion note:** Tailwind v4 uses OKLCH natively. Use an OKLCH conversion tool (e.g. `oklch.com`) to convert the project's hex palette. The `index.css` already uses OKLCH values — the planner should look these up for the 10 project colors. Example: `#F5F0E8` (parchment) → approx `oklch(0.96 0.018 78)`.

**Semantic @theme tokens (D-10):**

```css
/* src/app/styles/index.css */

:root {
  /* noir palette as shadcn vars */
  --background: oklch(/* #F5F0E8 */);
  --foreground: oklch(/* #2C2416 */);
  /* ... all shadcn vars mapped to noir colors */

  /* Tailwind border radius per UIルール */
  --radius: 10px; /* card radius */
}

@theme inline {
  /* shadcn bridge (keep existing @theme inline block) */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... */

  /* Semantic noir tokens (D-10) — usable as bg-bg, text-ink-dark, etc. */
  --color-bg: var(--background);
  --color-surface: var(--secondary);
  --color-card-noir: var(--card);
  --color-border-gold: var(--border);
  --color-border-light: var(--input);
  --color-ink-dark: var(--foreground);
  --color-ink-mid: oklch(/* #6B5B3E */);
  --color-ink-muted: var(--muted-foreground);
  --color-accent-dark: var(--primary);
  --color-accent-pale: var(--accent);

  /* Border radius tokens per UIルール */
  --radius-card: 10px;
  --radius-button: 6px;
  --radius-chip: 999px;
}
```

> **Remove dark mode:** Delete the `.dark { ... }` block entirely. Remove `@custom-variant dark` line. Remove `next-themes` import from `index.tsx`. Remove the Noto Sans font import (app uses system sans-serif per D-02).

### Pattern 5: Minimal App Entry (after cleanup)

**What:** After removing Convex/Clerk/wouter, `index.tsx` becomes a direct render:

```typescript
// src/app/index.tsx
import "./styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "@/app/providers/ErrorBoundary";
import { PlottedApp } from "@/pages/home";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <PlottedApp />
    </ErrorBoundary>
  </StrictMode>,
);
```

### Anti-Patterns to Avoid

- **Storing image Blobs in localStorage:** Blobs cannot be JSON-serialized; they will silently become `{}`. Always use IndexedDB for binary data.
- **Importing from `@/features/todo` after deletion:** TypeScript will catch this but remove barrel re-exports before deleting files.
- **Using `any` for the initializer function:** Type the loaded state correctly to avoid losing type safety at the persistence boundary.
- **Keeping `@cloudflare/vite-plugin` with Convex env vars:** The plugin expects `VITE_CONVEX_URL` which will be missing. Remove the plugin and its env deps together.
- **Keeping the `@fontsource-variable/noto-sans` import after removing it from `@theme`:** The CSS `@import` must also be removed or the build will include a large unused font.

---

## Don't Hand-Roll

| Problem                | Don't Build                | Use Instead                       | Why                                                                                            |
| ---------------------- | -------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------- |
| IndexedDB key-value    | Custom IndexedDB wrapper   | idb-keyval                        | IDB API is verbose; error handling, transaction management, store upgrades are all non-trivial |
| Tailwind class merging | Custom className concat    | `cn()` from `shared/lib/utils.ts` | Already exists; handles Tailwind-specific conflict resolution                                  |
| OKLCH color values     | Manually calculating OKLCH | Use oklch.com converter           | OKLCH math is non-trivial; converter gives accurate values instantly                           |

**Key insight:** The persistence layer's main complexity is IndexedDB for images — idb-keyval eliminates all of that complexity in 573 bytes.

---

## Cleanup Inventory (SETUP-01)

### Files to Delete

| Path                              | Reason                                                      |
| --------------------------------- | ----------------------------------------------------------- |
| `src/features/todo/`              | Entire Todo feature slice                                   |
| `src/shared/api/convex/`          | Convex schema, mutations, generated types                   |
| `src/shared/api/index.ts`         | Only exports convexApi — delete or replace with empty/no-op |
| `src/widgets/header/`             | Header widget (no header per D-01)                          |
| `src/app/routes/`                 | Routing layer (no routing per D-03)                         |
| `src/pages/home/ui/HomePage.tsx`  | Replace with PlottedApp component                           |
| `e2e/todo.spec.ts`                | Todo-specific e2e test                                      |
| `e2e/global.setup.ts` (if exists) | Clerk auth setup                                            |

### Files to Modify

| Path                       | Change                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/index.tsx`        | Remove Convex/Clerk providers; simplify to ErrorBoundary + PlottedApp                                                                                               |
| `src/app/styles/index.css` | Replace shadcn default theme with noir tokens; remove dark mode; remove Noto Sans import                                                                            |
| `package.json`             | Remove `convex`, `@clerk/react`, `wouter`, `next-themes` from deps; remove `@clerk/testing`, `@cloudflare/vite-plugin`, `wrangler`, `@dotenvx/dotenvx` from devDeps |
| `vite.config.ts`           | Remove `cloudflare()` plugin import and usage                                                                                                                       |
| `wrangler.jsonc`           | No longer needed for static Pages — can be kept or removed (low priority)                                                                                           |
| `playwright.config.ts`     | Remove auth setup dependency; simplify to direct page tests                                                                                                         |

### Environment Files

| File        | Change                                             |
| ----------- | -------------------------------------------------- |
| `.env.dev`  | Remove VITE_CONVEX_URL, VITE_CLERK_PUBLISHABLE_KEY |
| `.env.prod` | Same                                               |

---

## Common Pitfalls

### Pitfall 1: TypeScript errors from deleted Convex types

**What goes wrong:** After deleting `src/shared/api/convex/`, TypeScript finds orphaned imports in files that were missed during cleanup (e.g. the `src/shared/api/index.ts` barrel).
**Why it happens:** Barrel files re-export; the barrel itself must be deleted or replaced before the inner files are removed.
**How to avoid:** Run `bun run typecheck` immediately after each deletion step. Delete the barrel first, then its contents.

### Pitfall 2: vite.config.ts fails without Cloudflare plugin env

**What goes wrong:** The `@cloudflare/vite-plugin` may attempt to read wrangler config or Cloudflare-specific environment on startup, causing `vite dev` to fail even after removing Convex.
**How to avoid:** Remove `cloudflare()` from `vite.config.ts` plugins array in the same step as removing the package.

### Pitfall 3: OKLCH values produce unexpected colors

**What goes wrong:** Hand-calculated OKLCH values for the noir palette produce visually different colors from the design spec.
**Why it happens:** OKLCH gamut and lightness scale differ from sRGB hex.
**How to avoid:** Use an OKLCH converter (oklch.com or similar) for each of the 10 palette colors. Verify visually in browser.

### Pitfall 4: localStorage saves corrupted Blob references

**What goes wrong:** Code attempts to `JSON.stringify(state)` when `state.maps[].img` contains a Blob object rather than an ID string.
**Why it happens:** The state type specifies `img: string | null` (per PROJECT.md) — but if image loading code accidentally puts a Blob into state instead of an ID, it silently corrupts.
**How to avoid:** The `img` field stores only the map's UUID string. The actual Blob lives only in IndexedDB. Keep types strict.

### Pitfall 5: @fontsource Noto Sans conflicts with system font intent

**What goes wrong:** The `@import "@fontsource-variable/noto-sans"` remains in CSS and overrides the system font, contradicting D-02.
**How to avoid:** Remove the `@import` line and `--font-sans` override in the `@theme inline` block when removing next-themes/dark mode.

---

## Code Examples

### State Type (from PROJECT.md)

```typescript
// src/shared/model/state.ts
export type PlotLog = {
  id: number;
  char: string; // character name
  map: string; // map id
  day: number;
  time: number; // 0–143 (10-minute index)
  x: number; // 0.0–1.0
  y: number; // 0.0–1.0
};

export type MapDef = {
  id: string;
  name: string;
  img: string | null; // map ID key into IndexedDB; null if no image
};

export type CharDef = {
  name: string;
  color: string;
};

export type State = {
  chars: CharDef[];
  maps: MapDef[];
  logs: PlotLog[];
  days: number; // 1–7
  activeChar: string | null;
  activeDay: number;
  currentTime: number; // 0–143
};

export const initialState: State = {
  chars: [],
  maps: [],
  logs: [],
  days: 1,
  activeChar: null,
  activeDay: 1,
  currentTime: 0,
};
```

### useReducer Action Shape (Claude's Discretion recommendation)

```typescript
// src/shared/model/reducer.ts
// Phase 1 needs no actions yet — future phases add CHAR_ADD, MAP_ADD, etc.
// Define the union type now so dispatch type is correct from day one.

export type Action = { type: "RESET" };
// Phase 2+ actions will be added here

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return initialState;
    default:
      return state;
  }
}
```

### Minimal PlottedApp (initial page, D-01/D-02/D-03)

```typescript
// src/pages/home/ui/PlottedApp.tsx
export function PlottedApp() {
  return (
    <div className="min-h-screen bg-background p-4">
      <span className="text-sm font-medium text-foreground">Plotted.</span>
    </div>
  );
}
```

---

## State of the Art

| Old Approach                               | Current Approach                 | When Changed            | Impact                                                |
| ------------------------------------------ | -------------------------------- | ----------------------- | ----------------------------------------------------- |
| shadcn themes in `tailwind.config.js`      | `@theme inline` directive in CSS | Tailwind v4 (2025)      | Theme definition moves entirely to CSS                |
| HSL color values in shadcn                 | OKLCH values                     | shadcn v4 / Tailwind v4 | More perceptually uniform; `oklch()` in CSS variables |
| Dark mode via `next-themes` class toggling | Single `:root` theme (no dark)   | This phase (D-11)       | Simpler; remove `.dark` block entirely                |
| ConvexProviderWithClerk wrapping app       | Direct `createRoot`              | This phase (SETUP-01)   | Zero external dependencies                            |

**Deprecated/outdated in this project:**

- `wouter`: Was used for SPA routing; app is now single-page with no routes
- `@custom-variant dark`: Must be removed along with the `.dark { }` block
- `@fontsource-variable/noto-sans`: Replaced by system font per D-02

---

## Open Questions

1. **OKLCH hex conversions for all 10 palette colors**
   - What we know: The 10 hex values are specified in PROJECT.md
   - What's unclear: Exact OKLCH values not pre-computed
   - Recommendation: Planner's execution step should use an OKLCH converter. Approximate values for reference:
     - `#F5F0E8` → `oklch(0.96 0.018 78)`
     - `#EDE7D9` → `oklch(0.93 0.020 78)`
     - `#FAF6EE` → `oklch(0.98 0.012 78)`
     - `#C8B99A` → `oklch(0.77 0.040 78)`
     - `#DDD3BE` → `oklch(0.85 0.025 78)`
     - `#2C2416` → `oklch(0.18 0.030 68)`
     - `#6B5B3E` → `oklch(0.42 0.045 68)`
     - `#9C8B6E` → `oklch(0.60 0.040 70)`
     - `#7A4F2A` → `oklch(0.38 0.075 56)`
     - `#F0E4CC` → `oklch(0.92 0.035 82)`
   - These are approximations — verify visually in browser.

2. **wrangler.jsonc retention**
   - What we know: Cloudflare Pages (static) does not require Workers CLI
   - What's unclear: Whether keeping `wrangler.jsonc` with stale config causes build errors
   - Recommendation: Remove `wrangler.jsonc` and all Workers-related dev scripts from `package.json` (`deploy`, `cf-typegen`, `check`). Keep `build` script. Low priority blocker — `bun run build` via Vite alone is sufficient.

---

## Sources

### Primary (HIGH confidence)

- Codebase inspection (`src/app/index.tsx`, `src/app/styles/index.css`, `package.json`, `vite.config.ts`) — current state of all files to modify
- `.planning/PROJECT.md` §Design — canonical State type, color palette (10 colors), UIルール
- `.planning/phases/01-foundation/1-CONTEXT.md` — all locked decisions D-01 through D-11

### Secondary (MEDIUM confidence)

- [Tailwind v4 shadcn docs](https://ui.shadcn.com/docs/tailwind-v4) — `@theme inline` directive, OKLCH vars, shadcn CSS variable contract
- [idb-keyval npm](https://www.npmjs.com/package/idb-keyval) — version 6.2.2, get/set/del API
- [idb-keyval README](https://github.com/jakearchibald/idb-keyval/blob/main/README.md) — official usage patterns

### Tertiary (LOW confidence)

- Approximate OKLCH values computed from hex — verify visually in browser

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all packages inspected directly from package.json and npm registry
- Architecture: HIGH — derived from existing codebase structure + FSD skill rules + PROJECT.md
- Pitfalls: HIGH — identified from direct code inspection of files being deleted/modified
- OKLCH values: LOW — approximations, not from official converter

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable stack — Tailwind v4 and shadcn patterns unlikely to change)
