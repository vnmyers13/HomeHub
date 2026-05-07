"""HomeHub API Application Entry Point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print(f"Starting {settings.app_name} v{settings.app_version}...")
    yield
    # Shutdown
    print(f"Shutting down {settings.app_name}...")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers here (lazy imports to avoid circular dependencies)
from backend.app.routers import (
    auth,
    devices,
    rooms,
    schedules,
    logs,
    users,
    photos,
)

app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(devices.router, prefix="/api/v1", tags=["Devices"])
app.include_router(rooms.router, prefix="/api/v1", tags=["Rooms"])
app.include_router(schedules.router, prefix="/api/v1", tags=["Schedules"])
app.include_router(logs.router, prefix="/api/v1", tags=["Logs"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(photos.router, prefix="/api/v1", tags=["Photos"])

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "app": settings.app_name}
