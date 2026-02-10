"""Main FastAPI application entry point."""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.api import api_router as management_router
from app.api.v1.routes import router as public_router
from app.db.base import Base
from app.db.session import engine
from app.middleware.security import SecurityMiddleware, RateLimitMiddleware, LoggingMiddleware
from app.services.readiness import evaluate_production_readiness

load_dotenv()


def _enforce_production_readiness() -> None:
    if settings.env.lower() != "production":
        return
    if not settings.PRODUCTION_ENFORCE_READINESS:
        return

    readiness = evaluate_production_readiness(settings)
    if readiness["ready"]:
        return

    failed = ", ".join(readiness["failed_checks"])
    raise RuntimeError(
        f"Production readiness checks failed: {failed}. "
        "Fix configuration or set PRODUCTION_ENFORCE_READINESS=false for emergency bypass."
    )


_enforce_production_readiness()

# Create database tables on startup
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Energy calculation service with compliance-grade BEI evaluation and tariff tools",
    version="1.0.0",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs" if settings.env.lower() == "development" else None,
    redoc_url=f"{settings.API_PREFIX}/redoc" if settings.env.lower() == "development" else None,
)

# CORS configuration shared across public/front-end clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security-oriented middleware stack
app.add_middleware(SecurityMiddleware)
app.add_middleware(RateLimitMiddleware, calls=100, period=60)
app.add_middleware(LoggingMiddleware)

# Public calculator + compliance endpoints (legacy v1)
app.include_router(public_router, prefix=settings.API_PREFIX)

# Authenticated project-management endpoints (production backend)
app.include_router(management_router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Root"], summary="Root status")
async def read_root() -> dict[str, str]:
    return {"message": f"Welcome to {settings.APP_NAME}"}


@app.get("/healthz", tags=["Health"], summary="Service health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": settings.APP_NAME}
