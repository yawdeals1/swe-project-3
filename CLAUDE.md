# Carvo — Claude Code Instructions

Carvo is a three-tier vehicle rental management system built for CPEN 208 (Software Engineering), Project 3, University of Ghana. One company manages its own fleet, staff, and customer bookings through three role-specific dashboards: Customer, Staff, Admin.

**Source of truth for requirements:** `docs/Carvo_PRD.md`. Every functional/non-functional requirement has an ID (`FR-x.x`, `NFR-x`) — reference these IDs in commits, PRs, and code comments (only where the ID adds real context, not by default) instead of restating requirements from memory. If a requirement is ambiguous, resolve it against the PRD, not assumption.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind |
| Backend | Java Spring Boot, layered Controller → Service → Repository |
| Database | PostgreSQL, schema managed by Flyway |
| Auth | Deploro Auth-as-a-Service (email/password), roles kept in `app_user` |
| Deployment | Deploro VPS compute (see "Deployment" below) |

## Repo layout

```
swe-project-3/
├── CLAUDE.md, AGENTS.md, README.md
├── docs/Carvo_PRD.md
├── docker-compose.yml           # frontend + backend + postgres
├── backend/                     # Spring Boot, Maven
│   └── src/main/java/com/carvo/api/{config,controller,service,repository,entity,dto,security,exception}
│   └── src/main/resources/db/migration/   # Flyway V1__..., V2__...
└── frontend/                    # Next.js App Router
    ├── app/(public)|(customer)|(staff)|(admin)/
    ├── components/
    ├── lib/                     # typed API client, auth helpers
    └── public/icons/            # codex-generated graphics
```

## Graphics: no emoji, ever

Do not use emoji anywhere — not in UI copy, not in code, not in commit messages, not in documentation. They read as unprofessional for this project. Every icon, logo, illustration, or placeholder image the app needs is a real generated asset produced by shelling out to the `codex` CLI, then committed under `frontend/public/icons/` (or the appropriate `public/` subfolder). If a UI needs a visual marker where you'd default to an emoji, generate an icon asset instead — never substitute a Unicode character.

## Backend conventions

