# Pitfalls Research

**Domain:** Map-based coordinate plotting with localStorage persistence (murder mystery alibi tracker)
**Researched:** 2026-03-22
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: localStorage QuotaExceededError from base64 images

**What goes wrong:**
localStorage is capped at ~5MB per origin across all major browsers. A single high-resolution map image converted to base64 inflates approximately 33% over raw binary size. With the project's limit of 3 maps, users uploading typical PNG/JPG screenshots (1–3 MB each) will silently hit the quota. The write call throws `QuotaExceededError: DOM Exception 22` — if unhandled, the entire save operation fails without user feedback, and subsequent page loads restore stale or empty state.

**Why it happens:**
Developers test with small images during development. The error only surfaces in production with real-world assets. localStorage's synchronous write API does not warn before failure — it just throws.

**How to avoid:**

1. Wrap every `localStorage.setItem` call in `try/catch` and surface a user-visible error when quota is exceeded.
2. Before storing, check estimated usage with `navigator.storage.estimate()` and warn the user if stored + new image would exceed a conservative threshold (e.g. 4 MB).
3. Compress images via `canvas.toDataURL('image/jpeg', 0.8)` before base64 encoding — JPEG at 80% quality dramatically reduces size for photographic maps.
4. Cap accepted image file size at upload time (e.g. reject files >1 MB before encoding).
5. If quota constraints prove unworkable in practice, migrate image storage to IndexedDB (Blob storage, gigabyte-class limits) while keeping the coordinate/log state in localStorage.

**Warning signs:**

- Development images are small PNGs (<100 KB); production users use full-screenshot maps (1–5 MB).
- No `try/catch` around `setItem` calls.
- State silently resets on reload when a user adds a third map.

**Phase to address:** Data persistence phase (localStorage save/restore implementation). Must be addressed before any map upload UI is shipped.

---

### Pitfall 2: Click coordinates offset when using CSS `object-fit: contain`

**What goes wrong:**
If the map `<img>` element uses `object-fit: contain` (or the container has padding/border), the image is letterboxed inside its DOM bounding box. A click at pixel (x, y) on the element is NOT at (x, y) on the image — there are empty gutters above/below or left/right. Computing `x / element.width` produces coordinates outside the visible image area, and dots render in blank space or are offset from where the user clicked.

**Why it happens:**
`getBoundingClientRect()` returns the element's box, not the rendered image's box. When aspect ratios differ, the image occupies only part of that box. Developers normalize against element dimensions without accounting for letterbox offsets.

**How to avoid:**
Use `img.naturalWidth / img.naturalHeight` to compute the image's aspect ratio, compare it to the element's rendered aspect ratio, then calculate the letterbox offsets:

```ts
function getImageRelativeCoords(
  e: React.MouseEvent<HTMLImageElement>,
  img: HTMLImageElement,
): { x: number; y: number } | null {
  const rect = img.getBoundingClientRect();
  const elementAspect = rect.width / rect.height;
  const imageAspect = img.naturalWidth / img.naturalHeight;

  let imgRenderedWidth: number;
  let imgRenderedHeight: number;
  let offsetX = 0;
  let offsetY = 0;

  if (elementAspect > imageAspect) {
    // Letterbox: empty space left and right
    imgRenderedHeight = rect.height;
    imgRenderedWidth = rect.height * imageAspect;
    offsetX = (rect.width - imgRenderedWidth) / 2;
  } else {
    // Pillarbox: empty space top and bottom
    imgRenderedWidth = rect.width;
    imgRenderedHeight = rect.width / imageAspect;
    offsetY = (rect.height - imgRenderedHeight) / 2;
  }

  const clickX = e.clientX - rect.left - offsetX;
  const clickY = e.clientY - rect.top - offsetY;

  if (clickX < 0 || clickY < 0 || clickX > imgRenderedWidth || clickY > imgRenderedHeight) {
    return null; // Click landed in the letterbox gutter — ignore
  }

  return { x: clickX / imgRenderedWidth, y: clickY / imgRenderedHeight };
}
```

The project already decided to store coordinates as ratios (0.0–1.0), which is the correct approach. The critical part is computing those ratios against the rendered image pixels, not the element pixels.

