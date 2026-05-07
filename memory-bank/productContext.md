# HomeHub Product Context

## Why This Project Exists

HomeHub was created to solve the chaos of disconnected family schedules. In modern households, family members often live their lives in separate calendar silos - Google Calendar on phones, paper notebooks, reminder apps - leading to:
- Missed family events and appointments
- Overbooking and scheduling conflicts
- Lack of visibility into each other's availability
- Difficulty coordinating group activities

## Problems We Solve

### 1. Fragmented Scheduling
**Problem**: Family members use different calendar systems with no way to see each other's schedules.
**Solution**: A unified shared calendar where everyone can view and manage events from a single source.

### 2. External Calendar Integration
**Problem**: Important events live in external calendars (Google, iCloud, Outlook) that aren't visible to the whole family.
**Solution**: ICS feed subscriptions that pull in external calendars while keeping data in one SQLite database.

### 3. Quick Family Access
**Problem**: Complex login flows frustrate family members who just want to check schedules quickly.
**Solution**: PIN-based login for family members, with password-only access for admins.

### 4. Large-Scale Display
**Problem**: Traditional calendar views don't work well on large wall displays.
**Solution**: Optimized wall display mode at 1920×1080 showing a 7-day calendar strip.

### 5. Offline Reliability
**Problem**: Internet outages disrupt calendar access.
**Solution**: Workbox service worker caches calendar data for offline read capability.

## How It Should Work

### User Flow
1. **First-time user** (family member):
   - Launch app → Enter PIN → See shared calendar
   - Create/edit/delete events (with appropriate permissions)
   - Toggle ICS feed subscriptions

2. **Admin user**:
   - Launch app → Enter password → Access admin settings
   - Add/remove ICS feed subscriptions
   - Configure sync intervals per source
   - View sync logs

3. **Wall display mode**:
   - Boot Raspberry Pi or launch on supported device
   - Full-screen 7-day calendar strip at 1920×1080
   - No interaction required

### Calendar Event Model
- Events stored in SQLite with: `id`, `title`, `description`, `start`, `end`, `recurrence_rule`, `creator`, `visibility`
- Recurrence rules use iCalendar format (FREQ, COUNT, INTERVAL, BYDAY, etc.)
- Events are deduplicated across ICS feeds using unique identifiers
- Conflict resolution: newer events overwrite older ones on same timestamp

## User Experience Goals

### For Family Members
- **Simplicity**: PIN entry in 4-6 digits, no password memorization
- **Speed**: Quick calendar view within 2 seconds of launch
- **Clarity**: Color-coded events by creator/source
- **Control**: Toggle ICS feeds on/off without losing subscriptions

### For Admins
- **Visibility**: Clear sync logs showing last sync time, events imported, errors
- **Flexibility**: Per-source sync interval configuration
- **Safety**: Password protection on admin functions
- **Monitoring**: Easy ICS feed management via simple add/remove interface

### For Display Users
- **Readability**: Large, clean calendar strip optimized for wall viewing
- **Reliability**: Works in kiosk mode without user interaction
- **Performance**: Smooth scrolling and rendering at full resolution

## Success Metrics

- Family members can create events in < 10 seconds
- PIN entry completes in < 5 seconds
- Calendar loads with < 500 events in < 2 seconds
- Wall display renders at 60 FPS
- Offline mode provides full read access after initial load
- Sync completes within configured interval for all active feeds
