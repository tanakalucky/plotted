# External Integrations

**Analysis Date:** 2026-03-22

## APIs & External Services

**Authentication & Backend:**

- Clerk - User authentication and identity management
  - SDK/Client: `@clerk/react` (6.1.2)
  - PublishableKey env var: `VITE_CLERK_PUBLISHABLE_KEY`
  - Configuration: `src/app/index.tsx` initializes ClerkProvider with publishable key
  - JWT issuer domain: `CLERK_JWT_ISSUER_DOMAIN` (server-side, configured in Convex)

- Convex - Backend API, real-time database, and serverless functions
  - SDK/Client: `convex` (1.34.0), `@clerk/react` integration
  - URL env var: `VITE_CONVEX_URL`
  - Configuration: `src/app/index.tsx` initializes ConvexReactClient
  - Integration: `ConvexProviderWithClerk` from `convex/react-clerk` handles Clerk authentication with Convex

## Data Storage

**Databases:**

- Convex (Backend Database)
  - Type: Real-time database (serverless)
  - Connection: `VITE_CONVEX_URL` environment variable
  - Client: Convex React client
  - Schema: `src/shared/api/convex/schema.ts` - Defines `todos` table with userId and content fields
  - Queries & Mutations: `src/shared/api/convex/todos.ts`
    - Queries: `getTodos`, `getTodo`
    - Mutations: `addTodo`, `deleteTodo`, `updateTodo`
  - Authentication: Clerk JWT validation via `src/shared/api/convex/auth.config.ts`
  - Index: `by_user` index on todos table for efficient user-scoped queries

**File Storage:**

- Not detected - No file upload/storage integration configured

**Caching:**

- Not detected - No explicit caching service (relies on Convex real-time synchronization)

## Authentication & Identity

**Auth Provider:**

- Clerk
  - Implementation: OAuth and multi-factor authentication provider
  - SDK: `@clerk/react` (6.1.2)
  - Clerk Provider Config: `src/app/index.tsx`
    - Initialized with `VITE_CLERK_PUBLISHABLE_KEY`
  - Sign-in UI: `src/app/routes/routes.tsx` - Uses Clerk's SignIn component
  - User Context: `useAuth` hook from `@clerk/react` throughout application
  - Clerk Testing: `@clerk/testing` (2.0.6) for E2E test authentication
  - E2E Credentials: `E2E_CLERK_USER_USERNAME`, `E2E_CLERK_USER_PASSWORD` environment variables

**JWT Integration:**

- Server-side: `src/shared/api/convex/auth.config.ts` configures JWT validation from Clerk
  - Issuer domain: `CLERK_JWT_ISSUER_DOMAIN`
  - Application ID: `"convex"`

## Monitoring & Observability

**Error Tracking:**

- Not explicitly configured - Error boundary present at `src/app/providers/ErrorBoundary/ErrorBoundary.tsx`

**Logs:**

- Cloudflare Workers observability: Enabled in `wrangler.jsonc` with `"observability": { "enabled": true }`
- Source maps: Uploaded to Cloudflare with `"upload_source_maps": true`

**Observability:**

- Cloudflare Workers provides runtime monitoring and logging for edge functions

## CI/CD & Deployment

**Hosting:**

- Cloudflare Workers - Edge function platform for the application
- Deployment configuration: `wrangler.jsonc`
  - Compatibility date: 2025-04-01
  - Node.js compatibility enabled: `nodejs_compat` flag
  - Workers Dev enabled for preview

**Asset Serving:**

- Client assets: `./dist/client` directory served by Cloudflare Workers
- Single-page application (SPA) routing: 404 responses redirected to index.html

**CI Pipeline:**

- Not detected in codebase (Playwright config supports CI via `process.env.CI`)

**Build & Deploy Commands:**

- `bun run build` - Vite build for production
- `bun run check` - Type check, build, and dry-run Cloudflare deployment
- `wrangler deploy` - Deploy to Cloudflare Workers
- `wrangler deploy --dry-run` - Validate deployment without publishing

## Environment Configuration

**Required env vars:**

- `VITE_CONVEX_URL` - Convex backend URL (client-side)
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (client-side)
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer domain (server-side, Convex config)

**Optional env vars:**

- `E2E_CLERK_USER_USERNAME` - Test account username for E2E tests
- `E2E_CLERK_USER_PASSWORD` - Test account password for E2E tests
- `CI` - Set to true in CI environments (enables Playwright retries and CI-specific behavior)

**Secrets location:**

- Environment files: `.env.dev`, `.env.prod`
- Secrets management: Wrangler secrets (configured via `wrangler secret put`)
- Example template: `.env.example`

**Environment file loading:**

- Development: `dotenvx run -f .env.dev -- [command]`
- Production: `dotenvx run -f .env.prod -- [command]`
- Via @dotenvx/dotenvx (1.57.0) - Supports encryption and .env management

## Webhooks & Callbacks

**Incoming:**

- Clerk webhooks: Not explicitly configured in codebase (Convex handles Clerk JWT validation server-side)

**Outgoing:**

- Not detected - No outbound webhooks configured

## API Patterns

**Convex API Usage:**

- Query pattern: `useQuery` hook from Convex React library
  - Example: `src/features/todo/lib/use-todo-query.ts` - Fetches todos via `getTodos` query
- Mutation pattern: `useMutation` hook from Convex React library
  - Example: `src/features/todo/lib/use-todo-mutation.ts` - Creates/updates/deletes todos
- API Export: `src/shared/api/index.ts` exports `convexApi` for type-safe access to Convex functions

**Authentication Flow:**

1. Clerk authentication on frontend
2. Clerk provides JWT to Convex
3. Convex validates JWT using CLERK_JWT_ISSUER_DOMAIN
4. Authenticated user context available in Convex functions via `ctx.auth.getUserIdentity()`

---

_Integration audit: 2026-03-22_
