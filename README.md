# Carvo

Vehicle rental management system for CPEN 208 (Software Engineering), Project 3 — University of Ghana. Three roles (Customer, Staff, Admin), one shared fleet, backed by a Spring Boot REST API and PostgreSQL, with a Next.js frontend.

Full requirements: [`docs/Carvo_PRD.md`](docs/Carvo_PRD.md). Agent/contributor conventions: [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md).

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind — `frontend/`
- **Backend:** Java Spring Boot, layered Controller → Service → Repository — `backend/`
- **Database:** PostgreSQL (Deploro-hosted VPS Postgres — see `CLAUDE.md`), schema managed by Flyway
- **Auth:** JWT bearer tokens, BCrypt password hashing
- **Deployment:** Deploro VPS compute hosting (see `CLAUDE.md`)

## Local development

Requires Java 21, Node 22+, and a reachable Postgres instance (the project's Deploro-hosted one, or your own).

```bash
export DATABASE_URL_INTERNAL="postgres://user:pass@host:port/db?sslmode=require"
cd backend && ./mvnw spring-boot:run   # API on :8080
cd frontend && BACKEND_INTERNAL_URL=http://localhost:8080 npm run dev   # web app on :3000
```

Or with Docker (requires the same `DATABASE_URL_INTERNAL` exported first, since there is no bundled Postgres container in `docker-compose.yml` — see the comment at its top for why):

```bash
docker compose up --build
```

The first Admin account is seeded automatically on backend startup — see `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` in `CLAUDE.md`.

## Status

MVP implemented and deployed — see the build plan for the phased task list (V1/V2 remain).