- **Layered architecture is mandatory** (NFR-7): Controller handles HTTP only, Service holds business logic, Repository is Spring Data JPA only. Don't collapse layers for convenience.
- **DTOs at the controller boundary.** Never serialize JPA entities directly in a response or bind them directly from a request body.
- **All schema changes go through Flyway migrations** in `backend/src/main/resources/db/migration/`. Never hand-edit the database or rely on Hibernate `ddl-auto` to shape schema.
- **Auth:** register/login proxy to Deploro's Auth-as-a-Service (`DeploroAuthClient`) instead of hashing passwords or minting tokens locally (NFR-2) — Deploro issues the opaque bearer token, and `DeploroAuthFilter` validates it against Deploro's session endpoint on every protected request. Deploro has no concept of Carvo's roles; `app_user.deploro_account_id` links a Deploro identity to its local row, and role checks still belong in Spring Security config / method security, not ad hoc `if` checks scattered through controllers. Every new identity (self-registered or Admin-created) is gated behind a Deploro-emailed confirmation link before first login — there is no bypass, including for seeded/admin-created accounts.
- **Validation:** every input is validated both client-side and server-side (FR-5.2); server errors return a consistent, human-readable shape (FR-5.3) via a global exception handler — never let a stack trace leak to the client, and never let bad input crash the server (NFR-5).
- **Double-booking prevention (FR-3.4):** enforce this at the database layer with a Postgres `EXCLUDE` constraint (`btree_gist`, on `vehicle_id` + the booking's date range), not only an application-level check before insert. This is called out explicitly in the PRD's risk table (Section 14) — a UI-only check is not sufficient.

## Frontend conventions

- Route groups per role under `app/`: `(public)`, `(customer)`, `(staff)`, `(admin)`.
- One typed API client in `lib/` — components call that, never `fetch` scattered ad hoc.
- Role-based route guards on the frontend must mirror backend RBAC (FR-1.6); the frontend guard is a UX convenience, the backend check is the actual security boundary.
- Every role lands on a role-specific dashboard immediately after login (FR-5.1).

## Phase discipline

The PRD phases requirements into MVP / V1 / V2 (Section 7) strictly by original SRS priority. Implement in that order. Do not start V1 or V2 work while any MVP requirement is incomplete — this mirrors the PRD's own risk mitigation (Section 14: "scope creep past MVP before core flow works"). MVP is done when the full booking-to-return cycle (search → book → pay → confirm → check-out → check-in) works end to end for all three roles.

## Local development

There is no bundled Postgres container — Carvo's database is Deploro's dedicated VPS Postgres (see Deployment below), not a service in `docker-compose.yml`. Point at it (or any Postgres you run yourself) via `DATABASE_URL_INTERNAL`:

```
export DATABASE_URL_INTERNAL="postgres://user:pass@host:port/db?sslmode=require"
cd backend && mvn spring-boot:run                              # backend on :8080
cd frontend && BACKEND_INTERNAL_URL=http://localhost:8080 npm run dev   # frontend on :3000
```

`DatabaseUrlEnvironmentPostProcessor` (`backend/src/main/java/com/carvo/api/config/`) translates that `postgres://` connection string into the `spring.datasource.*` properties Hikari/Flyway need — Deploro's own connection strings are never in JDBC form, so don't bypass this by hand-rolling a `jdbc:postgresql://` URL elsewhere.

Before considering a backend change done: `mvn test` passes. Before considering a frontend change done: `npm run lint` and `npm run build` pass, and the flow was actually clicked through in a browser — passing type checks is not the same as the feature working.

The first Admin account is seeded automatically on backend startup by `AdminSeeder` (`backend/src/main/java/com/carvo/api/config/`) — FR-1.7 blocks Staff/Admin creation any other way, so this is the deliberate bootstrap. Set `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`; without them it defaults to a well-known dev-only password and an undeliverable `admin@carvo.local` address, and logs a warning — never leave that default in a real deployment. **`ADMIN_SEED_EMAIL` must be a real inbox you control**, not just non-default: Deploro Auth-as-a-Service emails a confirmation link to every new identity, including this seeded one, and there is no way to sign in before it's clicked.

## Deployment

Carvo deploys via **Deploro VPS compute hosting**, not Cloudflare Workers/Pages. This is a deliberate choice, not a default: Spring Boot needs a real JDBC/TCP connection to Postgres and a long-running process, which Cloudflare Workers cannot provide. Concretely:

- Database: `deploro vps database create` (a dedicated Postgres container with a real connection string), **not** `deploro db create` (that provisions a REST-only studio-API database with no connection string — wrong choice for Spring Data JPA). This is a *separate* Postgres instance from anything in `docker-compose.yml` — the compose file has no `postgres` service, deliberately, because the VPS's shared port 5432 is already in use by the platform and duplicating it there breaks `docker compose up` on deploy (this happened once — don't reintroduce a `postgres:` service in the compose file).
- App: `deploro vps deploy`, which builds and runs `docker-compose.yml` at the repo root. The Next.js service is deliberately named `web` (not `frontend`) and the Spring Boot service `backend` — Deploro's port auto-detection prefers a service named `app`/`web`/`server`/`api`/`backend` (in that order) for the public `{slug}.deploro.app` route, so `web` wins and becomes the one public origin. The browser only ever talks to `web`; it proxies API calls server-side (Next.js Route Handlers) to `backend` over the internal docker network via `BACKEND_INTERNAL_URL`, so there's no CORS or cross-origin cookie/auth surface between the two.
- Prefer `DATABASE_URL_INTERNAL` (private VPS network, no allowlist needed) over the public `DATABASE_URL` for the backend's own runtime connection; the public URL is for external tooling only. Deploro auto-injects both into the compute stack's `.env`; `docker-compose.yml`'s `backend` service passes them through with bare `- DATABASE_URL_INTERNAL` / `- DATABASE_URL` entries (present only when set, so the app can tell "unset" from "empty" and fall back correctly) rather than `KEY: ${VAR}` interpolation.
- `deploro vps deploy` clones the linked GitHub repo; this CLI has no private-repo credential flag, so if clones start failing with a git auth error, check whether repo access needs to be reconnected (dashboard-level GitHub App/deploy-key integration, not something this CLI exposes) rather than assuming the repo must be public. Also note: **git on Windows does not preserve the executable bit**, so `backend/mvnw` can silently lose it on a Windows commit and break the Docker build (`Permission denied`, exit 126) on Deploro's Linux build host; the backend `Dockerfile` defensively `chmod +x`'s it, but if this ever regresses, `git update-index --chmod=+x backend/mvnw` fixes the index directly.
- The repo has branch protection requiring PRs into `main` — direct pushes to `main` will be rejected (`GH013`). Branch, push, open a PR, and merge it (or ask the user to) before expecting `deploro vps deploy` to pick up new commits.

If you're unfamiliar with the Deploro CLI, load the `deploro` skill before running any `deploro vps *` commands — the distinction between VPS compute and the Workers-only `deploy`/`db` commands is easy to get backwards and matters here.

## Full requirements and phased task list

See the approved build plan for the complete phase-by-phase task breakdown (data model, backend modules, frontend modules, icon pass, deployment, V1, V2) and the end-to-end verification approach for the MVP gate.
