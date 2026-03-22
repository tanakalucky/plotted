# Architecture Research

**Domain:** Murder mystery alibi management — single-page client-only web app
**Researched:** 2026-03-22
**Confidence:** HIGH (brownfield project with established FSD codebase; architecture derived directly from existing patterns and defined data model)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  app/                                                               │
│  Bootstrap, global styles, error boundary, single-page route       │
├─────────────────────────────────────────────────────────────────────┤
│  pages/                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PlottedPage  — single page, orchestrates all widgets        │   │
│  └──────────────────────────────────┬──────────────────────────┘   │
├─────────────────────────────────────┼───────────────────────────────┤
│  widgets/                           │                               │
│  ┌──────────────┐  ┌─────────────┐  │  ┌──────────────────────┐   │
│  │ ControlPanel │  │  MapCanvas  │  │  │  CharacterRoster     │   │
│  │ (day+time)   │  │ (click plot)│  │  │ (select active char) │   │
│  └──────┬───────┘  └──────┬──────┘  │  └──────────┬───────────┘   │
├─────────┼─────────────────┼──────────┼─────────────┼───────────────┤
│  features/                │          │             │               │
│  ┌────────────┐  ┌────────┴──────┐  ┌┴────────┐  ┌┴─────────┐   │
│  │ manage-    │  │  plot-point   │  │ manage- │  │ time-    │   │
│  │ characters │  │  (place/del)  │  │ maps    │  │ selector │   │
│  └────────────┘  └───────────────┘  └─────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  entities/                                                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐      │
│  │ character │  │    map    │  │    log    │  │  session  │      │
│  │ (model +  │  │ (model +  │  │ (model +  │  │ (day +    │      │
│  │  display) │  │  display) │  │  display) │  │  time)    │      │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘      │
├─────────────────────────────────────────────────────────────────────┤
│  shared/                                                            │
│  lib/storage (localStorage r/w)  lib/time  lib/utils  ui/          │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component            | Layer    | Responsibility                                                                    |
| -------------------- | -------- | --------------------------------------------------------------------------------- |
| `PlottedPage`        | pages    | Single-page shell, composes widgets into layout                                   |
| `ControlPanel`       | widgets  | Day selector + time slider combined into one control block                        |
| `MapCanvas`          | widgets  | Renders a map image with dot overlays; emits click coords                         |
| `CharacterRoster`    | widgets  | Character list with active selection and color indicators                         |
| `manage-characters`  | features | Add/delete characters, name + color input, enforces 10-char limit                 |
| `manage-maps`        | features | Upload map image (max 3), set name, delete (cascades log deletion)                |
| `plot-point`         | features | Click handler on map converts pixel to ratio coords; delete dot on click          |
| `time-selector`      | features | 10-minute-step slider (0–143 index), fine-tune buttons                            |
| `character` (entity) | entities | Character type, color swatch display component                                    |
| `map` (entity)       | entities | Map type, image display container                                                 |
| `log` (entity)       | entities | Log entry type, dot marker component                                              |
| `session` (entity)   | entities | Encapsulates `days`, `activeDay`, `activeChar`, `currentTime` selection state     |
| `shared/lib/storage` | shared   | `loadState()`, `saveState()`, `resetState()` — serialise/deserialise localStorage |
| `shared/lib/time`    | shared   | Convert time index (0–143) to HH:MM string and back                               |
| `shared/ui/`         | shared   | Button, Input, Label, Slider, Separator, Skeleton (existing + new Slider)         |

## Recommended Project Structure

