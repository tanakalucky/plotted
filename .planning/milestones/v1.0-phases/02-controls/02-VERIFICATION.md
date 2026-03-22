---
phase: 02-controls
verified: 2026-03-22T00:00:00Z
status: human_needed
score: 10/10 must-haves verified (Plan 01) + 9/9 must-haves verified (Plan 02)
human_verification:
  - test: "Character chip visual active state"
    expected: "Active chip shows scale-110 and shadow-md (enlarged with shadow)"
    why_human: "CSS visual behavior, scale transform and shadow only verifiable in browser"
  - test: "Hover reveals delete button on chip"
    expected: "X delete button appears only on hover (group-hover:inline-flex)"
    why_human: "CSS hover state cannot be verified programmatically"
  - test: "Duplicate character rejection"
    expected: "Adding a character with an existing name silently does nothing (no second chip appears)"
    why_human: "UI feedback on duplicate rejection requires runtime interaction"
  - test: "Time slider continuous drag update"
    expected: "Time label updates continuously while dragging the slider (onValueChange, not onValueCommitted)"
    why_human: "Real-time drag behavior requires browser interaction"
  - test: "Collapsible toolbar collapse/expand animation"
    expected: "Chevron toggles direction and panel collapses/expands smoothly"
    why_human: "Animation and visual state transition only verifiable in browser"
  - test: "Reset dialog confirmation flow"
    expected: "Clicking リセット opens dialog, confirming clears all data, canceling does nothing"
    why_human: "Dialog interaction and state persistence verification requires runtime"
  - test: "State persistence across page reload"
    expected: "Characters, day selection, and time setting survive browser page reload via localStorage"
    why_human: "localStorage persistence requires actual browser reload cycle"
---

# Phase 02: Controls Verification Report

**Phase Goal:** Build character management, day/time selection controls, and toolbar assembly
**Verified:** 2026-03-22
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths — Plan 01 (Reducer + Time Utility)

| #   | Truth                                                                                       | Status   | Evidence                                                                                            |
| --- | ------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| 1   | ADD_CHAR adds a character with name and color to state.chars                                | VERIFIED | `reducer.ts` L20-25: filters duplicates then appends `{ name: trimmedName, color: payload.color }`  |
| 2   | ADD_CHAR rejects duplicate names (returns state unchanged)                                  | VERIFIED | `reducer.ts` L22: `if (state.chars.some((c) => c.name === trimmedName)) return state;`              |
| 3   | DELETE_CHAR removes the character and all its logs, resets activeChar if deleted            | VERIFIED | `reducer.ts` L28-33: filters chars, filters logs, resets activeChar conditionally                   |
| 4   | SET_ACTIVE_CHAR sets activeChar to the given name                                           | VERIFIED | `reducer.ts` L34-37: `activeChar: payload.name`                                                     |
| 5   | SET_DAYS changes days count and cascade-deletes logs beyond new day count, clamps activeDay | VERIFIED | `reducer.ts` L38-45: clamps 1-7, filters `log.day <= newDays`, `Math.min(state.activeDay, newDays)` |
| 6   | SET_ACTIVE_DAY sets activeDay to the given day                                              | VERIFIED | `reducer.ts` L47-50: `activeDay: payload.day`                                                       |
| 7   | SET_TIME sets currentTime clamped to 0-287                                                  | VERIFIED | `reducer.ts` L51-54: `Math.max(TIME_MIN, Math.min(TIME_MAX, payload.time))` with TIME_MAX=287       |
| 8   | ADJUST_TIME adds delta to currentTime clamped to 0-287                                      | VERIFIED | `reducer.ts` L55-58: same clamp applied to `state.currentTime + payload.delta`                      |
| 9   | RESET returns initialState                                                                  | VERIFIED | `reducer.ts` L19: `.with({ type: "RESET" }, () => initialState)`                                    |
| 10  | timeIndexToLabel converts 0-287 index to HH:MM format (5-minute resolution)                 | VERIFIED | `time.ts` L7-14: `index * 5` total minutes formula; tests confirm 0→"00:00", 287→"23:55"            |

**Score:** 10/10 truths verified

### Observable Truths — Plan 02 (UI Components)

