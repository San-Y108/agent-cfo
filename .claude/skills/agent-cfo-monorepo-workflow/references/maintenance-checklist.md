# Monorepo 改动后维护联想清单

| 你改了… | 检查 / 更新 |
|---|---|
| API 契约 | `app/models.py` · `tests/test_mvp_flow.py` · `frontend/lib/api/*` · 根 `README.md` API 表 |
| 部署 URL / env | 根 `README.md` · `frontend/CLAUDE.md` §11 · `docs/backend/` |
| 交付物路径 | `assets/README.md` · `AGENTS.md` · `CLAUDE.md` · `docs/pm/SUBMISSION_CHECKLIST.md` |
| inbox 新文件 | 归类 → 删 inbox 原文件 → 更新 `assets/README.md` 或 `docs/README.md` |
| 前端结构 / 路由 | `frontend/` 各 README · **frontend-agent-workflow** maintenance 清单 |
| 团队边界 / 工作流 | 根 `CLAUDE.md` · `AGENTS.md` · 本 skill 的 references |
| 完成 phase | 对应 handoff 路径（见 handoff-workflow.md）· checklist |

## 根目录常维护文件

- `README.md` — 首页、Demo、Quick Start
- `CLAUDE.md` — Claude Code 团队边界
- `AGENTS.md` — 全 agent 地图
- `docs/README.md` — 文档入口
- `assets/README.md` — 交付资产状态

## 原则

规范写入文件，不留在 chat。下一 Agent 冷启动读文档，不读上一 Session 对话。
