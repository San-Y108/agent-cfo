import os
from typing import Literal

from openai import OpenAI

from app.models import AgentChatContext, AgentChatMessage

DEFAULT_MINIMAX_BASE_URL = "https://api.minimaxi.com/v1"
DEFAULT_MINIMAX_MODEL = "MiniMax-M2.5-highspeed"
MAX_HISTORY_MESSAGES = 20


def get_minimax_config() -> tuple[str, str, str]:
    api_key = os.getenv("MINIMAX_API_KEY", "").strip()
    base_url = os.getenv("MINIMAX_BASE_URL", DEFAULT_MINIMAX_BASE_URL).strip()
    model = os.getenv("MINIMAX_MODEL", DEFAULT_MINIMAX_MODEL).strip()
    return api_key, base_url, model


def is_agent_chat_configured() -> bool:
    return bool(get_minimax_config()[0])


def build_system_prompt(lang: Literal["en", "zh"], context: AgentChatContext | None) -> str:
    if lang == "zh":
        intro = (
            "你是 AgentCFO，一个 DAO 财务智能体助手。"
            "你帮助 DAO 运营者理解贡献记录、预算规则、付款计划、风控结果与 CAW 执行状态。"
            "回答要简洁、专业、可执行。不要编造 tx hash 或链上结果。"
            "若用户要求执行付款，提醒其需通过 Console 的人工审批与风控流程。"
        )
    else:
        intro = (
            "You are AgentCFO, an AI treasury assistant for DAOs. "
            "You help operators understand contribution records, budget rules, payment plans, "
            "risk checks, and CAW execution status. "
            "Keep answers concise, professional, and actionable. "
            "Never invent tx hashes or on-chain results. "
            "If the user asks to execute payments, remind them about human approval and risk checks."
        )

    if context is None:
        return intro

    lines = [intro, "", "Current console context:"]
    if context.monthlyBudget is not None:
        lines.append(f"- Monthly budget: {context.monthlyBudget}")
    if context.singlePaymentLimit is not None:
        lines.append(f"- Single payment limit: {context.singlePaymentLimit}")
    if context.allowedToken:
        lines.append(f"- Allowed token: {context.allowedToken}")
    if context.whitelist:
        lines.append(f"- Whitelist wallets: {', '.join(context.whitelist)}")
    if context.recordCount is not None:
        lines.append(f"- Contribution records loaded: {context.recordCount}")
    if context.planItemCount is not None:
        lines.append(f"- Payment plan items: {context.planItemCount}")
    if context.planSummary:
        lines.append(f"- Plan summary: {context.planSummary}")
    if context.flowStep is not None:
        lines.append(f"- Treasury flow step: {context.flowStep}")

    return "\n".join(lines)


def generate_agent_chat_reply(
    messages: list[AgentChatMessage],
    *,
    lang: Literal["en", "zh"] = "en",
    context: AgentChatContext | None = None,
    client: OpenAI | None = None,
) -> str:
    api_key, base_url, model = get_minimax_config()
    if not api_key:
        raise RuntimeError("MINIMAX_API_KEY is not configured")

    llm = client or OpenAI(api_key=api_key, base_url=base_url)
    history = messages[-MAX_HISTORY_MESSAGES:]
    payload = [
        {"role": "system", "content": build_system_prompt(lang, context)},
        *[{"role": message.role, "content": message.content} for message in history],
    ]

    response = llm.chat.completions.create(
        model=model,
        messages=payload,
        max_tokens=1024,
        extra_body={"reasoning_split": True},
    )
    content = response.choices[0].message.content
    if not content or not content.strip():
        raise RuntimeError("MiniMax returned an empty response")
    return _strip_redacted_thinking(content.strip())


def _strip_redacted_thinking(content: str) -> str:
    """Remove legacy thinking wrapper if the model returns native format."""
    if "<think>" not in content:
        return content
    marker = "</think>"
    if marker in content:
        return content.split(marker, 1)[1].strip()
    return content.replace("<think>", "").strip()
