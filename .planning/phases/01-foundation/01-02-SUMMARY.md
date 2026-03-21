---
phase: 01-foundation
plan: 02
subsystem: state
tags: [react, useReducer, localStorage, IndexedDB, idb-keyval, typescript]

# Dependency graph
requires:
  - phase: 01-01
    provides: Cleaned codebase with FSD structure and removed Convex/Clerk dependencies
provides:
  - State, PlotLog, MapDef, CharDef TypeScript interfaces and initialState constant
  - isValidState type guard for corrupted data detection
  - reducer with RESET action (extensible for Phase 2 actions)
  - useAppState hook (useReducer + localStorage auto-save/restore)
  - loadState with silent reset on corrupted JSON (D-04, D-05)
  - saveMapImage/loadMapImage/deleteMapImage via idb-keyval IndexedDB (D-06)
  - src/shared/model barrel index.ts
affects: [02-features, 03-map, all feature phases that dispatch actions or read state]

# Tech tracking
tech-stack:
  added: [idb-keyval@6.2.2]
  patterns:
    - useReducer pattern for global state management (no Zustand)
    - localStorage auto-save via useEffect on state change
    - Silent reset pattern for corrupted/incomplete persisted state
    - IndexedDB via idb-keyval with try-catch graceful failure

key-files:
  created:
    - src/shared/model/state.ts
    - src/shared/model/reducer.ts
    - src/shared/model/use-app-state.ts
    - src/shared/model/use-map-images.ts
    - src/shared/model/index.ts
    - src/shared/model/state.unit.test.ts
  modified:
    - package.json
    - bun.lock

key-decisions:
  - "useReducer (not Zustand) chosen for global state — simpler, no extra dependency"
  - "localStorage key plotted-v1 for potential future migration versioning"
  - "idb-keyval for IndexedDB — minimal API, avoids 5 MB localStorage quota for image blobs"
  - "isValidState uses structural key check (not Valibot) — D-05 decision to keep dependency minimal"
  - "loadState exported as standalone function to enable unit testing without React"

patterns-established:
  - "Silent reset pattern: corrupted/incomplete localStorage silently falls back to initialState"
  - "IndexedDB graceful degradation: try-catch on all idb-keyval calls, returns null on failure"
  - "Barrel export at src/shared/model/index.ts for all public model API"
  - "TDD: test file committed first (RED), then implementation (GREEN)"

requirements-completed: [SETUP-02, SETUP-03]

# Metrics
duration: 6min
completed: 2026-03-22
---

# Phase 01 Plan 02: State Model Summary

**useReducer + localStorage persistence layer with IndexedDB map image storage via idb-keyval, including silent-reset protection for corrupted data**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-21T22:50:47Z
- **Completed:** 2026-03-21T22:56:30Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Canonical State type hierarchy (State, PlotLog, MapDef, CharDef) matching PROJECT.md data model
- useAppState hook providing useReducer + localStorage auto-save with silent reset on data corruption (D-04, D-05)
- IndexedDB map image CRUD via idb-keyval with graceful failure on IndexedDB unavailability (D-06)
- 13 unit tests covering isValidState, reducer, and loadState edge cases — all passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Tests (RED)** - `bb449b9` (test)
2. **Task 1: State types, reducer, useAppState hook** - `935508d` (feat)
3. **Task 2: IndexedDB map image storage via idb-keyval** - `0f5deb3` (feat)

_Note: TDD tasks have multiple commits (test RED → feat GREEN)_

## Files Created/Modified

- `src/shared/model/state.ts` - State, PlotLog, MapDef, CharDef interfaces, initialState, isValidState
- `src/shared/model/reducer.ts` - Action union type (RESET), reducer function
- `src/shared/model/use-app-state.ts` - useAppState hook + loadState with localStorage persistence
- `src/shared/model/use-map-images.ts` - saveMapImage/loadMapImage/deleteMapImage via idb-keyval
- `src/shared/model/index.ts` - Barrel file for shared/model public API
- `src/shared/model/state.unit.test.ts` - 13 unit tests for state model
- `package.json` - Added idb-keyval@6.2.2
- `bun.lock` - Lock file updated

## Decisions Made

- `loadState` exported as a standalone function (not inside the hook) to enable direct unit testing without needing to invoke React hooks
- Structural key presence check (`"key" in v`) instead of Valibot for isValidState — keeps the validation minimal and avoids schema coupling at this layer

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All Phase 2/3 features can import `useAppState`, `State`, and image utilities from `@/shared/model`
- Reducer is ready for Phase 2 action additions (CHAR_ADD, MAP_ADD, LOG_ADD, etc.)
- No blockers for next phase

---

_Phase: 01-foundation_
_Completed: 2026-03-22_

## Self-Check: PASSED

- All 6 model files confirmed present on disk
- All 3 task commits confirmed in git history (bb449b9, 935508d, 0f5deb3)
