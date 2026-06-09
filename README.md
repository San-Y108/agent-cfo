# AgentCFO | DAO AI 财务官

> Give every DAO an AI CFO with a controlled wallet.

AgentCFO 是面向 Web3 小团队 / DAO 的 AI 财务官。它读取贡献记录、预算规则和付款需求，生成 Payment Plan，执行 Risk Check，在 Human Approval 之后通过 Cobo Agentic Wallet 完成受控测试网付款，并输出 Audit Report。

赛道：Cobo Agentic Commerce

## Key Features

- AI Payment Plan：根据贡献记录生成结构化付款计划和付款原因。
- Risk Check：检查预算、白名单、单笔限额、token 和重复付款。
- Human Approval：付款执行前必须有人类确认。
- Cobo Agentic Wallet Execution：真实付款路径必须经过 CAW。
- Audit Report：输出付款原因、风险结果、执行状态、剩余预算和 tx hash。
- Mock Mode：CAW 不稳定时可演示完整流程，但必须清楚标注为 mock。

## Problem

DAO 小团队经常遇到：

- 贡献者结算靠人工表格，容易漏发、错发、重复发。
- DAO 支出不透明，事后很难追踪。
- 普通多签虽然安全，但每笔小额付款都要多人确认，效率低。
- 完全自动化又有风险，容易失控。

## Solution

AgentCFO 的核心边界：

- Agent 负责整理贡献记录、生成付款计划和解释付款原因。
- Risk Engine 负责确定性风控。
- Human Approval 保留关键确认权。
- Cobo Agentic Wallet 负责受控资金执行。
- Audit Report 把计划、风险、审批和执行结果串成可审计记录。

```text
Contribution Records
-> AI Payment Plan
-> Risk Check
-> Human Approval
-> Cobo Agentic Wallet Execution
-> Tx Hash
-> Audit Report
```

## Why Cobo Agentic Commerce

| 方向 | AgentCFO 如何匹配 |
| --- | --- |
| Agent-Native Payments | Agent 根据贡献记录和预算规则，自动生成付款计划并发起付款 |
| Agent Resource Procurement | Agent 可判断 DAO 需要支付哪些工具订阅、服务费用，在预算范围内完成结算 |
| A2A Economy / Treasury Management | 后续可扩展多个 Agent 各自管理不同部门预算，统一向 DAO Treasury 汇报 |

## Demo Scenario

MVP Demo 场景：

| 对象 | 类型 | 说明 | 金额 |
| --- | --- | --- | --- |
| Alice | 贡献者 | 写了一篇活动复盘 | 20 USDC |
| Bob | 贡献者 | 设计了活动海报，可用于展示白名单风险 | 15 USDC |
| Charlie | 贡献者 | 维护社群并整理数据 | 10 USDC |
| Data API | 工具订阅 | 本月数据服务订阅费 | 5 USDC |

AgentCFO 需要展示：哪些付款可以执行、哪些付款被 blocked、为什么 blocked、最终 CAW 返回了什么交易结果。

## Repository Status

当前仓库实现了 FastAPI 后端 MVP，包含 mock 和真实 CAW 两套适配器。后端已部署到 Render，前端已部署到 Vercel。

当前已有文件：

| 文件 | 用途 |
| --- | --- |
| `README.md` | 项目入口、运行方式、联调方式和当前限制 |
| `app/` | FastAPI MVP 服务代码 |
| `tests/` | pytest API 流程测试 |
| `requirements.txt` | Python 依赖锁定版本 |
| `docs/pm/` | 项目管理、站会、风险、提交和彩排清单 |

当前可运行 mock API 服务。真实 CAW 配置已到位（API Key + Wallet + SDK），后端可开始替换 mock adapter。

## How To Work In This Repo

新队友或 AI agent 开始前按这个顺序读：

