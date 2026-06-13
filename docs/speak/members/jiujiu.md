# 九九八乂 · 后端 / Agent

> 第一人称陈述

---

我是九九八乂，负责后端和 Agent 逻辑——如果说前端是「前台」，我就是「账房 + 风控 + 档案室」。

黑客松第一周我把 **FastAPI P0 MVP** 从 0 搭到可部署：不是 demo 级别的假接口，而是有 Pydantic 校验、pytest 验收、SQLite 持久化、可切换 mock/real CAW 的一套服务。线上：https://agentcfo-backend.onrender.com

**我交付的核心 API（P0）：**

| 接口 | 我让它干什么 |
|---|---|
| `POST /api/payment-plan` | 读贡献记录，生成付款计划和付款原因 |
| `POST /api/risk-check` | **唯一**决定 Ready / NeedsApproval / Blocked 的地方 |
| `POST /api/execute-payment` | 人工 `approved=true` 后才进 CAW adapter |
| `GET /api/audit-report/{id}` | 执行时快照，后续 refresh 不能改历史 |
| `GET /api/caw-status/{id}` | 查 mock 或真实 CAW 状态 |

**Risk Engine 六条规则（我坚持写死在代码里，不靠 LLM）：**

- 超月预算 → block
- 超单笔限额 → block
- 非白名单地址 → block（**Bob 就是这条**）
- token 不符 → block
- 重复收款人 / 重复任务 → 识别并拦截
- 缺 human approval → 不执行

**Agent / Planner：** `payment_planner.py` 默认 mock planner；可显式开 OpenAI Structured Outputs，但 LLM **只能起草计划和理由**，不能改金额、不能绕过风控。

**Phase 1–2 我还做了：**

- Render 部署、CORS、SQLite `AGENTCFO_DB_PATH`
- P2 demo-safe 扩展：Request Finance spike、Sablier preview、Safe refs、multichain readiness、treasury partitions——全部 **metadata / simulation**，默认不触发真实外部动作
- `GET /api/demo-sample` 标准 mock payload，供前端和评委复制
- 技术深文档下沉到 `docs/backend/`（CAW、部署、env、P2、测试）

**GitHub 维护：** 仓库后端提交以 `x0jujubayi` / `W5W8L9jlu` 为主，核心契约在 `app/models.py`、`app/routers/payments.py`、`tests/test_mvp_flow.py`——前后端分歧时**以后端为准**。

**和 purple sun 的交界：** 我定义 `CawAdapter` 契约和 `MockCawAdapter`；他实现 `RealCawAdapter` 并在 Sepolia 跑出 tx。我们约定：blocked 项永远不进 adapter；缺 env 就 fail-closed。

**和 PPT 的对应：** 第 6 页 Architecture、第 10 页 API、第 11 页 Roadmap，都从我这边的事实出发；第 8 页 CAW 证据是联调结果，不是后端单独吹的。

后端的价值就一句话：**让 AI 能建议，但不能让 AI 擅自打钱。**
