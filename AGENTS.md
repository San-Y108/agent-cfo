# AgentCFO — AI Agent 工作指南

> 面向所有 AI coding agent 的仓库级说明。Claude Code 用户可同时读 `CLAUDE.md`。

## 1. 你在哪个团队？

先确认任务归属，**只在自己目录内改代码**：

| 任务类型 | 去读 | 只改 |
|---|---|---|
| 前端 UI / Console / Landing | `frontend/CLAUDE.md` | `frontend/` |
| 后端 API / 风控 / CAW adapter | `README.md` + `docs/backend/` + `app/` | `app/`、`tests/` |
| PM / 排期 / 交付文档 | `docs/README.md` → `docs/pm/` | `docs/`（文字类） |
| 物料 / PPT / 视频 / 截图 | `inbox/README.md` → `assets/README.md` | 投递放 `inbox/`；归类后只改 `assets/` |
| 合约 / 链上 | 与合约同学对齐 | 团队约定目录 |

前端任务：**不要**用本文件替代 `frontend/CLAUDE.md`；前端规范以 `frontend/` 内文档为准。

## 2. 核心业务流程

```text
Contribution Records → Payment Plan → Risk Check → Human Approval
  → Cobo Agentic Wallet → Tx Hash → Audit Report
```

契约真相：`app/models.py` · `app/routers/payments.py` · `tests/test_mvp_flow.py`

Agent Hub 聊天（MiniMax 代理）：`POST /api/agent/chat` · `app/routers/agent.py` · `app/services/agent_chat.py` · `tests/test_agent_chat.py` · 前端 `frontend/lib/api/agent.ts`。Key 仅在后端 `MINIMAX_API_KEY`，不进入前端 env。

## 3. 仓库地图

```text
agent-cfo/
├── README.md           项目首页（合并后：polish 结构 + 技术摘要）
├── docs/backup/        合并前 README 备份
├── docs/backend/       后端技术深文档（从 README 拆出）
├── AGENTS.md           本文件（全 agent 工作指南）
├── CLAUDE.md           Claude Code 团队边界入口
├── app/                FastAPI 后端
├── tests/              pytest
├── frontend/           Next.js 前端（Console + Landing）
│   └── docs/           前端专项 plans / handoff / UI 研究
├── docs/               竞赛与项目文字文档（入口 docs/README.md）
│   ├── backup/         README 合并前备份（只读）
│   ├── backend/        后端技术深文档（CAW / 部署 / P2；合并时拆出）
│   ├── plans/          规划文档（含 README-merge-plan）
│   ├── pm/             任务看板、提交清单、彩排
│   ├── p2/             P2 能力边界说明
│   └── reports/        阶段报告
├── assets/             竞赛交付资产（入口 assets/README.md）
│   ├── ppt/            路演 PPT + ppt-master 源工程 + material/
│   ├── video/          答辩 / Demo 视频
│   ├── images/         截图、海报；README 用图在 images/readme/
│   └── design/         Logo、海报设计稿
├── inbox/              待归类投递区（入口 inbox/README.md）
└── .claude/skills/     仓库级 agent skills（含 ppt-master、gitnexus、agent-cfo-monorepo-workflow）
```

**frontend 专属 skills**：`frontend/.claude/skills/`（含 `frontend-agent-workflow`）

**文档 vs 资产 vs 投递**：`docs/` 放 Markdown 与清单；`assets/` 放 PPT、视频、图片等已归类交付物；`inbox/` 放待整理投递。不要混放。

## 4. 常用命令

```bash
# 后端
uvicorn app.main:app --reload --port 8000
pytest

# Agent Hub 聊天冒烟（需 MINIMAX_API_KEY）
curl -X POST http://127.0.0.1:8000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d "{\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}],\"lang\":\"zh\"}"

# 前端（在 frontend/ 下）
PORT=3100 pnpm dev
pnpm typecheck && pnpm build

# 代码图谱
npx gitnexus status
npx gitnexus analyze   # 索引过期时
```

## 5. 交付物速查

