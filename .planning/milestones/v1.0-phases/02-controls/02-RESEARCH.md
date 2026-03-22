# Phase 2: Controls - Research

**Researched:** 2026-03-22
**Domain:** React UI controls — character management, day/time controls, collapsible toolbar, data reset dialog
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** コントロール群は上部に横並び配置（1〜2行のツールバー的レイアウト）。マップ表示領域を最大化する
- **D-02:** コントロール群は折りたたみ可能。マダミスプレイ中にマップを広く見たい時に畳める
- **D-03:** リセットボタンはコントロール群の端に小さく配置。誤操作防止のため目立たせない
- **D-04:** 「Plotted.」タイトルは削除してスペースを確保
- **D-05:** プリセットパレット（12色）+ 自由入力（カラーピッカーまたはHEXコード）の併用
- **D-06:** 同じ色を複数キャラクターに使用可能（制限しない）
- **D-07:** キャラクターの最大人数に制限なし
- **D-08:** カラー背景のバッジ型チップ。チップ全体がキャラカラーで塗られ、白文字で名前表示
- **D-09:** アクティブ状態はサイズ拡大+影で表現
- **D-10:** キャラクター追加フォームはチップ列の下に常時表示
- **D-11:** キャラクター削除はチップ上のホバーで「×」表示。クリックで即削除（確認ダイアログなし）
- **D-12:** タブ風の横並びボタン。`[Day1] [Day2] [Day3]` のように並び、+/-ボタンでDay数を増減
- **D-13:** Day選択と時刻コントロールは2段構成。上段にDay選択、下段に時刻スライダー+微調整ボタン
- **D-14:** スライダー + 目盛り付き。0時、6時、12時、18時などの目盛りラベルを表示
- **D-15:** 微調整ボタン（-10m / -5m / +5m / +10m）はスライダーの下に横並び配置

### Claude's Discretion

- プリセット12色の具体的なカラー値（マップ上での視認性を考慮）
- カラーピッカーのUI実装方式（ブラウザネイティブ or カスタム）
- 折りたたみのアニメーションとトリガーUI
- Day選択タブのアクティブ状態のスタイリング
- スライダーの目盛り数と間隔の詳細
- 時刻表示のフォント（PROJECT.mdでserif体と定義済み）
- reducerのアクション設計とディスパッチ構造

### Deferred Ideas (OUT OF SCOPE)

- カラーパレットのプリセット（UX-01） — v2 Requirements
- キーボード矢印キーによる時刻操作（UX-02） — v2 Requirements
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                            | Research Support                                                 |
| ------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| CHAR-01 | 名前（最大10文字）とカラーを指定してキャラクターを追加できる           | Input maxLength=10 + color picker + ADD_CHAR reducer action      |
| CHAR-02 | キャラクターチップをクリックしてアクティブキャラクターを切り替えられる | SET_ACTIVE_CHAR reducer action + chip click handler              |
| CHAR-03 | キャラクターを削除すると、関連するプロットデータもカスケード削除される | DELETE_CHAR reducer action filters both chars and logs arrays    |
| TIME-01 | Day1〜Day7を選択でき、+/-ボタンでDay数を増減できる                     | SET_DAYS reducer action + day tab buttons                        |
| TIME-02 | Dayを減らした場合、該当Day以降のログが自動削除される                   | SET_DAYS filters logs where log.day > newDays                    |
| TIME-03 | スライダーで10分単位（00:00〜23:50）の時刻を操作できる                 | @base-ui/react Slider (min=0, max=143, step=1) + SET_TIME action |
| TIME-04 | -10m / -5m / +5m / +10m ボタンで時刻を微調整できる                     | ADJUST_TIME reducer action with clamp 0-143                      |
| DATA-01 | リセットボタンで全データを初期化できる（確認ダイアログあり）           | @base-ui/react Dialog + existing RESET action                    |

</phase_requirements>

---

