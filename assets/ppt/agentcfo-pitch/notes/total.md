# AgentCFO Pitch — Speaker Notes

## 01 Cover
大家好，我们是 AgentCFO——给每个 DAO 一个带受控钱包的 AI 财务官。参赛赛道是 Cobo Agentic Commerce。接下来用 3 分钟展示：问题、方案、Demo 和 CAW 证据。

## 02 Problem
DAO 小团队付款有四大痛点：人工表格易错、支出不透明、多签效率低、全自动又有风险。AgentCFO 的目标是在效率和安全之间找到平衡。

## 03 Solution
我们的核心边界很清晰：Agent 负责规划和解释，Risk Engine 做确定性风控，Human Approval 保留确认权，CAW 负责受控执行，Audit Report 串联全链路证据。

## 04 Flow
端到端流程：贡献记录 → 付款计划 → 风险检查 → 人工确认 → CAW 执行 → Tx Hash → 审计报告。Blocked 付款不会进入 CAW，Mock 模式必须明确标注。

## 05 Features
六大能力：AI Payment Plan、Risk Check、Human Approval、CAW Execution、Audit Report、Mock Mode。前后端已分别部署到 Vercel 和 Render。

## 06 Architecture
架构分层：前端、FastAPI 后端、LLM Planner、Risk Engine、Human Gate、CAW Adapter、Audit Report。每层职责单一，LLM 不是最终授权层。

## 07 Demo
Demo 场景四名对象：Alice 和 Charlie 可执行，Bob 因白名单被 Blocked，Data API 是工具订阅。前端可展示 risk badge 和 blocked 原因。

## 08 CAW Evidence
Phase 4C 已完成 1 笔 Sepolia testnet 低额转账，有真实 tx hash 和 request_id。但默认线上仍是 mock mode，真实转账需显式配置和人工批准。

## 09 Tech Stack
技术栈：Python + FastAPI + Pydantic + pytest + SQLite + cobo-agentic-wallet SDK。Planner 默认 mock，可显式启用 OpenAI Structured Outputs。

## 10 API
P0 五个核心 API 覆盖完整 Demo 流程。另外还有 CAW status 查询和 refresh 接口，Audit Report 是不可变快照。

## 11 Roadmap
P0/P1 核心能力已完成并部署。P2 是 demo-safe 扩展，包括 Request Finance、Sablier、Safe 等参考能力，live integration 需明确批准。

## 12 Why Cobo
匹配 Cobo 赛道三个方向：Agent-Native Payments、Agent Resource Procurement、A2A Treasury Management。CAW 是我们受控执行的核心。

## 13 Team
五人分工：交付总控、物料设计、前端、后端 Agent、合约 CAW。各司其职，README 和代码保持一致。

## 14 Ending
AgentCFO：Controlled AI Treasury for DAOs。欢迎访问前端和后端 Demo，GitHub 开源。谢谢！
