# Phase 3: Maps and Plotting - Research

**Researched:** 2026-03-22
**Domain:** Canvas/SVG overlay coordinate math, image upload via File API, interactive dot plotting on images
**Confidence:** HIGH

## Summary

Phase 3 completes the alibi-tracking loop by adding map management (upload, display, delete) and the click-to-plot interaction (colored dots with character initials, hover-delete, ripple feedback). The core technical challenge is the **letterbox coordinate system**: when an image is displayed with `object-fit: contain`, the rendered image occupies only part of the container element, and click coordinates must be mapped back to image-space ratios (0.0–1.0) correctly. This requires `getBoundingClientRect` on the `<img>` element plus the image's `naturalWidth`/`naturalHeight` to compute the actual rendered image bounds within the container.

The map image workflow uses the already-implemented `saveMapImage`/`loadMapImage`/`deleteMapImage` helpers from `src/shared/model/use-map-images.ts` (idb-keyval). Map state lives in the existing reducer; Phase 3 adds `ADD_MAP`, `DELETE_MAP`, `RENAME_MAP`, `ADD_LOG`, and `DELETE_LOG` actions following the established ts-pattern exhaustive pattern. Dot rendering uses a positioned SVG (or absolutely-positioned divs) overlaid on the image container, with dots placed at `x * renderedWidth + offsetX` and `y * renderedHeight + offsetY` relative to the container.

All implementation follows Feature-Sliced Design: new code goes in `src/features/map-manager/` and `src/features/plot-manager/`, wired into `src/pages/home/ui/PlottedApp.tsx` at the `{/* Map area — Phase 3 */}` placeholder. State/dispatch are passed as props (established pattern from Phase 2).

**Primary recommendation:** Use a positioned `<div>` container with `<img object-fit:contain>` and an absolutely-positioned SVG overlay at 100% width/height. Compute letterbox insets from `getBoundingClientRect` + `naturalWidth`/`naturalHeight` on every click and on window resize (via `ResizeObserver`).

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 1枚なら全幅表示、2枚以降は2カラムグリッド。3枚目・4枚目は2行目に配置
- **D-02:** マップ最大枚数は4枚（従来の3枚から変更）
- **D-03:** マップカードにはヘッダーバーを設け、マップ名+削除アイコンを配置
- **D-04:** 画像は`object-fit: contain`で表示。アスペクト比を維持し、余白（letterbox）が出ても座標の正確性を優先
- **D-05:** 画像未設定時はノワールテーマに合わせた淡い背景+アップロードアイコン+テキスト（「画像をアップロードしてください」）
- **D-06:** ドットは円+キャラ名のイニシャル1文字表示。キャラカラーで塗り、色と文字の両方で識別可能
- **D-07:** 同一座標付近に複数キャラのドットが重なった場合、そのまま重ねて表示（シンプル）
- **D-08:** ホバー時はドットが「×」マークに変わる（削除インジケーター）
- **D-09:** クリック判定範囲は見た目より少し広め（見た目+数px余白）で使いやすさを確保
- **D-10:** activeCharが未選択時にマップをクリックしても何も起きないが、カーソルが変わる（クリック不可を示す `not-allowed` 等）
- **D-11:** プロット成功時にクリック地点で波紋エフェクトを表示
- **D-12:** 同キャラ・同Day・同時刻で複数プロット可能（追加方式、上書きしない）
- **D-13:** マップ上にはcurrentDay+currentTimeに一致するドットのみ表示。他の時刻のドットは非表示
- **D-14:** マップ追加はマップエリア末尾の「＋」カード型ボタン（空スロットと同サイズ）
- **D-15:** マップ追加時にデフォルト名を自動付与（「マップ1」「マップ2」...）、後からヘッダーバーで編集可能
- **D-16:** 画像の差し替え機能は作らない。変更したい場合はマップ削除→再追加で対応
- **D-17:** マップ削除時、プロットデータがある場合のみ確認ダイアログを表示（「このマップと関連するプロットデータが削除されます」）。プロットなしなら即削除
- **制約変更:** マップ最大枚数を3枚→4枚に変更（PROJECT.md・REQUIREMENTS.mdの更新が必要）

