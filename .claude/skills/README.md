# .claude/skills — 仓库级 Claude Code Skills

与 `frontend/.claude/skills/` 互补：本目录服务 **全 monorepo**；frontend 专项见 `frontend/.claude/`。

## 工作流 Skills

| Skill | 说明 |
|---|---|
| [`agent-cfo-monorepo-workflow`](agent-cfo-monorepo-workflow/SKILL.md) | 全仓库角色边界 · phase 交接 |
| [`frontend-agent-workflow`](frontend-agent-workflow/SKILL.md) | frontend 专用；`paths: frontend/**` |

加载披露：[`frontend/docs/agent-context-loading.md`](../../frontend/docs/agent-context-loading.md)

## 领域 Skills

| Skill | 说明 |
|---|---|
| `ppt-master/` | 路演 PPT 生成与导出 |
| `gitnexus/*/` | 代码图谱探索 / 影响分析 / 重构 |
| `taste-skill/` · `ui-ux-pro-max/` | Landing / Console 视觉 |

## 新 Session

1. **`agent-cfo-monorepo-workflow`** — 确认角色与目录
2. 前端任务 → 进入 `frontend/` 并启用 **`frontend-agent-workflow`**
3. 读 `CLAUDE.md` · `AGENTS.md`
