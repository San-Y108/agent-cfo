from app.models import AuditReport, PaymentExecutionResult, PaymentPlan, RiskCheckResult


class InMemoryStore:
    def __init__(self):
        self.reset()

    def reset(self):
        self.payment_plans: dict[str, PaymentPlan] = {}
        self.risk_checks: dict[str, RiskCheckResult] = {}
        self.executions: dict[str, PaymentExecutionResult] = {}
        self.audit_reports: dict[str, AuditReport] = {}
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


store = InMemoryStore()

