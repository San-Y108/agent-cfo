/**
 * API adapter base layer.
 *
 * Mock-first 策略：默认 `NEXT_PUBLIC_DEMO_MODE=mock` 不调用真实后端。
 * 组件禁止直接 fetch，必须通过 domain-level adapter（payment/risk/caw/audit）取数。
 * real mode 下 adapter 直接返回后端裸对象（无 ApiResponse 包裹）。
 */

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE ?? "mock";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export function isMockMode(): boolean {
  return DEMO_MODE === "mock";
}

/**
 * 真实 API 请求入口。后端返回裸 JSON 对象，直接作为 T 返回。
 * mock 模式下调用会抛错，防止业务层在 mock 模式误打真实 API。
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (isMockMode()) {
    throw new Error(
      "request() was called in mock mode. Use lib/mock data or switch NEXT_PUBLIC_DEMO_MODE=real."
    );
  }

  const response = await fetch(`${API_BASE_URL}${path}`, init);

  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { detail?: string };
      detail = body?.detail ? ` - ${body.detail}` : "";
    } catch {
      // response had no JSON body
    }
    throw new Error(`API request failed: ${response.status}${detail}`);
  }

  return response.json() as Promise<T>;
}

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export function postJson<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}
