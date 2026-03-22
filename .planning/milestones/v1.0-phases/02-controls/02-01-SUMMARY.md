---
phase: 02-controls
plan: 01
subsystem: state
tags: [reducer, ts-pattern, time-utility, unit-test, tdd]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "State type, initialState, useReducer setup, localStorage persistence"
provides:
  - "time.ts: timeIndexToLabel, TIME_MIN, TIME_MAX, MINUTES_PER_STEP, SLIDER_TICKS (5-minute resolution)"
  - "reducer.ts: 8 action types (RESET, ADD_CHAR, DELETE_CHAR, SET_ACTIVE_CHAR, SET_DAYS, SET_ACTIVE_DAY, SET_TIME, ADJUST_TIME)"
  - "reducer.unit.test.ts: 19 test cases covering all actions with boundary conditions"
  - "time.unit.test.ts: 13 test cases for time utility"
affects: [02-controls-plan-02, ui-components, char-panel, day-panel, time-slider]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ts-pattern match().exhaustive() for discriminated union reducer — exhaustive matching catches missing cases at compile AND runtime"
    - "TDD RED-GREEN cycle: write failing tests first, then minimal implementation"
    - "5-minute time resolution: 288 steps (0-287), timeIndexToLabel(index) = HH:MM"

key-files:
  created:
    - src/shared/lib/time.ts
    - src/shared/lib/time.unit.test.ts
    - src/shared/model/reducer.unit.test.ts
  modified:
    - src/shared/model/reducer.ts
    - src/shared/model/state.ts
    - src/shared/model/state.unit.test.ts

key-decisions:
  - "ts-pattern match().exhaustive() throws on unknown actions — more robust than default:return state, catches bugs early"
  - "TIME_MAX=287 (5-minute steps, 288 total) aligns with plan revision from 10-minute (0-143) to 5-minute resolution"

patterns-established:
  - "Reducer pattern: import TIME_MIN/TIME_MAX from @/shared/lib/time for clamping operations"
  - "ADD_CHAR trims name before duplicate check — whitespace-insensitive deduplication"
  - "DELETE_CHAR cascade pattern: filter chars + filter logs + reset activeChar in single state spread"
  - "SET_DAYS cascade: clamp days 1-7, filter logs, clamp activeDay with Math.min"

requirements-completed: [CHAR-01, CHAR-02, CHAR-03, TIME-01, TIME-02, TIME-03, TIME-04, DATA-01]

# Metrics
duration: 12min
completed: 2026-03-22
---

# Phase 2 Plan 01: Reducer Actions + Time Utility Summary

**Fully-tested pure reducer with 8 action types (ts-pattern exhaustive) and 5-minute time index utility (0-287, timeIndexToLabel)**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-22T08:34:40Z
- **Completed:** 2026-03-22T08:37:26Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created `time.ts` with 5-minute resolution constants and `timeIndexToLabel` (13 tests, all passing)
- Extended reducer from RESET-only to 8 full action types using `ts-pattern match().exhaustive()`
- Cascade deletion: `DELETE_CHAR` removes chars + logs + resets activeChar; `SET_DAYS` removes out-of-range logs + clamps activeDay
- Boundary clamping: `SET_TIME`/`ADJUST_TIME` clamp to 0-287 using TIME_MIN/TIME_MAX from time.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Time index utility with TDD + update state.ts comments** - `d7fc603` (feat)
2. **Task 2: Extend reducer with all Phase 2 actions using TDD** - `d26909a` (feat)

_Note: TDD tasks — RED (failing tests) followed by GREEN (implementation) in single commits per task_

## Files Created/Modified

- `src/shared/lib/time.ts` - Time index utility: TIME_MIN=0, TIME_MAX=287, MINUTES_PER_STEP=5, SLIDER_TICKS, timeIndexToLabel
- `src/shared/lib/time.unit.test.ts` - 13 unit tests for time utility boundary values and constants
- `src/shared/model/reducer.ts` - Full reducer with 8 action types using ts-pattern exhaustive matching
- `src/shared/model/reducer.unit.test.ts` - 19 unit tests across all 8 action types with boundary conditions
- `src/shared/model/state.ts` - Updated comments: `// 0-143 (10-minute index)` → `// 0-287 (5-minute index)`
- `src/shared/model/state.unit.test.ts` - Updated unknown-action test to expect throw (exhaustive pattern)

## Decisions Made

- Used `ts-pattern match().exhaustive()` instead of switch/default — exhaustive throws on unknown actions at runtime, catching bugs early. The existing test expecting `return state` for unknown actions was updated to `expect throw`.
- TIME_MAX=287 confirms 5-minute resolution (288 steps × 5 min = 1440 min = 24h).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated existing test for exhaustive pattern matching behavior**

- **Found during:** Task 2 (GREEN phase)
- **Issue:** `state.unit.test.ts` had a test expecting reducer to return state unchanged for unknown actions (`default: return state`). With `match().exhaustive()`, the reducer throws a `NonExhaustiveError` instead.
- **Fix:** Updated test from `expect(result).toBe(state)` to `expect(() => reducer(...)).toThrow()` — the new behavior is correct and more robust.
- **Files modified:** `src/shared/model/state.unit.test.ts`
- **Verification:** All 47 tests pass after fix
- **Committed in:** d26909a (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Auto-fix necessary for test correctness. No scope creep.

## Issues Encountered

None — TDD cycle proceeded cleanly. RED → GREEN confirmed for both tasks.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All reducer actions implemented and tested — Plan 02 UI components can dispatch any action
- Time utility constants (SLIDER_TICKS, TIME_MAX) ready for slider component implementation
- No blockers

---

_Phase: 02-controls_
_Completed: 2026-03-22_

## Self-Check: PASSED

- src/shared/lib/time.ts: FOUND
- src/shared/lib/time.unit.test.ts: FOUND
- src/shared/model/reducer.ts: FOUND
- src/shared/model/reducer.unit.test.ts: FOUND
- Commit d7fc603: FOUND
- Commit d26909a: FOUND
