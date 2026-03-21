# Roadmap: Plotted.

## Overview

Plotted. delivers a focused alibi-tracking tool for online murder mystery players. Starting from a brownfield codebase with dead Convex/Clerk code, the build proceeds in three phases: first establishing clean foundations (cleanup, state model, persistence, theme), then building all session-context controls (characters, days, time, reset), and finally assembling the core map-and-plot interaction that is the app's entire reason to exist.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Clean the codebase, establish state model, persistence layer, and noir design theme (completed 2026-03-21)
- [ ] **Phase 2: Controls** - Build all session-context controls: characters, day/time management, and data reset
- [ ] **Phase 3: Maps and Plotting** - Build map management and the core click-to-plot interaction

## Phase Details

### Phase 1: Foundation

**Goal**: The app compiles and runs cleanly with a correct state model, auto-persistent storage, and noir visual theme ready to apply
**Depends on**: Nothing (first phase)
**Requirements**: SETUP-01, SETUP-02, SETUP-03, SETUP-04
**Success Criteria** (what must be TRUE):

1. The app builds and runs without any Convex, Clerk, or Todo-related errors or references
2. State persists across full page reloads — data entered before refresh is present after refresh
3. The noir color palette (parchment beige, antique gold, dark brown) is visible as CSS variables throughout the app
4. Reloading with corrupted or schema-mismatched localStorage does not crash the app

**Plans**: 2 plans

Plans:

- [x] 01-01-PLAN.md — Cleanup + noir theme: remove Convex/Clerk/Todo/wouter/next-themes, apply noir CSS variables and shadcn mapping
- [x] 01-02-PLAN.md — State + persistence: useReducer state model with localStorage auto-save/restore and IndexedDB image storage

### Phase 2: Controls

**Goal**: Users can configure the full session context — who is being tracked (characters), when (day and time), and can reset all data
**Depends on**: Phase 1
**Requirements**: CHAR-01, CHAR-02, CHAR-03, TIME-01, TIME-02, TIME-03, TIME-04, DATA-01
**Success Criteria** (what must be TRUE):

1. User can add a character with a name (up to 10 characters) and a color, and it appears in the roster
2. User can click a character chip to make it the active character
3. Deleting a character removes it and all its associated plot data
4. User can increment and decrement the active Day count (Day 1-7), and reducing days auto-deletes logs from removed days
5. User can drag the time slider to any 10-minute increment between 00:00 and 23:50, and use fine-adjust buttons for ±5m/±10m steps
6. User can reset all data via a confirmation dialog

**Plans**: 2 plans

Plans:

- [ ] 02-01-PLAN.md — Reducer extension + time utility: TDD for all 8 action types and timeIndexToLabel utility
- [ ] 02-02-PLAN.md — Controls UI: character chips/roster/add-form, day tabs, time slider, fine-adjust buttons, collapsible toolbar, reset dialog

### Phase 3: Maps and Plotting

**Goal**: Users can load map images, click to record character positions, see all dots for the current day/time, and delete individual plots — completing the full alibi-tracking loop
**Depends on**: Phase 2
**Requirements**: MAP-01, MAP-02, MAP-03, PLOT-01, PLOT-02, PLOT-03
**Success Criteria** (what must be TRUE):

1. User can add up to 3 maps by uploading local image files; maps display side-by-side in a 2-column layout
2. Deleting a map removes it and all associated plot data
3. An unloaded map slot shows "画像をアップロードしてください" placeholder text
4. With an active character, day, and time selected, clicking on a map records a colored dot at that position
5. All dots for the current day and time are visible on their respective maps, color-coded by character
6. Clicking an existing dot (with hover delete indicator) removes it immediately

**Plans**: TBD

Plans:

- [ ] 03-01: Map management (add, delete with cascade, 2-column layout, image upload and placeholder)
- [ ] 03-02: Click-to-plot and dot rendering (coordinate normalization, SVG overlay, click-to-delete)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase           | Plans Complete | Status      | Completed  |
| --------------- | -------------- | ----------- | ---------- |
| 1. Foundation   | 2/2            | Complete    | 2026-03-21 |
| 2. Controls     | 0/2            | Not started | -          |
| 3. Maps + Plots | 0/2            | Not started | -          |
