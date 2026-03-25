"""Main FastAPI application entry point."""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.api import api_router as management_router
from app.api.v1.routes import router as public_router
from app.api.v1.billing import router as billing_router
from app.api.v1.products import router as products_router
from app.api.v1.referral import router as referral_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.onboarding import router as onboarding_router
from app.api.v1.residential import router as residential_router
from app.api.v1.contact import router as contact_router
from app.db.base import Base
from app.db.session import engine
from app.middleware.security import SecurityMiddleware, RateLimitMiddleware, LoggingMiddleware, RequestSizeLimitMiddleware
from app.services.readiness import evaluate_production_readiness

load_dotenv()


def _register_models() -> None:
    # Import model modules so SQLAlchemy metadata has all tables.
    from app.models import billing_entitlement  # noqa: F401
    from app.models import billing_project_pass  # noqa: F401
    from app.models import contact_inquiry  # noqa: F401
    from app.models import onboarding_registration  # noqa: F401
    from app.models import product  # noqa: F401
    from app.models import product_event  # noqa: F401
    from app.models import project  # noqa: F401
    from app.models import referral  # noqa: F401
    from app.models import user  # noqa: F401


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
_register_models()

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
app.add_middleware(RequestSizeLimitMiddleware, max_bytes=settings.MAX_UPLOAD_SIZE_BYTES)
app.add_middleware(RateLimitMiddleware, calls=100, period=60)
app.add_middleware(LoggingMiddleware)

# Public calculator + compliance endpoints (legacy v1)
app.include_router(public_router, prefix=settings.API_PREFIX)
app.include_router(billing_router, prefix=settings.API_PREFIX)
app.include_router(products_router, prefix=settings.API_PREFIX)
app.include_router(referral_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(onboarding_router, prefix=settings.API_PREFIX)
app.include_router(residential_router, prefix=settings.API_PREFIX)
app.include_router(contact_router, prefix=settings.API_PREFIX)

# Authenticated project-management endpoints (production backend)
app.include_router(management_router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Root"], summary="Root status")
async def read_root() -> dict[str, str]:
    return {"message": f"Welcome to {settings.APP_NAME}"}


@app.get("/healthz", tags=["Health"], summary="Service health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": settings.APP_NAME}
