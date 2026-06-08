# AgentCFO | DAO AI 财务官

AgentCFO 是面向 Web3 小团队 / DAO 的 AI 财务官。它读取贡献记录、预算规则和付款需求，生成 Payment Plan，执行 Risk Check，在 Human Approval 之后通过 Cobo Agentic Wallet 完成受控测试网付款，并输出 Audit Report。

一句话：Give every DAO an AI CFO with a controlled wallet.

## Key Features

- AI Payment Plan：根据贡献记录生成结构化付款计划和付款原因。
- Risk Check：检查预算、白名单、单笔限额、token 和重复付款。
- Human Approval：付款执行前必须有人类确认。
- Cobo Agentic Wallet Execution：真实付款路径必须经过 CAW。
- Audit Report：输出付款原因、风险结果、执行状态、剩余预算和 tx hash。
- Mock Mode：CAW 不稳定时可演示完整流程，但必须清楚标注为 mock。

## Demo Flow

```text
Contribution Records
-> AI Payment Plan
-> Risk Check
-> Human Approval
-> Cobo Agentic Wallet Execution
-> Tx Hash
-> Audit Report
```

MVP Demo 场景：

- Alice：内容贡献，20 USDC
- Bob：设计海报，15 USDC，示例中可用于展示白名单风险
- Charlie：社群运营，10 USDC
- Data API：工具订阅，5 USDC

AgentCFO 需要展示：哪些付款可以执行、哪些付款被 blocked、为什么 blocked、最终 CAW 返回了什么交易结果。

## Repository Status

当前仓库是 AgentCFO 后端规划仓库，尚未 scaffold 具体后端工程。

当前已有文件：

| 文件 | 用途 |
| --- | --- |
| `AGENTS.md` | 给 AI coding agent 的项目级工作规则 |
| `spec.md` | 后端 source of truth，包含 API、数据模型、风控、CAW 和验收标准 |
| `AgentCFO DAO AI财务官项目规划文档.md` | 黑客松项目规划原文 |

当前暂无可运行服务。

不要在 README 中补不存在的启动命令、部署链接、Agent Wallet 地址或 tx hash。等后端工程创建和 CAW 联调完成后再补充。

## How To Work In This Repo

新队友或 AI agent 开始前按这个顺序读：

1. `README.md`：理解项目、Demo 和当前仓库状态。
2. `AGENTS.md`：理解在这个仓库里怎么工作、不能做什么。
3. `spec.md`：理解后端要实现的 API、模型、风险规则和验收标准。
4. `AgentCFO DAO AI财务官项目规划文档.md`：理解完整黑客松背景和团队分工。

后端开发原则：

- 先跑通 P0 demo loop，再考虑 P1/P2。
- 不提前实现 Request Network、Sablier、Safe、多链、多 Agent。
- 不选择技术栈，除非团队明确确认。
- 不把 LLM 当作最终授权层。
- 不把 mock transaction 当作真实 CAW 交易。

## Backend Scope

P0 APIs:

| API | 目的 |
| --- | --- |
| `POST /api/payment-plan` | 输入贡献记录和预算规则，输出 Payment Plan |
| `POST /api/risk-check` | 对 Payment Plan 执行确定性风险检查 |
| `POST /api/execute-payment` | 人工确认后，通过 CAW 执行可付款项 |
| `GET /api/audit-report/:id` | 返回最终 Audit Report |

详细接口和示例见 `spec.md`。

## Architecture

目标后端应拆成这些边界：

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

## Local Development

当前暂无可运行服务，因为后端工程尚未创建。

下一步创建后端工程时，需要先确定：

- 技术栈：例如 Node.js / TypeScript 或 Python / FastAPI。
- 包管理器和启动命令。
- 测试框架。
- 环境变量命名。
- CAW adapter 的 SDK 或 HTTP 接入方式。

确定技术栈后，再在本节补充：

```bash
# 示例占位：不要在未 scaffold 前使用
# install command
# dev server command
# test command
```

## Environment Variables

当前尚未确定最终环境变量名。创建后端工程时，至少需要覆盖：

| 变量类别 | 用途 | 状态 |
| --- | --- | --- |
| LLM API key | 调用 Agent / LLM 生成 Payment Plan | 待技术栈确认 |
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

## Roadmap

P0:

- Scaffold backend。
- 实现四个 P0 API。
- 接入 LLM planner。
- 实现 deterministic Risk Engine。
- 接入 CAW Adapter。
- 输出 Audit Report。

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

