# Carvo — Agent Instructions

This file governs coding agents (Codex CLI and others) operating in this repository. Carvo is a three-tier vehicle rental management system (Next.js frontend, Spring Boot backend, PostgreSQL) for a CPEN 208 course project. Full requirements live in `docs/Carvo_PRD.md`, referenced by ID (`FR-x.x`, `NFR-x`).

**Scope note:** this repository is Carvo's own application source. If you were invoked to generate an icon or image asset for Carvo, you are operating on *this* repo, not the separate Deploro platform repo — do not assume Deploro platform conventions, its git history, or its CLAUDE.md apply here. Any deployment for this project happens through `deploro vps deploy` acting on this repo's `docker-compose.yml` from the outside; nothing in this repo's own commands should invoke Deploro platform-repo operations.

## Repo map

```
swe-project-3/
├── docs/Carvo_PRD.md             # requirements, source of truth
├── docker-compose.yml
├── backend/                      # Spring Boot, Maven, Java
│   └── src/main/java/com/carvo/api/{config,controller,service,repository,entity,dto,security,exception}
│   └── src/main/resources/db/migration/   # Flyway migrations
└── frontend/                     # Next.js App Router, TypeScript, Tailwind
    ├── app/(public)|(customer)|(staff)|(admin)/
    ├── components/
    ├── lib/
    └── public/icons/             # generated graphics land here
```

## Commands to run before finishing any task

- Backend touched: `cd backend && mvn test` — must pass.
- Frontend touched: `cd frontend && npm run lint && npm run build` — both must pass.
- Any UI-visible change: confirm it renders/behaves as intended; a passing build is not sufficient evidence a feature works.

Do not report a task complete if any of the applicable commands above fail.

## Graphics rule — read this before generating any visual asset

No emoji anywhere in this project — UI, code, commit messages, docs. Every icon, logo, illustration, or placeholder image is a real generated asset, produced by this CLI (`codex`) and committed as a file under `frontend/public/` (icons in `frontend/public/icons/`). If a task calls for a visual marker, status indicator, or decorative image, generate an actual asset — never fall back to a Unicode emoji character or an ad hoc third-party icon font as a shortcut.

## Conventions to preserve

- Backend stays layered: Controller → Service → Repository. Don't put business logic in a controller or SQL-shaped logic in a service.
- DTOs at the API boundary; never return or bind JPA entities directly.
- All schema changes are Flyway migrations under `backend/src/main/resources/db/migration/` — never edit the database by hand.
- FR-3.4 (no overlapping confirmed bookings for a vehicle) is enforced at the database layer via a Postgres `EXCLUDE` constraint, not only application code.
- Frontend route groups are per role (`(public)`, `(customer)`, `(staff)`, `(admin)`); all API calls go through the shared client in `lib/`, not ad hoc `fetch`.
- Implement strictly in MVP → V1 → V2 order per `docs/Carvo_PRD.md` Section 7. Don't pull forward a V1/V2 item while MVP work is incomplete.

## Full requirements and phased task list

See the approved build plan for the full phase-by-phase task breakdown and the end-to-end MVP verification checklist.
