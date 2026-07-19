# Domain map

## 核心领域

| 领域 | 责任 | 代码 / 文档 |
| --- | --- | --- |
| Contribution | 贡献记录与订阅账单输入 | `frontend/lib/demo/`、API models |
| Planning | 付款计划与解释 | `app/services/payment_planner.py` |
| Risk | 确定性预算、白名单、限额、token、重复检查 | `app/services/risk_engine.py` |
| Approval | 人工确认与可执行项选择 | `app/routers/payments.py`、Console |
| Execution | CAW mock / testnet 执行 | `app/services/caw_adapter.py` |
| Observation | CAW 状态只读刷新 | `app/services/caw_observer.py` |
| Audit | 决策与执行证据快照 | `AuditReport`、SQLite store |
| Agent Chat | Treasury 解释与操作引导 | MiniMax 后端代理 |

## 授权边界

LLM 不得决定 Risk、Approval 或 CAW policy。生产环境中的 `approvedBy` 必须来自可信身份，不得继续信任任意客户端字符串。

## 事实层级

1. 运行时代码和测试；
2. `README.md` 与 `docs/backend/`;
3. `docs/output/` 中已批准的 PRD 与 handoff；
4. `docs/pm/` 历史任务记录；
5. PPT、视频和营销文案。

下层来源不得推翻上层事实。
