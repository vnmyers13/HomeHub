# HomeHub Active Context

## Current Work Focus

Sprint 2 foundation work is complete. The focus is now on:
- Completing Sprint 2 implementation (T2.2-T2.4)
- Auth API endpoints (setup, login, PIN login, logout, me)
- Users API (CRUD operations, avatar upload)
- Frontend pages (SetupWizard, Login, ManageUsers, components)

## Recent Changes

- Sprint 2 auth models created (Family, User, Session)
- Alembic configuration updated for auth models
- Python 3.12 environment configured
- SECRET_KEY generated
- Configuration paths adjusted for local development
- Changes committed to GitHub (commit 7784a12)

## Next Steps

1. Read TODO.md to understand current priorities
2. Review sprint files (sprint_s1.json through sprint_s6.json) to understand completed work
3. Check CHANGELOG.md and FUTURE_ENHANCEMENTS.md for feature roadmap
4. Assess GETTING_STARTED.md for setup context
5. Determine if new sprint work or bug fixes are needed
6. Update progress.md with current status

## Active Decisions

- Using SQLite as primary database
- ICS feed subscriptions for external calendars
- PIN-based auth for family members, password for admins
- Wall display at 1920×1080 resolution
- Docker Compose for AMD64 Linux deployment
- Raspberry Pi kiosk mode support
- Workbox service worker for offline PWA capability

## Important Patterns

- Calendar events stored in SQLite with recurrence rule support
- ICS feed deduplication via unique event identifiers
- Conflict resolution: newer events overwrite older ones
- Role-based access control (family vs admin)
- Sync logging per ICS source

## Learnings

- Project uses MAJOR.MINOR versioning (no PATCH)
- MINOR increments by 1 each release
- Unreleased changes tracked in CHANGELOG.md
- Release checklist (Phase P2) bumps version and creates new changelog entry
