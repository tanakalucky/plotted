---
phase: 03-maps-and-plotting
plan: 02
subsystem: ui
tags: [react, svg, typescript, letterbox, coordinate-math, reducer, tdd]

requires:
  - phase: 03-01
    provides: MapCard with image container, ADD_MAP/DELETE_MAP/SET_MAP_IMAGE reducer actions, IndexedDB image storage

provides:
  - ADD_LOG and DELETE_LOG reducer actions with auto-incrementing ID
  - letterbox.ts pure coordinate utility (getRenderedImageBounds, clickToRatio)
  - PlotDot SVG component with circle+initial, hover→x delete indicator
  - DotOverlay SVG component filtering logs by mapId/activeDay/currentTime
  - Click-to-plot integration in MapCard with ripple feedback
  - plotted-ripple CSS keyframe animation

affects:
  - future phases reading/displaying plot logs
  - any UI touching MapCard or plot state

tech-stack:
  added: []
  patterns:
    - ResizeObserver for container size tracking in DotOverlay
    - Pure coordinate math functions in lib/ for unit testability
    - stopPropagation in dot onClick to prevent new plot on delete
    - Local ripple state with setTimeout cleanup for 600ms animation

key-files:
  created:
    - src/features/plot-manager/lib/letterbox.ts
    - src/features/plot-manager/lib/letterbox.unit.test.ts
    - src/features/plot-manager/ui/PlotDot.tsx
    - src/features/plot-manager/ui/DotOverlay.tsx
    - src/features/plot-manager/index.ts
  modified:
    - src/shared/model/reducer.ts
    - src/shared/model/reducer.unit.test.ts
    - src/features/map-manager/ui/MapCard.tsx
    - src/app/styles/index.css

key-decisions:
  - "letterbox coordinate math extracted to pure functions in lib/ for unit testability without browser"
  - "DotOverlay uses ResizeObserver (not window resize) for targeted container dimension tracking"
  - "PlotDot stopPropagation on click prevents container ADD_LOG firing on dot delete (pitfall 4)"
  - "imageLoaded state flag in DotOverlay handles initial render before image has loaded"

patterns-established:
  - "Pure coordinate math: numeric inputs only, no DOM dependency, fully unit-testable"
  - "SVG overlay: pointer-events none at root, all on individual dot groups"
  - "Ripple via local state array with setTimeout cleanup after 600ms animation"

requirements-completed:
  - PLOT-01
  - PLOT-02
  - PLOT-03

duration: 3min
completed: 2026-03-22
---

# Phase 03 Plan 02: Click-to-Plot Interaction Summary

**SVG dot overlay with letterbox coordinate math, hover-delete PlotDot, and ripple feedback wired into MapCard delivering complete PLOT-01/02/03 alibi-tracking loop**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-22T00:37:15Z
- **Completed:** 2026-03-22T00:40:30Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- ADD_LOG/DELETE_LOG reducer actions with auto-incrementing ID and full test coverage (TDD)
- Pure letterbox coordinate utility `getRenderedImageBounds`/`clickToRatio` with 10 unit tests
- PlotDot SVG component: visual circle (r=12) + character initial, hover toggles to "x", transparent hit target (r=16)
- DotOverlay SVG component: ResizeObserver for resize-safe positioning, filters by mapId+activeDay+currentTime
- MapCard wired with click-to-plot handler, cursor feedback (crosshair/not-allowed), ripple effect

## Task Commits

1. **Task 1: ADD_LOG, DELETE_LOG reducer actions and letterbox coordinate utility** - `e706aaf` (feat)
2. **Task 2: DotOverlay, PlotDot components and click-to-plot MapCard integration** - `10b81a4` (feat)

## Files Created/Modified

- `src/shared/model/reducer.ts` - Added ADD_LOG, DELETE_LOG actions; imports PlotLog type
- `src/shared/model/reducer.unit.test.ts` - Added 7 new test cases for ADD_LOG and DELETE_LOG
- `src/features/plot-manager/lib/letterbox.ts` - Pure coordinate math: getRenderedImageBounds, clickToRatio
- `src/features/plot-manager/lib/letterbox.unit.test.ts` - 10 unit tests covering all edge cases
- `src/features/plot-manager/ui/PlotDot.tsx` - SVG dot with hover-delete, stopPropagation on click
- `src/features/plot-manager/ui/DotOverlay.tsx` - SVG overlay with ResizeObserver, log filtering
- `src/features/plot-manager/index.ts` - Barrel exporting DotOverlay, clickToRatio, getRenderedImageBounds
- `src/features/map-manager/ui/MapCard.tsx` - Click-to-plot handler, containerRef, imgRef, ripples, DotOverlay
- `src/app/styles/index.css` - Added @keyframes plotted-ripple animation

## Decisions Made

- Letterbox coordinate functions accept pure numeric inputs (no DOM dependency) — enables unit testing without browser mode
- DotOverlay uses ResizeObserver (not window.resize) for precise container dimension tracking on resize
- imageLoaded state flag in DotOverlay prevents rendering dots before image naturalWidth is available
- stopPropagation in PlotDot.onClick prevents container click handler from firing ADD_LOG on delete

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all implementation straightforward following plan specifications.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Complete alibi-tracking loop delivered: characters can be plotted on maps, dots display color-coded with initials, click to delete
- PLOT-01, PLOT-02, PLOT-03 requirements satisfied
- Phase 03 maps-and-plotting complete; ready for phase transition

---

_Phase: 03-maps-and-plotting_
_Completed: 2026-03-22_

## Self-Check: PASSED

- letterbox.ts: FOUND
- PlotDot.tsx: FOUND
- DotOverlay.tsx: FOUND
- index.ts: FOUND
- SUMMARY.md: FOUND
- commit e706aaf: FOUND
- commit 10b81a4: FOUND
