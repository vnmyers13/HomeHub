# Changelog

All notable changes to HomeHub are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Version numbers follow `MAJOR.MINOR` format. MINOR increments by 1 each release.

---

## [Unreleased]

### Added
- Sprint 2 foundation: Auth models (Family, User, Session)
- Python 3.12 development environment support
- Alembic configuration for auth models

### Changed
- Updated configuration paths for local development
- Fixed model imports for Sprint 2 compatibility

### In Progress
- Sprint 2: Authentication & User Management (T2.2-T2.4 pending)
  - Auth API endpoints (setup, login, PIN login, logout, me)
  - Users API (CRUD operations, avatar upload)
  - Frontend pages (SetupWizard, Login, ManageUsers, components)

---

## [0.1.0] - 2026-05-07

### Added
- Initial MVP: shared family calendar with ICS feed subscriptions
- Internal calendar: create/edit/delete events with recurrence support
- Family member profiles: role-based access, PIN and password login
- Google Calendar and Apple iCloud import via ICS URL feeds
- Wall display at /wall: full-screen 7-day calendar strip at 1920×1080
- PWA support: installable on Android and iOS
- Offline read capability via Workbox service worker
- Admin calendar settings: add/remove ICS feeds, per-source sync interval
- Sync log: view last sync time, events imported, and errors per source
- Docker Compose deployment on AMD64 Linux
- Raspberry Pi kiosk boot script for wall display
- Daily automated SQLite backup
- Sprint 1 infrastructure complete

---

*This file is maintained by the release checklist. Run Phase P2 to bump the version and prepend a new entry.*
