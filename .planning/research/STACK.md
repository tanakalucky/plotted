# Stack Research

**Domain:** Interactive alibi map plotting tool (murder mystery web app)
**Researched:** 2026-03-22
**Confidence:** HIGH for core choices, MEDIUM for image storage approach

## Context

Brownfield project. The existing stack (React 19.2.4, Tailwind CSS v4.2.2, shadcn/ui, Vite 8, TypeScript 5.9.3, FSD architecture, bun) is fixed. This research covers only the **new additions** needed to build the alibi plotting feature on top of the existing base.

Convex and Clerk are present in the codebase but will be removed — the target is a fully localStorage/IndexedDB-backed static site deployed to Cloudflare Pages.

---

## Recommended Stack

### Core Technologies (New Additions)

| Technology                   | Version   | Purpose                                                                       | Why Recommended                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------- | --------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zustand                      | 5.0.12    | Global app state (chars, maps, logs, day, time)                               | The State shape in PROJECT.md is a single interconnected object that must be shared across multiple map panels, character selectors, and time sliders simultaneously. Zustand's flat store pattern fits this exactly without prop-drilling or context boilerplate. Outperforms useReducer+Context for this pattern due to selective subscription (each panel re-renders only when its slice changes). |
| zustand/middleware `persist` | (bundled) | Auto-persist structured state (everything except image blobs) to localStorage | Built into Zustand. `partialize` lets us exclude image blobs (stored separately in IndexedDB) while persisting all other state. Zero additional dependency.                                                                                                                                                                                                                                           |
| idb-keyval                   | 6.2.1     | Store map image blobs in IndexedDB                                            | localStorage is capped at 5MB per origin — three map images as base64 strings easily exceed this. idb-keyval stores Blobs natively (no base64 penalty), is 295–573 bytes brotli'd, and has a dead-simple get/set API. IndexedDB capacity is typically 50%+ of available disk space.                                                                                                                   |

### Supporting Libraries (No New Installs Needed)

| Library               | Already Present    | Purpose in This Project                                | Notes                                                                                                                                                                                                                    |
| --------------------- | ------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| shadcn/ui Slider      | via shadcn install | Time slider (00:00–23:50, 10-min steps)                | Built on Radix UI. `min={0}` `max={143}` `step={1}` maps directly to the `time: 0–143` index in the State type. `onValueChange` fires on every drag tick. No additional install required — run `bunx shadcn add slider`. |
| Lucide React          | 0.577.0            | Icons for character chips, map controls, time controls | Already installed. No new icons library needed.                                                                                                                                                                          |
| clsx + tailwind-merge | existing           | Dynamic className composition for noir theme           | Already installed via cn() utility.                                                                                                                                                                                      |
| Valibot               | 1.3.1              | localStorage parse/validate on restore                 | Already installed. Use to validate deserialized state shape on app load, preventing crashes from malformed or legacy localStorage data.                                                                                  |

### SVG Overlay Approach (No Library Needed)

The map click-to-plot feature does NOT need a library. The correct approach for this project is:

**Plain React + native SVG + `getBoundingClientRect()`**

Pattern:

```tsx
function MapCanvas({ imageUrl, plots, onPlotAdd, onPlotRemove }) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleClick(e: React.MouseEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0.0–1.0
    const y = (e.clientY - rect.top) / rect.height; // 0.0–1.0
    onPlotAdd({ x, y });
  }

  return (
    <div ref={containerRef} className="relative cursor-crosshair" onClick={handleClick}>
      <img src={imageUrl} className="w-full h-full object-contain" draggable={false} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1 1" preserveAspectRatio="none">
        {plots.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={0.012}
            fill={p.color}
            onClick={(e) => {
              e.stopPropagation();
              onPlotRemove(p.id);
            }}
          />
        ))}
      </svg>
    </div>
  );
}
```

Why no library: Libraries like react-image-mapper or react-svg-map are designed for geographic or zone-based maps. This project needs arbitrary image + proportional click coordinates — a 10-line implementation with `getBoundingClientRect()` and an SVG overlay is the entire feature. Adding a library adds bundle size and unnecessary abstraction.

### FileReader API (Native Browser, No Library)

Reading user-uploaded image files uses the browser's native FileReader API — no library needed.

```tsx
function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;
  // Store Blob directly in IndexedDB via idb-keyval
  set(`map-image-${mapId}`, file);
  // Store object URL for display (revoke on component unmount)
  const url = URL.createObjectURL(file);
  setImageUrl(url);
}
```

**Decision: Store Blob in IndexedDB, not base64 in localStorage.**

- Base64 encoding inflates image size by ~33%
- Three map images as base64 would likely exceed the 5MB localStorage limit
- idb-keyval stores File/Blob natively with no encoding overhead
- On app load: read Blob from IndexedDB → `URL.createObjectURL()` → use as `<img src>`

---

## What NOT to Use