## Summary

Phase 2 builds the toolbar UI for configuring session context: character management (add/select/delete), day and time controls, and a reset confirmation dialog. All state changes flow through the existing `useReducer` + `localStorage` auto-persistence pattern established in Phase 1. The reducer in `src/shared/model/reducer.ts` currently only handles `RESET` and must be extended with 5 new action types.

The key technical insight is that the project already has all required UI primitives: `@base-ui/react` v1.3.0 ships `Slider`, `Dialog`, and `Collapsible` components that can be used directly without installing additional libraries. The `Button`, `Input`, and `Field` shared components from Phase 1 cover character form construction. No new dependencies are needed.

The toolbar is a collapsible panel (`@base-ui/react` Collapsible) with two sections: character management (chip row + always-visible add form) and time controls (Day tab row + time slider + fine-adjust buttons). The reset button sits at the trailing edge of the toolbar.

**Primary recommendation:** Extend the reducer with typed actions (ADD_CHAR, DELETE_CHAR, SET_ACTIVE_CHAR, SET_DAYS, SET_TIME, ADJUST_TIME), build UI components as features slices (features/character-manager, features/time-controls), wire them into PlottedApp.tsx via the existing `useAppState` hook.

## Standard Stack

### Core

| Library                  | Version | Purpose                                | Why Standard                                                   |
| ------------------------ | ------- | -------------------------------------- | -------------------------------------------------------------- |
| @base-ui/react           | 1.3.0   | Slider, Dialog, Collapsible primitives | Already installed; covers all headless UI needs for this phase |
| React + useReducer       | 19.2.4  | State management via existing pattern  | Phase 1 pattern — no new dependency                            |
| class-variance-authority | 0.7.1   | Variant-based chip styling             | Already in use for Button; same pattern for CharChip           |
| ts-pattern               | 5.9.0   | Exhaustive reducer pattern matching    | Already a dependency; improves action type safety              |
| tailwind-merge + clsx    | —       | `cn()` utility for conditional classes | Already available via `@/shared/lib/utils`                     |

### Supporting

| Library      | Version | Purpose                                           | When to Use                                  |
| ------------ | ------- | ------------------------------------------------- | -------------------------------------------- |
| lucide-react | 0.577.0 | Icons for +/- buttons, X delete, chevron collapse | All interactive controls needing icon labels |

### No New Installs Required

All needed components (`Slider`, `Dialog`, `Collapsible`) are already in `@base-ui/react` v1.3.0. Do not install shadcn Slider — STATE.md flags a potential conflict with @base-ui/react and the @base-ui version is verified to have the required component.

**Installation:** None required.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── features/
│   ├── character-manager/      # CHAR-01, CHAR-02, CHAR-03
│   │   ├── ui/
│   │   │   ├── CharChip.tsx         # Single character chip (active state, hover-X)
│   │   │   ├── CharRoster.tsx       # Horizontal chip list
│   │   │   └── AddCharForm.tsx      # Always-visible add form (name input + color picker)
│   │   └── index.ts
│   └── time-controls/          # TIME-01, TIME-02, TIME-03, TIME-04
│       ├── ui/
│       │   ├── DaySelector.tsx      # Day tab buttons + +/- increment
│       │   ├── TimeSlider.tsx       # @base-ui Slider with tick marks
│       │   └── FineAdjustButtons.tsx # -10m/-5m/+5m/+10m row
│       └── index.ts
├── shared/
│   └── model/
│       ├── reducer.ts          # Extended with new actions (Phase 2 adds 5 actions)
│       └── state.ts            # Unchanged (types already complete)
└── pages/
    └── home/
        └── ui/
            └── PlottedApp.tsx  # Toolbar + Collapsible wrapper
