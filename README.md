# AgentCFO | DAO AI 财务官

> **Give every DAO an AI CFO with a controlled wallet.**

AgentCFO 是面向 Web3 小团队 / DAO 的 AI 财务官。它读取贡献记录、预算规则和付款需求，自动生成付款计划，检查预算、白名单、单笔限额、重复付款等风险，并通过 Cobo Agentic Wallet 在受控权限内执行测试网付款，最后输出可审计的结算报告。

**赛道：Cobo Agentic Commerce**

---

## 问题

DAO 小团队经常遇到：

- 贡献者结算靠人工表格，容易漏发、错发、重复发。
- DAO 支出不透明，事后很难追踪。
- 普通多签虽然安全，但每笔小额付款都要多人确认，效率低。
- 完全自动化又有风险，容易失控。

## 解决方案

**Agent 负责整理、判断和生成付款计划，CAW 负责受控执行资金，人类保留关键确认权。**

```
贡献记录输入
  → AgentCFO 解析任务
  → 生成付款计划
  → 风险检查：预算、白名单、限额、重复付款
  → 人类确认
  → Cobo Agentic Wallet 执行付款
  → 链上交易完成
  → 生成审计报告
```

## 为什么适合 Cobo Agentic Commerce

| 方向 | AgentCFO 如何匹配 |
|------|-------------------|
| Agent-Native Payments | Agent 根据贡献记录和预算规则，自动生成付款计划并发起付款 |
| Agent Resource Procurement | Agent 可判断 DAO 需要支付哪些工具订阅、服务费用，在预算范围内完成结算 |
| A2A Economy / Treasury Management | 后续可扩展多个 Agent 各自管理不同部门预算，统一向 DAO Treasury 汇报 |

## Demo 场景

一个 Web3 小团队本月有 3 个贡献者和 1 个工具订阅费用：

| 对象 | 类型 | 说明 | 金额 |
|------|------|------|------|
| Alice | 贡献者 | 写了一篇活动复盘 | 20 USDC |
| Bob | 贡献者 | 设计了活动海报 | 15 USDC |
| Charlie | 贡献者 | 维护社群并整理数据 | 10 USDC |
| Data API | 工具订阅 | 本月数据服务订阅费 | 5 USDC |

AgentCFO 读取这份记录后：

1. 自动识别收款人、金额、钱包地址和付款原因。
2. 检查是否超过预算。
3. 检查是否超过单笔限额。
4. 检查钱包地址是否在白名单内。
5. **Bob 的地址不在白名单，被标记为 Blocked。**
6. 其他通过检查的付款，在人类确认后通过 CAW 执行。
7. 展示 tx hash、Agent Wallet 地址和完整审计报告。

## 架构

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│  Dashboard → 贡献输入 → 计划审批 → 执行结果 → 审计报告  │
└──────────────────────┬──────────────────────────────┘
                       │ API
┌──────────────────────▼──────────────────────────────┐
│              Backend / Agent (FastAPI)                │
│  贡献解析 → LLM 付款计划 → 风险检查 → 审计日志          │
└──────────────────────┬──────────────────────────────┘
                       │ CAW API
┌──────────────────────▼──────────────────────────────┐
│          Cobo Agentic Wallet (Testnet)               │
│  Agent Wallet → 预算/白名单/限额 → 执行付款 → tx hash   │
└─────────────────────────────────────────────────────┘
```

## 技术栈

- **前端**：Next.js + React
- **后端**：FastAPI + Python
- **Agent**：LLM 生成付款计划 + 规则引擎风险检查
- **钱包**：Cobo Agentic Wallet
- **测试网**：Sepolia / BSC Testnet

## CAW 使用说明

Cobo Agentic Wallet 在本项目中承担核心资金执行角色：

- **Agent Wallet 管理**：为 AI Agent 创建独立钱包，资金隔离
- **预算控制**：设置月度预算上限
- **白名单**：限制可收款地址
- **单笔限额**：限制单笔付款金额
- **人工确认**：付款前必须经过人类审批
- **tx hash 输出**：每笔付款生成可验证的链上交易记录

关键配置详见 → [docs/caw-integration.md](docs/caw-integration.md)

## Agent Wallet 地址

> （待合约同学补充测试网 Agent Wallet 地址）

## Transaction Hash

> （待补充至少 3 笔测试网交易记录）

| # | 收款人 | 金额 | 说明 | tx hash | 区块浏览器 |
|---|--------|------|------|---------|-----------|
| 1 | Alice | 20 USDC | 活动复盘 | 待补充 | 待补充 |
| 2 | Charlie | 10 USDC | 社群维护 | 待补充 | 待补充 |
| 3 | Data API | 5 USDC | 工具订阅 | 待补充 | 待补充 |

## 运行方式

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 风险边界说明

1. 本次 Demo 使用测试网资金，不涉及真实资产。
2. Agent 不能无限制转账，所有付款受预算限制。
3. 所有收款地址必须在白名单内。
4. 单笔付款有金额上限。
5. 付款前需要人类确认。
6. 异常付款会被暂停，不会自动跳过。
7. 所有付款结果有 tx hash 可在区块浏览器验证。
8. Agent 不接触用户私钥。
9. Agent 只在授权范围内执行付款。
10. 未来可扩展多签审批、Sablier 流式付款、Request Network 发票记录。

## 团队

| 角色 | 职责 |
|------|------|
| 交付 / 路演 / 总控 | 严硕 — 项目统筹、路演、GitHub、最终交付 |
| 物料 / 设计 / 内容 | PPT、海报、视频、文案 |
| 前端 | Next.js 产品界面 + Mock 模式 |
| 后端 / Agent | FastAPI + Agent 付款计划 + 风险检查 |
| 合约 / CAW | Cobo Agentic Wallet 集成 + 测试网付款 |

## 项目管理

- [任务看板](docs/pm/TASK_BOARD.md)
- [每日站会模板](docs/pm/DAILY_STANDUP.md)
- [风险日志](docs/pm/RISK_LOG.md)
- [提交材料清单](docs/pm/SUBMISSION_CHECKLIST.md)
- [Demo 彩排检查清单](docs/pm/DEMO_REHEARSAL_CHECKLIST.md)
- [群消息模板库](docs/pm/TEAM_SYNC_MESSAGES.md)

## Demo 视频

> （待录制）

## License

MIT
