# Technology Stack

**Analysis Date:** 2026-03-22

## Languages

**Primary:**

- TypeScript 5.9.3 - All source code, configuration, and build scripts
- JavaScript/JSX - React components, webpack/vite configuration
- HTML - Template and static content

**Secondary:**

- CSS - Styling through Tailwind CSS (v4.2.2)
- JSON/JSONC - Configuration files (wrangler.jsonc, tsconfig.json)

## Runtime

**Environment:**

- Node.js (implied by package.json type "module")
- Bun - Package manager and task runner (configured in CLAUDE.md and package.json scripts)

**Package Manager:**

- Bun
- Lockfile: `bun.lock` (present)

## Frameworks

**Core:**

- React 19.2.4 - UI framework
- Vite 8.0.1 - Build tool and development server
- React DOM 19.2.4 - React rendering library

**Routing & State:**

- Wouter 3.9.0 - Client-side routing
- Convex 1.34.0 - Backend API and database

**Styling:**

- Tailwind CSS 4.2.2 - Utility-first CSS framework
- @tailwindcss/vite 4.2.2 - Vite plugin for Tailwind CSS
- Next-themes 0.4.6 - Theme management

**UI & Components:**

- @base-ui/react 1.3.0 - Headless UI components
- shadcn 4.1.0 - Component template system
- Lucide-react 0.577.0 - Icon library
- class-variance-authority 0.7.1 - CSS class composition
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.5.0 - Merge Tailwind classes intelligently

**Validation & Parsing:**

- Valibot 1.3.1 - Data validation library
- ts-pattern 5.9.0 - Pattern matching for TypeScript

**Error Handling:**

- react-error-boundary 6.1.1 - React error boundary wrapper

**Icons & Fonts:**

- @fontsource-variable/noto-sans 5.2.10 - Variable font loading

## Testing

**Test Framework:**

- Vitest 4.1.0 - Unit and browser test runner
- @vitest/browser-playwright 4.1.0 - Browser testing adapter
- @vitest/ui 4.1.0 - Vitest UI dashboard
- vitest-browser-react 2.1.0 - React testing utilities

**E2E Testing:**

- Playwright 1.58.2 - E2E test framework
- @playwright/test 1.58.2 - Playwright testing library

**Testing Utilities:**

- @clerk/testing 2.0.6 - Clerk authentication testing utilities

## Build & Dev Tools

**Development:**

- @vitejs/plugin-react 6.0.1 - React Fast Refresh plugin for Vite
- @cloudflare/vite-plugin 1.30.0 - Cloudflare Workers integration
- Wrangler 4.76.0 - Cloudflare Workers CLI and bundler

**Linting & Formatting:**

- Oxlint 1.56.0 - Fast linter with type-aware features
- oxlint-tsgolint 0.17.1 - TypeScript-specific linting
- Oxfmt 0.41.0 - Code formatter

**Git Hooks:**

- Lefthook 2.1.4 - Git hooks manager

**Type Checking:**

- TypeScript 5.9.3 - Type checking compiler
- @types/react 19.2.14 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions
- @types/node 25.5.0 - Node.js type definitions
- @typescript/native-preview 7.0.0-dev.20260321.1 - Advanced TypeScript features

**Environment Variables:**

- @dotenvx/dotenvx 1.57.0 - Environment variable management with encryption support

## Key Dependencies

**Critical:**

- Convex 1.34.0 - Backend database, API, and real-time synchronization. Core to data persistence and server logic.
- React 19.2.4 - Modern React with latest features
- TypeScript 5.9.3 - Type safety across entire codebase

**Infrastructure:**

- Wrangler 4.76.0 - Deploy to Cloudflare Workers as edge function
- Vite 8.0.1 - Fast development server and optimized production builds
- @dotenvx/dotenvx 1.57.0 - Secure environment configuration management

**Authentication:**

- @clerk/react 6.1.2 - Clerk authentication provider
- Convex integration with Clerk for JWT validation

## Configuration

**Environment:**

- `.env.dev` - Development environment variables
- `.env.prod` - Production environment variables
- `.env.example` - Environment variable template (reference only)
- Configured via @dotenvx/dotenvx in npm scripts (`dotenvx run -f .env.dev --`)

**Build:**

- `vite.config.ts` - Vite configuration with React, Cloudflare, and Tailwind plugins
- `tsconfig.json` - TypeScript compiler configuration (references tsconfig.app.json)
- `wrangler.jsonc` - Cloudflare Workers configuration with observability enabled
- `playwright.config.ts` - E2E test configuration with Chromium browser

**Linting/Formatting:**

- Oxlint configuration included (uses --type-aware flag for strict checks)
- Oxfmt for code formatting

## Platform Requirements

**Development:**

- Bun runtime for package management and script execution
- Node.js compatible environment
- Port 5173 for Vite dev server
- Browser with WebSocket support (for Vite HMR)

**Production:**

- Cloudflare Workers - Edge function deployment
- Convex backend (API and database)
- Clerk authentication backend

**Deployment:**

- Wrangler CLI for Cloudflare Workers deployment
- Assets served from `./dist/client` directory
- Single-page application (SPA) routing enabled on 404

---

_Stack analysis: 2026-03-22_
