---
phase: 02-controls
plan: 02
subsystem: ui-controls
tags: [character-management, time-controls, toolbar, collapsible, reset-dialog]
dependency_graph:
  requires: ["02-01"]
  provides: ["character-manager feature", "time-controls feature", "PlottedApp toolbar"]
  affects: ["src/pages/home/ui/PlottedApp.tsx"]
tech_stack:
  added: []
  patterns:
    [
      "props-based state propagation",
      "FSD feature slices",
      "@base-ui/react Slider",
      "@base-ui/react Collapsible",
      "@base-ui/react Dialog",
    ]
key_files:
  created:
    - src/features/character-manager/lib/preset-colors.ts
    - src/features/character-manager/ui/CharChip.tsx
    - src/features/character-manager/ui/CharRoster.tsx
    - src/features/character-manager/ui/AddCharForm.tsx
    - src/features/character-manager/index.ts
    - src/features/time-controls/ui/DaySelector.tsx
    - src/features/time-controls/ui/TimeSlider.tsx
    - src/features/time-controls/ui/FineAdjustButtons.tsx
    - src/features/time-controls/index.ts
  modified:
    - src/pages/home/ui/PlottedApp.tsx
    - src/shared/lib/time.ts
    - src/shared/lib/time.unit.test.ts
decisions:
  - "All feature components receive state/dispatch as props — useAppState called once in PlottedApp"
  - "TimeSlider uses @base-ui/react Slider with single number value (not array) for continuous drag updates"
  - "FineAdjustButtons use ADJUST_TIME deltas: -2/-1/+1/+2 (5-min steps = -10m/-5m/+5m/+10m)"
  - "SLIDER_TICKS changed to 24 hourly indices with plain hour numbers (0-23) as labels"
metrics:
  duration_minutes: 5
  completed_date: "2026-03-22"
  tasks_completed: 3
  tasks_total: 3
  files_created: 10
  files_modified: 3
---

# Phase 02 Plan 02: UI Controls Build Summary

**One-liner:** Complete controls toolbar with character chip management, collapsible day/time controls (288-step 5-minute slider with hourly tick marks), and reset dialog wired to single useAppState instance.

## Tasks Completed

| Task | Name                                    | Commit  | Files                 |
| ---- | --------------------------------------- | ------- | --------------------- |
| 1    | Character management feature slice      | a693d52 | 5 created             |
| 2    | Day/time controls + PlottedApp assembly | 2045654 | 5 created, 1 modified |
| 3    | Visual and functional verification      | 5f6a707 | 3 modified (fix)      |

## What Was Built

### Character Management (`src/features/character-manager/`)

- **`preset-colors.ts`**: 12 preset hex colors exported as `PRESET_COLORS as const`
- **`CharChip.tsx`**: Character chip with `role="button"`, `aria-pressed={isActive}`, active state (scale-110 + shadow-md), hover-reveal X delete button using `group`/`group-hover:inline-flex` pattern
- **`CharRoster.tsx`**: Horizontal flex-wrap chip list receiving `chars`, `activeChar`, `dispatch` as props
- **`AddCharForm.tsx`**: Always-visible form with name input (maxLength=10), 12 preset color swatches, native `<input type="color">` picker, and Add button

### Time Controls (`src/features/time-controls/`)

- **`DaySelector.tsx`**: Tab-style Day buttons (Day1-Day7) with +/- increment buttons, disabled at bounds (MIN_DAYS=1, MAX_DAYS=7)
- **`TimeSlider.tsx`**: `@base-ui/react/slider` Slider with continuous `onValueChange`, 288 steps (0-287), 24 hourly tick labels (0-23), serif time label
- **`FineAdjustButtons.tsx`**: Four buttons dispatching ADJUST_TIME with distinct deltas: -2 (-10m), -1 (-5m), +1 (+5m), +2 (+10m)

### PlottedApp (`src/pages/home/ui/PlottedApp.tsx`)

- Single `useAppState()` call, state/dispatch passed as props to all children
- Collapsible toolbar via `@base-ui/react/collapsible` with chevron toggle
- Reset dialog via `@base-ui/react/dialog` with confirmation before dispatching RESET
- "Plotted." title text removed per D-04

## Verification Results

- `bun run typecheck`: passed
- `bun run test`: 47 tests passed (3 test files)
- `bun run lint`: passed (no errors)
- Visual verification: completed (user-reported issues fixed)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed slider drag not updating time**

- **Found during:** Task 3 (human verification)
- **Issue:** `@base-ui/react` Slider.Root `value` was passed as `number[]` (array) but single-thumb slider expects `number` (single value). The `onValueChange` callback type did not match.
- **Fix:** Changed `value={[currentTime]}` to `value={currentTime}` and updated callback from `([v]) =>` to `(v) =>`.
- **Files modified:** `src/features/time-controls/ui/TimeSlider.tsx`
- **Commit:** 5f6a707

**2. [Rule 1 - Bug] Changed tick marks to hourly display (0-23)**

- **Found during:** Task 3 (human verification)
- **Issue:** SLIDER_TICKS had only 5 sparse ticks showing HH:MM format. User requested hourly labels (0, 1, 2, ... 23) for better readability.
- **Fix:** Changed `SLIDER_TICKS` from `[0, 72, 144, 216, 287]` to `Array.from({ length: 24 }, (_, i) => i * 12)`. Updated tick label rendering to show plain hour numbers. Updated corresponding unit test.
- **Files modified:** `src/shared/lib/time.ts`, `src/shared/lib/time.unit.test.ts`, `src/features/time-controls/ui/TimeSlider.tsx`
- **Commit:** 5f6a707

## Known Stubs

None -- all controls are fully wired to the useAppState reducer.

## Self-Check: PASSED

- [x] src/features/character-manager/lib/preset-colors.ts -- created (a693d52)
- [x] src/features/character-manager/ui/CharChip.tsx -- created (a693d52)
- [x] src/features/character-manager/ui/CharRoster.tsx -- created (a693d52)
- [x] src/features/character-manager/ui/AddCharForm.tsx -- created (a693d52)
- [x] src/features/character-manager/index.ts -- created (a693d52)
- [x] src/features/time-controls/ui/DaySelector.tsx -- created (2045654)
- [x] src/features/time-controls/ui/TimeSlider.tsx -- created (2045654), fixed (5f6a707)
- [x] src/features/time-controls/ui/FineAdjustButtons.tsx -- created (2045654)
- [x] src/features/time-controls/index.ts -- created (2045654)
- [x] src/pages/home/ui/PlottedApp.tsx -- modified (2045654)
- [x] src/shared/lib/time.ts -- modified (5f6a707)
- [x] src/shared/lib/time.unit.test.ts -- modified (5f6a707)
- [x] All commits verified in git log
