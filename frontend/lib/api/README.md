# lib/api/

API 客户端与类型定义，镜像后端 Pydantic models。

## 文件

| 文件 | 用途 |
|---|---|
| `types.ts` | 共享 API 类型（`PaymentPlan` · `RiskCheckResult` · 枚举等） |
| `client.ts` | `request()` 封装；mock 模式抛错防误打后端 |
| `payment.ts` | `POST /api/payment-plan` |
| `risk.ts` | `POST /api/risk-check` |
| `caw.ts` | `POST /api/execute-payment` |
| `audit.ts` | `GET /api/audit-report/{id}` |
| `p2.ts` | P2 扩展端点（如有） |

## 规则

- 返回后端**裸对象**，无 `ApiResponse<T>` 信封
- 字段名 / 枚举以 `app/models.py` 为准
- 禁止自行发明 endpoint 或 response wrapper

## 调用入口

`lib/workflow/run-demo-flow.ts` 的 `runDemoFlow()` 编排完整 real 链路。