| #   | Truth                                                                              | Status   | Evidence                                                                                                                |
| --- | ---------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | User can add a character with name (max 10 chars) and color from presets or picker | VERIFIED | `AddCharForm.tsx` L27-37: `maxLength={10}`, `PRESET_COLORS.map(...)`, `type="color"` native picker, dispatches ADD_CHAR |
| 2   | User can click a character chip to select it as active                             | VERIFIED | `CharChip.tsx` L24: `onClick={onSelect}`; `CharRoster.tsx` L21: dispatches `SET_ACTIVE_CHAR`                            |
| 3   | User can hover a chip and click X to delete it (no confirmation dialog)            | VERIFIED | `CharChip.tsx` L33-43: `group-hover:inline-flex` class on delete button, `e.stopPropagation()`, dispatches DELETE_CHAR  |
| 4   | User can see Day tabs and click +/- to add or remove days                          | VERIFIED | `DaySelector.tsx` L20-54: minus/plus buttons dispatch SET_DAYS, disabled at MIN_DAYS=1 and MAX_DAYS=7                   |
| 5   | User can click a Day tab to select it as active day                                | VERIFIED | `DaySelector.tsx` L30-44: renders Day1-N tabs, onClick dispatches SET_ACTIVE_DAY                                        |
| 6   | User can drag the time slider to any 5-minute increment                            | VERIFIED | `TimeSlider.tsx` L20-33: `Slider.Root` with `max={287}`, `step={1}`, `onValueChange` (continuous updates)               |
| 7   | User can click -5m/-10m/+5m/+10m fine-adjust buttons with distinct step sizes      | VERIFIED | `FineAdjustButtons.tsx` L12-43: deltas -2/-1/+1/+2 for -10m/-5m/+5m/+10m respectively                                   |
| 8   | User can collapse/expand the controls toolbar                                      | VERIFIED | `PlottedApp.tsx` L20-58: `Collapsible.Root` with `isOpen` state, chevron icon toggles                                   |
| 9   | User can reset all data via a confirmation dialog                                  | VERIFIED | `PlottedApp.tsx` L63-102: `Dialog.Root` with cancel + destructive confirm dispatching `{ type: "RESET" }`               |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact                                              | Status   | Evidence                                                                                                         |
| ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `src/shared/model/state.ts`                           | VERIFIED | Exists; `currentTime: number; // 0-287` comment updated correctly                                                |
| `src/shared/model/reducer.ts`                         | VERIFIED | 8 action types, `match().exhaustive()`, imports TIME_MIN/TIME_MAX                                                |
| `src/shared/model/reducer.unit.test.ts`               | VERIFIED | 19 test cases across all 8 action types, all passing                                                             |
| `src/shared/lib/time.ts`                              | VERIFIED | Exports `timeIndexToLabel`, `TIME_MIN=0`, `TIME_MAX=287`, `MINUTES_PER_STEP=5`, `SLIDER_TICKS` (24 hourly ticks) |
| `src/shared/lib/time.unit.test.ts`                    | VERIFIED | 13 tests: 8 for timeIndexToLabel boundaries + 5 constants; all passing                                           |
| `src/features/character-manager/ui/CharChip.tsx`      | VERIFIED | `role="button"`, `aria-pressed`, `group-hover:inline-flex`, `scale-110 shadow-md` active state                   |
| `src/features/character-manager/ui/CharRoster.tsx`    | VERIFIED | Props-based (no useAppState), dispatches SET_ACTIVE_CHAR and DELETE_CHAR                                         |
| `src/features/character-manager/ui/AddCharForm.tsx`   | VERIFIED | `maxLength={10}`, `type="color"`, dispatches ADD_CHAR, no useAppState                                            |
| `src/features/character-manager/lib/preset-colors.ts` | VERIFIED | 12 hex colors `as const`                                                                                         |
| `src/features/character-manager/index.ts`             | VERIFIED | Exports CharRoster, AddCharForm (CharChip intentionally not exported)                                            |
| `src/features/time-controls/ui/DaySelector.tsx`       | VERIFIED | Props-based, MIN_DAYS=1, MAX_DAYS=7, SET_DAYS/SET_ACTIVE_DAY dispatches                                          |
| `src/features/time-controls/ui/TimeSlider.tsx`        | VERIFIED | `@base-ui/react/slider`, `onValueChange`, `max={287}`, `step={1}`, SLIDER_TICKS tick marks                       |
| `src/features/time-controls/ui/FineAdjustButtons.tsx` | VERIFIED | Four buttons with delta -2/-1/+1/+2, no useAppState                                                              |
| `src/features/time-controls/index.ts`                 | VERIFIED | Exports DaySelector, TimeSlider, FineAdjustButtons                                                               |
| `src/pages/home/ui/PlottedApp.tsx`                    | VERIFIED | Single `useAppState()` call, all children receive dispatch as props, Collapsible + Dialog wired                  |

