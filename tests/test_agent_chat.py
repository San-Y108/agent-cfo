import os
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

os.environ["AGENTCFO_DB_PATH"] = ":memory:"
os.environ["CAW_ADAPTER_MODE"] = "mock"
os.environ.pop("MINIMAX_API_KEY", None)

from app.main import app
from app.services.agent_chat import _strip_redacted_thinking

client = TestClient(app)


def test_strip_redacted_thinking():
    raw = "<think>hidden</think>\n\nHello DAO."
    assert _strip_redacted_thinking(raw) == "Hello DAO."


def test_agent_chat_returns_503_when_not_configured(monkeypatch):
    monkeypatch.delenv("MINIMAX_API_KEY", raising=False)
    response = client.post(
        "/api/agent/chat",
        json={
            "messages": [{"role": "user", "content": "Hello"}],
            "lang": "en",
        },
    )
    assert response.status_code == 503


def test_agent_chat_returns_assistant_message(monkeypatch):
    monkeypatch.setenv("MINIMAX_API_KEY", "test-key")

    mock_choice = MagicMock()
    mock_choice.message.content = "Treasury looks healthy."
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]

    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = mock_response
    monkeypatch.setattr(
        "app.services.agent_chat.OpenAI",
        lambda *args, **kwargs: mock_client,
    )

    response = client.post(
        "/api/agent/chat",
        json={
            "messages": [{"role": "user", "content": "How is treasury?"}],
            "lang": "en",
            "context": {"monthlyBudget": 50, "recordCount": 4},
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["message"]["role"] == "assistant"
    assert body["message"]["content"] == "Treasury looks healthy."
