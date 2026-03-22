---
phase: 03-maps-and-plotting
plan: 01
subsystem: ui
tags: [react, tailwind, indexeddb, idb-keyval, ts-pattern, reducer, file-upload]

requires:
  - phase: 02-controls
    provides: useReducer state architecture, dispatch pattern, PlottedApp shell with map placeholder

provides:
  - MAP actions (ADD_MAP, DELETE_MAP, RENAME_MAP, SET_MAP_IMAGE) in reducer.ts
  - MAX_MAPS = 4 constant exported from shared/model
  - MapGrid 2-column grid layout with dynamic column switching
  - MapCard with IndexedDB image loading and object URL lifecycle
  - MapHeader with inline rename and confirmation-dialog delete
  - MapPlaceholder with upload trigger
  - AddMapButton with crypto.randomUUID and auto-named マップN

affects:
  - 03-02-PLAN.md (plot feature builds on MapCard's relative position container)

tech-stack:
  added: []
  patterns:
    - MapCard manages its own objectUrl state with useEffect cleanup (URL.revokeObjectURL)
    - Side-effects (deleteMapImage, saveMapImage) called in components, not in pure reducer
    - Confirmation dialog via @base-ui/react Dialog only when logsExist=true

key-files:
  created:
    - src/features/map-manager/ui/MapGrid.tsx
    - src/features/map-manager/ui/MapCard.tsx
    - src/features/map-manager/ui/MapHeader.tsx
    - src/features/map-manager/ui/MapPlaceholder.tsx
    - src/features/map-manager/ui/AddMapButton.tsx
    - src/features/map-manager/index.ts
  modified:
    - src/shared/model/reducer.ts
    - src/shared/model/reducer.unit.test.ts
    - src/shared/model/index.ts
    - src/pages/home/ui/PlottedApp.tsx
    - .planning/REQUIREMENTS.md

key-decisions:
  - "MAX_MAPS set to 4 (plan D-02 overrides PROJECT.md constraint of 3)"
  - "MapGrid shows 2-column layout when maps.length >= 2 OR when 1 map + AddMapButton visible"
  - "AddMapButton gets existingNames prop to compute smallest unused マップN suffix"

patterns-established:
  - "IndexedDB side-effects called in components; reducer stays pure"
  - "logsExist prop computed at MapCard level and passed to MapHeader for conditional dialog"

requirements-completed:
  - MAP-01
  - MAP-02
  - MAP-03

duration: 25min
completed: 2026-03-22
---

# Phase 03 Plan 01: Map Management Summary

**Map CRUD with IndexedDB image upload, 2-column grid, inline rename, and cascade-delete confirmation dialog using ts-pattern reducer actions**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-22
- **Completed:** 2026-03-22
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Extended reducer with 4 MAP actions (ADD_MAP, DELETE_MAP, RENAME_MAP, SET_MAP_IMAGE) with MAX_MAPS=4 guard and cascade-delete on DELETE_MAP
- Built 5 UI components: MapGrid, MapCard, MapHeader, MapPlaceholder, AddMapButton following Feature-Sliced Design
- Wired MapGrid into PlottedApp replacing Phase 3 placeholder, enabling full map management flow

## Task Commits

1. **Task 1: Extend reducer with MAP actions** - `becd334` (feat) [TDD RED+GREEN]
2. **Task 2: Build map management UI components** - `b9d4219` (feat)

## Files Created/Modified

- `src/shared/model/reducer.ts` - Added MAX_MAPS=4, ADD_MAP/DELETE_MAP/RENAME_MAP/SET_MAP_IMAGE actions
- `src/shared/model/reducer.unit.test.ts` - Unit tests for all 4 MAP actions (54 total passing)
- `src/shared/model/index.ts` - Export MAX_MAPS
- `src/features/map-manager/ui/MapGrid.tsx` - 2-column grid, renders MapCard per map + AddMapButton
- `src/features/map-manager/ui/MapCard.tsx` - Image display with object-contain, URL cleanup, file upload
- `src/features/map-manager/ui/MapHeader.tsx` - Inline rename on double-click, delete with conditional dialog
- `src/features/map-manager/ui/MapPlaceholder.tsx` - Upload icon + "画像をアップロードしてください"
- `src/features/map-manager/ui/AddMapButton.tsx` - Dashed card, crypto.randomUUID, auto-named マップN
- `src/features/map-manager/index.ts` - Barrel export of MapGrid
- `src/pages/home/ui/PlottedApp.tsx` - Import MapGrid, replace placeholder with functional map area
- `.planning/REQUIREMENTS.md` - MAP-01 updated from "最大3枚" to "最大4枚"

## Decisions Made

- MAX_MAPS=4 per plan D-02 (overrides original PROJECT.md constraint of 3 maps)
- MapGrid uses 2-column when maps.length >= 2 OR when 1 map + AddMapButton would appear together
- AddMapButton receives existingNames prop to compute smallest unused integer suffix for "マップN" naming
- deleteMapImage side-effect called in MapHeader component (not in reducer) to keep reducer pure

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- MapCard has `position: relative` container (per plan requirement) ready for SVG overlay in Plan 02
- State.maps array populated with MapDef objects (id, name, img) for plot coordinate association
- Plan 02 (plot feature): click-to-plot on map images, dot rendering, click-to-delete dots

---

_Phase: 03-maps-and-plotting_
_Completed: 2026-03-22_

## Self-Check: PASSED

- All 7 key files exist on disk
- Both task commits (becd334, b9d4219) verified in git log
