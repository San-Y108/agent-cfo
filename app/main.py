from fastapi import FastAPI

from app.routers.payments import router as payments_router

app = FastAPI(
    title="AgentCFO Backend MVP",
    description="Mock backend API for AgentCFO payment planning, risk checks, execution, and audit reports.",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.include_router(payments_router)
