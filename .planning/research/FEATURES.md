# Feature Research

**Domain:** Murder mystery alibi management web app (マーダーミステリー向けアリバイ管理ツール)
**Researched:** 2026-03-22
**Confidence:** MEDIUM

---

## Context

This tool serves online murder mystery (マダミス) players using Discord + browser. Its core value is plotting character locations on maps over time so players can visually detect alibi contradictions. It is NOT a full virtual tabletop (like ユドナリウム or ココフォリア) — it is a focused single-purpose tool for tracking "who was where and when."

The primary existing tools in this space (ユドナリウム, ココフォリア) are general-purpose TRPG boards, not alibi-specific. This means players currently use spreadsheets or memory to track character positions over time — the gap this tool fills.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature                                | Why Expected                                                                                                                        | Complexity | Notes                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| Character management (add/edit/delete) | Every game tool has named actors. Without this, plots have no identity.                                                             | LOW        | Name + color assignment. Max 10 chars per name.                        |
| Color-coded character identity         | Visual disambiguation is essential when multiple characters share the same map. Standard in all TRPG/boardgame tools.               | LOW        | Each character gets a unique color dot on the map.                     |
| Map image upload                       | Players need to reference their game's actual floor plan / map. Generic grids do not match マダミス scenarios.                      | LOW        | Local file upload. Null state shows "upload prompt."                   |
| Click-to-place dot on map              | Core interaction. Users must be able to record a position in 1–2 clicks. Drag-and-drop or coordinate input is too slow mid-session. | LOW        | Store as relative x/y (0.0–1.0) ratio for resize safety.               |
| Time selector (coarse resolution)      | Alibis are time-bound. Without time context, a position plot is meaningless.                                                        | LOW        | 10-minute units (00:00–23:50) is sufficient for マダミス scenarios.    |
| Day management                         | Most マダミス scenarios span Day 1 to Day 7. Without days, users cannot separate plots from different in-game days.                 | LOW        | Increment/decrement buttons. Day reduction auto-deletes affected logs. |
| View all plots for active time         | Users need to see where everyone was at a specific time at a glance — this is the core "reading" experience.                        | MEDIUM     | Filter map dots by activeDay + currentTime.                            |
| Delete a plot entry                    | Misclicks happen. Users need correction.                                                                                            | LOW        | Click on existing dot to remove.                                       |
| Persistent local storage               | Session data must survive page refresh without a server. Online players open/close tabs frequently.                                 | LOW        | Auto-save to localStorage on every state change. Auto-restore on load. |
| Multi-map support                      | マダミス scenarios routinely have multiple locations (e.g., mansion floor 1, floor 2, garden).                                      | MEDIUM     | Up to 3 maps. 2-column parallel display for simultaneous comparison.   |
| Reset / clear all data                 | Players start new sessions. They need a clean slate.                                                                                | LOW        | One-button reset with confirmation.                                    |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature                       | Value Proposition                                                                                                                                                                                        | Complexity | Notes                                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 2-column parallel map display | Existing tools show one map at a time. Seeing Floor 1 and Floor 2 simultaneously lets players spot contradictions without switching views.                                                               | MEDIUM     | Key differentiator vs spreadsheets and general TRPG tools.                                                       |
| Relative coordinate storage   | Map plots remain accurate even when the browser window is resized or a different display is used. No other consumer-grade alibi tool does this correctly.                                                | LOW        | Store x/y as 0.0–1.0 fraction of rendered image dimensions.                                                      |
| Noir aesthetic                | Generic tools feel clinical. A пергамент-beige, classic noir design matches the detective fiction atmosphere of マダミス and increases immersion.                                                        | LOW        | Parchment beige background, antique gold borders, dark brown ink. Distinguishes from generic productivity tools. |
| Character-color dot overlays  | Multiple characters plotted on the same map at the same time. Existing approaches (spreadsheet, memory) cannot show spatial overlap. Colored dots make groupings and gaps instantly visible.             | MEDIUM     | On each map, render one dot per character who has a log for the active day + time.                               |
| Day-scoped timeline           | Separating plots by Day (not just time-of-day) matches how マダミス scenarios are structured (events happen across multiple in-game days). Generic timeline tools are continuous; this is day-segmented. | LOW        | Tabs or selector for activeDay.                                                                                  |
| No login / no backend         | Immediate use. No account creation friction. Works offline once loaded. Players in Discord sessions do not want to pause to register.                                                                    | LOW        | localStorage-only. Deploy as static site on Cloudflare Pages.                                                    |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature                           | Why Requested                                                               | Why Problematic                                                                                                                                                                                                                                                       | Alternative                                                                         |
| --------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Automatic contradiction detection | Sounds like the killer feature. Would save users from manual checking.      | Requires formalizing what counts as a "contradiction" (simultaneous presence in two locations, etc.). Adds significant logic complexity, is brittle, and removes the deductive pleasure that is core to マダミス gameplay. The PROJECT.md explicitly scopes this out. | Keep plots visual. Let users see contradictions themselves — that IS the game.      |
| Real-time multiplayer sync        | Players want to share boards across Discord sessions without screensharing. | Requires WebSocket infrastructure, auth, conflict resolution. Violates "static site, no backend" constraint. Adds deploy/ops complexity that kills simplicity.                                                                                                        | Screenshot or screen share the app. Export-to-image feature (v2 consideration).     |
| Mobile-optimized UI               | Players want to use phones during sessions.                                 | Plotting precise positions on a small touchscreen is inaccurate. The multi-map 2-column layout breaks on narrow screens. Desktops/laptops dominate Discord session setups.                                                                                            | Desktop-first design. Ensure basic mobile readability without breaking layout.      |
| Clue / evidence tracking          | GMs want a full session management tool.                                    | Scope creep into ユドナリウム / ココフォリア territory. Those tools already exist and do it better. Plotted's value is focused alibi visualization, not becoming another general TRPG platform.                                                                       | Direct users to ユドナリウム/ココフォリア for clue management.                      |
| OAuth / user accounts             | Personalization, saving multiple scenarios to cloud.                        | No backend is a feature. Adding auth introduces security surface, complexity, and friction. The app is for personal/session use, not persistent multi-user accounts.                                                                                                  | Use localStorage with manual import/export if needed in v2.                         |
| Undo / redo history               | Accidental deletions are annoying.                                          | Full undo stack requires significant state management complexity (or a library dependency). The delete-by-click pattern is already reversible (just re-plot).                                                                                                         | Keep state minimal. Re-clicking to restore a deleted dot is acceptable friction.    |
| Dice rolling, card mechanics      | TRPG GMs want one tool for everything.                                      | Completely outside the alibi tracking domain. Dilutes the product identity.                                                                                                                                                                                           | ユドナリウム and ココフォリア exist for this purpose.                               |
| PDF / print export                | Document the session for post-game review.                                  | Complex rendering. jsPDF or html2canvas have layout edge cases with custom images. Adds significant engineering with low session-time value.                                                                                                                          | Browser print / screenshot is sufficient for v1. Consider in v2 if users demand it. |

