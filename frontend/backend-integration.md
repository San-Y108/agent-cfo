# AgentCFO Frontend — Backend Integration

> 前后端联调信息。后端契约真相见 `app/models.py` / `app/routers/payments.py` / `tests/test_mvp_flow.py`。
> 本轮不修改后端；本文件仅记录前端侧已知状态与联调待办。

## 1. 联调方式

### 本地
- frontend：`pnpm dev` → 默认 `http://localhost:3000`（若 3000 被占用，Next 会自动改用 `3001`，本机实测出现过）
- backend：`uvicorn app.main:app --reload --port 8000` → `http://127.0.0.1:8000`
- 切 real mode：`NEXT_PUBLIC_DEMO_MODE=real` + `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`

### 线上
- frontend（Vercel）：**https://agentcfo-frontend.vercel.app** —— 当前 mock mode
- backend（Render）：**TODO（URL 未知）**
- 线上切 real mode：把 Vercel 项目环境变量 `NEXT_PUBLIC_API_BASE_URL` 指向 Render URL，`NEXT_PUBLIC_DEMO_MODE` 设为 `real`，然后重新部署

## 2. 后端需要配置的 CORS origins

后端（Render / 本地 uvicorn）需允许以下来源。**当前后端尚未配置 CORS**，real mode 下浏览器跨域请求会被拦截，需后端补 `CORSMiddleware`：

```
https://agentcfo-frontend.vercel.app     # 线上前端
http://localhost:3000                     # 本地 dev（默认）
http://localhost:3100                     # 本地 dev（备用端口）
```

> 注：本机 dev 在 3000 被占用时实测落到 `http://localhost:3001`，如遇到可一并加入白名单。

## 3. 当前 API endpoints（4 个，prefix `/api`，返回后端裸对象）

| 方法 | 路径 | 前端 adapter（`lib/api/`） | 入参 → 出参 |
|---|---|---|---|
| POST | `/api/payment-plan` | `payment.ts` `createPaymentPlan` | `PaymentPlanRequest` → `PaymentPlan` |
| POST | `/api/risk-check` | `risk.ts` `runRiskCheck` | `RiskCheckRequest` → `RiskCheckResult` |
| POST | `/api/execute-payment` | `caw.ts` `executePayment` | `ExecutePaymentRequest` → `PaymentExecutionResult` |
| GET | `/api/audit-report/{auditReportId}` | `audit.ts` `getAuditReport` | → `AuditReport` |

调用链编排：`lib/workflow/run-demo-flow.ts` 的 `runDemoFlow()` 依次执行
`payment-plan → risk-check → execute-payment（自动批准非 blocked 项）→ audit-report`。

主要入参形状（完整定义见 `lib/api/types.ts`，镜像后端 Pydantic models）：
- `PaymentPlanRequest { contributions: ContributionRecord[]; budgetRule: BudgetRule }`
- `RiskCheckRequest { paymentPlanId: string; budgetRule: BudgetRule }`
- `ExecutePaymentRequest { paymentPlanId: string; approvedPaymentIds: string[]; humanApproval: { approved: boolean; approvedBy?: string } }`

## 4. 环境变量

| 变量 | 作用 | 当前值 |
|---|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | `mock` = 不打后端（默认）；`real` = 走 API base URL | `mock`（Vercel 生产已设） |
| `NEXT_PUBLIC_API_BASE_URL` | 后端地址 | `http://127.0.0.1:8000`（占位；real 线上需指向 Render URL） |

> `.env.example` 中另有 `NEXT_PUBLIC_TESTNET_NAME`、`NEXT_PUBLIC_AGENT_WALLET_ADDRESS` 两个变量，**契约对齐后已不再被 adapter 读取**（network / agentWalletAddress 改由后端响应提供），属遗留项，可在后续清理 `.env.example` 时一并移除。

## 5. 当前已完成

- ✅ **API types 对齐** — `lib/api/types.ts` 镜像后端 models（含 `PaymentStatus` / `RiskLevel` 枚举值）
- ✅ **adapter 对齐** — 4 个端点，返回后端裸对象，无 `ApiResponse` 信封
- ✅ **mock shape 对齐** — `lib/mock/*` 与后端输出同构同值（id `pay_NNN`、`reason`、risk strings、mock CAW：mode `mock` / network `mock-testnet` / `cawRequestId` / `txHash=null`）
- ✅ **workflow 层 real HTTP chain 已验证** — 本地 uvicorn + 等价 `runDemoFlow` 链路跑通 4 端点；后端 `pytest` 12 passed

## 6. 当前未完成

- ❌ `/demo` 页面 **real mode UI 接入**（页面读静态 `demoData`，未调用 `runDemoFlow`，无 loading / error 态）
- ❌ Render backend URL 未知
- ❌ Render CORS 未确认 / 未配置
- ❌ 线上 real mode 联调未完成

## 7. 下一步联调任务

1. **后端**：给出 Render URL，并配置 CORS（第 2 节三个 origin）。
2. **契约确认**：后端确认 `requiresHumanApproval`、blocked 判定、risk 字符串等与 `tests/test_mvp_flow.py` 一致（前端 mock 已按此对齐；任何字段变更需先同步契约）。
3. **前端**：把 `/demo` 接入 real mode —— client component + `runDemoFlow(demoData.request)` + loading / error 态 + UI 层 mock/real 切换。
4. **Vercel**：设置生产环境变量 `NEXT_PUBLIC_API_BASE_URL=<Render URL>`、按需 `NEXT_PUBLIC_DEMO_MODE=real`，重新部署。
5. **线上冒烟**：real mode 跑通 `payment-plan → risk-check → execute-payment → audit-report`，核对 tx hash / audit report 展示。
