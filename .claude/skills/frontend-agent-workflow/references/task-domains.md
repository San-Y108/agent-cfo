# Frontend 任务域 ↔ 路径 ↔ Commit Scope

（内容与 `frontend/.claude/skills/frontend-agent-workflow/references/task-domains.md` 同步；canonical 在根 `.claude/skills/frontend-agent-workflow/`）

开工前确认本 Session 只负责一行。

| 任务域 | 主要路径 | commit scope |
|---|---|---|
| **Console / Treasury** | `components/console/modules/treasury.tsx` · `stages/treasury-*` · `app/console/treasury/` | `console/treasury` |
| **Console / Wallets & CAW** | `components/console/modules/wallets.tsx` · `components/caw/` | `console/wallets` |
| **Console / Analytics** | `components/console/modules/analytics.tsx` · `components/console/charts/` | `console/analytics` |
| **Console / Policy** | `components/console/modules/policy.tsx` · `app/console/policy/` | `console/policy` |
| **Console / Shell** | `agent-hub.tsx` · `edge-capsule.tsx` · `navbar.tsx` · `layout.tsx` · `command-deck/` | `console/shell` |
| **Landing** | `app/page.tsx` · `components/landing/*` | `landing`（**默认锁定**，需用户授权） |
| **API / Real mode** | `lib/api/*` · `lib/workflow/*` · `backend-integration.md` | `api` |
| **i18n** | `lib/i18n/dict.ts` | `i18n` |
| **文档 / 交接** | `docs/handoff/*` · `HANDOFF.md` · `checklist.md` | `docs` 或 `docs(handoff)` |

## Commit 纪律

- 一 commit 一意图；仅用户明确要求时 commit
- type：`feat` · `fix` · `refactor` · `docs` · `chore` · `style`
