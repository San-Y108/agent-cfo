# AgentCFO Frontend — Backend Integration

> 前后端联调信息。后端契约真相见 `app/models.py` / `app/routers/payments.py` / `tests/test_mvp_flow.py`。
> 本轮不修改后端；本文件仅记录前端侧已知状态与联调待办。

## 1. 联调方式

### 本地
- frontend：`PORT=3100 pnpm dev` → `http://localhost:3100`
- backend：`uvicorn app.main:app --reload --port 8000` → `http://127.0.0.1:8000`
- 切 real mode：`NEXT_PUBLIC_DEMO_MODE=real` + `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`

### 线上
- frontend（Vercel）：**https://agentcfo-frontend.vercel.app** — mock mode
- backend（Render）：**TODO（URL 未知）**
- 线上 real mode：Vercel 设 `NEXT_PUBLIC_API_BASE_URL=<Render URL>`、`NEXT_PUBLIC_DEMO_MODE=real`，重新部署

## 2. 后端需要配置的 CORS origins

```
https://agentcfo-frontend.vercel.app
http://localhost:3000
http://localhost:3100
```

> 当前后端**尚未配置 CORS**，real mode 浏览器请求会被拦截。

## 3. API endpoints（4 个，prefix `/api`）

| 方法 | 路径 | adapter（`lib/api/`） | 入参 → 出参 |
|---|---|---|---|
| POST | `/api/payment-plan` | `payment.ts` `createPaymentPlan` | `PaymentPlanRequest` → `PaymentPlan` |
| POST | `/api/risk-check` | `risk.ts` `runRiskCheck` | `RiskCheckRequest` → `RiskCheckResult` |
| POST | `/api/execute-payment` | `caw.ts` `executePayment` | `ExecutePaymentRequest` → `PaymentExecutionResult` |
| GET | `/api/audit-report/{auditReportId}` | `audit.ts` `getAuditReport` | → `AuditReport` |

调用链：`lib/workflow/run-demo-flow.ts` → `runDemoFlow()`  
顺序：`payment-plan → risk-check → execute-payment → audit-report`

主要入参（完整定义见 `lib/api/types.ts`）：
- `PaymentPlanRequest { contributions, budgetRule }`
- `RiskCheckRequest { paymentPlanId, budgetRule }`
- `ExecutePaymentRequest { paymentPlanId, approvedPaymentIds, humanApproval }`

## 4. 环境变量

| 变量 | 作用 | 当前值（Vercel 生产） |
|---|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | `mock` / `real` | `mock` |
| `NEXT_PUBLIC_API_BASE_URL` | 后端地址 | `http://127.0.0.1:8000`（占位） |

## 5. 已完成

- ✅ API types / adapter / mock shape 对齐后端
- ✅ `runDemoFlow()` 本地 uvicorn 链路验证；`pytest` 12 passed
- ✅ **Console Treasury real mode** — `console-state` 在 `NEXT_PUBLIC_DEMO_MODE=real` 时调用 `payment-plan → risk-check → execute-payment → audit-report`；mock 行为不变
- ✅ Treasury API 错误横幅 + `flowError` 状态
- ✅ Console Navbar：**EN/中** 语言切换 + Mock/Real 模式徽章
- ✅ 后端 CORS 默认含 `localhost:3100` 与 Vercel 生产域

## 6. 未完成

- ❌ Render backend URL 未知（线上 real mode）
- ❌ 线上 Vercel env 仍为 mock；需设 `NEXT_PUBLIC_DEMO_MODE=real` + Render URL 后重部署
- ⚠️ Agent Hub Chat / QuickActions 仍为 mock（P1）

## 7. 下一步联调任务

1. 本地 real mode 冒烟：
   ```bash
   # terminal 1
   uvicorn app.main:app --reload --port 8000
   # terminal 2
   cd frontend && set NEXT_PUBLIC_DEMO_MODE=real&& set NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000&& set PORT=3100&& pnpm dev
   ```
2. Render URL 就绪后更新 Vercel env 并部署
3. Agent Hub QuickActions 与 Treasury 流程联动（P1）
