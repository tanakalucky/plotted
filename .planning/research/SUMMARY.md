# Project Research Summary

**Project:** Plotted — Interactive Alibi Map Plotting Tool
**Domain:** Murder mystery alibi management web app (マーダーミステリー向けアリバイ管理ツール)
**Researched:** 2026-03-22
**Confidence:** HIGH

## Executive Summary

Plotted is a focused, single-purpose browser tool for online murder mystery (マダミス) players to record and review character positions on custom map images across time. There is no direct competitor: existing TRPG virtual tabletop tools (ユドナリウム, ココフォリア) are general-purpose boards without a time dimension; spreadsheets cover the time dimension but cannot show spatial data. The recommended approach is a fully offline, localStorage-backed static SPA using the existing React 19 / TypeScript / FSD / Tailwind stack, augmented with Zustand for global state and idb-keyval for blob-safe map image storage.

The architecture is deliberately simple: one page, one unified state tree managed via `useReducer`, auto-persisted to localStorage on every change. Coordinate data is stored as normalized ratios (0.0–1.0) so dots remain accurate across any screen size. Map images are stored as Blobs in IndexedDB (not base64 in localStorage) to avoid the 5 MB quota ceiling. The Convex and Clerk providers currently in the codebase must be removed before any feature work begins — they block compilation and are contrary to the "no backend" constraint.

The primary implementation risks are all in the data layer: localStorage quota overflow from large images, click coordinate offset when maps are letterboxed inside their containers, orphaned log entries from incomplete cascade deletes, and localStorage schema mismatch after field renames during development. Every one of these has a well-understood fix that must be baked in from the start rather than added as a patch. The feature set for v1 is small and fully defined — there is no scope ambiguity that would require discovery during implementation.

---

## Key Findings

### Recommended Stack

The existing project stack (React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, FSD, bun) requires only two new runtime dependencies: **Zustand 5** for global state and **idb-keyval** for IndexedDB Blob storage. Everything else — SVG overlay for click-to-plot, FileReader for image upload, shadcn Slider for time selection, Valibot for state validation — uses either native browser APIs or already-installed libraries.

**Core technologies:**

- **Zustand 5.0.12**: Global state management — flat store matches the `State` shape exactly; `persist` middleware handles localStorage sync; selective subscriptions prevent unnecessary re-renders across map panels
- **idb-keyval 6.2.1**: Map image Blob storage — avoids the 5 MB localStorage limit that base64-encoded images would breach; 295-byte brotli footprint; native Blob support eliminates 33% base64 inflation penalty
- **Plain React + SVG overlay**: Click-to-plot functionality — 10-line implementation with `getBoundingClientRect()` is the entire feature; no library (react-image-mapper, Leaflet, Konva) adds value here
- **shadcn Slider (new install via `bunx shadcn add slider`)**: Time selector — Radix UI controlled component; `min=0 max=143 step=1` maps directly to the `time: 0–143` index type

One note: the project uses `@base-ui/react` rather than `@radix-ui/react-*`; verify slider compatibility when adding the shadcn component.

### Expected Features

The entire v1 feature set is well-defined and dependency-mapped. All P1 features must ship together — they are interdependent. No feature is speculative.

**Must have (table stakes):**

- Character management (add/delete, name + color) — nothing else works without named, colored actors
- Day management (Day 1–7, increment/decrement, cascade delete on reduce) — temporal scope without which logs are meaningless
- Time selector (10-minute step slider 00:00–23:50) — required to create or filter log entries
- Map management (upload up to 3 images, 2-column display, cascade delete) — spatial substrate for all plots
- Click-to-place dot + click-to-delete dot (stored as x/y ratio) — the core write interaction
- Dot rendering per active day + current time, color-coded by character — the core read interaction
- localStorage auto-save/restore + reset button — data survival is table stakes for a single-session tool
- Classic noir aesthetic (parchment beige, antique gold, dark brown) — immersion is a functional concern for this audience

