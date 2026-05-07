# HomeHub Progress Tracker

## What Works (MVP Features Complete)

### Core Functionality
- ✅ Shared family calendar with ICS feed subscriptions
- ✅ Internal calendar: create/edit/delete events with recurrence support
- ✅ Family member profiles with role-based access control
- ✅ PIN and password authentication flows
- ✅ Google Calendar and Apple iCloud import via ICS URL feeds

### Display Modes
- ✅ Wall display at /wall: full-screen 7-day calendar strip at 1920×1080
- ✅ PWA support: installable on Android and iOS
- ✅ Offline read capability via Workbox service worker

### Administration
- ✅ Admin calendar settings: add/remove ICS feeds
- ✅ Per-source sync interval configuration
- ✅ Sync log: view last sync time, events imported, and errors per source

### Deployment
- ✅ Docker Compose deployment on AMD64 Linux
- ✅ Raspberry Pi kiosk boot script for wall display
- ✅ Daily automated SQLite backup

## What's Left to Build

### Post-MVP Enhancements
- [ ] Enhanced event search and filtering
- [ ] Event categories/tags for better organization
- [ ] Drag-and-drop event rescheduling
- [ ] Event reminders/notifications
- [ ] Export/Import calendar data
- [ ] Mobile app native wrapper (Capacitor/Cordova)
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Event templates for recurring patterns
- [ ] Share event via link

### Known Issues
- [ ] Large ICS feeds (>10k events) slow to sync
- [ ] Wall display scroll performance degrades with many events
- [ ] SQLite file locking on concurrent admin operations
- [ ] No conflict detection for same-timestamp events from different feeds

### Current Status
- **Sprint Completion**: Review sprint_s1.json through sprint_s6.json for completed work
- **Version**: MAJOR.MINOR format, MINOR increments by 1 each release
- **Next Release**: Bump version via release checklist Phase P2
- **Backlog**: See TODO.md for current priorities

## Evolution of Project Decisions

### Database Migration Path
- v0.0: SQLite single-file design
- Future: Consider PostgreSQL for multi-instance deployments

### Authentication Evolution
- v0.0: PIN for family, password for admin
- Future: OAuth integration (Google, Apple, Microsoft)

### Storage Strategy
- v0.0: IndexedDB for offline cache
- Future: Consider separate cache database for large installations

## Release History

### Upcoming Releases
- **Next**: Bump minor version, update changelog, release new minor version
- **Phase P2**: Release checklist workflow for version bumps

### Past Releases
- See CHANGELOG.md for historical release notes
- See sprint_s1.json through sprint_s6.json for sprint-level details
