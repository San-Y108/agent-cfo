import os
from typing import Protocol

from pydantic import BaseModel, ConfigDict

from app.models import (
    PaymentItem,
    PaymentPlan,
    PaymentPlanRequest,
    PaymentStatus,
    PlannerMode,
    RiskLevel,
)

OPENAI_FALLBACK_WARNING = "OpenAI planner failed; used mock planner fallback"
DEFAULT_OPENAI_MODEL = "gpt-4.1-mini"


class PaymentPlanner(Protocol):
    def generate(self, request: PaymentPlanRequest, payment_plan_id: str) -> PaymentPlan: ...


class MockPaymentPlanner:
    def generate(
        self,
        request: PaymentPlanRequest,
        payment_plan_id: str,
        warnings: list[str] | None = None,
    ) -> PaymentPlan:
        payments = [
            PaymentItem(
                id=f"pay_{index:03d}",
                recipient=contribution.name,
                task=contribution.task,
                wallet=contribution.wallet,
                amount=contribution.amount,
                token=contribution.token,
                reason=f"Completed task: {contribution.task}",
                status=PaymentStatus.READY,
                risks=[],
            )
            for index, contribution in enumerate(request.contributions, start=1)
        ]
        return PaymentPlan(
            paymentPlanId=payment_plan_id,
            summary=f"AgentCFO generated a payment plan for {len(payments)} payment item(s).",
            totalAmount=sum(payment.amount for payment in payments),
            riskLevel=RiskLevel.UNCHECKED,
            payments=payments,
            plannerMode=PlannerMode.MOCK,
            plannerWarnings=warnings or [],
        )


class OpenAiStructuredPaymentPlanner:
    class DraftPayment(BaseModel):
        model_config = ConfigDict(extra="forbid")

        recipient: str
        task: str
        wallet: str
        amount: float
        token: str
        reason: str

    class DraftPlan(BaseModel):
        model_config = ConfigDict(extra="forbid")

        summary: str
        payments: list["OpenAiStructuredPaymentPlanner.DraftPayment"]

    def __init__(self, client=None, model: str | None = None):
        self.client = client
        self.model = model or os.getenv("OPENAI_MODEL", DEFAULT_OPENAI_MODEL)
        self.mock_planner = MockPaymentPlanner()

    def generate(self, request: PaymentPlanRequest, payment_plan_id: str) -> PaymentPlan:
        try:
            draft = self._generate_draft(request)
            self._validate_draft_matches_request(draft, request)
        except Exception:
            return self.mock_planner.generate(
                request,
                payment_plan_id,
                warnings=[OPENAI_FALLBACK_WARNING],
            )

        payments = [
            PaymentItem(
                id=f"pay_{index:03d}",
                recipient=contribution.name,
                task=contribution.task,
                wallet=contribution.wallet,
                amount=contribution.amount,
                token=contribution.token,
                reason=draft_payment.reason,
                status=PaymentStatus.READY,
                risks=[],
            )
            for index, (contribution, draft_payment) in enumerate(
                zip(request.contributions, draft.payments, strict=True),
                start=1,
            )
        ]
        return PaymentPlan(
            paymentPlanId=payment_plan_id,
            summary=draft.summary,
            totalAmount=sum(payment.amount for payment in payments),
            riskLevel=RiskLevel.UNCHECKED,
            payments=payments,
            plannerMode=PlannerMode.OPENAI,
            plannerWarnings=[],
        )

    def _generate_draft(self, request: PaymentPlanRequest) -> DraftPlan:
        client = self.client or self._create_openai_client()
        response = client.responses.parse(
            model=self.model,
            input=[
                {
                    "role": "system",
                    "content": (
                        "You draft DAO payment plan explanations only. "
                        "Do not approve payments, do not assign risk status, "
                        "and do not change recipients, wallets, token, tasks, or amounts."
                    ),
                },
                {
                    "role": "user",
                    "content": request.model_dump_json(),
                },
            ],
            text_format=self.DraftPlan,
        )
        return response.output_parsed

    def _create_openai_client(self):
        from openai import OpenAI

        return OpenAI()

    def _validate_draft_matches_request(
        self,
        draft: DraftPlan,
        request: PaymentPlanRequest,
    ):
        if len(draft.payments) != len(request.contributions):
            raise ValueError("OpenAI draft payment count does not match contributions")

        for contribution, draft_payment in zip(
            request.contributions,
            draft.payments,
            strict=True,
        ):
            if (
                draft_payment.recipient != contribution.name
                or draft_payment.task != contribution.task
                or draft_payment.wallet != contribution.wallet
                or draft_payment.amount != contribution.amount
                or draft_payment.token != contribution.token
            ):
                raise ValueError("OpenAI draft changed payment inputs")


def create_payment_planner() -> PaymentPlanner:
    mode = os.getenv("PAYMENT_PLANNER_MODE", "mock").strip().lower()
    if mode == PlannerMode.OPENAI and os.getenv("OPENAI_API_KEY"):
        return OpenAiStructuredPaymentPlanner()
    return MockPaymentPlanner()
