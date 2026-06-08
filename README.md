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

当前仓库已经 scaffold 了 FastAPI 后端 MVP。它实现了 mock 版 Payment Plan、Risk Check、Execute Payment 和 Audit Report API，并预留了 Cobo Agentic Wallet adapter。

当前已有文件：

| 文件 | 用途 |
| --- | --- |
| `AGENTS.md` | 给 AI coding agent 的项目级工作规则 |
| `spec.md` | 后端 source of truth，包含 API、数据模型、风控、CAW 和验收标准 |
| `app/` | FastAPI MVP 服务代码 |
| `tests/` | pytest API 流程测试 |
| `requirements.txt` | Python 依赖锁定版本 |
| `docs/pm/` | 项目管理、站会、风险、提交和彩排清单 |
| `AgentCFO DAO AI财务官项目规划文档.md` | 黑客松项目规划原文 |

当前可运行 mock API 服务。真实 CAW 交易尚未接入；不要在 README 中补不存在的部署链接、Agent Wallet 地址或真实 tx hash。

## How To Work In This Repo

新队友或 AI agent 开始前按这个顺序读：

1. `README.md`：理解项目、Demo 和当前仓库状态。
2. `AGENTS.md`：理解在这个仓库里怎么工作、不能做什么。
3. `spec.md`：理解后端要实现的 API、模型、风险规则和验收标准。
4. `docs/pm/`：查看任务看板、站会、风险、提交和彩排清单。
5. `AgentCFO DAO AI财务官项目规划文档.md`：理解完整黑客松背景和团队分工。

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

详细接口和示例见 `spec.md`。

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
- **Storage**: In-memory MVP store
- **CAW**: Mock adapter only, no real credentials

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
.\.venv\Scripts\python -m pip install -r requirements.txt
```

运行测试：

```bash
.\.venv\Scripts\python -m pytest -q
```

启动开发服务：

```bash
.\.venv\Scripts\python -m uvicorn app.main:app --reload
```

默认服务地址：

```text
http://127.0.0.1:8000
```

FastAPI 自动 docs / OpenAPI 当前已关闭，以保证运行时只暴露四个 P0 API。后续进入联调或需要文档展示时，可以在 `app/main.py` 重新开启。

```text
P0 routes only:
POST /api/payment-plan
POST /api/risk-check
POST /api/execute-payment
GET  /api/audit-report/{auditReportId}
```

## Curl Verification

PowerShell 中建议使用 `curl.exe`，避免 `curl` alias 干扰。

创建 Payment Plan：

```bash
curl.exe -X POST http://127.0.0.1:8000/api/payment-plan -H 'Content-Type: application/json' -d '{"contributions":[{"name":"Alice","role":"Content Contributor","task":"Wrote event recap article","wallet":"0xAlice","amount":20,"token":"USDC"}],"budgetRule":{"monthlyBudget":50,"singlePaymentLimit":25,"allowedToken":"USDC","whitelist":["0xAlice"],"requiresHumanApproval":true}}'
```

执行 Risk Check：

```bash
curl.exe -X POST http://127.0.0.1:8000/api/risk-check -H 'Content-Type: application/json' -d '{"paymentPlanId":"plan_demo_001","budgetRule":{"monthlyBudget":50,"singlePaymentLimit":25,"allowedToken":"USDC","whitelist":["0xAlice"],"requiresHumanApproval":true}}'
```

执行 mock payment：

```bash
curl.exe -X POST http://127.0.0.1:8000/api/execute-payment -H 'Content-Type: application/json' -d '{"paymentPlanId":"plan_demo_001","approvedPaymentIds":["pay_001"],"humanApproval":{"approved":true,"approvedBy":"demo-operator"}}'
```

查看 Audit Report：

```bash
curl.exe http://127.0.0.1:8000/api/audit-report/audit_demo_001
```

所有执行结果当前都是 `mode="mock"`，`txHash=null`。

## Environment Variables

当前 MVP 不读取任何 CAW secrets。真实 CAW 接入时至少需要覆盖：

| 变量类别 | 用途 | 状态 |
| --- | --- | --- |
| LLM API key | 调用 Agent / LLM 生成 Payment Plan | 暂未接入 |
| CAW API key | 调用 Cobo Agentic Wallet | 待 CAW 同学提供 |
| CAW wallet id | 选择 Agent Wallet | 待 CAW 同学提供 |
| CAW base URL | CAW API endpoint | 待 CAW 同学提供 |
| Testnet config | 测试网链和 token 配置 | 待 CAW 同学提供 |

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
- README、`spec.md` 和实际实现保持一致。

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
- 接入 LLM planner。
- 实现 deterministic Risk Engine。
- 接入 CAW Adapter。当前为 MockCawAdapter。
- 输出 Audit Report。已完成 mock MVP。

P1:

- 部署后端服务。
- 增加持久化。
- 增加 CAW 状态轮询。
- 补齐运行方式和环境变量说明。

P2:

- Request Network invoice records。
- Sablier Flow payroll。
- Safe module references。
- Multi-agent treasury。
- Multi-chain support。

## Documentation Rules

- `AGENTS.md`：Agent 怎么工作。
- `spec.md`：后端应该做成什么样。
- `README.md`：人类如何理解项目、当前状态和下一步。

需求变化时，先更新 `spec.md`，再改代码。

## Demo Video

> 待录制

## License

MIT

