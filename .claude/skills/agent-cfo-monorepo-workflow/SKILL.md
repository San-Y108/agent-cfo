---
name: agent-cfo-monorepo-workflow
description: >
  AgentCFO monorepo Claude Code workflow — role boundaries (PM / frontend / backend /
  assets / inbox), multi-agent parallel dev, scoped commits, cross-directory maintenance,
  and phase-based handoff. Use whenever working anywhere in agent-cfo/, when the user
  mentions 团队边界/跨目录/多 Agent/交接/handoff/phase 完成/物料归类/inbox, or when
  unsure which directory to edit. Also trigger at repo root cold start, before cross-role
  changes, or when a session is ending and context must survive for the next agent —
  even if the user only says "save for next time" or "wrap up this session".
---

# AgentCFO Monorepo Agent Workflow

> 仓库级工作流。团队边界：`CLAUDE.md` · `AGENTS.md`。  
> **前端任务**进入 `frontend/` 后，必须再启用 **`frontend-agent-workflow`** skill（`frontend/.claude/skills/`）。

## 何时启用

- 在 `agent-cfo/` 任意目录工作，需确认**改哪里**
- 多 Agent 并行（前端 + 后端 + PM + 物料）
- 跨目录改动、交付物归类、phase 完成写交接
- 新 Session 冷启动（仓库根）

## 冷启动（仓库根 Session）

```
1. Read CLAUDE.md（团队边界表）
2. Read AGENTS.md §1–§3（角色 ↔ 目录）
3. 确认本 Session 角色 / 任务域 → references/role-boundaries.md
4. 读该角色入口文档（见下表）
5. 前端域 → 切换 frontend/CLAUDE.md + frontend-agent-workflow skill
```

| 角色 | 入口文档 | 只改 |
|---|---|---|
| 前端 | `frontend/CLAUDE.md` | `frontend/` |
| 后端 | `README.md` · `docs/backend/` | `app/` · `tests/` |
| PM | `docs/README.md` · `docs/pm/` | `docs/`（文字） |
| 物料 | `inbox/README.md` · `assets/README.md` | `inbox/` → `assets/` |
| 合约 | 团队约定 | 待定 |

## 执行循环

```
确认角色与目录 → Explore → Plan → Execute → Verify → 维护联想 → Summarize
                                              ↓
                        （phase 完成 / 用户指令 / 上下文将满）→ HANDOFF
```

| 阶段 | 动作 |
|---|---|
| **确认角色** | 不对的角色目录 **先停**，向用户申请跨边界 |
| **Execute** | 只在本角色目录内改代码；文档/资产按边界表 |
| **Verify** | 前端 `pnpm typecheck` · 后端 `pytest` · 物料不改业务代码 |
| **维护联想** | `references/maintenance-checklist.md` |
| **Summarize** | 改了什么、验证、下一步；小任务不写 HANDOFF |

## Commit（仅用户明确要求时）

- 格式：`<type>(<scope>): <说明>` — scope 见 `references/commit-scopes.md`
- **一 commit 一角色域 / 一意图** — 不要把 frontend 与 app 混提交
- 多 Agent 并行：改前 `git pull`

## Phase 交接（HANDOFF）

完整规则：`references/handoff-workflow.md`

| 工作域 | HANDOFF 写到哪里 |
|---|---|
| **前端** | `frontend/docs/handoff/*` + `frontend/HANDOFF.md`（用 **frontend-agent-workflow**） |
| **后端 / 全栈 phase** | `docs/reports/` 或 `docs/handoff/`（若存在）+ 更新相关 plan/checklist |
| **PM / 交付** | `docs/pm/` · `docs/reports/` · `SUBMISSION_CHECKLIST.md` |

**节奏**（全仓库通用，勿每个小任务都写）：

| 时机 | 写 HANDOFF？ |
|---|---|
| 完成 **1 个 phase** | ✅ 必须 |
| 每再完成 **2 个 phase** | ✅ 合并更新 |
| 小 fix | ❌ |
| 用户要求 / 上下文将满 | ✅ |

## 跨边界规则

- 改 `frontend/` 外代码 → **先申请**
- 改 API → 后端改 `app/`；前端只镜像 `frontend/lib/api/*`，禁止发明字段
- 新文件先进 `inbox/` → 按 README 归类到 `assets/` 或 `docs/`
- 前端细节（任务域、Console scope、Landing 锁定）→ **不要**在本 skill 重复，读 `frontend-agent-workflow`

## 子 skill 路由

| 场景 | Skill |
|---|---|
| 在 `frontend/` 开发 | `frontend-agent-workflow` |
| 探索跨模块代码 | `gitnexus-exploring` |
| 改 PPT | `ppt-master` |
| Landing / Console 视觉 | `taste-skill` · `ui-ux-pro-max` |

## References

| 文件 | 何时读 |
|---|---|
| `references/role-boundaries.md` | Session 开始、跨目录前 |
| `references/commit-scopes.md` | commit 前 |
| `references/maintenance-checklist.md` | 改动完成后 |
| `references/handoff-workflow.md` | phase 完成、Session 将断 |
