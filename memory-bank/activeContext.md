# HomeHub Active Context

## Current Work Focus

The initial Memory Bank initialization is complete. The focus is now on:
- Understanding existing project files and structure
- Reviewing TODO.md, CHANGELOG.md, and sprint files
- Identifying current development state
- Planning next implementation steps

## Recent Changes

- Memory Bank created with 6 core files
- Project brief and product context documents written
- Ready to assess current sprint status and backlog

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
