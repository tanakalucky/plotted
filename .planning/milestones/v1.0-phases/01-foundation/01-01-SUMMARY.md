---
phase: 01-foundation
plan: 01
subsystem: ui
tags: [react, tailwindcss, shadcn, css-variables, oklch, feature-sliced-design]

# Dependency graph
requires: []
provides:
  - Minimal PlottedApp entry point with ErrorBoundary
  - Noir theme CSS variables mapped to shadcn contract
  - Semantic Tailwind tokens (bg-bg, text-ink-dark, etc.)
  - Clean codebase without Convex/Clerk/Todo/wouter/next-themes
affects: [02-core-state, 03-map-plots]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "OKLCH color values for all theme tokens"
    - "shadcn CSS variable bridge pattern (--color-X: var(--X))"
    - "Semantic noir token layer on top of shadcn contract"

key-files:
  created:
    - src/pages/home/ui/PlottedApp.tsx
  modified:
    - src/app/index.tsx
    - src/app/styles/index.css
    - src/pages/home/index.ts
    - package.json
    - vite.config.ts
    - playwright.config.ts

key-decisions:
  - "Removed Convex/Clerk entirely — localStorage-only app needs no backend"
  - "Removed wouter — single-page app with no routing needed"
  - "Removed next-themes — single light theme only (noir palette)"
  - "System font (system-ui) instead of Noto Sans — simpler, faster"
  - "OKLCH for all color values — perceptually uniform, modern CSS"

patterns-established:
  - "PlottedApp: minimal root component rendered directly from ErrorBoundary"
  - "CSS: shadcn bridge pattern maps --background etc. to --color-background for Tailwind"
  - "CSS: semantic tokens (--color-ink-dark, --color-bg) layered on top of shadcn vars"

requirements-completed: [SETUP-01, SETUP-04]

# Metrics
duration: 15min
completed: 2026-03-22
---

# Phase 01 Plan 01: Codebase Cleanup and Noir Theme Summary

**Removed all Convex/Clerk/Todo dead code and applied classic noir palette via OKLCH CSS variables mapped to shadcn's token contract**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-22T00:00:00Z
- **Completed:** 2026-03-22T00:15:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Deleted all Convex, Clerk, Todo, wouter, next-themes code and tests (32 files changed)
- Rewrote entry point as minimal PlottedApp with ErrorBoundary, no external providers
- Applied noir palette (parchment beige #F5F0E8 background, dark brown #2C2416 text) via OKLCH CSS variables
- Mapped all shadcn CSS variable contract entries to noir palette values
- Added semantic tokens (bg-bg, text-ink-dark, text-ink-muted) as Tailwind utility aliases
- Build passes cleanly: typecheck and vite build both exit 0

## Task Commits

Each task was committed atomically:

1. **Task 1: Convex/Clerk/Todo/wouter/next-themes削除とエントリーポイント再構築** - `562bdf4` (feat)
2. **Task 2: ノワールテーマのCSS変数定義とshadcn変数マッピング** - `7e0cef1` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `src/app/index.tsx` - Minimal entry: StrictMode > ErrorBoundary > PlottedApp (no Clerk/Convex)
- `src/pages/home/ui/PlottedApp.tsx` - New: minimal page with "Plotted." title
- `src/pages/home/index.ts` - Updated barrel to export PlottedApp
- `src/app/styles/index.css` - Noir theme CSS variables replacing default light theme
- `package.json` - Removed 5 dependencies, 4 devDependencies, updated scripts and metadata
- `vite.config.ts` - Removed cloudflare() plugin
- `playwright.config.ts` - Removed Clerk auth globalSetup reference
- `bun.lock` - Updated after dependency removal

## Decisions Made

- Used system-ui font stack instead of Noto Sans to avoid the @fontsource dependency
- Kept OKLCH color space throughout for consistency and modern CSS support
- No dark mode support — single noir light theme only (design decision D-11)
- Removed wrangler/Cloudflare Workers plugin — deploying as static site to Cloudflare Pages only

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Clean, buildable foundation established
- Noir theme applied globally via CSS variables
- shadcn components will automatically use noir colors
- Ready for Plan 02: core state management with useReducer

## Self-Check: PASSED

- FOUND: src/pages/home/ui/PlottedApp.tsx
- FOUND: src/app/index.tsx
- FOUND: src/app/styles/index.css
- FOUND: .planning/phases/01-foundation/01-01-SUMMARY.md
- FOUND: commit 562bdf4 (feat: remove Convex/Clerk/Todo)
- FOUND: commit 7e0cef1 (feat: noir theme CSS variables)

---

_Phase: 01-foundation_
_Completed: 2026-03-22_
