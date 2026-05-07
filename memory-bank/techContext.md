# HomeHub Technical Context

## Technologies Used

### Frontend Stack
- **Framework**: Modern JavaScript framework (React recommended for PWA)
- **State Management**: React Context or similar
- **Routing**: React Router or similar
- **Styling**: CSS Modules or Tailwind CSS
- **PWA**: Workbox service worker for offline capability
- **Icons**: SVG sprite or icon library (Phosphor/Heroicons)

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js or similar
- **Database**: SQLite3
- **ICS Parsing**: ical.js library
- **Authentication**: Custom PIN/password hashing (bcrypt)
- **Cron**: node-cron for scheduled tasks (sync, backup)

### Build Tool
- **Package Manager**: npm or yarn
- **Build**: Vite or Webpack
- **TypeScript**: Optional but recommended

### Deployment
- **Docker**: Docker Compose for containerization
- **Platform**: AMD64 Linux (primary), Raspberry Pi (secondary)
- **OS**: Ubuntu/Debian based for Linux, Raspberry Pi OS for Pi

## Development Setup

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Docker Development
```bash
# Build and run with Docker Compose
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# Admin: http://localhost:3001
```

### Database Schema
```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pin TEXT UNIQUE NOT NULL,
    password TEXT,  -- NULL for PIN-only users
    role TEXT NOT NULL DEFAULT 'family',  -- 'family' or 'admin'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    start DATETIME NOT NULL,
    end DATETIME NOT NULL,
    recurrence_rule TEXT,  -- iCalendar RRULE format
    creator TEXT NOT NULL,  -- 'internal' or feed source name
    feed_id INTEGER,  -- NULL for internal events
    visibility TEXT DEFAULT 'public',  -- 'public' or 'private'
    uid TEXT,  -- Unique identifier for deduplication
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feed_id) REFERENCES feeds(id)
);

-- Feeds table
CREATE TABLE feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    sync_interval_minutes INTEGER NOT NULL DEFAULT 60,
    enabled INTEGER DEFAULT 1,
    last_sync DATETIME,
    next_sync DATETIME,
    errors TEXT  -- JSON array of error messages
);

-- Sync logs table
CREATE TABLE sync_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_id INTEGER NOT NULL,
    sync_time DATETIME NOT NULL,
    events_imported INTEGER DEFAULT 0,
    events_deleted INTEGER DEFAULT 0,
    errors TEXT,
    FOREIGN KEY (feed_id) REFERENCES feeds(id)
);
```

## Technical Constraints

### Browser Compatibility
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari, Android Chrome

### API Rate Limits
- ICS feeds: Respect X-RateLimit headers
- Implement exponential backoff on failures
- Max concurrent fetches: 3 (to avoid overwhelming sources)

### Storage Limits
- IndexedDB: ~500MB recommended limit
- Event deduplication prevents unbounded growth
- Daily backup rotation prevents disk fill

### Wall Display Constraints
- Resolution: Fixed 1920×1080
- Max events per day: 20 (avoid clutter)
- Scroll performance: 60 FPS target
- No user interaction in kiosk mode

## Dependencies

### Frontend
- react: ^18.0.0
- react-dom: ^18.0.0
- workbox-webpack-plugin: ^7.0.0
- ical.js: ^1.5.0 (for client-side ICS preview)

### Backend
- express: ^4.18.0
- sqlite3: ^5.1.0
- ical.js: ^1.5.0
- bcryptjs: ^2.4.3
- node-cron: ^3.0.0
- cors: ^2.8.5

### Dev Dependencies
- vite: ^5.0.0
- vitest: ^1.0.0 (testing)
- jest: ^29.0.0 (alternative)

## Tool Usage Patterns

### Git Workflow
- Feature branches from main
- Pull requests for review
- Semantic versioning for releases

### Docker Usage
- Single container with embedded SQLite
- Volume mounts for data persistence
- Health checks on API endpoint

### Cron Configuration
```bash
# Sync job (per feed interval)
*/10 * * * * /app/bin/sync-all.sh

# Daily backup at 2 AM
0 2 * * * /app/bin/backup.sh
```

### Backup Strategy
- Daily copy to backup directory
- Compressed gzip rotation
- Keep last 30 days
- Manual restore from backup file
