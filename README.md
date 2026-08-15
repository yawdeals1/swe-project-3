# Carvo

Vehicle rental management system for CPEN 208 (Software Engineering), Project 3 — University of Ghana. Three roles (Customer, Staff, Admin), one shared fleet, backed by a Spring Boot REST API and PostgreSQL, with a Next.js frontend.

Full requirements: [`docs/Carvo_PRD.md`](docs/Carvo_PRD.md). Agent/contributor conventions: [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md).

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind — `frontend/`
- **Backend:** Java Spring Boot, layered Controller → Service → Repository — `backend/`
- **Database:** PostgreSQL, schema managed by Flyway
- **Auth:** JWT bearer tokens, BCrypt password hashing
- **Deployment:** Deploro VPS compute hosting (see `CLAUDE.md`)

## Local development

Requires Docker, Java 21, Node 22+.

```bash
docker compose up -d postgres      # local Postgres on :5432
cd backend && ./mvnw spring-boot:run   # API on :8080
cd frontend && npm run dev             # web app on :3000
```

Or run the full stack the same way it deploys:

```bash
docker compose up --build
```

## Status

Scaffolding stage — see the build plan for the phased task list (data model, MVP backend/frontend, branding pass, deployment, V1, V2).