```
src/
├── app/
│   ├── index.tsx                     # Entry point — no Convex/Clerk, just ErrorBoundary
│   ├── providers/
│   │   └── ErrorBoundary/            # Existing, keep as-is
│   └── styles/
│       └── index.css                 # Global styles + noir theme CSS variables
│
├── pages/
│   └── plotted/
│       ├── index.ts
│       └── ui/
│           └── PlottedPage.tsx       # Root layout: roster | controls | maps
│
├── widgets/
│   ├── character-roster/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── CharacterRoster.tsx   # List of chars, active selection
│   ├── control-panel/
│   │   ├── index.ts
│   │   └── ui/
│   │       └── ControlPanel.tsx      # Day controls + time slider
│   └── map-canvas/
│       ├── index.ts
│       └── ui/
│           └── MapCanvas.tsx         # Single map with dot overlays (renders up to 3)
│
├── features/
│   ├── manage-characters/
│   │   ├── index.ts
│   │   ├── model/
│   │   │   └── character-form.ts     # Form state type
│   │   └── ui/
│   │       ├── AddCharacterForm.tsx
│   │       └── CharacterItem.tsx
│   ├── manage-maps/
│   │   ├── index.ts
│   │   ├── model/
│   │   │   └── map-form.ts
│   │   └── ui/
│   │       ├── AddMapButton.tsx
│   │       └── MapItem.tsx
│   ├── plot-point/
│   │   ├── index.ts
│   │   └── lib/
│   │       └── use-plot-point.ts     # Click → ratio coords → log entry
│   └── time-selector/
│       ├── index.ts
│       └── ui/
│           └── TimeSlider.tsx        # Slider + step buttons
│
├── entities/
│   ├── character/
│   │   ├── index.ts
│   │   ├── model/
│   │   │   └── types.ts              # Character type
│   │   └── ui/
│   │       └── CharacterChip.tsx     # Name + color swatch display
│   ├── log/
│   │   ├── index.ts
│   │   ├── model/
│   │   │   └── types.ts              # Log type
│   │   └── ui/
│   │       └── PlotDot.tsx           # Dot marker on map
│   ├── map/
│   │   ├── index.ts
│   │   ├── model/
│   │   │   └── types.ts              # Map type
│   │   └── ui/
│   │       └── MapFrame.tsx          # Image container + empty state
│   └── session/
│       ├── index.ts
│       └── model/
│           └── types.ts              # Session type (activeDay, activeChar, currentTime)
│
└── shared/
    ├── lib/
    │   ├── storage.ts                # loadState / saveState / resetState
    │   ├── time.ts                   # indexToHHMM, HHMMToIndex
    │   └── utils.ts                  # cn() — existing
    └── ui/
        ├── Button/                   # existing
        ├── Input/                    # existing
        ├── Label/                    # existing
        ├── Slider/                   # new — shadcn slider for time selector
        ├── Separator/                # existing
        └── Skeleton/                 # existing
```

### Structure Rationale

- **entities/session:** Groups `activeDay`, `activeChar`, `currentTime`, and `days` count into one slice because they are inseparable selection state — they always travel together into the log key `{ char, map, day, time }`.
- **entities/log:** The `PlotDot` UI component belongs here because a dot IS a log entry rendered spatially — no feature logic.
- **widgets/map-canvas:** Sits above features because it composes `plot-point` feature logic and `log` entity display together. One `MapCanvas` is rendered per map (up to 3).
- **shared/lib/storage:** Domain-agnostic persistence layer. Features and entities never directly call `localStorage`; they go through this module so the serialization contract is in one place.
- **No `entities` layer existed before:** The old codebase had no `entities/` folder. This is intentional — FSD does not require every layer. Add it now because `character`, `map`, and `log` are genuine domain objects reused across multiple features.

## Architectural Patterns

### Pattern 1: Single Global State via Custom Hook at Page Level

**What:** All app state (`chars`, `maps`, `logs`, `days`, `activeChar`, `activeDay`, `currentTime`) lives in one `usePlottedState` hook returned from `PlottedPage`. State is passed down as props to widgets, which forward to features.

**When to use:** App has one page and all features share read/write access to the same data. Avoids context complexity for a small app.

**Trade-offs:** Prop drilling at two levels (page → widget → feature) is acceptable for this depth. Adding a third level of nesting should trigger a switch to context.

**Example:**

```typescript
// pages/plotted/ui/PlottedPage.tsx
const { state, dispatch } = usePlottedState();

return (
  <main>
    <CharacterRoster
      chars={state.chars}
      activeChar={state.activeChar}
      onSelectChar={(name) => dispatch({ type: 'SET_ACTIVE_CHAR', name })}
    />
    <ControlPanel
      days={state.days}
      activeDay={state.activeDay}
      currentTime={state.currentTime}
      onDayChange={...}
      onTimeChange={...}
    />
    {state.maps.map((map) => (
      <MapCanvas key={map.id} map={map} logs={state.logs} state={state} dispatch={dispatch} />
    ))}
  </main>
);
```

### Pattern 2: useReducer + localStorage Auto-Sync

**What:** State mutations go through a `useReducer` dispatcher. A `useEffect` watching the state object saves to localStorage on every change. Initial state is loaded from localStorage via an init function.

**When to use:** Multiple action types modify the same state tree (add/delete chars, place/remove logs, change day count). `useReducer` gives each action an explicit name and prevents ad-hoc state mutation patterns.

**Trade-offs:** Slightly more boilerplate than `useState`, but the action log makes debugging straightforward and cascade deletions (e.g., remove map → delete related logs) are expressed cleanly in one reducer case.

**Example:**

```typescript
// shared/lib/storage.ts
export function loadState(): State { ... }
export function saveState(s: State): void { ... }

// pages/plotted/lib/use-plotted-state.ts
const [state, dispatch] = useReducer(plottedReducer, undefined, loadState);
useEffect(() => { saveState(state); }, [state]);
```