| Avoid                                 | Why                                                                                                                                                                 | Use Instead                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Storing base64 images in localStorage | 5MB limit per origin. Three map images easily exceed this. QuotaExceededError crashes the app silently.                                                             | idb-keyval with Blob storage         |
| react-image-mapper                    | Designed for pre-defined clickable zones (HTML image maps). Overkill and wrong abstraction for free-form dot placement.                                             | Plain React + SVG overlay            |
| react-leaflet / Leaflet               | Geographic tile-based mapping. Massive dependency (200KB+) with no benefit for static image overlays.                                                               | Plain React + SVG overlay            |
| Redux / Redux Toolkit                 | 6x the boilerplate of Zustand for no benefit at this app's scale. FSD architecture works fine with Zustand slices.                                                  | Zustand 5                            |
| React Context for global state        | Context causes full subtree re-renders. With 3 maps and multiple character tabs rendered simultaneously, this will cause noticeable lag when the time slider moves. | Zustand with selective subscriptions |
| Canvas API (`<canvas>`)               | Requires imperative redraw logic on every state change, fighting React's declarative model. SVG integrates naturally with React's virtual DOM and event system.     | SVG overlay                          |
| localForage                           | 7KB+ bundle size for the same feature as idb-keyval (295 bytes). Only adds value for IE11 support, which this project does not need.                                | idb-keyval                           |

---

## Installation

```bash
# New dependencies to add
bun add zustand idb-keyval

# shadcn component (no npm install — copies component code)
bunx shadcn add slider
```

Everything else (SVG overlay, FileReader, time calculation) uses native browser APIs and existing project dependencies.

---

## Alternatives Considered

| Recommended               | Alternative                       | When to Use Alternative                                                                                                                                                                                       |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zustand persist           | Manual localStorage read/write    | If state structure is trivial (1-2 keys). For this project's multi-key State type, persist middleware saves hundreds of lines.                                                                                |
| idb-keyval                | localStorage + base64             | Only if images are guaranteed tiny (< 100KB each) and only 1 map. Given up to 3 maps of unknown size, idb-keyval is safer.                                                                                    |
| SVG overlay (plain React) | Konva / react-konva               | Konva is appropriate when you need drag-and-drop repositioning of placed dots, canvas-to-PNG export, or complex drawing. This project only needs click-to-place and click-to-remove dots — SVG is sufficient. |
| shadcn Slider             | rc-slider or @mantine/core Slider | If shadcn/ui weren't already in the project, these are valid. Never mix UI libraries when one already covers the use case.                                                                                    |

---

## Stack Patterns

**State slice organization (FSD-compatible):**

- One Zustand store per feature entity: `useCharStore`, `useMapStore`, `useLogStore`, `useTimeStore`
- Or one unified store mirroring the `State` type in PROJECT.md — simpler for this project's size
- Recommendation: **single unified store** matching `State` type exactly, with `persist` middleware excluding `maps[].img` (stored in IndexedDB separately)

**Time slider → time index mapping:**

```ts
// time index 0–143 → display string
const toTimeString = (idx: number) => {
  const hours = Math.floor((idx * 10) / 60)
    .toString()
    .padStart(2, "0");
  const mins = ((idx * 10) % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};
```

**IndexedDB key convention:**

```ts
// idb-keyval keys for map images
`plotted:map:${mapId}:image`; // stores File/Blob
```

---

## Version Compatibility

| Package       | Version  | Compatible With                                   | Notes                                                                                                                                                                                                                                                            |
| ------------- | -------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| zustand       | 5.0.12   | React 19                                          | Zustand 5 supports React 19 concurrent features. Zustand 4 had React 19 issues — use v5.                                                                                                                                                                         |
| idb-keyval    | 6.2.1    | All modern browsers (Chrome, Firefox, Safari 13+) | No IE11 support — acceptable per project constraints (desktop browsers only).                                                                                                                                                                                    |
| shadcn Slider | (copied) | Radix UI (already installed as @base-ui/react)    | shadcn uses Radix UI primitives. Note: the existing project uses `@base-ui/react` not `@radix-ui/react-*` packages. When running `bunx shadcn add slider`, verify it installs the Radix slider primitive or check if @base-ui/react slider can be used directly. |

---

## Sources

- [Zustand npm page](https://www.npmjs.com/package/zustand) — version 5.0.12 confirmed (MEDIUM confidence)
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) — partialize and storage API (HIGH confidence)
- [idb-keyval GitHub](https://github.com/jakearchibald/idb-keyval) — Blob storage support, bundle size (HIGH confidence)
- [MDN FileReader.readAsDataURL](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL) — base64 API (HIGH confidence)
- [MDN Storage quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — 5MB localStorage limit (HIGH confidence)
- [shadcn/ui Slider docs](https://ui.shadcn.com/docs/components/slider) — Radix UI based, min/max/step/onValueChange props (HIGH confidence)
- [getBoundingClientRect MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) — coordinate normalization pattern (HIGH confidence)
- WebSearch: Zustand 5 React 19 compatibility — verified via multiple sources (MEDIUM confidence)

---

_Stack research for: Interactive alibi map plotting tool (Plotted.)_
_Researched: 2026-03-22_
