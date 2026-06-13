---
name: frontend-agent-workflow
description: >
  AgentCFO frontend Claude Code workflow for threetwoa — multi-agent modular dev,
  scoped commits, post-change doc maintenance, and phase-based HANDOFF. Use whenever
  working in frontend/, on Console/Treasury/Wallets/Landing/API adapter, when the user
  mentions 前端交接/handoff/phase 完成/多 Agent 并行/commit scope, or starts a new
  Claude Code session under agent-cfo/frontend. Also trigger before ending a long
  frontend session or when context is getting full — even if the user only says
  "wrap up" or "save context for next time".
paths:
  - "frontend/**"
---

# Frontend Agent Workflow（AgentCFO）

> **Canonical 路径**：`.claude/skills/frontend-agent-workflow/`（根目录，确保 Claude Code 索引）。  
> 宪法全文：`frontend/CLAUDE.md` · 加载披露：`frontend/docs/agent-context-loading.md`

## 何时启用

- 工作目录或改动路径在 **`frontend/`**
- 用户开多个 Agent 分模块（Console / Landing / API …）
- 完成 phase、要写交接、或 Session 上下文将满
- 用户要求分类 commit 或同步 README / HANDOFF

## 冷启动（每个新 Session）

```
1. Read frontend/CLAUDE.md §1–§2
2. Read frontend/HANDOFF.md → 跟随 §2 最新 handoff
3. Read 当前 phase 的 frontend/docs/plans/*-checklist.md
4. 确认本 Session 任务域（见 references/task-domains.md）
5. （API 域）Read frontend/backend-integration.md
```

## 执行循环

```
确认任务域 → Explore → Plan → Execute → Verify → 维护联想 → Summarize
                                              ↓
                        （phase 完成 / 用户指令 / 上下文将满）→ HANDOFF
```

| 阶段 | 动作 |
|---|---|
| **确认任务域** | 对照 `references/task-domains.md`；越界先问用户 |
| **Execute** | **只改 `frontend/`**；Landing 默认锁定 |
| **Verify** | `pnpm typecheck`；大改后 `pnpm build`；不伪造结果 |
| **维护联想** | 走 `references/maintenance-checklist.md` |
| **Summarize** | 改了什么、验证结果、下一步；小任务不写 HANDOFF |

## Commit（仅用户明确要求时）

- 格式：`<type>(<scope>): <说明>` — 一 commit 一意图
- scope 见 `references/task-domains.md`
- 多 Agent 并行：改前 `git pull`；不跨域混提交

## Phase 交接（HANDOFF）

完整规则：`references/handoff-workflow.md` · 模板：`frontend/docs/handoff/TEMPLATE.md`

| 时机 | 动作 |
|---|---|
| 完成 **1 个 phase** | 新建 handoff + 更新 `HANDOFF.md` |
| 每再完成 **2 个 phase** | 合并更新 handoff + 刷新 `CLAUDE.md` §7 |
| 小 fix / 单组件微调 | ❌ 不写 handoff |
| 用户说「写交接 / handoff / 压缩上下文」 | ✅ 立即写 |
| 上下文很长 / 多次 retry / Session 将断 | ✅ 提议写 handoff，经确认后执行 |

**产出物（phase 完成时）**

1. `frontend/docs/handoff/<YYYY-MM-DD>-phase-<N>-<简述>-handoff.md`
2. 更新 `frontend/HANDOFF.md` §1–§2
3. 更新 `frontend/CLAUDE.md` §7 当前状态
4. 勾选 `checklist.md` 与相关 `docs/plans/*-checklist.md`

## 写 HANDOFF 时

1. Read `frontend/docs/handoff/TEMPLATE.md`
2. 填交付 / 验证 / Suggested next steps / 维护文件同步记录
3. **不要**复制 plan 或 report 全文 — 只引用路径
4. 在 Summarize 里告诉下一 Agent：任务域 + 先读哪份 handoff

## 与其他 skill 的关系

| 场景 | 优先 skill |
|---|---|
| 探索 Console 架构 / 调用链 | `gitnexus-exploring` |
| Landing / Console 视觉改版 | `taste-skill` / `ui-ux-pro-max` |
| 改 API adapter | 本 skill + 对照 `app/models.py` |

## References

| 文件 | 何时读 |
|---|---|
| `references/task-domains.md` | Session 开始、写 commit 前 |
| `references/maintenance-checklist.md` | 每次代码改动完成后 |
| `references/handoff-workflow.md` | phase 完成、用户要交接、上下文将满 |