**Should have (competitive):**

- 2-column parallel map display — the primary differentiator vs. all existing tools
- Character filter toggle — hide/show individual characters when maps get crowded (add when visual overload is reported)
- Time scrubbing playback — step forward/back through time to reconstruct movement sequences

**Defer (v2+):**

- JSON export / import — localStorage is sufficient for single-session use
- Screenshot / image export — screen sharing is an acceptable v1 workaround
- Keyboard shortcuts — add when power users emerge

**Anti-features to reject explicitly:**

- Automatic contradiction detection — removes deductive play; out of scope by design
- Real-time multiplayer sync — requires backend; violates static-site constraint
- OAuth / user accounts — "no login" is a feature, not a limitation

### Architecture Approach

The app follows Feature-Sliced Design across five layers: `app` (bootstrap, error boundary), `pages` (single `PlottedPage` that owns all state), `widgets` (composited UI blocks: `CharacterRoster`, `ControlPanel`, `MapCanvas`), `features` (CRUD slices: `manage-characters`, `manage-maps`, `plot-point`, `time-selector`), and `entities` (domain types + display primitives: `character`, `map`, `log`, `session`). A `shared/lib/storage` module is the sole gateway to localStorage — no component may call `localStorage` directly. The existing codebase has no `entities/` layer; it must be created. Convex and Clerk providers in `app/` must be removed as the first task.

**Major components:**

1. `PlottedPage` (pages) — owns the unified `useReducer` state, auto-syncs to localStorage via `useEffect`, passes state slices down as props
2. `MapCanvas` (widgets) — renders one map image with SVG dot overlay per map; emits click coordinates to `plot-point` feature; one instance per loaded map (max 3)
3. `ControlPanel` (widgets) — day selector + time slider combined; connects `time-selector` feature and day dispatch
4. `CharacterRoster` (widgets) — character list with active selection; connects `manage-characters` feature
5. `shared/lib/storage` (shared) — `loadState()`, `saveState()`, `resetState()` with schema version check and `try/catch`; also triggers idb-keyval reads for image Blobs on load

### Critical Pitfalls

1. **localStorage quota overflow from map images** — Never store images as base64 in localStorage. Store Blobs in IndexedDB via idb-keyval; keep only coordinate/log state in localStorage. Wrap every `setItem` call in `try/catch`. Address in the data persistence phase before any map upload UI ships.

2. **Click coordinate offset under `object-fit: contain` letterboxing** — `getBoundingClientRect()` returns element bounds, not rendered image bounds. Compute letterbox offsets from `img.naturalWidth / naturalHeight` vs element aspect ratio; normalize coordinates against rendered image pixels, not element pixels. Return `null` for clicks in the gutter. Address at the start of the plot-point feature.

3. **Dot position drift on window resize** — Never compute dot positions in pixels. Always use CSS percentage positioning (`left: ${x*100}%`, `top: ${y*100}%`) inside a `position: relative` container sized to the rendered image area. Address from day one in the overlay implementation.

4. **Orphaned log entries from incomplete cascade deletes** — Implement a `sanitizeState(state): State` pure function that enforces all referential invariants (logs reference only existing chars, maps, and days within range). Call it on every state transition and on localStorage load. Build this before any delete UI ships.

5. **localStorage schema mismatch after field renames** — Store a `version: number` field alongside state. On load, if version doesn't match current schema, wipe and return default state (pre-launch); add explicit migrations post-launch. Implement before the first localStorage write merges.

---

## Implications for Roadmap

Based on research, the dependency graph and pitfall timing requirements suggest 6 phases:

### Phase 1: Codebase Cleanup (Remove Convex/Clerk)

