"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.routes import router as v1_router

app = FastAPI(
    title=settings.app_name,
    description="Energy calculation API with BEI evaluation, tariff quotes, and electrical calculations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/healthz", summary="Health check")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": settings.app_name}

# Include API routes
app.include_router(v1_router, prefix="/v1", tags=["Energy Calculations"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)