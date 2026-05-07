# HomeHub Project Brief

## Overview
HomeHub is a family-oriented shared calendar system designed for household members to coordinate schedules, manage events, and share calendar feeds.

## Core Requirements

### Primary Functionality
- **Shared Family Calendar**: Central calendar where all family members can view and manage events
- **ICS Feed Subscriptions**: Support for subscribing to external calendars (Google, iCloud, Outlook)
- **Internal Calendar Management**: Create, edit, delete events with recurrence support
- **Role-Based Access Control**: Different permission levels for family members and admins

### Authentication
- **PIN Login**: Quick access for family members
- **Password Login**: Admin access with password protection
- **PIN Change Flow**: Secure PIN modification process

### Display Modes
- **Wall Display**: Full-screen 7-day calendar strip at 1920×1080 resolution
- **PWA Support**: Installable as Progressive Web App on Android and iOS devices
- **Offline Read Capability**: Service worker caching via Workbox

### Administration
- **ICS Feed Management**: Add/remove external calendar subscriptions
- **Sync Interval Configuration**: Per-source sync frequency settings
- **Sync Log**: View last sync time, imported events, and errors per source

### Deployment
- **Docker Compose**: AMD64 Linux deployment support
- **Raspberry Pi Kiosk**: Boot script for wall display mode
- **Automated Backups**: Daily SQLite backup routine

## MVP Scope
The initial release includes:
- Shared calendar with ICS feed subscriptions
- Internal event management with recurrence
- Family member profiles with role-based access
- PIN and password authentication
- Wall display mode
- PWA support with offline capability
- Admin calendar settings management
- Sync logging and monitoring
- Docker and kiosk deployment options

## Future Enhancements
Refer to `FUTURE_ENHANCEMENTS.md` for planned features beyond MVP scope.
