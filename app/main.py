import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.payments import router as payments_router

DEFAULT_CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]


def get_cors_allowed_origins() -> list[str]:
    configured_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
    origins = [origin.strip() for origin in configured_origins.split(",") if origin.strip()]
    return origins or DEFAULT_CORS_ALLOWED_ORIGINS


app = FastAPI(
    title="AgentCFO Backend MVP",
    description="Mock backend API for AgentCFO payment planning, risk checks, execution, and audit reports.",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(payments_router)


@app.get("/health", include_in_schema=False)
def health_check():
    return {"status": "ok", "service": "agent-cfo-backend"}