**Rationale:** Convex and Clerk providers cause compilation errors that block all subsequent development. This is a prerequisite, not a feature. Must be first.
**Delivers:** Clean build with no dead dependencies; app boots with a blank slate
**Addresses:** Not a feature phase — unblocks everything else
**Avoids:** Compiler errors interfering with new feature work

### Phase 2: Data Foundation (State Model + Persistence Layer)

**Rationale:** All features write to and read from the same state tree. The schema, storage module, and `sanitizeState` invariant enforcer must exist before any feature is built. Pitfalls 4 and 5 (orphaned logs, schema mismatch) must be addressed here — retrofitting them is significantly harder.
**Delivers:** `State` type, `useReducer` + `plottedReducer`, `shared/lib/storage` (with schema versioning + `try/catch`), `sanitizeState`, entity types (`character`, `map`, `log`, `session`), `shared/lib/time` utilities
**Addresses:** localStorage persistence, schema versioning, cascade-delete invariants
**Avoids:** Pitfalls 4 (orphaned logs) and 5 (schema mismatch) — both must be pre-empted here

### Phase 3: Character + Day + Time Controls

**Rationale:** These three context-setters are prerequisites for any meaningful plot entry. They share no external dependencies beyond Phase 2. Implementation is LOW complexity for all three. Grouping them delivers the full "session context" in one phase.
**Delivers:** `manage-characters` feature (add/delete with color), `manage-maps` stub (upload + store Blob in IndexedDB), `CharacterRoster` widget, `ControlPanel` widget, `time-selector` feature (shadcn Slider + step buttons), day management (increment/decrement + cascade delete)
**Uses:** Zustand (or `useReducer` from Phase 2), idb-keyval for image Blobs, shadcn Slider
**Avoids:** Pitfall 1 (quota overflow) — idb-keyval for images is established here, not in a later patch

### Phase 4: Map Canvas + Click-to-Plot

**Rationale:** The core interaction loop. Requires all Phase 3 context (activeChar, activeDay, currentTime, maps loaded). This is the highest-risk phase technically — letterbox coordinate math and CSS percentage positioning must be correct from the start.
**Delivers:** `MapCanvas` widget (image display + SVG dot overlay), `plot-point` feature (click → ratio coords → dispatch ADD_LOG), `PlotDot` entity component (CSS percentage positioning), click-to-delete dot
**Uses:** `getBoundingClientRect()` + letterbox offset math from Pitfall 2, CSS percentage dot positioning from Pitfall 3
**Avoids:** Pitfalls 2 (letterbox offset) and 3 (dot drift on resize) — both must be built correctly initially

### Phase 5: Multi-Map Layout + Noir Theme

**Rationale:** 2-column parallel display is the key differentiator and requires maps to be functional (Phase 4). Noir theme is low-complexity and can be applied once layout is stable.
**Delivers:** 2-column responsive layout for up to 3 `MapCanvas` instances, `PlottedPage` final layout assembly, noir CSS variables (parchment beige, antique gold, dark brown ink), empty state variants ("upload image" vs "no plots for current filter")
**Implements:** `PlottedPage` layout, global CSS variables in `app/styles/index.css`

### Phase 6: Polish + Edge Cases

**Rationale:** UX pitfalls identified in research (image upload rejection feedback, delete confirmation dialogs, day-reduction warnings) are best addressed once the core loop is working and verifiable.
**Delivers:** Upload size validation with user-visible error, confirmation dialogs for destructive deletes (character with logs, day reduction with log count), `resetState` confirmation, performance debounce on localStorage writes during slider drag, distinct empty states
**Avoids:** UX pitfalls from PITFALLS.md (no feedback on rejection, silent cascade deletes, letterbox gutter clicks)

### Phase Ordering Rationale

