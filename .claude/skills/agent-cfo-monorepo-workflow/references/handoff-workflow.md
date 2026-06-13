# Monorepo Phase 交接（HANDOFF）

## 目的

防止 Session 过载 / API Error 导致接力中断。把**可恢复状态**写入文件。

## 节奏（全仓库通用）

| 时机 | 写 HANDOFF？ |
|---|---|
| 完成 **1 个 phase**（plan 中定义的阶段性目标） | ✅ 必须 |
| 之后又完成 **每 2 个 phase** | ✅ 合并更新 |
| 单个小 fix | ❌ commit message 即可 |
| 用户：「写交接 / handoff / 压缩上下文」 | ✅ 立即 |
| 上下文很长 / Session 将断 | ✅ 提议后经用户确认 |

**不要**每完成一个小任务就写 HANDOFF — 浪费 token。

## 写到哪里

| 工作域 | 路径 | 索引 |
|---|---|---|
| **前端** | `frontend/docs/handoff/<date>-phase-<N>-<简述>-handoff.md` | `frontend/HANDOFF.md` |
| **后端 / 部署 phase** | `docs/reports/<date>-<topic>.md` 或 `docs/handoff/*` | `docs/README.md` 或相关 plan |
| **PM / 提交** | 更新 `docs/pm/SUBMISSION_CHECKLIST.md` · `docs/pm/TASK_BOARD.md` | — |

前端 HANDOFF 步骤与模板：启用 **`frontend-agent-workflow`** → `frontend/docs/handoff/TEMPLATE.md`

## 必含内容

- 日期、分支、**角色 / scope**
- What was done + 验证（pytest / typecheck / build）
- Suggested next steps
- Key files 表
- 已同步的维护文件列表
- **引用** plan/report 路径，不复制全文

## 后端 phase 报告模板（简）

```markdown
# Report: <Phase / Topic>
**Date:** YYYY-MM-DD
**Scope:** backend | deploy | full-stack
**Branch:** main

## Done
- …

## Verification
- [ ] pytest
- [ ] curl smoke（如适用）

## Next
1. …

## Files touched
| 路径 | 说明 |
```