### Claude's Discretion

- ドットの具体的なサイズ（px）と判定余白の広さ
- 波紋エフェクトの実装方式（CSS animation or SVG）
- letterbox領域のクリック無効化の実装方法
- マップ名編集のUI方式（インライン編集 or ダイアログ）
- 「＋」カードのデザイン詳細
- SVGオーバーレイの実装構造
- reducerの新規アクション設計（ADD_MAP, DELETE_MAP, ADD_LOG, DELETE_LOG等）

### Deferred Ideas (OUT OF SCOPE)

- マップのスクリーンショット書き出し — EXPORT-01（v2 Requirements）
- 時刻変更時のドット軌跡表示（全時刻のドットを薄く表示）— 将来のUX改善として検討可能
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                                            | Research Support                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| MAP-01  | マップを最大4枚まで追加・削除でき、削除時に関連プロットデータもカスケード削除される                    | ADD_MAP/DELETE_MAP reducer actions; D-02 max=4; D-17 confirmation dialog                      |
| MAP-02  | 各マップにローカルファイルから画像を読み込める。未設定時は「画像をアップロードしてください」と表示する | File input + idb-keyval saveMapImage; D-05 placeholder; use-map-images.ts already implemented |
| MAP-03  | マップを最大2カラムで並列表示し、同時に見比べられる                                                    | CSS grid 2-column; D-01 single map = full width                                               |
| PLOT-01 | 選択中のキャラクター・Day・時刻で、マップ上をクリックして位置を記録できる（比率座標 0.0〜1.0）         | Letterbox coordinate math; ADD_LOG reducer action; D-10 guard on no activeChar                |
| PLOT-02 | 選択中のDay・時刻に記録された全キャラクターのドットをマップ上に常時表示する                            | SVG overlay; filter logs by activeDay+currentTime; D-06 dot style                             |
| PLOT-03 | ドットをクリックで即削除でき、ホバー時に削除インジケーターを表示する                                   | DELETE_LOG reducer action; D-08 hover → "×"                                                   |

</phase_requirements>

## Standard Stack

### Core

| Library                          | Version   | Purpose                                  | Why Standard                            |
| -------------------------------- | --------- | ---------------------------------------- | --------------------------------------- |
| React (existing)                 | 19.2.4    | UI components and event handling         | Already in project                      |
| TypeScript (existing)            | 5.9.3     | Type safety for coordinate math          | Already in project                      |
| idb-keyval (existing)            | installed | Blob storage for map images in IndexedDB | Already used by use-map-images.ts       |
| ts-pattern (existing)            | 5.9.0     | Exhaustive reducer matching              | Already used by reducer.ts              |
| @base-ui/react/dialog (existing) | 1.3.0     | Confirmation dialog for map delete       | Already used in PlottedApp reset dialog |
| Tailwind CSS v4 (existing)       | 4.2.2     | Layout and styling                       | Already in project                      |

### No New Dependencies Required

All required functionality (File API, SVG overlay, CSS grid, event handling) is native browser API or already available in the project. No additional packages needed.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── features/
│   ├── map-manager/
│   │   ├── ui/
│   │   │   ├── MapGrid.tsx          # 2-column grid container
│   │   │   ├── MapCard.tsx          # Single map with header + image + SVG overlay
│   │   │   ├── MapHeader.tsx        # Map name + rename + delete icon
│   │   │   ├── MapImageArea.tsx     # Image display + click handler + dot overlay
│   │   │   ├── MapPlaceholder.tsx   # Upload prompt for empty slots
│   │   │   └── AddMapButton.tsx     # "+" card button
│   │   └── index.ts
│   └── plot-manager/
│       ├── ui/
│       │   ├── DotOverlay.tsx       # SVG overlay rendering all dots for current time
│       │   └── PlotDot.tsx          # Individual dot: circle + initial + hover delete
│       └── index.ts
└── shared/
    └── model/
        ├── reducer.ts               # Add MAP/LOG actions here
        ├── state.ts                 # MapDef, PlotLog already defined
        └── use-map-images.ts        # Already implemented