1. `README.md`：理解项目、Demo 和当前仓库状态。
2. `app/`：查看 FastAPI 路由、模型、风控服务和 CAW adapter。
3. `tests/`：查看 P0 mock API 的可执行验收用例。
4. `docs/pm/`：查看任务看板、站会、风险、提交和彩排清单。

后端开发原则：

- 先跑通 P0 demo loop，再考虑 P1/P2。
- 不提前实现 Request Network、Sablier、Safe、多链、多 Agent。
- 当前技术栈是 Python + FastAPI + Pydantic + pytest。
- 不把 LLM 当作最终授权层。
- 不把 mock transaction 当作真实 CAW 交易。

## Backend Scope

P0 APIs:

| API | 目的 |
| --- | --- |
| `POST /api/payment-plan` | 输入贡献记录和预算规则，输出 Payment Plan |
| `POST /api/risk-check` | 对 Payment Plan 执行确定性风险检查 |
| `POST /api/execute-payment` | 人工确认后，通过 CAW 执行可付款项 |
| `GET /api/audit-report/{auditReportId}` | 返回最终 Audit Report |

详细接口以 `app/routers/payments.py`、`app/models.py` 和 README 的 curl.exe 示例为准。

## Architecture

当前后端按这些边界拆分：

```text
Frontend
-> Backend API
-> Agent / LLM Planner
-> Risk Engine
-> Human Approval Gate
-> CAW Adapter
-> Audit Report
```

关键原则：

- Agent / LLM 负责生成计划和解释原因。
- Risk Engine 负责确定性规则检查。
- Human Approval Gate 负责阻止未确认付款。
- CAW Adapter 负责隔离 Cobo Agentic Wallet 调用。
- Audit Report 负责把输入、计划、风险、批准和执行结果串起来。

## Cobo Agentic Wallet Evidence

以下内容需要合约 / CAW 同学在联调后补充，不能编造：

| 证据项 | 当前状态 |
| --- | --- |
| Agent Wallet Address | 待补充 |
| Testnet / Chain | 待补充 |
| Token | 待补充 |
| Transaction Hash | 待补充 |
| CAW Request ID | 待补充 |
| CAW config notes | 待补充 |
| Payment screenshots | 待补充 |

真实付款必须通过 Cobo Agentic Wallet。Mock mode 只能用于演示兜底，必须明确标注。

## Tech Stack

- **Language**: Python 3.14 当前本机可用；如依赖安装失败，改用 Python 3.12/3.13。
- **Framework**: FastAPI
- **Validation**: Pydantic
- **Testing**: pytest + FastAPI TestClient
- **Server**: Uvicorn
- **Storage**: SQLite demo store with repository abstraction
- **CAW**: Cobo Agentic Wallet SDK (cobo-agentic-wallet v0.1.40), real credentials configured

## Local Development

## Teammate Handoff

如果你是前端或 CAW 同学，按下面步骤拿到后端 mock API：

```bash
git clone https://github.com/San-Y108/agent-cfo.git
cd agent-cfo
```

如果你已经 clone 过仓库：

```bash
git pull
```

确认当前后端交付提交：

```bash
git log --oneline --max-count=3
```

你应该能看到类似提交：

```text
3d63bfc Implement FastAPI backend P0 mock APIs
```

然后继续执行下面的 Local Development 步骤创建虚拟环境、安装依赖、运行测试和启动服务。

创建虚拟环境：

```bash
python -m venv .venv
```

安装依赖：

```bash
.venv/bin/python -m pip install -r requirements.txt
```

运行测试：

```bash
.venv/bin/python -m pytest -q
```

启动开发服务：

```bash
.venv/bin/python -m uvicorn app.main:app --reload
```

默认服务地址：

```text
http://127.0.0.1:8000
```

健康检查：

```bash
curl.exe http://127.0.0.1:8000/health
```

FastAPI 自动 docs / OpenAPI 当前已关闭，以保证运行时只暴露四个 P0 业务 API 和部署健康检查。后续进入联调或需要文档展示时，可以在 `app/main.py` 重新开启。

