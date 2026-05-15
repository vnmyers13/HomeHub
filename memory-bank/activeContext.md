# HomeHub Active Context

## Current Work Focus

Sprint 2 is now complete! All authentication and user management features are implemented:
- ✅ Auth API endpoints (setup, login, PIN login, logout, me)
- ✅ Users API (CRUD operations, avatar upload)
- ✅ Frontend pages (SetupWizard, Login, ManageUsers)
- ✅ Frontend components (OfflineBanner, InstallPrompt)

## Recent Changes

- Completed Sprint 2 implementation (T2.1-T2.4)
- Created database migration for auth models
- Implemented all auth and users API endpoints
- Built SetupWizard with 3-step flow
- Built Login page with PIN pad and password options
- Built ManageUsers admin page
- Added OfflineBanner and InstallPrompt components
- Updated App.tsx with proper routing and auth flow

## Next Steps

1. Test Sprint 2 features end-to-end
2. Update CHANGELOG.md with Sprint 2 completion
3. Commit Sprint 2 changes to GitHub
4. Begin Sprint 3 (Calendar Core) when ready
5. Update progress.md with Sprint 2 completion

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