```

### Pattern 1: Letterbox Coordinate Math

**What:** When `object-fit: contain` is used, the image's rendered area is smaller than the container. Clicks in the letterbox (padding) area must be rejected. Clicks in the image area must be normalized to 0.0–1.0 relative to the image, not the container.

**When to use:** Every click handler on a map image container.

**Implementation:**

```typescript
// Source: MDN HTMLImageElement.naturalWidth/naturalHeight + getBoundingClientRect
interface RenderedImageBounds {
  left: number; // px offset from container left to image left edge
  top: number; // px offset from container top to image top edge
  width: number; // rendered image width in px
  height: number; // rendered image height in px
}

const getRenderedImageBounds = (imgEl: HTMLImageElement): RenderedImageBounds => {
  const rect = imgEl.getBoundingClientRect();
  const containerW = rect.width;
  const containerH = rect.height;
  const naturalW = imgEl.naturalWidth;
  const naturalH = imgEl.naturalHeight;

  // Scale factor: fit image into container preserving aspect ratio
  const scale = Math.min(containerW / naturalW, containerH / naturalH);
  const renderedW = naturalW * scale;
  const renderedH = naturalH * scale;

  // Letterbox offsets (centered)
  const offsetX = (containerW - renderedW) / 2;
  const offsetY = (containerH - renderedH) / 2;

  return { left: offsetX, top: offsetY, width: renderedW, height: renderedH };
};

