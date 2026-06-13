---
paths:
  - "frontend/**"
---

# Frontend 路径规则（触达 `frontend/**` 时加载）

> 与 `frontend/CLAUDE.md` 配套。触达本目录文件时，Agent 应已完成或立即完成冷启动阅读。

## 立即 Read（若尚未在上下文中）

1. `frontend/CLAUDE.md` — 宪法 §1 任务域 · §2 执行流程
2. `frontend/HANDOFF.md` — 最新 phase 指针
3. 跟随 HANDOFF §2 → 最新 `frontend/docs/handoff/*.md`

## 本域可用 Skills（description 已在 Session 列表；正文按需）

| Skill | 用途 |
|---|---|
| `/frontend-agent-workflow` | 多 Agent · scope commit · 维护联想 · phase HANDOFF |
| `/agent-cfo-monorepo-workflow` | 跨目录 / 角色边界（全仓库） |
| `gitnexus-exploring` 等 | 代码探索 |
| `taste-skill` · `ui-ux-pro-max` | Landing / Console 视觉 |

## 约束摘要

- **只改 `frontend/`**；Landing 默认锁定
- API 契约：`app/models.py` — 禁止发明字段
- 验证：`pnpm typecheck` · 大改 `pnpm build`
- phase 完成 → 按 `frontend/docs/handoff/TEMPLATE.md` 写 HANDOFF

完整披露：`frontend/docs/agent-context-loading.md`