```text
P0 routes only:
POST /api/payment-plan
POST /api/risk-check
POST /api/execute-payment
GET  /api/audit-report/{auditReportId}
GET  /api/caw-status/{cawRequestId}
GET  /health
```

## Render Deployment

Phase 1 demo backend can be deployed as a Render Web Service.

Render settings:

```text
Build command: pip install -r requirements.txt
Start command: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Render environment variables:

```text
PYTHON_VERSION=3.13.5
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.example
```

Production must set `CORS_ALLOWED_ORIGINS` to the actual frontend origin. If this variable is not set, the backend only uses local development defaults:

```text
http://localhost:5173
http://127.0.0.1:5173
http://localhost:3000
```

Deployed health check:

部署后端验证：

```bash
curl https://agentcfo-backend.onrender.com/health
```

预期返回：

```json
{"status":"ok","service":"agent-cfo-backend"}
```

此部署仍为 mock 后端模式：无真实 OpenAI planner，无真实 Cobo Agentic Wallet 执行，无 `.env`，仓库中无 secrets。

## Persistence

The backend now uses a repository abstraction with SQLite as the default local demo store. The database path is configured with:

```text
AGENTCFO_DB_PATH=agentcfo_demo.sqlite3
```

If `AGENTCFO_DB_PATH` is not set, the backend writes to `agentcfo_demo.sqlite3` in the current working directory. Tests use an in-memory SQLite database and reset state before each test.

For temporary local demos, you can force the old in-memory store:

```text
AGENTCFO_STORE_BACKEND=memory
```

On Render, SQLite is only suitable for a single-instance demo. To keep SQLite data across deploys or restarts, attach a Render persistent disk and set `AGENTCFO_DB_PATH` to a path on that disk. If SQLite is stored on Render's normal ephemeral filesystem, deploys or restarts can lose the database file. For long-running audit storage, multi-instance services, or production-like usage, use Postgres in a later phase instead.

Audit Reports are saved as execution-time snapshots. Later CAW status refreshes must not rewrite historical Audit Report content.

## Curl Verification

验证本地后端 API：

创建 Payment Plan：

```bash
curl -X POST http://127.0.0.1:8000/api/payment-plan -H 'Content-Type: application/json' -d '{"contributions":[{"name":"Alice","role":"Content Contributor","task":"Wrote event recap article","wallet":"0xAlice","amount":20,"token":"USDC"}],"budgetRule":{"monthlyBudget":50,"singlePaymentLimit":25,"allowedToken":"USDC","whitelist":["0xAlice"],"requiresHumanApproval":true}}'
```

执行 Risk Check：

```bash
curl -X POST http://127.0.0.1:8000/api/risk-check -H 'Content-Type: application/json' -d '{"paymentPlanId":"plan_demo_001","budgetRule":{"monthlyBudget":50,"singlePaymentLimit":25,"allowedToken":"USDC","whitelist":["0xAlice"],"requiresHumanApproval":true}}'
```

执行 mock payment：

```bash
curl -X POST http://127.0.0.1:8000/api/execute-payment -H 'Content-Type: application/json' -d '{"paymentPlanId":"plan_demo_001","approvedPaymentIds":["pay_001"],"humanApproval":{"approved":true,"approvedBy":"demo-operator"}}'
```

查看 Audit Report：

```bash
curl http://127.0.0.1:8000/api/audit-report/audit_demo_001
```

查看 mock CAW status：

```bash
curl http://127.0.0.1:8000/api/caw-status/mock_caw_exec_demo_001_pay_001
```

验证部署后端：

```bash
curl https://agentcfo-backend.onrender.com/health
```

所有执行结果当前都是 `mode="mock"`，`txHash=null`。

## Environment Variables

当前 MVP 不读取任何 CAW secrets。真实 CAW 接入时至少需要覆盖：

| 变量类别 | 用途 | 状态 |
| --- | --- | --- |
| LLM API key | 调用 Agent / LLM 生成 Payment Plan | Phase 2 OpenAI planner 已开发 |
| CAW API key | 调用 Cobo Agentic Wallet | ✅ 已配置 |
| CAW wallet id | 选择 Agent Wallet | ✅ 已配置 |
| CAW base URL | CAW API endpoint | ✅ 已配置 |
| Testnet config | 测试网链和 token 配置 | ✅ 已配置（SETH/Sepolia） |
| AGENTCFO_DB_PATH | SQLite demo database path | 可选，本地默认 `agentcfo_demo.sqlite3` |
| AGENTCFO_STORE_BACKEND | 可选切回 in-memory store | 仅本地临时 demo 使用 |

不要提交 `.env`、API key、private key、token 或生产钱包凭证。

## Testing And Acceptance

后端完成前至少要验证：

- Payment Plan schema validation。
- Budget exceeded 会 block。
- Single payment limit exceeded 会 block。
- Non-whitelisted wallet 会 block。
- Duplicate task 或 duplicate recipient 会被识别。
- Missing human approval 不会执行付款。
- Blocked payment 不会发送到 CAW adapter。
- CAW adapter failure 会进入 Audit Report。
- Mock execution 明确标注为 mock。

完成标准：

- 四个 P0 API 支持完整 Demo flow。
- 前端可以展示 Payment Plan、Risk Check、Execution Result 和 Audit Report。
- 至少一笔 CAW testnet transaction 有真实证据，或明确标注当前使用 mock mode。
- README 和实际实现保持一致。

## Project Management

- [任务看板](docs/pm/TASK_BOARD.md)
- [每日站会模板](docs/pm/DAILY_STANDUP.md)
- [风险日志](docs/pm/RISK_LOG.md)
- [提交材料清单](docs/pm/SUBMISSION_CHECKLIST.md)
- [Demo 彩排检查清单](docs/pm/DEMO_REHEARSAL_CHECKLIST.md)
- [群消息模板库](docs/pm/TEAM_SYNC_MESSAGES.md)
- [交付总控报告](docs/pm/DELIVERY_MASTER_REPORT_2026-06-08.md)

## Team

| 角色 | 职责 |
| --- | --- |
| 交付 / 路演 / 总控 | 项目统筹、路演、GitHub、最终交付 |
| 物料 / 设计 / 内容 | PPT、海报、视频、文案 |
| 前端 | 产品界面 + Mock 模式 |
| 后端 / Agent | FastAPI + Agent 付款计划 + 风险检查 |
| 合约 / CAW | Cobo Agentic Wallet 集成 + 测试网付款 |

## Roadmap

P0:

- Scaffold backend。已完成 mock MVP。
- 实现四个 P0 API。已完成 mock MVP。
- 接入 LLM planner。Phase 2 OpenAI planner 已开发（phase2-openai-planner 分支）。
- 实现 deterministic Risk Engine。已完成，6 条规则。
- 接入 CAW Adapter。当前为 MockCawAdapter，真实 CAW 配置已到位。
- 输出 Audit Report。已完成 mock MVP。

P1:

- 部署后端服务。✅ 已部署到 Render。
- 增加持久化。✅ SQLiteStore 已实现。
- 增加 CAW 状态轮询。✅ GET /api/caw-status/{id} 已实现。
- 补齐运行方式和环境变量说明。✅ README 已更新。

P2:

- Request Network invoice records。
- Sablier Flow payroll。
- Safe module references。
- Multi-agent treasury。
- Multi-chain support。

## Documentation Rules

- `README.md` 是项目入口，记录运行、测试、联调方式和当前限制。
- 代码里的 `app/models.py`、`app/routers/payments.py`、`app/services/` 是当前 P0 API 和业务规则的准确信息来源。
- 需求变化时，先更新 README 的联调说明和对应测试，再改实现。

## Demo Video

> 待录制

## License

MIT