const clickToRatio = (
  event: React.MouseEvent<HTMLDivElement>,
  imgEl: HTMLImageElement,
): { x: number; y: number } | null => {
  const containerRect = event.currentTarget.getBoundingClientRect();
  const clickX = event.clientX - containerRect.left;
  const clickY = event.clientY - containerRect.top;

  const bounds = getRenderedImageBounds(imgEl);

  // Reject clicks in letterbox area
  if (
    clickX < bounds.left ||
    clickX > bounds.left + bounds.width ||
    clickY < bounds.top ||
    clickY > bounds.top + bounds.height
  ) {
    return null;
  }

  return {
    x: (clickX - bounds.left) / bounds.width,
    y: (clickY - bounds.top) / bounds.height,
  };
};
```

### Pattern 2: SVG Overlay for Dot Rendering

**What:** An absolutely-positioned SVG element covering the entire container, with dots placed at the computed pixel position within the rendered image bounds.

**When to use:** Rendering all PlotLog dots for the current day/time.

```typescript
// Dot position in SVG space = letterbox offset + ratio * rendered image size
const dotX = bounds.left + log.x * bounds.width;
const dotY = bounds.top + log.y * bounds.height;
```

The SVG has `pointer-events: none` at the root level; individual `<g>` dot groups have `pointer-events: all` to capture hover and click for deletion.

### Pattern 3: File Input for Image Upload

**What:** Hidden `<input type="file" accept="image/*">` triggered by clicking the placeholder area.

```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const blob = new Blob([await file.arrayBuffer()], { type: file.type });
  await saveMapImage(mapId, blob);
  dispatch({ type: "SET_MAP_IMAGE", payload: { id: mapId } });
  // Reset input so same file can be re-selected if needed
  e.target.value = "";
};
```

The `MapDef.img` field in state is used as a flag (non-null = image exists in IndexedDB). The actual image data is loaded from IndexedDB as a Blob and converted to an object URL for display:

```typescript
const [objectUrl, setObjectUrl] = useState<string | null>(null);
useEffect(() => {
  if (!mapDef.img) {
    setObjectUrl(null);
    return;
  }
  let url: string;
  loadMapImage(mapDef.id).then((blob) => {
    if (!blob) return;
    url = URL.createObjectURL(blob);
    setObjectUrl(url);
  });
  return () => {
    if (url) URL.revokeObjectURL(url);
  };
}, [mapDef.id, mapDef.img]);
```

### Pattern 4: Reducer Actions for Phase 3

**What:** Extend `src/shared/model/reducer.ts` with new action types, maintaining ts-pattern exhaustive matching.

```typescript
// New action types to add to the Action union in reducer.ts
| { type: "ADD_MAP"; payload: { id: string; name: string } }
| { type: "DELETE_MAP"; payload: { id: string } }
| { type: "RENAME_MAP"; payload: { id: string; name: string } }
| { type: "SET_MAP_IMAGE"; payload: { id: string } }  // marks img as non-null
| { type: "ADD_LOG"; payload: Omit<PlotLog, "id"> }
| { type: "DELETE_LOG"; payload: { id: number } }
```

ADD_MAP case: enforce max 4 maps, generate sequential default name ("マップ1", "マップ2"...).
DELETE_MAP case: filter out map + cascade-delete matching logs. Also call `deleteMapImage(id)` as a side-effect OUTSIDE reducer (reducer is pure).
ADD_LOG case: assign auto-incrementing ID (use `Math.max(0, ...state.logs.map(l => l.id)) + 1` or `Date.now()`).

### Pattern 5: Ripple Effect on Plot Success

**What:** CSS keyframe animation triggered by adding a state entry. A temporary `<div>` is added at click position in the container, animates outward, then is removed.

**Recommended approach:** Local state in MapImageArea holding an array of `{ id, x, y }` ripple entries. On successful plot dispatch, add a ripple; after animation duration (e.g., 600ms), remove it via `setTimeout`.

```typescript
// CSS (Tailwind @keyframes or inline style)
// Ripple: scale 0→2, opacity 0.6→0 over 600ms
@keyframes ripple {
  0%   { transform: scale(0); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
```

The ripple div is positioned at `left: bounds.left + x * bounds.width`, `top: bounds.top + y * bounds.height`, with a circular border and the animation applied.

### Pattern 6: Map Name Inline Editing

**Recommendation:** Inline edit via double-click on the name text in `MapHeader`. Toggle between a `<span>` display and an `<input>` edit mode with local state. Confirm on blur or Enter, cancel on Escape. This avoids a dialog and keeps the interaction lightweight.

```typescript
const [editing, setEditing] = useState(false);
const [draft, setDraft] = useState(name);
const commit = () => {
  const trimmed = draft.trim();
  if (trimmed) dispatch({ type: "RENAME_MAP", payload: { id, name: trimmed } });
  setEditing(false);
};
```

### Pattern 7: Dot Hit Testing

**What:** Each dot has a click target larger than its visual radius. Use an invisible `<circle>` with a larger radius and `pointer-events: all` layered above the visible dot.

```typescript
const DOT_RADIUS = 12; // visual
const HIT_RADIUS = 16; // hit target (DOT_RADIUS + 4px padding per D-09)
```

Hover state toggles showing the "×" text instead of the initial character.

### Anti-Patterns to Avoid

- **Do not use `<canvas>` for dot rendering:** SVG is easier to manage per-element pointer events and accessibility. Canvas requires manual hit testing.
- **Do not use `offsetX`/`offsetY` on click events:** These are relative to the event target, which may be a child element (the `<img>` or an SVG dot). Use `clientX/Y - getBoundingClientRect().left/top` on the container for reliable coordinates.
- **Do not store Blob URLs in localStorage:** Blob URLs are session-scoped and expire. The existing pattern (store blob in IndexedDB, derive URL at runtime) is correct.
- **Do not call `getBoundingClientRect` inside the reducer:** Coordinate math is a side effect that must happen in event handlers before dispatching normalized ratios.
- **Do not use `e.target` for container rect:** Use `e.currentTarget` (the registered listener element) to avoid getting the `<img>` element's rect instead of the container's.

## Don't Hand-Roll

| Problem              | Don't Build              | Use Instead                                           | Why                                     |
| -------------------- | ------------------------ | ----------------------------------------------------- | --------------------------------------- |
| Image storage        | Custom IndexedDB wrapper | `idb-keyval` via `use-map-images.ts` (already exists) | Already handles errors, key namespacing |
| Confirmation dialog  | Custom modal             | `@base-ui/react/dialog` (already used in reset flow)  | Consistent with existing UI pattern     |
| Unique map IDs       | Sequential counter       | `crypto.randomUUID()` or `Date.now().toString()`      | Avoids collision on delete+re-add       |
| Object URL lifecycle | Manual management        | `useEffect` cleanup with `URL.revokeObjectURL`        | Prevents memory leaks                   |

**Key insight:** The letterbox coordinate math is genuinely complex — it must handle `naturalWidth === 0` (image not yet loaded), container resize, and letterbox in both dimensions. Getting this wrong causes all dots to be slightly misaligned. Do not simplify by assuming no letterbox.

## Common Pitfalls

### Pitfall 1: naturalWidth === 0 Before Image Loads

**What goes wrong:** Click handler reads `imgEl.naturalWidth` before the image has loaded; gets 0, causing division by zero or NaN coordinates.

**Why it happens:** File input onChange fires asynchronously; image load from object URL also takes a tick.

**How to avoid:** Guard with `if (!imgEl.complete || imgEl.naturalWidth === 0) return null;` in `getRenderedImageBounds`. Alternatively use the `onLoad` event to set a ready flag.

**Warning signs:** Dots appear at (0,0) or NaN position.

### Pitfall 2: Letterbox Offset Direction Varies

**What goes wrong:** Horizontal images have letterbox on top/bottom; vertical images have letterbox on left/right. Code that only handles one case places dots incorrectly for the other.

**Why it happens:** `object-fit: contain` letterboxes in the dimension where the aspect ratio mismatch is greatest.

**How to avoid:** Always compute both offsetX and offsetY using `Math.min(containerW / naturalW, containerH / naturalH)` as the scale factor. The larger offset will be in the constrained dimension.

### Pitfall 3: Container Resize Invalidates Rendered Bounds

**What goes wrong:** User resizes window; dots no longer align with image because `getRenderedImageBounds` was called at the old size.

**Why it happens:** Dot positions are computed from stored ratios + current container size. If the container size is cached, it becomes stale.

**How to avoid:** Do NOT cache rendered bounds. Compute them fresh on every dot render pass. For the SVG overlay, re-render whenever container size changes using `ResizeObserver` or a simple `window.resize` listener (less precise).

**Recommended pattern:**

```typescript
const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
useEffect(() => {
  const ro = new ResizeObserver(([entry]) => {
    setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
  });
  if (containerRef.current) ro.observe(containerRef.current);
  return () => ro.disconnect();
}, []);
```

Dots re-render automatically when `containerSize` state changes.

### Pitfall 4: Clicks on SVG Dots Block New Plots

**What goes wrong:** User clicks on an existing dot to delete it but also inadvertently creates a new plot because the click also propagates to the container's click handler.

**Why it happens:** Both the container `onClick` (add plot) and the dot `onClick` (delete plot) fire for the same event.

**How to avoid:** Call `e.stopPropagation()` in the dot's `onClick` handler to prevent the event from reaching the container.

### Pitfall 5: Object URL Memory Leak

**What goes wrong:** Each time the component re-renders or the map image changes, a new object URL is created without revoking the previous one, gradually consuming memory.

**Why it happens:** `URL.createObjectURL` allocates browser memory; the URL must be explicitly revoked.

**How to avoid:** Always revoke in `useEffect` cleanup:

```typescript
useEffect(() => {
  if (!blobRef) return;
  const url = URL.createObjectURL(blobRef);
  setObjectUrl(url);
  return () => URL.revokeObjectURL(url);
}, [blobRef]);
```

### Pitfall 6: IndexedDB Image Not Available After Hard Reload in PlottedApp Init

**What goes wrong:** On page load, `useAppState` restores state from localStorage (maps have `img: "map-img-<id>"` flag set), but the image is loaded asynchronously from IndexedDB. If a component tries to render before the Blob is fetched, it briefly shows an empty image.

**Why it happens:** localStorage hydration is synchronous; IndexedDB is always async.

**How to avoid:** Show the placeholder until `objectUrl` state is non-null. This is the correct behavior — do not attempt to make IndexedDB synchronous.

## Code Examples

### Full Letterbox Coordinate Calculation

```typescript
// Source: getBoundingClientRect (MDN) + naturalWidth/naturalHeight (MDN)
const clickToRatio = (
  containerEl: HTMLDivElement,
  imgEl: HTMLImageElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null => {
  if (!imgEl.complete || imgEl.naturalWidth === 0) return null;

  const containerRect = containerEl.getBoundingClientRect();
  const clickX = clientX - containerRect.left;
  const clickY = clientY - containerRect.top;

  const containerW = containerRect.width;
  const containerH = containerRect.height;
  const scale = Math.min(containerW / imgEl.naturalWidth, containerH / imgEl.naturalHeight);
  const renderedW = imgEl.naturalWidth * scale;
  const renderedH = imgEl.naturalHeight * scale;
  const offsetX = (containerW - renderedW) / 2;
  const offsetY = (containerH - renderedH) / 2;

  if (clickX < offsetX || clickX > offsetX + renderedW) return null;
  if (clickY < offsetY || clickY > offsetY + renderedH) return null;

  return {
    x: (clickX - offsetX) / renderedW,
    y: (clickY - offsetY) / renderedH,
  };
};
```

### SVG Dot with Hover Delete

```tsx
// Source: SVG specification + React event model
const PlotDot = ({ log, char, bounds, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const cx = bounds.left + log.x * bounds.width;
  const cy = bounds.top + log.y * bounds.height;
  const DOT_RADIUS = 12;
  const HIT_RADIUS = 16;

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onDelete(log.id);
      }}
      style={{ cursor: "pointer" }}
    >
      <circle cx={cx} cy={cy} r={DOT_RADIUS} fill={char.color} />
      <text
        x={cx}
        y={cy}
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={10}
        fill="white"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {hovered ? "×" : char.name[0]}
      </text>
      {/* Expanded hit target */}
      <circle cx={cx} cy={cy} r={HIT_RADIUS} fill="transparent" />
    </g>
  );
};
```

### CSS Ripple Animation (Tailwind @keyframes)

```css
/* Add to global CSS or use inline style */
@keyframes plotted-ripple {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}
```

```tsx
// Ripple div positioned at click location within container
<div
  style={{
    position: "absolute",
    left: ripple.x,
    top: ripple.y,
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "2px solid currentColor",
    animation: "plotted-ripple 600ms ease-out forwards",
    pointerEvents: "none",
  }}
/>
```

### Reducer Extensions

```typescript
// Add to Action union type in reducer.ts
| { type: "ADD_MAP"; payload: { id: string; name: string } }
| { type: "DELETE_MAP"; payload: { id: string } }
| { type: "RENAME_MAP"; payload: { id: string; name: string } }
| { type: "SET_MAP_IMAGE"; payload: { id: string } }
| { type: "ADD_LOG"; payload: Omit<PlotLog, "id"> }
| { type: "DELETE_LOG"; payload: { id: number } }

// In ts-pattern match chain:
.with({ type: "ADD_MAP" }, ({ payload }) => {
  if (state.maps.length >= 4) return state; // D-02: max 4
  return { ...state, maps: [...state.maps, { id: payload.id, name: payload.name, img: null }] };
})
.with({ type: "DELETE_MAP" }, ({ payload }) => ({
  ...state,
  maps: state.maps.filter((m) => m.id !== payload.id),
  logs: state.logs.filter((l) => l.map !== payload.id),
  // NOTE: call deleteMapImage(payload.id) as side-effect in component, not here
}))
.with({ type: "RENAME_MAP" }, ({ payload }) => ({
  ...state,
  maps: state.maps.map((m) => m.id === payload.id ? { ...m, name: payload.name } : m),
}))
.with({ type: "SET_MAP_IMAGE" }, ({ payload }) => ({
  ...state,
  maps: state.maps.map((m) => m.id === payload.id ? { ...m, img: payload.id } : m),
}))
.with({ type: "ADD_LOG" }, ({ payload }) => {
  const newId = state.logs.length > 0 ? Math.max(...state.logs.map((l) => l.id)) + 1 : 1;
  return { ...state, logs: [...state.logs, { ...payload, id: newId }] };
})
.with({ type: "DELETE_LOG" }, ({ payload }) => ({
  ...state,
  logs: state.logs.filter((l) => l.id !== payload.id),
}))
```

## State of the Art

| Old Approach                          | Current Approach                      | When Changed  | Impact                                                          |
| ------------------------------------- | ------------------------------------- | ------------- | --------------------------------------------------------------- |
| Canvas-based image overlay            | SVG overlay + CSS positioning         | —             | SVG gives per-element pointer events without manual hit testing |
| `offsetX/offsetY` click coords        | `clientX/Y - getBoundingClientRect()` | —             | `offsetX` is unreliable when event target is a child element    |
| `URL.createObjectURL` without cleanup | Cleanup in `useEffect` return         | React 16+ era | Memory leak prevention                                          |

## Open Questions

1. **REQUIREMENTS.md says MAP-01 is "最大3枚" but CONTEXT.md D-02 changes it to 4枚**
   - What we know: CONTEXT.md explicitly says "マップ最大枚数を3枚→4枚に変更（PROJECT.md・REQUIREMENTS.mdの更新が必要）"
   - What's unclear: REQUIREMENTS.md and PROJECT.md still say 3枚
   - Recommendation: The first task in the plan must update REQUIREMENTS.md MAP-01 and PROJECT.md Constraints to say 4枚. This is a prerequisite for implementation.

2. **MapDef.img field semantics**
   - What we know: `img` is typed as `string | null` and comment says "map ID key into IndexedDB"
   - What's unclear: The current state type stores the map ID itself as the img key (`map-img-<id>` prefix added by use-map-images.ts). Setting `img = mapId` vs `img = "map-img-<id>"` — the use-map-images.ts already prepends `"map-img-"`, so `img` should just store the mapId.
   - Recommendation: SET_MAP_IMAGE action sets `img: mapId` (not the full key). `use-map-images.ts` handles the prefix.

3. **ResizeObserver vs recomputing on every render**
   - What we know: Dot positions depend on container dimensions which change on window resize
   - What's unclear: Whether inline dimension recomputation per render is sufficient vs explicit ResizeObserver
   - Recommendation: Use ResizeObserver. Inline recomputation would fire on every unrelated state change; ResizeObserver is targeted and idiomatic.

## Sources

### Primary (HIGH confidence)

- MDN HTMLImageElement.naturalWidth/naturalHeight — letterbox math foundation
- MDN Element.getBoundingClientRect — container coordinate origin
- MDN URL.createObjectURL / URL.revokeObjectURL — object URL lifecycle
- MDN ResizeObserver — container size change detection
- Existing codebase: `src/shared/model/use-map-images.ts`, `src/shared/model/reducer.ts`, `src/shared/model/state.ts` — verified by direct read
- Existing codebase: `src/pages/home/ui/PlottedApp.tsx` — integration point confirmed
- ts-pattern docs (from prior phases) — exhaustive reducer pattern confirmed active

### Secondary (MEDIUM confidence)

- SVG pointer-events specification — `pointer-events: all` on individual elements
- React synthetic event system — `e.stopPropagation()` behavior verified by project patterns

### Tertiary (LOW confidence)

- None — all claims verifiable from existing codebase or native browser APIs

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — no new dependencies; all existing
- Architecture: HIGH — follows established patterns from Phase 2; integration point confirmed in codebase
- Letterbox math: HIGH — standard browser API; multiple sources confirm approach
- Pitfalls: HIGH — derived from known browser behavior and existing codebase patterns

**Research date:** 2026-03-22
**Valid until:** 2026-06-22 (stable browser APIs; no moving library targets)