**Warning signs:**

- Map images have portrait and landscape variants — tests with a square image always pass.
- Dots appear consistently offset in one direction when the map is narrower than the display column.
- Clicks near edges register outside [0, 1] range without explicit clamping.

**Phase to address:** Plot functionality phase. Coordinate normalization logic must be validated with non-square test images before UI is considered complete.

---

### Pitfall 3: Dot positions drift when the browser window is resized

**What goes wrong:**
Stored coordinates are ratios (0.0–1.0), which is correct. But the overlay dots are positioned using absolute pixel values computed once at render time. If the user resizes the browser window (or zooms), the image element's pixel dimensions change but the dot positions are not recomputed — dots drift away from their recorded positions.

**Why it happens:**
Computing `left: x * img.offsetWidth` in a one-time calculation or without reactive re-render loses synchronization with element dimensions after layout changes.

**How to avoid:**
Position overlay dots using CSS percentages derived directly from stored ratios:

```tsx
// Good: percentage-based, auto-reflows on resize
<div
  style={{
    left: `${plot.x * 100}%`,
    top: `${plot.y * 100}%`,
    position: "absolute",
    transform: "translate(-50%, -50%)",
  }}
/>
```

The parent container must be `position: relative` and sized to match the rendered image — not the element box if letterboxing is used.

If letterboxing is present, the overlay container must be sized to the rendered image area (not the full element), otherwise percentage positioning will re-introduce the same gutter offset as Pitfall 2.

**Warning signs:**

- Dots look correct at initial render but shift after window resize.
- Tests only run at a fixed viewport width.

**Phase to address:** Plot display/overlay phase. Use percentage positioning from day one.

---

### Pitfall 4: Cascading delete leaving orphaned logs

**What goes wrong:**
When a character is deleted, all logs referencing that character must be removed. When a map is deleted, all logs referencing that map must be removed. When the day count is reduced (e.g. 5 → 3), all logs for Day 4 and Day 5 must be removed. If any deletion path is missing, orphaned logs accumulate in localStorage. On reload, the UI tries to render them — undefined character colors, references to deleted maps, and phantom dots appear.

