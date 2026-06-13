from fastapi import APIRouter, HTTPException

from app.models import AgentChatRequest, AgentChatResponse, AgentChatResponseMessage
from app.services.agent_chat import generate_agent_chat_reply, is_agent_chat_configured

router = APIRouter(prefix="/api", tags=["agent"])


@router.post("/agent/chat", response_model=AgentChatResponse)
def agent_chat(request: AgentChatRequest) -> AgentChatResponse:
    if not is_agent_chat_configured():
        raise HTTPException(status_code=503, detail="Agent chat is not configured")

    try:
        content = generate_agent_chat_reply(
            request.messages,
            lang=request.lang,
            context=request.context,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"MiniMax request failed: {exc}") from exc

    return AgentChatResponse(message=AgentChatResponseMessage(content=content))
