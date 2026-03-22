# Milestones

## v1.0 MVP (Shipped: 2026-03-22)

**Phases completed:** 4 phases, 7 plans, 12 tasks

**Key accomplishments:**

- Removed all Convex/Clerk/Todo dead code and applied classic noir palette via OKLCH CSS variables mapped to shadcn's token contract
- useReducer + localStorage persistence layer with IndexedDB map image storage via idb-keyval, including silent-reset protection for corrupted data
- Fully-tested pure reducer with 8 action types (ts-pattern exhaustive) and 5-minute time index utility (0-287, timeIndexToLabel)
- Map CRUD with IndexedDB image upload, 2-column grid, inline rename, and cascade-delete confirmation dialog using ts-pattern reducer actions
- SVG dot overlay with letterbox coordinate math, hover-delete PlotDot, and ripple feedback wired into MapCard delivering complete PLOT-01/02/03 alibi-tracking loop
- Async reset onClick in PlottedApp.tsx that awaits Promise.all(deleteMapImage) for all map blobs before dispatching RESET, eliminating orphaned IndexedDB entries

---