**Why it happens:**
Deletion logic is added incrementally per feature. Character delete gets implemented, map delete gets implemented, but day-reduction delete is forgotten because it is a less obvious "delete" operation (it's a decrement button). Each path also needs to be applied to localStorage immediately, not just to in-memory state.

**How to avoid:**
Centralize all state mutations through a single reducer or store function. Define explicit invariants:

```
invariant: logs must only reference existing chars, maps, and days <= state.days
```

Write a `sanitizeState(state: State): State` pure function that enforces all invariants — filter orphaned logs, clamp activeDay to current days range, reset activeChar if deleted. Call `sanitizeState` on every state transition and on load from localStorage. This makes every deletion path correct by construction rather than requiring per-feature cleanup logic.

**Warning signs:**

- Character delete and map delete have separate log-cleanup code paths.
- Day decrement does not include a log purge step.
- No validation on localStorage load.

**Phase to address:** State management / data model phase. `sanitizeState` should be implemented before any delete UI is built.

---

### Pitfall 5: localStorage schema mismatch after code changes

**What goes wrong:**
During development, the `State` shape changes (fields added, renamed, types changed). localStorage contains the old shape. On page load, `JSON.parse` succeeds (valid JSON) but the app crashes or behaves incorrectly because fields are missing or have the wrong type — e.g. `logs` contains items with old field names, `activeChar` is an index instead of a name, etc.

**Why it happens:**
No schema version is stored alongside the data. There is no migration or reset path when the schema is incompatible.

**How to avoid:**
Store a `version` field alongside state:

```ts
const SCHEMA_VERSION = 1;
// On save: JSON.stringify({ version: SCHEMA_VERSION, data: state })
// On load:
const parsed = JSON.parse(raw);
if (!parsed || parsed.version !== SCHEMA_VERSION) {
  return defaultState(); // Wipe and start fresh
}
```

For production (post-launch), implement explicit migrations per version increment instead of wiping. For pre-launch development, wiping on mismatch is acceptable.

**Warning signs:**

- App crashes on load after a field rename.
- `console.error` about undefined properties on first page load after a code change.
- `activeChar` is `null` but logs reference character names from previous session.

**Phase to address:** Data persistence phase. Add `version` key before shipping any user-facing feature that writes to localStorage.

---

## Technical Debt Patterns

| Shortcut                                                      | Immediate Benefit            | Long-term Cost                                                 | When Acceptable                           |
| ------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------- | ----------------------------------------- |
| Store full base64 in localStorage without size check          | No extra code                | Silent data loss when quota exceeded; user loses all map state | Never — always add try/catch + size guard |
| Compute dot positions in pixels at render time                | Simpler initial code         | Dots drift on window resize                                    | Never — use CSS percentages               |
| Per-feature orphan cleanup instead of centralized sanitize    | Faster to write each feature | Orphaned logs from day-decrement and future deletion paths     | Never — centralize from the start         |
| Skip schema version field                                     | Less boilerplate             | Any field rename breaks existing sessions                      | Never after first localStorage write      |
| `JSON.parse(localStorage.getItem('state'))` without try/catch | Concise                      | App crashes on corrupted/missing data                          | Never in production paths                 |
| Use `e.nativeEvent.offsetX / img.offsetWidth` for coordinates | Looks correct                | Breaks with letterboxing, padding, transforms                  | Never — use explicit letterbox math       |

---

## Integration Gotchas

| Integration                               | Common Mistake                                                                 | Correct Approach                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| localStorage + React state                | setState and localStorage write get out of sync when error is thrown mid-write | Write to localStorage inside a useEffect that depends on state — only fires after React commits the state   |
| FileReader + React state                  | Setting state inside `reader.onload` callback runs outside React's batch       | Use `useCallback` and ensure the FileReader result is passed to a state setter directly                     |
| CSS `object-fit: contain` + click handler | Using element bounding box dimensions for coordinate normalization             | Compute rendered image dimensions from `naturalWidth/naturalHeight` ratio vs element ratio                  |
| shadcn/ui Slider + controlled value       | Slider value prop not updating when external state changes programmatically    | Always pass `value={[currentTime]}` (array) and `onValueChange` together; never mix controlled/uncontrolled |

---

## Performance Traps

| Trap                                                                                 | Symptoms                                                  | Prevention                                                                                            | When It Breaks                                                                                       |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Serializing full state (including 3 base64 images) on every keystroke or slider move | UI lag during time slider drag                            | Debounce localStorage writes (300–500ms); serialize images separately from frequently-changing fields | When state.maps contains images >500 KB — synchronous stringify blocks main thread                   |
| Re-rendering all map overlays when only one control changes                          | Unnecessary re-renders of image components with many dots | Split state: separate image/map metadata from active filters (activeChar, activeDay, currentTime)     | With 3 maps × 7 days × 144 time slots × multiple characters — can accumulate hundreds of log entries |
| `JSON.parse` of large state on every render                                          | Render latency                                            | Parse once on load, store in React state; never re-parse on each render                               | State >1 MB with 3 base64 images                                                                     |

---

## UX Pitfalls

| Pitfall                                                                        | User Impact                                           | Better Approach                                                                                       |
| ------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| No feedback when image upload is rejected (too large)                          | User confused why map doesn't appear                  | Show explicit error: "Image too large (X MB). Please resize to under 1 MB."                           |
| Slider snaps to wrong value when clicking on the track                         | Time jumps unexpectedly; loses precision              | Use shadcn/ui Slider which handles track click → nearest step correctly; validate step=1 with max=143 |
| Delete with no confirmation for character with many logs                       | Accidental deletion of all alibi data for a character | Confirm dialog showing "Delete [Name]? This will remove N plot entries."                              |
| Day count reduction silently deletes logs                                      | User reduces days thinking it's reversible            | Show count of logs that will be deleted: "Reduce to Day 3? This removes 12 plot entries."             |
| Clicking in letterbox gutter registers as a plot                               | Dot appears in blank space next to map                | Null-check click result (Pitfall 2 fix) and do nothing when click is outside image bounds             |
| No visual distinction between "no plots yet" and "no plots for current filter" | User thinks app is broken                             | Show different empty states: "Click to add first plot" vs "No plots for [Character] on Day [N]"       |

---

## "Looks Done But Isn't" Checklist

- [ ] **Map coordinate click:** Works with square test image — verify with portrait AND landscape map images at multiple window widths
- [ ] **Plot dot positions:** Check after window resize — dots must stay on the correct location
- [ ] **Character delete:** Verify localStorage contains no logs referencing deleted character's name after deletion
- [ ] **Day decrement:** Verify logs for removed days are purged, not just hidden
- [ ] **Map delete:** Verify logs referencing deleted map ID are purged from state AND localStorage
- [ ] **Base64 save:** Test with three 1 MB+ images — must not silently fail
- [ ] **localStorage load:** Corrupt the stored JSON manually in DevTools, reload — must not crash
- [ ] **Schema migration:** Increment SCHEMA_VERSION, reload with old data — must reset cleanly
- [ ] **Time slider:** Programmatically change activeDay — slider must reflect updated value without stale display
- [ ] **Empty state:** Load app with no maps uploaded — must show "upload image" prompt, not crash on undefined map

---

## Recovery Strategies

| Pitfall                                 | Recovery Cost | Recovery Steps                                                                                                                    |
| --------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| QuotaExceededError causes state loss    | HIGH          | Detect on load (state missing or parse fails); prompt user to re-upload maps; preserve log/char data if image-only keys are split |
| Corrupted localStorage JSON             | LOW           | `try/catch` on parse → call `resetToDefault()` → show toast "Session data was corrupted and has been reset"                       |
| Orphaned log entries visible in UI      | MEDIUM        | Ship `sanitizeState` as a patch; it auto-cleans on next load                                                                      |
| Schema mismatch (version field missing) | LOW           | Version check returns false → wipe and reload defaults; user loses session data but app is stable                                 |
| Dot position drift after resize         | LOW           | Switch to CSS percentage positioning — no data loss, pure rendering fix                                                           |

---

## Pitfall-to-Phase Mapping

| Pitfall                                 | Prevention Phase                            | Verification                                                                         |
| --------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------ |
| localStorage quota exceeded             | Data persistence phase                      | Test with 3 images of combined size >4 MB; confirm error toast appears without crash |
| Click coordinate offset (letterbox)     | Plot functionality phase                    | Verify dot appears at click point across portrait/landscape/square images            |
| Dot position drift on resize            | Plot display phase                          | Resize window while dots are visible; confirm positions remain accurate              |
| Cascading delete orphans                | State management / data model phase         | Delete character → inspect localStorage logs array for orphaned entries              |
| Schema mismatch                         | Data persistence phase (before first merge) | Modify schema, reload with old localStorage — must not crash                         |
| Slider controlled/uncontrolled mismatch | Time control phase                          | Change activeDay programmatically; confirm slider position updates                   |

---

## Sources

- [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — HIGH confidence
- [MDN: Element.getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) — HIGH confidence
- [open-webui issue: base64 images freeze frontend via localStorage limits](https://github.com/open-webui/open-webui/issues/14874) — MEDIUM confidence (real-world case)
- [remotestorage.js: localStorage not suited for binary data](https://github.com/remotestorage/remotestorage.js/issues/144) — MEDIUM confidence
- [DEV: LocalStorage vs IndexedDB guide](https://dev.to/tene/localstorage-vs-indexeddb-javascript-guide-storage-limits-best-practices-fl5) — MEDIUM confidence
- [Medium: Stop using JSON.parse(localStorage.getItem()) without safety checks](https://medium.com/devmap/stop-using-json-parse-localstorage-getitem-without-this-check-94cd034e092e) — MEDIUM confidence
- [DEV: Zustand localStorage migration](https://dev.to/diballesteros/how-to-migrate-zustand-local-storage-store-to-a-new-version-njp) — MEDIUM confidence
- [React docs: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) — HIGH confidence (stale state / cascading update patterns)
- [Dexie.js: Don't index binary data in IndexedDB](https://medium.com/dexie-js/keep-storing-large-images-just-dont-index-the-binary-data-itself-10b9d9c5c5d7) — MEDIUM confidence

---

_Pitfalls research for: map-based coordinate plotting / localStorage-heavy web app (Plotted.)_
_Researched: 2026-03-22_
