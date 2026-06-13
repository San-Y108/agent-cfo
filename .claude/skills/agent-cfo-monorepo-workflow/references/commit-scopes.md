# Monorepo Commit Scope

仅用户明确要求时 commit。一 commit 一角色域 / 一意图。

## 按角色

| 角色 | scope 示例 | 说明 |
|---|---|---|
| 前端 | `console/treasury` · `landing` · `api` · `i18n` | 详见 `frontend/.claude/skills/frontend-agent-workflow/references/task-domains.md` |
| 后端 | `api` · `caw` · `risk` · `agent` | 对应 `app/routers/` · `app/services/` |
| 文档 PM | `docs` · `docs(pm)` · `docs(handoff)` | 只含文字变更 |
| 物料 | `assets` · `assets(ppt)` · `assets(video)` | inbox 归类迁入 |
| 仓库 | `chore` · `ci` | 根配置、skill、AGENTS.md |

## 格式

```
<type>(<scope>): <简短说明>
```

type：`feat` · `fix` · `refactor` · `docs` · `chore` · `style` · `test`

## 示例

```
feat(app): add agent chat proxy endpoint
feat(console/treasury): wire real payment-plan in console-state
docs(handoff): phase 8 backend render deploy report
assets(ppt): export agentcfo-pitch v2
docs(pm): update submission checklist video link
```

## 禁止

- ❌ 同一 commit 含 `frontend/` + `app/` 功能改动
- ❌ 物料二进制与业务逻辑 refactor 混提交
- ❌ 未跑验证就 commit（前端 typecheck · 后端 pytest）