```

### Pattern 1: Reducer Action Extension

The reducer uses a discriminated union for `Action`. Extend it by adding new variants. Use `ts-pattern` `match()` for exhaustiveness.

**What:** Add typed action cases to `src/shared/model/reducer.ts`
**When to use:** Every state mutation goes here — no local state for anything shared

```typescript
// Source: existing src/shared/model/reducer.ts pattern
import { match } from "ts-pattern";

export type Action =
  | { type: "RESET" }
  | { type: "ADD_CHAR"; payload: { name: string; color: string } }
  | { type: "DELETE_CHAR"; payload: { name: string } }
  | { type: "SET_ACTIVE_CHAR"; payload: { name: string | null } }
  | { type: "SET_DAYS"; payload: { days: number } } // cascades log deletion
  | { type: "SET_ACTIVE_DAY"; payload: { day: number } }
  | { type: "SET_TIME"; payload: { time: number } } // 0-143
  | { type: "ADJUST_TIME"; payload: { delta: number } }; // ±1, ±2 (in 10-min units)

export const reducer = (state: State, action: Action): State =>
  match(action)
    .with({ type: "RESET" }, () => initialState)
    .with({ type: "ADD_CHAR" }, ({ payload }) => ({
      ...state,
      chars: [...state.chars, { name: payload.name, color: payload.color }],
    }))
    .with({ type: "DELETE_CHAR" }, ({ payload }) => ({
      ...state,
      chars: state.chars.filter((c) => c.name !== payload.name),
      logs: state.logs.filter((l) => l.char !== payload.name),
      activeChar: state.activeChar === payload.name ? null : state.activeChar,
    }))
    .with({ type: "SET_ACTIVE_CHAR" }, ({ payload }) => ({
      ...state,
      activeChar: payload.name,
    }))
    .with({ type: "SET_DAYS" }, ({ payload }) => ({
      ...state,
      days: payload.days,
      logs: state.logs.filter((l) => l.day <= payload.days),
      activeDay: Math.min(state.activeDay, payload.days),
    }))
    .with({ type: "SET_ACTIVE_DAY" }, ({ payload }) => ({
      ...state,
      activeDay: payload.day,
    }))
    .with({ type: "SET_TIME" }, ({ payload }) => ({
      ...state,
      currentTime: Math.max(0, Math.min(143, payload.time)),
    }))
    .with({ type: "ADJUST_TIME" }, ({ payload }) => ({
      ...state,
      currentTime: Math.max(0, Math.min(143, state.currentTime + payload.delta)),
    }))
    .exhaustive();
```

**Note on char identity:** `chars` array uses `name` as the natural key (from state.ts `CharDef`). Since names can conflict if user adds duplicates, ADD_CHAR should guard against duplicate names. Alternative: generate a unique id per char. The current `CharDef` type has no id field — recommend adding `id: string` (nanoid or crypto.randomUUID) to CharDef for stable identity, especially for cascade deletes with logs.

### Pattern 2: @base-ui/react Slider

The Slider API uses composable sub-components: `Slider.Root`, `Slider.Control`, `Slider.Track`, `Slider.Indicator`, `Slider.Thumb`.

**What:** Time slider for 00:00–23:50 in 10-minute increments (144 steps, index 0–143)
**When to use:** TIME-03 requirement; replace any custom range input

```typescript
// Source: @base-ui/react v1.3.0 Slider API (verified from node_modules)
import { Slider } from "@base-ui/react/slider";

// time: number (0-143), onValueChange: (v: number[]) => void
<Slider.Root
  value={[currentTime]}
  onValueChange={([v]) => dispatch({ type: "SET_TIME", payload: { time: v } })}
  min={0}
  max={143}
  step={1}
  aria-label="時刻"
