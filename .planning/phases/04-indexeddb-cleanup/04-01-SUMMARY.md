---
phase: 04-indexeddb-cleanup
plan: 01
subsystem: database
tags: [indexeddb, idb-keyval, storage, reset]

# Dependency graph
requires:
  - phase: 03-maps-and-plotting
    provides: deleteMapImage function in shared/model/use-map-images.ts and export via shared/model/index.ts
provides:
  - Reset button in PlottedApp.tsx awaits IndexedDB blob cleanup before dispatching RESET
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Async onClick handler pattern: await cleanup side-effects before dispatching state reset"

key-files:
  created: []
  modified:
    - src/pages/home/ui/PlottedApp.tsx

key-decisions:
  - "Inline async handler (no helper function) for IndexedDB cleanup per plan D-02"
  - "Promise.all for parallel blob deletion before RESET dispatch — ensures no orphaned blobs"

patterns-established:
  - "Side-effect cleanup before state reset: always await async cleanup before dispatch"

requirements-completed: [DATA-01, SETUP-03]

# Metrics
duration: 2min
completed: 2026-03-22
---

# Phase 4 Plan 01: IndexedDB Cleanup on Reset Summary

**Async reset onClick in PlottedApp.tsx that awaits Promise.all(deleteMapImage) for all map blobs before dispatching RESET, eliminating orphaned IndexedDB entries**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-22T01:12:31Z
- **Completed:** 2026-03-22T01:13:31Z
- **Tasks:** 2/2 (1 auto + 1 human-verify approved)
- **Files modified:** 1

## Accomplishments

- Updated reset button onClick in PlottedApp.tsx to be async
- Added `deleteMapImage` import from `@/shared/model`
- All map blobs are cleaned from IndexedDB via `Promise.all` before state is cleared via `dispatch({ type: "RESET" })`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add IndexedDB cleanup to reset onClick in PlottedApp.tsx** - `63323ce` (feat)
2. **Task 2: Verify reset cleans IndexedDB** - human-verify checkpoint (approved)

## Files Created/Modified

- `src/pages/home/ui/PlottedApp.tsx` - Reset button onClick changed from synchronous to async; awaits IndexedDB cleanup before RESET dispatch

## Decisions Made

None — followed plan as specified. No helper function created per D-02 (inline async handler).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 4 complete — gap closure for INT-01 fully validated
- All milestone v1.0 phases complete; ready for milestone completion

---

_Phase: 04-indexeddb-cleanup_
_Completed: 2026-03-22_

## Self-Check: PASSED

- `src/pages/home/ui/PlottedApp.tsx` — FOUND
- `.planning/phases/04-indexeddb-cleanup/04-01-SUMMARY.md` — FOUND
- Commit `63323ce` — FOUND
