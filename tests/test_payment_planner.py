import pytest
from pydantic import ValidationError

from app.models import PaymentPlanRequest
from app.services.payment_planner import (
    MockPaymentPlanner,
    OpenAiStructuredPaymentPlanner,
    create_payment_planner,
)


def sample_request():
    return PaymentPlanRequest.model_validate(
        {
            "contributions": [
                {
                    "name": "Alice",
                    "role": "Content Contributor",
                    "task": "Wrote event recap article",
                    "wallet": "0xAlice",
                    "amount": 20,
                    "token": "USDC",
                }
            ],
            "budgetRule": {
                "monthlyBudget": 50,
                "singlePaymentLimit": 25,
                "allowedToken": "USDC",
                "whitelist": ["0xAlice"],
                "requiresHumanApproval": True,
            },
        }
    )


class FakeParsedResponse:
    def __init__(self, parsed):
        self.output_parsed = parsed


class FakeResponsesClient:
    def __init__(self, parsed=None, error=None):
        self.parsed = parsed
        self.error = error
        self.calls = []

    def parse(self, **kwargs):
        self.calls.append(kwargs)
        if self.error is not None:
            raise self.error
        return FakeParsedResponse(self.parsed)


class FakeOpenAiClient:
    def __init__(self, responses):
        self.responses = responses


def test_create_payment_planner_defaults_to_mock(monkeypatch):
    monkeypatch.delenv("PAYMENT_PLANNER_MODE", raising=False)
    monkeypatch.setenv("OPENAI_API_KEY", "fake-key")

    planner = create_payment_planner()

    assert isinstance(planner, MockPaymentPlanner)


def test_create_payment_planner_openai_mode_without_key_uses_mock(monkeypatch):
    monkeypatch.setenv("PAYMENT_PLANNER_MODE", "openai")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    planner = create_payment_planner()

    assert isinstance(planner, MockPaymentPlanner)


def test_openai_planner_uses_fake_client_and_backend_forces_safe_fields():
    request = sample_request()
    draft = OpenAiStructuredPaymentPlanner.DraftPlan.model_validate(
        {
            "summary": "AI drafted one payout.",
            "payments": [
                {
                    "recipient": "Alice",
                    "task": "Wrote event recap article",
                    "wallet": "0xAlice",
                    "amount": 20,
                    "token": "USDC",
                    "reason": "Alice completed the recap and should be paid.",
                }
            ],
        }
    )
    fake_responses = FakeResponsesClient(parsed=draft)
    planner = OpenAiStructuredPaymentPlanner(
        client=FakeOpenAiClient(fake_responses),
        model="fake-model",
    )

    plan = planner.generate(request, "plan_demo_123")

    assert fake_responses.calls
    assert plan.paymentPlanId == "plan_demo_123"
    assert plan.summary == "AI drafted one payout."
    assert plan.totalAmount == 20
    assert plan.riskLevel == "Unchecked"
    assert plan.plannerMode == "openai"
    assert plan.plannerWarnings == []
    assert plan.payments[0].id == "pay_001"
    assert plan.payments[0].status == "Ready"
    assert plan.payments[0].risks == []
    assert plan.payments[0].reason == "Alice completed the recap and should be paid."
    system_message = fake_responses.calls[0]["input"][0]["content"]
    assert "Do not approve payments" in system_message
    assert "do not assign risk status" in system_message
    assert "do not change recipients" in system_message


def test_openai_draft_schema_rejects_authorization_fields():
    with pytest.raises(ValidationError):
        OpenAiStructuredPaymentPlanner.DraftPlan.model_validate(
            {
                "summary": "Bad authorization draft",
                "payments": [
                    {
                        "recipient": "Alice",
                        "task": "Wrote event recap article",
                        "wallet": "0xAlice",
                        "amount": 20,
                        "token": "USDC",
                        "reason": "Alice completed the recap.",
                        "status": "Executed",
                        "risks": [],
                    }
                ],
            }
        )


def test_openai_planner_falls_back_to_mock_when_client_fails():
    request = sample_request()
    fake_responses = FakeResponsesClient(error=TimeoutError("slow model"))
    planner = OpenAiStructuredPaymentPlanner(
        client=FakeOpenAiClient(fake_responses),
        model="fake-model",
    )

    plan = planner.generate(request, "plan_demo_001")

    assert plan.plannerMode == "mock"
    assert plan.plannerWarnings == ["OpenAI planner failed; used mock planner fallback"]
    assert plan.payments[0].reason == "Completed task: Wrote event recap article"


def test_openai_planner_falls_back_when_response_is_refusal_without_parsed_output():
    request = sample_request()
    fake_responses = FakeResponsesClient(parsed=None)
    planner = OpenAiStructuredPaymentPlanner(
        client=FakeOpenAiClient(fake_responses),
        model="fake-model",
    )

    plan = planner.generate(request, "plan_demo_001")

    assert plan.plannerMode == "mock"
    assert plan.plannerWarnings == ["OpenAI planner failed; used mock planner fallback"]
    assert plan.payments[0].reason == "Completed task: Wrote event recap article"


def test_openai_planner_falls_back_when_schema_parse_fails():
    request = sample_request()
    fake_responses = FakeResponsesClient(error=ValueError("schema validation failed"))
    planner = OpenAiStructuredPaymentPlanner(
        client=FakeOpenAiClient(fake_responses),
        model="fake-model",
    )

    plan = planner.generate(request, "plan_demo_001")

    assert plan.plannerMode == "mock"
    assert plan.plannerWarnings == ["OpenAI planner failed; used mock planner fallback"]
    assert plan.payments[0].recipient == "Alice"


def test_openai_planner_falls_back_when_payment_count_mismatches():
    request = sample_request()
    draft = OpenAiStructuredPaymentPlanner.DraftPlan.model_validate(
        {
            "summary": "Bad draft",
            "payments": [],
        }
    )
    fake_responses = FakeResponsesClient(parsed=draft)
    planner = OpenAiStructuredPaymentPlanner(
        client=FakeOpenAiClient(fake_responses),
        model="fake-model",
    )

    plan = planner.generate(request, "plan_demo_001")

    assert plan.plannerMode == "mock"
    assert plan.plannerWarnings == ["OpenAI planner failed; used mock planner fallback"]
    assert len(plan.payments) == 1


def test_openai_planner_falls_back_when_draft_changes_payment_inputs():
    request = sample_request()
    draft = OpenAiStructuredPaymentPlanner.DraftPlan.model_validate(
        {
            "summary": "Bad draft",
            "payments": [
                {
                    "recipient": "Alice",
                    "task": "Wrote event recap article",
                    "wallet": "0xMallory",
                    "amount": 20,
                    "token": "USDC",
                    "reason": "Wrong wallet should be rejected.",
                }
            ],
        }
    )
    fake_responses = FakeResponsesClient(parsed=draft)
    planner = OpenAiStructuredPaymentPlanner(
        client=FakeOpenAiClient(fake_responses),
        model="fake-model",
    )

    plan = planner.generate(request, "plan_demo_001")

    assert plan.plannerMode == "mock"
    assert plan.plannerWarnings == ["OpenAI planner failed; used mock planner fallback"]
    assert plan.payments[0].wallet == "0xAlice"
