/**
 * API adapter layer.
 *
 * 当前阶段采用 Mock-first 策略。
 * 默认模式 `NEXT_PUBLIC_DEMO_MODE=mock` 不会调用真实后端。
 * 组件禁止直接 fetch，必须通过 domain-level adapter 获取数据。
 * 后续联调时，在 `lib/api/payment.ts`、`lib/api/caw.ts` 中补充真实请求逻辑。
 */

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE ?? "mock";

export function isMockMode(): boolean {
  return DEMO_MODE === "mock";
}

/**
 * 真实 API 请求入口。
 * 在 mock 模式下调用会抛出明确错误，防止业务层误打真实 API。
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (isMockMode()) {
    throw new Error(
      "request() was called in mock mode. Use domain-level mock adapters instead."
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  const response = await fetch(`${baseUrl}${path}`, init);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * @deprecated 保留兼容旧命名，内部转发到 request()
 */
export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  return request<T>(path, options);
}