>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
```

**Time conversion utility (needed throughout UI):**

```typescript
// 0-143 index → "HH:MM" string
export const timeIndexToLabel = (index: number): string => {
  const totalMinutes = index * 10;
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

// Used for tick labels at indices: 0 (00:00), 36 (06:00), 72 (12:00), 108 (18:00), 143 (23:50)
```

**Tick marks:** Rendered as a custom overlay below the slider track. Use a datalist or absolute-positioned spans mapped from the 5 major tick indices.

### Pattern 3: @base-ui/react Dialog (Reset Confirmation)

**What:** Confirmation dialog for DATA-01 (reset all data)
**When to use:** Any destructive action requiring confirmation

```typescript
// Source: @base-ui/react v1.3.0 Dialog API (verified from node_modules)
import { Dialog } from "@base-ui/react/dialog";

<Dialog.Root>
  <Dialog.Trigger
    render={
      <Button variant="ghost" size="sm" className="text-muted-foreground">
        リセット
      </Button>
    }
  />
  <Dialog.Portal>
    <Dialog.Backdrop className="fixed inset-0 bg-black/40" />
    <Dialog.Popup className="...noir card styles...">
      <Dialog.Title>データをリセット</Dialog.Title>
      <Dialog.Description>全キャラクター・ログ・マップデータが削除されます。</Dialog.Description>
      <div className="flex gap-2 justify-end">
        <Dialog.Close render={<Button variant="outline">キャンセル</Button>} />
        <Dialog.Close
          render={
            <Button
              variant="destructive"
              onClick={() => dispatch({ type: "RESET" })}
            >
              リセット
            </Button>
          }
        />
      </div>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

### Pattern 4: @base-ui/react Collapsible (Toolbar)

**What:** Collapsible wrapper for the entire control toolbar (D-02)
**When to use:** Wraps the entire controls section for toggle-to-hide behavior

```typescript
// Source: @base-ui/react v1.3.0 Collapsible API (verified from node_modules)
import { Collapsible } from "@base-ui/react/collapsible";

// Collapsible.Root, Collapsible.Trigger, Collapsible.Panel
<Collapsible.Root defaultOpen={true}>
  <Collapsible.Trigger render={<Button variant="ghost" size="icon-sm"><ChevronUpIcon /></Button>} />
  <Collapsible.Panel>
    {/* Character section + Time controls */}
  </Collapsible.Panel>
</Collapsible.Root>
```

`Collapsible.Panel` animates with CSS transitions. Apply `data-[open]:...` / `data-[closed]:...` Tailwind classes or use the `hidden` attribute transition pattern.

### Pattern 5: Character Chip with Hover Delete

**What:** Colored badge chip with hover-revealed × button (D-08, D-09, D-11)
**When to use:** CharRoster renders one CharChip per character

```typescript
// Uses Tailwind group hover + CVA for active state
<div
  className={cn(
    "relative inline-flex cursor-pointer items-center rounded-[999px] px-3 py-1 text-sm font-medium text-white transition-all select-none",
    isActive && "scale-110 shadow-md",
  )}
  style={{ backgroundColor: char.color }}
  onClick={() => dispatch({ type: "SET_ACTIVE_CHAR", payload: { name: char.name } })}
  role="button"
  aria-pressed={isActive}
  tabIndex={0}
>
  <span>{char.name}</span>
  {/* Hover × delete button */}
  <button
    className="ml-1 hidden rounded-full p-0.5 hover:bg-black/20 group-hover:inline-flex"
    onClick={(e) => {
      e.stopPropagation();
      dispatch({ type: "DELETE_CHAR", payload: { name: char.name } });
    }}
    aria-label={`${char.name}を削除`}
  >
    <XIcon className="size-3" />
  </button>
</div>
```

Use `group` on the wrapper div and `group-hover:inline-flex` on the × button. Or use CSS `:hover` visibility toggle. The `group-hover` pattern is simpler and requires no state.

### Pattern 6: Color Picker (D-05)

**What:** 12 preset swatches + `<input type="color">` for custom HEX
**When to use:** CharAddForm color selection

The browser-native `<input type="color">` (styled to be minimal) is the simplest reliable cross-browser color picker. No library needed.

```typescript
// Preset palette (12 colors — high contrast on noir map backgrounds)
const PRESET_COLORS = [
  "#E63946", // red
  "#F4A261", // orange
  "#2A9D8F", // teal
  "#457B9D", // steel blue
  "#6A4C93", // purple
  "#F7C59F", // peach
  "#1D3557", // navy
  "#A8DADC", // light teal
  "#E9C46A", // yellow
  "#264653", // dark teal
  "#F1FAEE", // off-white (caution: low contrast on light maps)
  "#70D6FF", // sky blue
] as const;
```

These colors are recommended for visibility on typical map backgrounds (medium-dark maps). The Claude's Discretion area permits adjustment. Avoid pure white (#FFFFFF) and near-background beige tones since they blend with the noir theme.

### Anti-Patterns to Avoid

- **Installing shadcn Slider:** STATE.md explicitly flags potential conflict with @base-ui/react. Use @base-ui Slider directly.
- **Using `name` as char ID without uniqueness enforcement:** DELETE_CHAR and SET_ACTIVE_CHAR use name as key. Either enforce unique names on ADD_CHAR or add a generated `id` to CharDef. Recommend unique name enforcement (simpler, user-visible).
- **Local component state for activeChar/activeDay/currentTime:** These must live in the global reducer; they are read by future phases (Phase 3: Plot).
- **Inline styles for all chip colors:** Use `style={{ backgroundColor: char.color }}` only for the dynamic character color. All other styling via Tailwind.
- **Uncontrolled slider:** Slider must be controlled (`value=` + `onValueChange=`) so dispatch stays the source of truth.

## Don't Hand-Roll

| Problem                  | Don't Build                             | Use Instead                             | Why                                                          |
| ------------------------ | --------------------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| Collapsible/accordion UI | Custom useState + height animation      | @base-ui/react Collapsible              | Handles accessibility, keyboard, animation                   |
| Range slider             | `<input type="range">` with manual ARIA | @base-ui/react Slider                   | ARIA attributes, keyboard nav, multiple thumbs all handled   |
| Confirmation dialog      | Custom modal with backdrop              | @base-ui/react Dialog                   | Focus trap, escape key, portal, accessibility all handled    |
| Color input              | Custom color swatch selector only       | `<input type="color">` + swatches       | Browser native covers full spectrum; swatches are additive   |
| Time formatting          | Ad-hoc string concat                    | `timeIndexToLabel` utility (shared/lib) | Single source of truth for time display across Phase 2 and 3 |

**Key insight:** @base-ui/react 1.3.0 already installed covers every interactive primitive needed. The build cost is zero; skip any library search.

## Common Pitfalls

### Pitfall 1: Character Identity via Name Only

**What goes wrong:** Two characters named "Alice" cause DELETE_CHAR to remove both. SET_ACTIVE_CHAR becomes ambiguous.
**Why it happens:** CharDef has no id field; name is the natural key.
**How to avoid:** Enforce unique name on ADD_CHAR (reject duplicates with user error), OR add `id: crypto.randomUUID()` to CharDef. Unique name enforcement is simpler for the UI and avoids a state migration.
**Warning signs:** If ADD_CHAR doesn't validate uniqueness, test with duplicate names — cascade delete will silently delete too many.

### Pitfall 2: SET_DAYS Cascade Misses activeDay Reset

**What goes wrong:** User reduces days from 5 to 3. activeDay remains 5. Time controls show Day 5 but it no longer exists.
**Why it happens:** Reducer only filters `logs` but forgets to clamp `activeDay`.
**How to avoid:** In SET_DAYS handler: `activeDay: Math.min(state.activeDay, payload.days)`.
**Warning signs:** After reducing days, day tab shows a tab that doesn't exist; clicking it is a no-op.

### Pitfall 3: Time Index Off-By-One Boundary

**What goes wrong:** ADJUST_TIME with +2 at time=142 produces 144, which is out of range (max is 143, representing 23:50).
**Why it happens:** Clamp not applied, or applied wrong direction.
**How to avoid:** Always clamp: `Math.max(0, Math.min(143, state.currentTime + delta))`.
**Warning signs:** Time display shows "24:00" or invalid values.

### Pitfall 4: Slider `onValueChange` vs `onValueCommitted`

**What goes wrong:** `onValueCommitted` only fires on mouseup/touchend — dragging the slider won't update displayed time until released.
**Why it happens:** Wrong @base-ui Slider event chosen.
**How to avoid:** Use `onValueChange` (fires continuously during drag) for `SET_TIME` dispatch.
**Warning signs:** Time label only updates after releasing the slider thumb.

### Pitfall 5: Collapsible Animation with Tailwind

**What goes wrong:** `Collapsible.Panel` appears/disappears without animation, or has janky height jump.
**Why it happens:** @base-ui Collapsible Panel uses `hidden` attribute for closed state; direct `height` transition needs explicit CSS.
**How to avoid:** Use the `data-[open]:grid-rows-[1fr] data-[closed]:grid-rows-[0fr]` pattern with `overflow-hidden` wrapper. This is documented in @base-ui examples. Alternative: use simple opacity + translate transition if full height animation is not required.
**Warning signs:** Panel content still visible when collapsed, or no transition at all.

### Pitfall 6: Color Input Styling Mismatch

**What goes wrong:** `<input type="color">` appears as a small OS-native widget that doesn't match the noir theme.
**Why it happens:** Browser default styling for `type="color"` is platform-specific.
**How to avoid:** Size and clip the input: `w-8 h-8 cursor-pointer rounded border-border p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch-wrapper]:p-0`. The swatch itself becomes the visible element.
**Warning signs:** Ugly browser-default color button breaks the noir aesthetic.

## Code Examples

### Time Index Utility

```typescript
// Source: PROJECT.md §Design data structure (time: 0-143 is 10-min index)
// Place in: src/shared/lib/time.ts

export const TIME_MIN = 0;
export const TIME_MAX = 143; // 23:50

export const timeIndexToLabel = (index: number): string => {
  const totalMinutes = index * 10;
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

// Major tick indices for slider labels: 00:00, 06:00, 12:00, 18:00, 23:50
export const SLIDER_TICKS = [0, 36, 72, 108, 143] as const;
```

### Recommended 12 Preset Colors

```typescript
// Source: Claude's Discretion — chosen for map visibility on medium-tone backgrounds
// Place in: src/features/character-manager/lib/presetColors.ts

export const PRESET_COLORS = [
  "#E63946", // crimson
  "#F4A261", // amber orange
  "#2A9D8F", // teal
  "#457B9D", // steel blue
  "#6A4C93", // violet
  "#E9C46A", // golden yellow
  "#264653", // dark slate
  "#A8DADC", // ice blue
  "#E76F51", // burnt orange
  "#606C38", // olive green
  "#9B2226", // dark red
  "#70D6FF", // sky blue
] as const;
```

### useAppState Hook Integration

```typescript
// Source: src/shared/model/use-app-state.ts (Phase 1 pattern)
// Usage in feature UI component:
import { useAppState } from "@/shared/model";

export const CharRoster = () => {
  const { state, dispatch } = useAppState();
  // state.chars, state.activeChar available
  // dispatch({ type: "SET_ACTIVE_CHAR", payload: { name: c.name } })
};
```

### FSD Slice Export Pattern

```typescript
// src/features/character-manager/index.ts
export { CharRoster } from "./ui/CharRoster";
export { AddCharForm } from "./ui/AddCharForm";

// src/features/time-controls/index.ts
export { DaySelector } from "./ui/DaySelector";
export { TimeSlider } from "./ui/TimeSlider";
export { FineAdjustButtons } from "./ui/FineAdjustButtons";
```

## State of the Art

| Old Approach                | Current Approach                             | When Changed           | Impact                                      |
| --------------------------- | -------------------------------------------- | ---------------------- | ------------------------------------------- |
| shadcn Slider (Radix-based) | @base-ui/react Slider                        | @base-ui v1.3.0 (2024) | Radix conflict avoided; same API ergonomics |
| Manual dialog state         | @base-ui/react Dialog                        | Already in project     | No useState needed for open/close           |
| CSS grid height trick       | @base-ui Collapsible Panel + data attributes | @base-ui v1.x          | Accessible expand/collapse with animation   |

**Deprecated/outdated:**

- shadcn Slider: Would conflict with @base-ui/react. STATE.md Blockers/Concerns confirms this. Use `@base-ui/react/slider` directly.

## Open Questions

1. **CharDef identity: name vs generated id**
   - What we know: Current CharDef has `{ name: string; color: string }`. Logs reference char by `char: string` (name).
   - What's unclear: If user wants to rename a character in a future phase, name-keyed identity breaks. Phase 2 doesn't include rename, but the data model choice now constrains Phase 3+.
   - Recommendation: Add `id: string` to CharDef now (generated via `crypto.randomUUID()`). Update `logs.char` to reference char id instead of name. This is a one-time migration cost in Phase 2 reducer that prevents a painful migration later. If the planner prefers not to change the data model, enforce unique name with ADD_CHAR validation.

2. **Collapsible default state persistence**
   - What we know: D-02 says collapsible. No decision on whether the open/closed state should persist across reloads.
   - What's unclear: Should the collapsed state be saved to localStorage?
   - Recommendation: Keep collapsed state local (useState in PlottedApp). It's UI-only state with no business meaning. No reducer action needed.

3. **Day tab rendering when days=7**
   - What we know: D-12 shows tab-style Day buttons. With up to 7 days, all 7 tabs must be visible horizontally.
   - What's unclear: At narrow viewports, 7 tabs may overflow. Scroll or wrap?
   - Recommendation: Allow horizontal scroll on the day tab row (`overflow-x-auto`). The app targets desktop, so this is an edge case.

## Sources

### Primary (HIGH confidence)

- `node_modules/@base-ui/react/slider/index.d.ts` — Slider sub-component API verified from installed package
- `node_modules/@base-ui/react/dialog/index.d.ts` — Dialog sub-component API verified from installed package
- `node_modules/@base-ui/react/collapsible/index.d.ts` — Collapsible sub-component API verified from installed package
- `src/shared/model/state.ts` — State type definitions (CharDef, State, PlotLog) read directly
- `src/shared/model/reducer.ts` — Current RESET-only action pattern read directly
- `src/shared/model/use-app-state.ts` — useAppState hook and dispatch API read directly
- `src/shared/ui/Button/Button.tsx` — Button variant API confirmed
- `src/app/styles/index.css` — Noir theme CSS variables confirmed
- `.planning/PROJECT.md §Design` — Color palette, typography rules, data structure
- `.planning/phases/02-controls/2-CONTEXT.md` — All locked decisions

### Secondary (MEDIUM confidence)

- `.planning/STATE.md §Blockers/Concerns` — shadcn Slider conflict warning (project-recorded concern)
- CLAUDE.md conventions — FSD architecture rules, naming patterns confirmed

### Tertiary (LOW confidence)

- Collapsible animation CSS pattern (data-[open] grid-rows trick) — based on @base-ui documented patterns, not independently verified against installed version

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all libraries verified from node_modules, no new installs needed
- Architecture: HIGH — FSD patterns confirmed, reducer extension is straightforward
- Pitfalls: HIGH (identity/cascade), MEDIUM (Collapsible animation specifics)
- Color presets: MEDIUM — reasonable choices, but visibility depends on actual map content (Claude's Discretion)

**Research date:** 2026-03-22
**Valid until:** 2026-06-22 (stable libraries, 90 days)