| 资产 | 路径 |
|---|---|
| 待归类投递 | `inbox/`（见 `inbox/README.md`） |
| 路演 PPT（ppt-master） | `assets/theme/ppt/agentcfo-pitch.pptx` |
| 路演 PPT（物料同学 PDF） | `assets/theme/ppt/material/agentcfo-pitch-material-team-v1.pdf` |
| PPT 源工程 | `assets/theme/ppt/agentcfo-pitch/` |
| 答辩视频 | `assets/video/`（链接写入 `README.md` § Demo Video） |
| 提交清单 | `docs/pm/SUBMISSION_CHECKLIST.md` |
| README 合并规划 | `docs/plans/README-merge-plan.md` |
| README 合并前备份 | `docs/backup/`（Phase 0 生成） |
| README 展示用图 | `assets/images/readme/` |

收到 `inbox/` 新文件时：按 `inbox/README.md` 归类重命名 → 迁入 `assets/` 或 `docs/` → 删除 `inbox/` 原文件 → 同步本表与入口文档（`AGENTS.md`、`CLAUDE.md`、`docs/README.md`、`assets/README.md`）。

改 ppt-master 版 PPT：`.claude/skills/ppt-master/SKILL.md`；导出后更新 `assets/theme/ppt/agentcfo-pitch.pptx`。

执行 README 合并时：先读 `docs/plans/README-merge-plan.md`；合并后同步 `README.md` 与 `docs/backend/`。

## Claude Code Skills（工作流）

| Skill | 路径 | 何时用 |
|---|---|---|
| **agent-cfo-monorepo-workflow** | `.claude/skills/agent-cfo-monorepo-workflow/` | 仓库任意位置；角色边界、跨目录、phase 交接 |
| **frontend-agent-workflow** | `frontend/.claude/skills/frontend-agent-workflow/` | 仅在 `frontend/` 开发；多 Agent、scope commit、HANDOFF |

宪法文档：`CLAUDE.md` · `frontend/CLAUDE.md` — skills 是可执行 checklist，与 CLAUDE.md 同步。

---

## 6. 协作原则

- 改 API 前先对齐契约；前端不得发明字段或端点
- 跨目录改动先申请（前端 ↔ 后端 ↔ 合约 ↔ 物料）
- 提交前跑对应角色的 typecheck / test / build
- Demo 场景数据全团队一致（Bob = blocked）
- 更新交付物路径或文档结构时，同步维护 `README.md`、`AGENTS.md`、`CLAUDE.md`、`docs/README.md`

---

## Git Workflow Discipline（全 Agent）

- 多 Agent 并行时，改前先 `git pull origin main`
- **push 前必须检查远端**：`git fetch origin main`，然后 `git log HEAD..origin/main --oneline`
- 若远端有领先提交，必须先 `git pull` 合并后再 push
- 出现冲突时停止，把冲突文件列给用户，由用户或负责协调的 Agent 决策
- 不要 `--force` push，除非用户明确授权

---

<!-- gitnexus:start -->
## GitNexus — Code Intelligence

本仓库已索引为 **agent-cfo**（约 3800+ symbols，130+ execution flows）。用于理解代码、评估改动影响、追踪调用链。

> 工具提示 index stale 时：在仓库根运行 `npx gitnexus analyze`

### 推荐用法

| 场景 | 工具 / 资源 |
|---|---|
| 理解某功能怎么跑 | `gitnexus_query({ query: "payment plan" })` |
| 查某函数上下游 | `gitnexus_context({ name: "symbolName" })` |
| 改代码前看影响面 | `gitnexus_impact({ target: "symbolName", direction: "upstream" })` |
| 提交前核对波及范围 | `gitnexus_detect_changes()` |
| 仓库概览 | `gitnexus://repo/agent-cfo/context` |
| 功能聚类 | `gitnexus://repo/agent-cfo/clusters` |
| 执行流列表 | `gitnexus://repo/agent-cfo/processes` |

### 纪律

- 修改非平凡符号前，优先做 impact 分析
- HIGH / CRITICAL 风险须告知用户后再改
- 重命名用 `gitnexus_rename`，不要盲 find-replace

### Skill 文件

| 任务 | 路径 |
|---|---|
| 探索架构 | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| 影响分析 | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| 调试追踪 | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| 重构 | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| CLI | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