---

## Feature Dependencies

```
[Character Management]
└── requires --> (nothing — first to build)

[Map Management]
└── requires --> (nothing — independent of characters)

[Plot (Position Recording)]
├── requires --> [Character Management]  (need activeChar to assign dot)
├── requires --> [Map Management]        (need a map to click on)
├── requires --> [Time Selector]         (need currentTime for log entry)
└── requires --> [Day Management]        (need activeDay for log entry)

[Dot Rendering on Map]
├── requires --> [Plot]                  (need log data)
├── requires --> [Character Management] (need color per character)
└── requires --> [Map Management]       (need map image dimensions)

[localStorage Persistence]
├── requires --> [Character Management] (to serialize chars)
├── requires --> [Map Management]       (to serialize maps + images)
├── requires --> [Plot]                 (to serialize logs)
└── requires --> [Day Management]       (to serialize days/activeDay)

[Day Management]
└── enhances --> [Plot]                  (scopes which logs are visible/deletable)

[Multi-map Parallel Display]
└── requires --> [Map Management]        (need multiple maps loaded)
└── enhances --> [Dot Rendering]         (shows multiple maps side by side simultaneously)

[Reset]
└── requires --> [localStorage Persistence]  (needs to clear persisted state)
```

### Dependency Notes

- **Plot requires all four context providers:** A log entry is only meaningful when a character, a map, a day, and a time are all defined. These four must all be built before plotting is functional.
- **Dot Rendering requires Plot:** The map display is the read path; Plot is the write path. Both must exist for the core loop to work.
- **Day Management + Plot conflict resolution:** When days are decremented, all logs for the removed day(s) must be deleted. This cascade is a write-side concern in Day Management, not in Plot.
- **Map deletion cascade:** When a map is removed, all logs referencing that map ID must be deleted. This is a write-side concern in Map Management.
- **Multi-map parallel display enhances Dot Rendering:** It does not require new data structures — it is a layout/rendering concern on top of existing map + log data.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Character management (add/delete, name + color) — core identity layer; nothing else works without it
- [ ] Day management (Day 1–7, increment/decrement, cascade delete) — session scope; required for meaningful logs
- [ ] Time selector (10-minute slider 00:00–23:50 + fine-adjust buttons) — temporal context for all plots
- [ ] Map management (upload up to 3 images, 2-column display, delete with cascade) — spatial context for all plots
- [ ] Click-to-place plot (dot on map click, stored as x/y ratio, click to delete) — the core write interaction
- [ ] Dot rendering on map (filter by activeDay + currentTime, color per character) — the core read interaction
- [ ] localStorage auto-save/restore + reset button — data survival across tab refreshes
- [ ] Classic noir design theme — immersion matters for this audience; visual quality is a functional concern

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Character filter toggle — hide/show specific characters' dots when map gets crowded; add when users report visual overload with 4+ characters
- [ ] Time scrubbing playback — step through time with forward/back buttons to animate character movements; add when users want to reconstruct movement sequences
- [ ] Map name labels — display map names clearly in the UI so multiple maps are identifiable; simple addition that improves navigation

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] JSON export / import — allow users to save and reload sessions across devices; defer because localStorage is sufficient for single-session use and adding file I/O adds complexity
- [ ] Screenshot / image export — capture current map state as PNG for sharing in Discord; defer because screen sharing is an acceptable workaround and html2canvas has layout edge cases
- [ ] Keyboard shortcuts — faster time navigation, character switching; defer until power users emerge
- [ ] Scenario templates — pre-configured day/character setups for known マダミス titles; requires community knowledge and ongoing maintenance

