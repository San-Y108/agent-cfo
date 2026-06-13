import { API_BASE_URL } from "@/lib/api/client";
import type { AgentChatRequest, AgentChatResponse } from "@/lib/api/types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

/**
 * Agent Hub chat — always calls backend (independent of treasury mock/real mode).
 * API key stays on the server; frontend only talks to `/api/agent/chat`.
 */
export async function agentChat(
  payload: AgentChatRequest
): Promise<AgentChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/agent/chat`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { detail?: string };
      detail = body?.detail ? ` - ${body.detail}` : "";
    } catch {
      // response had no JSON body
    }
    throw new Error(`Agent chat failed: ${response.status}${detail}`);
  }

  return response.json() as Promise<AgentChatResponse>;
}