### Key Link Verification

| From             | To                           | Via                          | Status | Evidence                                                                                      |
| ---------------- | ---------------------------- | ---------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| `reducer.ts`     | `state.ts`                   | `import.*State.*from.*state` | WIRED  | L5: `import { type State, initialState } from "./state"`                                      |
| `PlottedApp.tsx` | `use-app-state.ts`           | `useAppState`                | WIRED  | L12: `const { state, dispatch } = useAppState()` — single call confirmed                      |
| `TimeSlider.tsx` | `@base-ui/react/slider`      | `Slider.Root`                | WIRED  | L1: `import { Slider } from "@base-ui/react/slider"`, L20: `<Slider.Root ...>`                |
| `PlottedApp.tsx` | `@base-ui/react/collapsible` | `Collapsible.Root`           | WIRED  | L1: `import { Collapsible } from "@base-ui/react/collapsible"`, L20: `<Collapsible.Root ...>` |
| `PlottedApp.tsx` | `@base-ui/react/dialog`      | `Dialog.Root`                | WIRED  | L2: `import { Dialog } from "@base-ui/react/dialog"`, L63: `<Dialog.Root>`                    |

### Requirements Coverage

| Requirement | Source Plan  | Description                                                            | Status               | Evidence                                                                                                                                                             |
| ----------- | ------------ | ---------------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CHAR-01     | 02-01, 02-02 | 名前（最大10文字）とカラーを指定してキャラクターを追加できる           | SATISFIED            | ADD_CHAR action in reducer; AddCharForm with maxLength=10 and color picker                                                                                           |
| CHAR-02     | 02-01, 02-02 | キャラクターチップをクリックしてアクティブキャラクターを切り替えられる | SATISFIED            | SET_ACTIVE_CHAR action; CharChip onClick dispatches it via CharRoster                                                                                                |
| CHAR-03     | 02-01, 02-02 | キャラクターを削除すると、関連するプロットデータもカスケード削除される | SATISFIED            | DELETE_CHAR filters both chars and logs arrays in single state update                                                                                                |
| TIME-01     | 02-01, 02-02 | Day1〜Day7を選択でき、+/-ボタンでDay数を増減できる                     | SATISFIED            | SET_ACTIVE_DAY + SET_DAYS actions; DaySelector with MIN_DAYS=1, MAX_DAYS=7                                                                                           |
| TIME-02     | 02-01, 02-02 | Dayを減らした場合、該当Day以降のログが自動削除される                   | SATISFIED            | SET_DAYS in reducer: `logs: state.logs.filter((log) => log.day <= newDays)`                                                                                          |
| TIME-03     | 02-01, 02-02 | スライダーで10分単位（00:00〜23:50）の時刻を操作できる                 | SATISFIED (enhanced) | Implemented at 5-minute resolution (288 steps) rather than 10-minute — exceeds requirement. REQUIREMENTS.md text still says "10分単位" but implementation is better. |
| TIME-04     | 02-01, 02-02 | -10m / -5m / +5m / +10m ボタンで時刻を微調整できる                     | SATISFIED            | FineAdjustButtons with ADJUST_TIME deltas: -2 (-10m), -1 (-5m), +1 (+5m), +2 (+10m)                                                                                  |
| DATA-01     | 02-01, 02-02 | リセットボタンで全データを初期化できる（確認ダイアログあり）           | SATISFIED            | RESET action; PlottedApp Dialog.Root with cancel + confirm before dispatching RESET                                                                                  |

**Note on TIME-03:** The REQUIREMENTS.md text reads "10分単位（00:00〜23:50）" (10-minute resolution, 144 steps, 0-143) but the plan explicitly revised this to 5-minute resolution (288 steps, 0-287). The implementation satisfies the intent — slider time selection — with finer granularity. REQUIREMENTS.md text was not updated to reflect this change. Not a blocker; the implementation is strictly better.