### Pattern 3: Ratio Coordinates for Plot Points

**What:** When the user clicks on a `MapCanvas`, the click event pixel coordinates are divided by the rendered image element's `clientWidth` / `clientHeight` to produce `x, y` in [0.0, 1.0]. These ratios are stored in the log, not pixel values.

**When to use:** Always — the map image may be displayed at different sizes on different screens or after browser zoom. Pixel coordinates would desync.

**Trade-offs:** Requires the image element to be fully laid out before a click can be registered (use `onLoad` callback to set a `ready` flag).

**Example:**

```typescript
// features/plot-point/lib/use-plot-point.ts
function handleMapClick(e: React.MouseEvent<HTMLImageElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  dispatch({
    type: "ADD_LOG",
    payload: { char: activeChar, map: mapId, day: activeDay, time: currentTime, x, y },
  });
}
```

### Pattern 4: Cascade Deletion in Reducer

**What:** When a map or day is removed, the reducer also filters out all `logs` that reference the deleted entity. This is handled in a single reducer action, not scattered across components.

**When to use:** Any delete action that has referential dependencies in the state tree.

**Trade-offs:** The reducer for `REMOVE_MAP` and `SET_DAYS` becomes slightly longer but the logic is testable in isolation.

**Example:**

```typescript
case 'REMOVE_MAP':
  return {
    ...state,
    maps: state.maps.filter((m) => m.id !== action.id),
    logs: state.logs.filter((l) => l.map !== action.id),
  };
case 'SET_DAYS':
  return {
    ...state,
    days: action.days,
    logs: action.days < state.days
      ? state.logs.filter((l) => l.day <= action.days)
      : state.logs,
  };
```

## Data Flow

### Request Flow

```
User clicks map
    ↓
MapCanvas onClick handler
    ↓
use-plot-point.ts: pixel → ratio conversion
    ↓
dispatch({ type: 'ADD_LOG', payload: { x, y, char, map, day, time } })
    ↓
plottedReducer: appends to state.logs
    ↓
useEffect: saveState(state) → localStorage
    ↓
React re-render: MapCanvas receives new logs → PlotDot rendered at (x%, y%)
```

### State Management

```
localStorage (initial load)
    ↓
usePlottedState (useReducer init)
    ↓ (state props)
widgets/features/entities
    ↓ (dispatch calls)
plottedReducer
    ↓ (new state)
usePlottedState
    ↓ (useEffect)
localStorage (auto-save)
```

### Key Data Flows

1. **Add character:** `AddCharacterForm` → `dispatch(ADD_CHAR)` → state.chars grows → `CharacterRoster` re-renders
2. **Select character:** `CharacterRoster` chip click → `dispatch(SET_ACTIVE_CHAR)` → activeChar changes → next map click uses this char
3. **Upload map image:** File input in `AddMapButton` → FileReader → base64 string → `dispatch(ADD_MAP)` → new MapCanvas renders
4. **Place plot dot:** Click on `MapCanvas` image → `use-plot-point` calculates ratio → `dispatch(ADD_LOG)` → `PlotDot` appears at ratio position
5. **Delete plot dot:** Click existing `PlotDot` → `dispatch(REMOVE_LOG, id)` → dot disappears; event propagation must be stopped to avoid re-adding
6. **Day count decrease:** `-` button in `ControlPanel` → `dispatch(SET_DAYS, n-1)` → reducer cascades: logs with day > n-1 are deleted
7. **Reset:** Reset button → `dispatch(RESET)` → reducer returns `initialState` → localStorage cleared

## Scaling Considerations

This is a single-user, offline-first, single-page app. Traditional scaling does not apply. The relevant "scaling" concerns are data volume within localStorage.

| Concern                       | Threshold       | Mitigation                                                                                                           |
| ----------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------- |
| localStorage size limit       | ~5MB per origin | Map images as base64 are the primary risk; 3 maps × ~500KB each = ~1.5MB. Acceptable. Warn user on oversized images. |
| Re-render cost with many logs | ~500+ logs      | Logs filtered per map before rendering dots — O(n) filter per map render. Acceptable for human-scale play sessions.  |
| Reducer complexity            | Action count    | 10–12 action types expected. Stays manageable. Split into sub-reducers only if >20 actions.                          |

## Anti-Patterns

### Anti-Pattern 1: Direct localStorage Access from Feature Components

**What people do:** Call `localStorage.setItem(...)` directly inside a feature component's event handler.

**Why it's wrong:** Scatter the persistence contract across multiple components. If the key name or serialization format changes, every callsite must be updated. Also makes testing harder.

