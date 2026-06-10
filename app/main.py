import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.payments import router as payments_router
from app.routers.p2_extensions import router as p2_extensions_router
from app.services.request_finance import RequestFinanceConfig

DEFAULT_CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]


def get_cors_allowed_origins() -> list[str]:
    configured_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
    origins = [origin.strip() for origin in configured_origins.split(",") if origin.strip()]
    return origins or DEFAULT_CORS_ALLOWED_ORIGINS


def get_public_caw_mode() -> str:
    mode = os.getenv("CAW_ADAPTER_MODE", "mock").strip().lower()
    return mode if mode in {"mock", "real"} else "unknown"


def get_public_request_finance_status():
    config = RequestFinanceConfig.from_env()
    return {
        "mode": config.public_mode,
        "apiKeyConfigured": config.api_key_configured,
        "invoiceCreateGuardEnabled": config.allow_invoice_create,
        "invoiceCreateImplemented": True,
    }


def get_public_p2_capabilities():
    return {
        "evidenceTimeline": True,
        "demoScenarioPack": True,
        "riskWhatIf": True,
        "policyGuardrails": True,
        "evidenceExport": True,
        "requestFinancePreflight": True,
        "plannerExplainability": True,
        "requestFinanceLifecycleMock": True,
        "requestFinanceWebhookReplayMockV2": True,
        "sablierPayrollSimulation": True,
        "safeGuardPolicySimulation": True,
        "multiAgentTreasurySimulation": True,
        "demoRunbookContracts": True,
        "openApiLiteContracts": True,
        "liveExternalActionsDefaultEnabled": False,
    }


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
app.include_router(p2_extensions_router)


@app.get("/health", include_in_schema=False)
def health_check():
    return {"status": "ok", "service": "agent-cfo-backend"}


@app.get("/version", include_in_schema=False)
def version():
    return {
        "service": "agent-cfo-backend",
        "version": app.version,
        "apiMode": "mock-demo",
        "docsEnabled": False,
        "openapiEnabled": False,
        "cawMode": get_public_caw_mode(),
        "requestFinance": get_public_request_finance_status(),
        "p2Capabilities": get_public_p2_capabilities(),
    }
