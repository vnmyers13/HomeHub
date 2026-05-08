"""FastAPI application main entry point."""

import os
from contextlib import asynccontextmanager

from alembic import command
from alembic.config import Config
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .core.config import settings


# Global scheduler instance
scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print("Starting HomeHub API...")
    
    # Create data directories
    os.makedirs("/data/db", exist_ok=True)
    os.makedirs("/data/photos/originals", exist_ok=True)
    os.makedirs("/data/photos/avatars", exist_ok=True)
    os.makedirs("/data/photos/thumbnails", exist_ok=True)
    os.makedirs("/data/backups", exist_ok=True)
    
    # Run Alembic migrations
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        print("Database migrations completed")
    except Exception as e:
        print(f"Migration error: {e}")
    
    # Start scheduler
    scheduler.start()
    print("Scheduler started")
    
    # TODO: Register calendar sync job
    # TODO: Register daily backup job
    
    yield
    
    # Shutdown
    print("Shutting down HomeHub API...")
    scheduler.shutdown()


# Create FastAPI app
app = FastAPI(
    title="HomeHub API",
    version=settings.app_version,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions."""
    print(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Mount static files for photos
if os.path.exists("/data/photos"):
    app.mount("/photos", StaticFiles(directory="/data/photos"), name="photos")


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "version": settings.app_version,
    }


# Include routers
from .routers import auth, users

app.include_router(auth.router)
app.include_router(users.router)

# TODO: Include additional routers
# from .routers import calendar, integrations, ws
# app.include_router(calendar.router)
# app.include_router(integrations.router)
# app.include_router(ws.router)
