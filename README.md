# HomeHub

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/vnmyers13/HomeHub/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](https://hub.docker.com/r/vnmyers13/homehub-api)

**Self-hosted family calendar and organization hub**

HomeHub is a privacy-first, self-hosted solution for managing your family's schedule. Run it on your own server, sync external calendars via ICS feeds, and display everything on a wall-mounted screen or mobile PWA.

## Features

- 📅 **Shared Family Calendar** - Create and manage events for the whole family
- 🔄 **ICS Feed Sync** - Import calendars from Google Calendar, Apple iCloud, sports leagues, and schools
- 📺 **Wall Display** - Full-screen 7-day calendar view optimized for 1920×1080 displays
- 📱 **Progressive Web App** - Install on iOS and Android devices
- 🔒 **Privacy-First** - Your data stays on your server
- 👥 **Multi-User** - Role-based access with PIN and password authentication
- 🌙 **Dark Mode** - Default dark theme with light mode option
- 📴 **Offline Support** - Read-only access when offline via service worker
- 🐳 **Docker Ready** - Simple deployment with Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Linux server or NAS (AMD64 architecture)
- Optional: Raspberry Pi for wall display

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vnmyers13/HomeHub.git
   cd HomeHub
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and set:
   # - FAMILY_NAME (your family name)
   # - TIMEZONE (e.g., America/New_York)
   # - SECRET_KEY (generate with: openssl rand -hex 32)
   ```

3. **Start the stack:**
   ```bash
   docker compose up -d
   ```

4. **Access HomeHub:**
   - Open https://homehub.local in your browser
   - Complete the setup wizard
   - Add family members and calendar sources

### Wall Display Setup

For a dedicated wall display using a Raspberry Pi:

```bash
# On the Raspberry Pi:
curl -fsSL https://raw.githubusercontent.com/vnmyers13/HomeHub/main/scripts/setup-wall-pi.sh | bash
```

The Pi will boot directly to the wall display at `https://homehub.local/wall`.

## Architecture

- **Backend**: Python 3.12 + FastAPI + SQLAlchemy + SQLite
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Reverse Proxy**: Caddy 2 with automatic HTTPS (self-signed for LAN)
- **Deployment**: Docker Compose
- **CI/CD**: GitHub Actions

## Documentation

- [Getting Started Guide](GETTING_STARTED.md) - Complete setup and development guide
- [Release Checklist](release_checklist.json) - Release engineering process
- [Changelog](CHANGELOG.md) - Version history
- [Future Enhancements](FUTURE_ENHANCEMENTS.md) - Planned features

## Development

### Local Development

```bash
# Backend (with hot reload)
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (with HMR)
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Backend tests
source backend/.venv/bin/activate
cd backend && pytest tests/ -v

# Frontend type check
cd frontend && npm run build
```

## Deployment

### Production Server

```bash
# First-time server setup
curl -fsSL https://raw.githubusercontent.com/vnmyers13/HomeHub/main/scripts/setup-server.sh | bash

# Deploy
./scripts/deploy.sh production
```

### Docker Hub Images

Pre-built images are available:
- `vnmyers13/homehub-api:latest` - Backend API
- `vnmyers13/homehub-web:latest` - Frontend web app

```bash
# Pull and run
docker pull vnmyers13/homehub-api:latest
docker pull vnmyers13/homehub-web:latest
docker compose up -d
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FAMILY_NAME` | Your family name | HomeHub |
| `TIMEZONE` | IANA timezone | UTC |
| `SECRET_KEY` | 64-char hex secret | (required) |
| `DATABASE_URL` | SQLite database path | sqlite+aiosqlite:////data/db/homehub.db |
| `ALLOWED_ORIGINS` | CORS origins | https://homehub.local |
| `BACKUP_RETENTION_DAYS` | Backup retention | 30 |
| `BACKUP_TIME` | Daily backup time | 03:00 |
| `WALL_IDLE_TIMEOUT_SECONDS` | Wall display timeout | 300 |

See [.env.example](.env.example) for complete documentation.

## Calendar Sync

HomeHub supports importing calendars via ICS feed URLs (no OAuth required):

- **Google Calendar**: Calendar Settings → Integrate calendar → Secret address in iCal format
- **Apple iCloud**: iCloud.com → Calendar → Share calendar → Public Calendar
- **Sports Leagues**: Most team management apps provide ICS export URLs
- **School Calendars**: Check your school's website for calendar feeds

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/vnmyers13/HomeHub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/vnmyers13/HomeHub/discussions)

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Calendar component from [react-big-calendar](https://github.com/jquense/react-big-calendar)

---

**Version**: 0.1.0 | **Status**: Active Development | **Platform**: AMD64 Linux
