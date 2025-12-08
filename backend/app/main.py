from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    docs_url=f"{settings.api_prefix}/docs",
    openapi_url=f"{settings.api_prefix}/openapi.json",
)

app.include_router(api_router, prefix=f"{settings.api_prefix}/v1")

# CORS for local admin frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Return application health state for monitoring."""
    return {"status": "ok"}


@app.get(settings.api_prefix + "/version", tags=["system"])
def version_info() -> dict[str, str]:
    """Expose current environment metadata."""
    return {
        "app": settings.app_name,
        "environment": settings.environment,
    }
