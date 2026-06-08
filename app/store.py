import os
import sqlite3
from pathlib import Path
from typing import Protocol, TypeVar

from pydantic import BaseModel

from app.models import (
    AuditReport,
    CawStatus,
    PaymentExecutionResult,
    PaymentPlan,
    RiskCheckResult,
)

DEFAULT_DB_PATH = "agentcfo_demo.sqlite3"

ModelT = TypeVar("ModelT", bound=BaseModel)


class PaymentRepository(Protocol):
    def reset(self): ...
    def next_plan_id(self): ...
    def next_execution_id(self): ...
    def next_audit_report_id(self): ...
    def save_payment_plan(self, payment_plan: PaymentPlan): ...
    def get_payment_plan(self, payment_plan_id: str) -> PaymentPlan | None: ...
    def save_risk_check(self, risk_check: RiskCheckResult): ...
    def get_risk_check(self, payment_plan_id: str) -> RiskCheckResult | None: ...
    def save_execution(self, execution: PaymentExecutionResult): ...
    def get_execution(self, execution_id: str) -> PaymentExecutionResult | None: ...
    def save_audit_report(self, audit_report: AuditReport): ...
    def get_audit_report(self, audit_report_id: str) -> AuditReport | None: ...
    def save_caw_status(self, caw_status: CawStatus): ...
    def get_caw_status(self, caw_request_id: str) -> CawStatus | None: ...


class InMemoryStore:
    def __init__(self):
        self.reset()

    def reset(self):
        self.payment_plans: dict[str, PaymentPlan] = {}
        self.risk_checks: dict[str, RiskCheckResult] = {}
        self.executions: dict[str, PaymentExecutionResult] = {}
        self.audit_reports: dict[str, AuditReport] = {}
        self.caw_statuses: dict[str, CawStatus] = {}
        self._plan_counter = 0
        self._execution_counter = 0
        self._audit_counter = 0

    def next_plan_id(self):
        self._plan_counter += 1
        return f"plan_demo_{self._plan_counter:03d}"

    def next_execution_id(self):
        self._execution_counter += 1
        return f"exec_demo_{self._execution_counter:03d}"

    def next_audit_report_id(self):
        self._audit_counter += 1
        return f"audit_demo_{self._audit_counter:03d}"

    def save_payment_plan(self, payment_plan: PaymentPlan):
        self.payment_plans[payment_plan.paymentPlanId] = payment_plan

    def get_payment_plan(self, payment_plan_id: str) -> PaymentPlan | None:
        return self.payment_plans.get(payment_plan_id)

    def save_risk_check(self, risk_check: RiskCheckResult):
        self.risk_checks[risk_check.paymentPlanId] = risk_check

    def get_risk_check(self, payment_plan_id: str) -> RiskCheckResult | None:
        return self.risk_checks.get(payment_plan_id)

    def save_execution(self, execution: PaymentExecutionResult):
        self.executions[execution.executionId] = execution

    def get_execution(self, execution_id: str) -> PaymentExecutionResult | None:
        return self.executions.get(execution_id)

    def save_audit_report(self, audit_report: AuditReport):
        self.audit_reports[audit_report.auditReportId] = audit_report

    def get_audit_report(self, audit_report_id: str) -> AuditReport | None:
        return self.audit_reports.get(audit_report_id)

    def save_caw_status(self, caw_status: CawStatus):
        self.caw_statuses[caw_status.cawRequestId] = caw_status

    def get_caw_status(self, caw_request_id: str) -> CawStatus | None:
        return self.caw_statuses.get(caw_request_id)


class SQLiteStore:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._ensure_parent_directory()
        self.connection = sqlite3.connect(db_path, check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        self._initialize_schema()

    def _ensure_parent_directory(self):
        if self.db_path == ":memory:":
            return
        parent = Path(self.db_path).expanduser().resolve().parent
        parent.mkdir(parents=True, exist_ok=True)

    def _initialize_schema(self):
        with self.connection:
            for table in [
                "payment_plans",
                "risk_checks",
                "executions",
                "audit_reports",
                "caw_statuses",
            ]:
                self.connection.execute(
                    f"CREATE TABLE IF NOT EXISTS {table} (id TEXT PRIMARY KEY, payload TEXT NOT NULL)"
                )
            self.connection.execute(
                "CREATE TABLE IF NOT EXISTS counters (name TEXT PRIMARY KEY, value INTEGER NOT NULL)"
            )

    def reset(self):
        with self.connection:
            for table in [
                "payment_plans",
                "risk_checks",
                "executions",
                "audit_reports",
                "caw_statuses",
                "counters",
            ]:
                self.connection.execute(f"DELETE FROM {table}")

    def _next_id(self, name: str, prefix: str):
        with self.connection:
            row = self.connection.execute(
                "SELECT value FROM counters WHERE name = ?",
                (name,),
            ).fetchone()
            value = 1 if row is None else row["value"] + 1
            self.connection.execute(
                "INSERT OR REPLACE INTO counters (name, value) VALUES (?, ?)",
                (name, value),
            )
        return f"{prefix}_{value:03d}"

    def next_plan_id(self):
        return self._next_id("payment_plan", "plan_demo")

    def next_execution_id(self):
        return self._next_id("execution", "exec_demo")

    def next_audit_report_id(self):
        return self._next_id("audit_report", "audit_demo")

    def _save(self, table: str, record_id: str, model: BaseModel):
        with self.connection:
            self.connection.execute(
                f"INSERT OR REPLACE INTO {table} (id, payload) VALUES (?, ?)",
                (record_id, model.model_dump_json()),
            )

    def _get(self, table: str, record_id: str, model_type: type[ModelT]) -> ModelT | None:
        row = self.connection.execute(
            f"SELECT payload FROM {table} WHERE id = ?",
            (record_id,),
        ).fetchone()
        if row is None:
            return None
        return model_type.model_validate_json(row["payload"])

    def save_payment_plan(self, payment_plan: PaymentPlan):
        self._save("payment_plans", payment_plan.paymentPlanId, payment_plan)

    def get_payment_plan(self, payment_plan_id: str) -> PaymentPlan | None:
        return self._get("payment_plans", payment_plan_id, PaymentPlan)

    def save_risk_check(self, risk_check: RiskCheckResult):
        self._save("risk_checks", risk_check.paymentPlanId, risk_check)

    def get_risk_check(self, payment_plan_id: str) -> RiskCheckResult | None:
        return self._get("risk_checks", payment_plan_id, RiskCheckResult)

    def save_execution(self, execution: PaymentExecutionResult):
        self._save("executions", execution.executionId, execution)

    def get_execution(self, execution_id: str) -> PaymentExecutionResult | None:
        return self._get("executions", execution_id, PaymentExecutionResult)

    def save_audit_report(self, audit_report: AuditReport):
        self._save("audit_reports", audit_report.auditReportId, audit_report)

    def get_audit_report(self, audit_report_id: str) -> AuditReport | None:
        return self._get("audit_reports", audit_report_id, AuditReport)

    def save_caw_status(self, caw_status: CawStatus):
        self._save("caw_statuses", caw_status.cawRequestId, caw_status)

    def get_caw_status(self, caw_request_id: str) -> CawStatus | None:
        return self._get("caw_statuses", caw_request_id, CawStatus)


def create_store() -> PaymentRepository:
    if os.getenv("AGENTCFO_STORE_BACKEND") == "memory":
        return InMemoryStore()
    return SQLiteStore(os.getenv("AGENTCFO_DB_PATH", DEFAULT_DB_PATH))


store = create_store()
