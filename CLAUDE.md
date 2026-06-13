# AgentCFO — Claude Code 仓库指南

> 团队 monorepo 入口。做**前端**工作时，读完本节后转到 **`frontend/CLAUDE.md`**（前端总纲，优先级更高）。

## 项目一句话

**AgentCFO ｜ DAO AI 财务官** — 贡献记录 → Payment Plan → Risk Check → Human Approval → Cobo Agentic Wallet → Audit Report。  
赛道：Cobo Agentic Commerce · Slogan: *Give every DAO an AI CFO with a controlled wallet.*

## 仓库结构 & 团队边界

| 角色 | 工作目录 | 入口文档 | 边界 |
|---|---|---|---|
| **PM** | `docs/` | `docs/README.md` · `docs/pm/TASK_BOARD.md` | 文字文档；不改 `app/`、`frontend/` 代码 |
| **物料** | `inbox/` → `assets/` | `inbox/README.md` · `assets/README.md` | 新文件先投 `inbox/`；归类后入 `assets/`，不改业务代码 |
| **前端** | `frontend/` | `frontend/CLAUDE.md` | **只改 `frontend/`**；后端只读契约 |
| **后端** | `app/`、`tests/` | `README.md` · `docs/backend/` | 不改 `frontend/` UI |
| **合约** | （待团队约定） | — | 与 CAW / 链上交互相关 |

```text
docs/     → 文字文档（backup / backend / plans / pm / p2 / reports）
assets/   → 交付资产（ppt / video / images/readme / design）
inbox/    → 待归类投递（整理后迁入 assets/ 或 docs/）
frontend/docs/ → 前端开发专项文档（与竞赛交付文档分开）
```

README 首页已于 2026-06-13 按 [`docs/plans/README-merge-plan.md`](docs/plans/README-merge-plan.md) 合并；合并前完整技术版见 [`docs/backup/README-20260613-pre-polish.md`](docs/backup/README-20260613-pre-polish.md)。

全 agent 通用指南见 **`AGENTS.md`**。

**跨边界规则**：修改非本角色目录前，先与对应队友确认或向用户申请。

## 新会话阅读顺序

### 全仓库概览（任何角色）

1. `README.md` — 项目首页、Demo、Quick Start、API 摘要（深文档见 `docs/backend/`）
2. `AGENTS.md` — 全 agent 仓库地图与 GitNexus 纪律
3. 本文件 — Claude Code 团队边界
4. `docs/README.md` / `assets/README.md` / `inbox/README.md` — 文档、交付资产与投递区入口
5. 本角色专属文档（见上表）

README 合并记录：[`docs/plans/README-merge-plan.md`](docs/plans/README-merge-plan.md) · 备份：[`docs/backup/README-20260613-pre-polish.md`](docs/backup/README-20260613-pre-polish.md)

### 前端开发（我们）

1. **`frontend/CLAUDE.md`** — 总纲（必读）
2. `frontend/HANDOFF.md` → `frontend/docs/handoff/phase-7-1-console-handoff.md`
3. `frontend/docs/plans/console-upgrade-checklist.md`
4. `frontend/backend-integration.md`（联调时）

### 物料开发

1. `inbox/README.md` — 队友新投递的待归类文件
2. `assets/README.md` — 已入库交付资产与状态
3. `docs/pm/SUBMISSION_CHECKLIST.md` — 提交项勾选
4. `.claude/skills/ppt-master/SKILL.md` — 修改或重新导出 ppt-master 版 PPT 时

### 后端开发

1. `app/models.py` · `app/routers/payments.py` · `tests/test_mvp_flow.py`
2. `docs/backend/` — CAW、部署、env、P2 技术深文档（合并后；当前见根目录 `README.md`）
3. `docs/pm/P2_BACKEND_READINESS.md`（如有）

## API 契约（全团队共用）

**唯一真相源**（前后端分歧时以后端代码为准）：

- `app/models.py`
- `app/routers/payments.py`
- `tests/test_mvp_flow.py`

P0 端点（4+1）：

| 方法 | 路径 |
|---|---|
| POST | `/api/payment-plan` |
| POST | `/api/risk-check` |
| POST | `/api/execute-payment` |
| GET | `/api/audit-report/{auditReportId}` |
| GET | `/api/caw-status/{cawRequestId}` |

前端 adapter 镜像：`frontend/lib/api/*` · 禁止自行发明 endpoint / field / wrapper。

## 当前部署

| 层 | URL / 状态 |
|---|---|
| 前端（Vercel） | https://agentcfo-frontend.vercel.app · mock mode |
| 后端（Render） | https://agentcfo-backend.onrender.com · 默认 mock mode |
| 本地后端 | `uvicorn app.main:app --reload --port 8000` |
| 产品入口 | `/` Landing · `/console` Command Center |

## 竞赛交付物

| 资产 | 路径 |
|---|---|
| 待归类投递 | `inbox/` |
| 路演 PPT（ppt-master） | `assets/ppt/agentcfo-pitch.pptx` |
| 路演 PPT（物料同学 PDF） | `assets/ppt/material/agentcfo-pitch-material-team-v1.pdf` |
| PPT 源工程 | `assets/ppt/agentcfo-pitch/` |
| 答辩视频 | `assets/video/`（公开链接写入 `README.md` § Demo Video） |
| 提交清单 | `docs/pm/SUBMISSION_CHECKLIST.md` |
| README 合并规划 | `docs/plans/README-merge-plan.md` |
| README 展示用图 | `assets/images/readme/` |

## Demo 数据（全团队对齐）

Alice 20 / **Bob 15（blocked，非白名单）** / Charlie 10 / Data API 5 USDC · 月预算 50 · 单笔限额 25

## 代码探索（GitNexus）

仓库已索引 GitNexus。探索跨模块代码、影响面分析时，见根目录 **`AGENTS.md`** § GitNexus。  
索引过期：`npx gitnexus analyze`（在仓库根执行）。

## 安全 & Demo 纪律

- 黑客松 Demo；mock mode 无真实资金
- 不把 mock tx 当作真实链上交易
- 不伪造验证结果；没跑就是没验证