- Phase 1 before everything: compilation must succeed before any development
- Phase 2 before features: the reducer, types, and `sanitizeState` are load-bearing for every subsequent phase
- Phase 3 before Phase 4: plot-point requires all four context values (char, map, day, time) to be settable
- Phase 4 before Phase 5: multi-map layout needs working per-map display and plotting
- Phase 6 last: polish presupposes a working feature set to polish

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 4 (Map Canvas + Click-to-Plot):** Letterbox coordinate math is non-trivial; the exact `getBoundingClientRect` + `naturalWidth/naturalHeight` computation should be validated with test images during planning. The interaction between `object-fit: contain` and SVG overlay sizing needs explicit verification.

Phases with standard patterns (skip research-phase):

- **Phase 1 (Cleanup):** Straightforward dependency removal — no research needed
- **Phase 2 (Data Foundation):** `useReducer` + localStorage pattern is well-documented; schema versioning pattern is explicit in PITFALLS.md
- **Phase 3 (Controls):** All three controls follow standard React patterns; shadcn Slider has clear docs
- **Phase 5 (Layout + Theme):** CSS layout and variable-based theming are standard
- **Phase 6 (Polish):** All UX improvements are incremental; no novel patterns

---

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                    |
| ------------ | ---------- | -------------------------------------------------------------------------------------------------------- |
| Stack        | HIGH       | Brownfield project — existing stack is fixed; only 2 new dependencies; idb-keyval and Zustand are mature |
| Features     | MEDIUM     | Domain is niche (Japanese マダミス community); feature expectations inferred from competitor analysis    |
| Architecture | HIGH       | Derived directly from existing FSD codebase + canonical PROJECT.md spec; no speculative decisions        |
| Pitfalls     | HIGH       | All 5 critical pitfalls are documented failure modes with real-world evidence and exact code-level fixes |

**Overall confidence:** HIGH

### Gaps to Address

- **shadcn Slider + @base-ui/react compatibility:** The project uses `@base-ui/react` rather than `@radix-ui/react-*`. `bunx shadcn add slider` may install a conflicting Radix peer dependency. Verify during Phase 3 planning; fall back to `@base-ui/react` Slider if needed.
- **Zustand vs. useReducer decision:** STACK.md recommends Zustand; ARCHITECTURE.md describes `useReducer`. Both approaches work. The team should commit to one before Phase 2. Recommendation: use `useReducer` as described in ARCHITECTURE.md (simpler, no extra dependency) and skip Zustand unless performance problems emerge.
- **Image size limits:** No hard cap is established — PITFALLS.md suggests <1 MB per image, but the right threshold depends on typical user map assets. Validate with real маDAMIS scenario screenshots during Phase 3.

---

## Sources

### Primary (HIGH confidence)

- `.planning/codebase/ARCHITECTURE.md` — existing FSD structure and layer conventions
- `.planning/codebase/STRUCTURE.md` — existing file tree and module boundaries
- `.planning/PROJECT.md` — canonical requirements and constraints
- [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — localStorage 5 MB limit
- [MDN: Element.getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) — coordinate normalization
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) — partialize and storage API
- [idb-keyval GitHub](https://github.com/jakearchibald/idb-keyval) — Blob storage, bundle size
- [React docs: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) — cascading update patterns

### Secondary (MEDIUM confidence)

- ユドナリウム usage guide — competitor feature baseline
- ココフォリア usage guide — competitor feature baseline
- [open-webui issue #14874](https://github.com/open-webui/open-webui/issues/14874) — real-world localStorage base64 quota failure
- [DEV: LocalStorage vs IndexedDB guide](https://dev.to/tene/localstorage-vs-indexeddb-javascript-guide-storage-limits-best-practices-fl5) — storage strategy
- Online マダミス tool overview (practitioner blog) — user workflow context
- [shadcn/ui Slider docs](https://ui.shadcn.com/docs/components/slider) — controlled component API

### Tertiary (LOW confidence)

- Virtual tabletop feature comparison 2025 (WebSearch only) — competitor landscape; needs validation against current tool versions

---

_Research completed: 2026-03-22_
_Ready for roadmap: yes_
