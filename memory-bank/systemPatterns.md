# HomeHub System Patterns

## System Architecture

### High-Level Overview
HomeHub is a monolithic web application with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                      HomeHub Application                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Frontend   │  │   Backend    │  │    Database       │  │
│  │  (PWA/SPA)   │◄─┤  (Node.js)   │◄─┤   (SQLite)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│       │                │                   │                │
│       ▼                ▼                   ▼                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Service     │  │  ICS Parser  │  │  Backup Manager  │  │
│  │   Worker     │  │  (ical.js)   │  │   (cron job)     │  │
│  │  (Workbox)   │  │              │  │                   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│       │                │                   │                │
│       └────────────────┴───────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Component Relationships

#### Frontend (PWA/SPA)
- Built with modern JavaScript framework (React/Vue/Angular)
- Service worker registered for offline capability
- Responsive design for mobile and desktop
- Wall display mode: fixed 1920×1080 resolution

#### Backend API
- RESTful API endpoints for calendar operations
- Authentication middleware (PIN/password)
- ICS feed processing service
- Admin settings management

#### Database Layer
- SQLite for local persistence
- Tables: users, events, feeds, sync_logs
- Foreign keys for user-event relationships
- Indexes on date and feed columns

## Key Technical Decisions

### 1. Database Choice: SQLite
**Rationale**: Single-file database simplifies deployment and backup. Perfect for embedded/Raspberry Pi deployments.

**Trade-offs**:
- ✅ Simple deployment, no separate DB server
- ✅ Easy backup (copy file)
- ❌ Single-threaded, not for high-concurrency scenarios
- ❌ File locking on concurrent writes

### 2. ICS Feed Parsing: ical.js
**Rationale**: Mature library for parsing iCalendar format, handles recurrence rules and VEVENT deduplication.

**Deduplication Strategy**:
- Each event has a unique `UID` from the ICS feed
- On sync, events are matched by UID
- Newer events (by DTSTAMP) overwrite older ones
- Deleted events in source are tracked via EXDATE

### 3. Authentication: PIN vs Password
**Rationale**: 
- PIN for family members: fast, familiar (like lock screen PIN)
- Password for admins: more secure, admin-only access

**Security Considerations**:
- PINs stored with salt and hash
- Rate limiting on auth attempts
- Password required for admin functions only

### 4. Offline-First PWA
**Rationale**: Family members may have intermittent connectivity.

**Implementation**:
- Workbox service worker caches API responses
- IndexedDB stores local event copy
- Offline mode: read-only access to cached events
- Background sync when connectivity returns

### 5. Wall Display Mode
**Rationale**: Raspberry Pi kiosk use case requires full-screen, no-interaction display.

**Technical Details**:
- Fixed resolution: 1920×1080
- 7-day horizontal strip
- Minimal DOM elements for performance
- CSS transforms for smooth scrolling

## Design Patterns

### Repository Pattern
- EventRepository handles CRUD operations
- FeedRepository manages ICS subscription data
- UserRepository for authentication

### Observer Pattern
- SyncService notifies UI when events change
- BackupService triggers on schedule

### Strategy Pattern
- Different rendering strategies for:
  - Mobile view (compact)
  - Desktop view (expanded)
  - Wall view (full strip)

### Singleton Pattern
- Database connection pool
- ICS parser instance
- Authentication manager

## Critical Implementation Paths

### Event Creation Flow
1. User selects "Add Event"
2. Fill form (title, description, start/end, recurrence)
3. Submit → API validates input
4. Backend creates event in SQLite
5. Service worker caches event
6. UI updates with new event

### ICS Sync Flow
1. Cron triggers sync job (per configured interval)
2. Fetch ICS feed from URL
3. ical.js parses into events
4. Match by UID against local database
5. Insert new, update existing, mark deleted
6. Log sync results to sync_logs table
7. Notify UI of changes

### Backup Flow
1. Cron triggers daily at configured time
2. Copy SQLite database to backup directory
3. Compress with gzip (optional)
4. Rotate old backups (keep last N days)
5. Log backup completion/failure

## Component Interactions

```
User Action              → Frontend
       ↓
API Request              → Backend API
       ↓
Database Query           → SQLite
       ↓
Response                 → Frontend
       ↓
Service Worker Cache     → IndexedDB (offline)
```

## Performance Considerations

- **Event Queries**: Indexed on `start`, `end`, `feed_id`
- **Wall Display**: Batch render 7 days, use CSS transform for scroll
- **ICS Parsing**: Stream large feeds, process in chunks
- **Memory**: Cache recent events, evict old ones

## Security Patterns

- **Authentication**: PIN/password hashing with bcrypt
- **Authorization**: Role-based (family/admin) middleware
- **Input Validation**: Sanitize all user inputs
- **CORS**: Configured for PWA origins only
