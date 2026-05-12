"""
FastAPI application entry point.
- Loads the YOLO model on startup
- Configures CORS
- Mounts routers
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import health, inference, settings as settings_router
from app.services.model_service import model_service

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: load model on startup, cleanup on shutdown."""
    logger.info("=" * 60)
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Model path: {settings.MODEL_PATH}")
    logger.info("=" * 60)

    try:
        model_service.load_model()
        logger.info("Model loaded successfully — ready to serve requests.")
    except FileNotFoundError as e:
        logger.error(f"CRITICAL: {e}")
        logger.error("The application will start but inference will not work.")
    except Exception as e:
        logger.error(f"CRITICAL: Failed to load model: {e}", exc_info=True)

    yield

    # Cleanup
    logger.info("Shutting down application.")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Şap Hastalığı (FMD) AI Teşhis Sistemi — Oriented Bounding Box lesion detection",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Include routers
app.include_router(health.router)
app.include_router(inference.router)
app.include_router(settings_router.router)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Sunucu hatası oluştu. Lütfen tekrar deneyin. / Internal server error.",
        },
    )


@app.get("/")
async def root():
    """Root endpoint — redirects to docs or returns basic info."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/health",
    }