**Do this instead:** All localStorage access goes through `shared/lib/storage.ts` — `loadState()`, `saveState(state)`, `resetState()`. The `useEffect` in `usePlottedState` is the only place `saveState` is called.

### Anti-Pattern 2: Pixel Coordinates in Log Entries

**What people do:** Store `e.clientX`, `e.clientY` or `offsetX`, `offsetY` directly in logs.

**Why it's wrong:** These values are viewport or element-relative pixels and change if the image is displayed at a different size (browser zoom, window resize, different monitor DPI).

**Do this instead:** Always divide by `getBoundingClientRect().width/height` immediately in the click handler and store the ratio (0.0–1.0). Render dots using `style={{ left: x * 100 + '%', top: y * 100 + '%' }}` inside a `position: relative` container.

### Anti-Pattern 3: Putting State in Individual Feature Hooks Instead of Page-Level

**What people do:** Each feature (`manage-characters`, `manage-maps`) holds its own `useState` for the shared data model.

**Why it's wrong:** Characters and logs are cross-cutting — `plot-point` needs `activeChar`, `map-canvas` needs `chars` for dot colors, `control-panel` needs `days`. Duplicating this state creates sync bugs.

**Do this instead:** All domain state lives in one `usePlottedState` hook at `PlottedPage` level and is passed down as props. Features receive what they need via props; they never own the source of truth.

### Anti-Pattern 4: Same-Layer Cross-Imports Between Features

**What people do:** `manage-characters` feature imports from `manage-maps` feature.

**Why it's wrong:** Violates FSD's strict dependency rule — same-layer slices cannot import each other. Creates circular dependency risk.

**Do this instead:** Shared types belong in `entities/`. Communication between features always flows up to the parent widget or page, which holds state and passes it down.

### Anti-Pattern 5: Storing Map Images as Object URLs

**What people do:** Use `URL.createObjectURL(file)` for the map image src and store that URL in state.

**Why it's wrong:** Object URLs are ephemeral — they are invalidated on page reload, making persistence via localStorage impossible.

**Do this instead:** Read the file as base64 via `FileReader.readAsDataURL()` and store the base64 string in state. This survives localStorage serialization and page reload.

## Integration Points

### External Services

None. This is a fully offline, client-side app. No API calls, no CDN assets at runtime.

### Internal Boundaries

| Boundary                                      | Communication                 | Notes                                                                             |
| --------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------- |
| `features/plot-point` ↔ `widgets/map-canvas`  | Props + callback              | MapCanvas owns the DOM element; plot-point provides the click handler logic       |
| `features/manage-maps` ↔ `widgets/map-canvas` | State prop (maps array)       | Add/delete in feature; display in widget                                          |
| `entities/*` ↔ `features/*`                   | Import entities from below    | Features import entity types and UI components; never the reverse                 |
| `pages/plotted` ↔ all widgets                 | Props drilling (2 levels max) | Page owns state; widgets receive slices of it                                     |
| `shared/lib/storage` ↔ `pages/plotted`        | Direct import                 | Only `usePlottedState` calls storage; all other layers are unaware of persistence |

## Build Order Implications

Dependencies determine implementation order. Later phases depend on earlier ones:

1. **shared/lib/storage + shared/lib/time** — No dependencies; can be built and tested in isolation first.
2. **entities/** (character, map, log, session types + display components) — Depend only on shared. Establish types that features reference.
3. **features/manage-characters + features/manage-maps** — Depend on entities. Establish CRUD before plotting.
4. **features/time-selector** — Depends on shared/lib/time + entities/session. Independent of characters/maps.
5. **features/plot-point** — Depends on entities/character, entities/log, entities/session being defined.
6. **widgets/** — Depend on features. Build after features are working.
7. **pages/plotted** — Assembles all widgets. Build last.
8. **app/ cleanup** (remove Convex/Clerk providers) — Should happen first as a separate cleanup phase before building new features, to avoid Convex compilation errors blocking development.

## Sources

- Existing codebase: `/Users/tanakalucky/Work/10.programming/20.private_develop/10.sample-project/plotted/.planning/codebase/ARCHITECTURE.md` (HIGH confidence — direct codebase analysis)
- Existing codebase: `/Users/tanakalucky/Work/10.programming/20.private_develop/10.sample-project/plotted/.planning/codebase/STRUCTURE.md` (HIGH confidence — direct codebase analysis)
- Project spec: `/Users/tanakalucky/Work/10.programming/20.private_develop/10.sample-project/plotted/.planning/PROJECT.md` (HIGH confidence — canonical requirements)
- Feature-Sliced Design methodology: https://feature-sliced.design/docs — referenced for layer dependency rules and slice/segment conventions

---

_Architecture research for: Plotted — murder mystery alibi management app_
_Researched: 2026-03-22_