---

## Feature Prioritization Matrix

| Feature                                  | User Value | Implementation Cost | Priority |
| ---------------------------------------- | ---------- | ------------------- | -------- |
| Character management                     | HIGH       | LOW                 | P1       |
| Day management                           | HIGH       | LOW                 | P1       |
| Time selector                            | HIGH       | LOW                 | P1       |
| Map management (upload, display, delete) | HIGH       | MEDIUM              | P1       |
| Click-to-place plot + dot rendering      | HIGH       | MEDIUM              | P1       |
| localStorage persistence                 | HIGH       | LOW                 | P1       |
| Noir design theme                        | MEDIUM     | LOW                 | P1       |
| 2-column parallel map display            | HIGH       | LOW                 | P1       |
| Delete existing plot (click dot)         | HIGH       | LOW                 | P1       |
| Reset all data                           | MEDIUM     | LOW                 | P1       |
| Character filter toggle                  | MEDIUM     | LOW                 | P2       |
| Time scrubbing playback                  | MEDIUM     | MEDIUM              | P2       |
| Map name labels                          | LOW        | LOW                 | P2       |
| JSON export / import                     | MEDIUM     | MEDIUM              | P3       |
| Screenshot export                        | LOW        | HIGH                | P3       |
| Keyboard shortcuts                       | LOW        | MEDIUM              | P3       |

**Priority key:**

- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature                      | ユドナリウム / ココフォリア                    | Spreadsheet (manual)      | Plotted (our approach)                   |
| ---------------------------- | ---------------------------------------------- | ------------------------- | ---------------------------------------- |
| Map image display            | Yes — general TRPG boards with token placement | No                        | Yes — upload per-scenario images         |
| Character position over time | No — real-time only, no time dimension         | Manual rows per time slot | Yes — time+day indexed logs              |
| Color-coded character dots   | Tokens (avatar images, not dots)               | Color cells manually      | Yes — automatic per-character color dots |
| Alibi-specific UX            | No — general purpose                           | No                        | Yes — designed for alibi reading         |
| Multi-map parallel view      | No — single board                              | N/A                       | Yes — up to 3 maps, 2-column             |
| No-install, browser-based    | ユドナリウム: yes / ココフォリア: yes          | N/A                       | Yes                                      |
| Offline / no-login           | Partial (server-dependent)                     | Yes (local file)          | Yes — static site + localStorage         |
| Session persistence          | Room-based (ephemeral)                         | Manual save               | Auto localStorage                        |
| Contradiction detection      | No                                             | Manual                    | Manual (by design — users read plots)    |

---

## Sources

- Project context: `.planning/PROJECT.md` (Plotted alibi management app — active requirements and constraints)
- ユドナリウム usage guide: https://trpg-japan.com/knowledge/how-to-use-udonarium/ — MEDIUM confidence (WebSearch, Japanese community)
- ココフォリア usage guide: https://wakaba-penguin.com/tool-guide-ccfolia/ — MEDIUM confidence (WebSearch, Japanese community)
- Online マダミス tool overview: https://note.com/nissy_mmg/n/n1061018cf0db — MEDIUM confidence (WebSearch, practitioner blog)
- GM alibi management guidance: https://www.roleplayingtips.com/adventure-building-campaigns/how-to-create-a-murder-mystery/ — MEDIUM confidence (WebSearch, TRPG community)
- Virtual tabletop feature comparison 2025: https://nurlttrpg.com/blog/digital-tabletop-gaming-tools — LOW confidence (WebSearch only)
- World Anvil campaign manager features: https://www.worldanvil.com/features/dnd-campaign-manager — MEDIUM confidence (official product page)
- Timeline visualization tools (Aeon Timeline, KronoGraph): https://www.aeontimeline.com/ — MEDIUM confidence (official product)
- Anti-feature rationale for real-time sync and auto-contradiction detection: inferred from PROJECT.md Out of Scope + community tool analysis

---

_Feature research for: Murder mystery alibi management web app (マーダーミステリー向けアリバイ管理ツール)_
_Researched: 2026-03-22_