### Anti-Patterns Found

| File             | Line | Pattern                                                | Severity | Impact                                                           |
| ---------------- | ---- | ------------------------------------------------------ | -------- | ---------------------------------------------------------------- |
| `PlottedApp.tsx` | 108  | `<div className="p-4" />` — empty map area placeholder | Info     | Known stub for Phase 3 map content; does not affect Phase 2 goal |

No blocker or warning anti-patterns found. The empty map area `<div>` is intentional Phase 3 scaffolding per the plan comment `{/* Map area — Phase 3 */}`.

### Test Suite Results

- `bun run test`: **47 tests, 47 passed, 0 failed** (3 test files)
- `bun run typecheck`: **exits 0, no errors**
- Test files: `time.unit.test.ts` (13 tests), `reducer.unit.test.ts` (19 tests), `state.unit.test.ts` (updated for exhaustive pattern)

### Human Verification Required

#### 1. Character Chip Active State Visual

**Test:** Add two characters. Click one chip to select it.
**Expected:** Selected chip visually enlarges (scale-110) and gains a shadow (shadow-md). Unselected chips remain at normal size.
**Why human:** CSS transform and shadow visual effects cannot be verified programmatically.

#### 2. Hover Delete Button Reveal

**Test:** Add a character, hover the chip with the mouse cursor.
**Expected:** X delete button becomes visible only on hover. Clicking X removes the chip without a confirmation dialog.
**Why human:** CSS `group-hover:inline-flex` state requires actual mouse hover in browser.

#### 3. Duplicate Character Rejection

**Test:** Add character named "Alice". Try adding "Alice" again with a different color.
**Expected:** Second "Alice" chip does NOT appear. No error message — silent rejection. Only one chip remains.
**Why human:** UI-level duplicate suppression feedback requires runtime interaction.

#### 4. Time Slider Continuous Drag

**Test:** Drag the time slider from left to right.
**Expected:** The time label (HH:MM in serif font) updates continuously while dragging — not only on release. Tick marks showing hours 0-23 are visible below the slider.
**Why human:** Real-time drag behavior and visual tick rendering require browser interaction.

#### 5. Collapsible Toolbar Toggle

**Test:** Click the chevron button at the top-left of the toolbar.
**Expected:** Controls panel (characters + day/time controls) collapses/expands. Chevron icon direction changes (up when open, down when closed). "コントロールを折りたたむ" / "コントロールを展開する" aria-label updates correctly.
**Why human:** Animation and aria-label live updates require browser verification.

#### 6. Reset Dialog Confirmation Flow

**Test:** Add characters and change day/time. Click "リセット" button. Click "キャンセル". Then click "リセット" again and click "リセット" in the dialog to confirm.
**Expected:** Cancel does nothing. Confirm clears all characters, resets day to 1, time to 0.
**Why human:** Dialog modal behavior and state mutation require runtime testing.

#### 7. State Persistence Across Page Reload

**Test:** Add characters, select a day, set a time. Reload the browser page.
**Expected:** All state (characters, active character, selected day, current time) is restored from localStorage after reload.
**Why human:** localStorage persistence requires an actual browser reload cycle.

### Deviations from Original Plan (Documented)

Two deviations from plan specs occurred and were auto-fixed during execution:

1. **SLIDER_TICKS changed to 24 hourly ticks:** Plan spec called for `[0, 72, 144, 216, 287]` (5 ticks with HH:MM labels). Implementation uses `Array.from({ length: 24 }, (_, i) => i * 12)` (24 hourly indices with plain hour numbers 0-23). Labels render as `Math.floor((tick * 5) / 60)` = `0, 1, 2, ... 23`. This is a user-preference deviation, not a regression.

2. **TimeSlider `onValueChange` receives `number`, not `number[]`:** Plan specified `([v]) =>` (array destructure) per `@base-ui/react` Slider array API. Actual `@base-ui/react` single-thumb slider passes a plain `number` to `onValueChange`. Fix: `(v) =>` directly. This matches the actual library API and is correct.

---

_Verified: 2026-03-22_
_Verifier: Claude (gsd-verifier)_
