# Frontend 改动后维护联想清单

| 你改了… | 检查 / 更新 |
|---|---|
| 路由增删 | `app/README.md` · `lib/constants/routes.ts` |
| `components/` 结构 | `components/README.md` · 子目录 README |
| `lib/` 模块 / 数据流 | `lib/README.md` · `lib/api/README.md` |
| API adapter / 类型 | `lib/api/README.md` · `backend-integration.md` · `app/models.py` |
| 设计 token / 动效 | `CLAUDE.md` §10 |
| env / 部署 / URL | `CLAUDE.md` §11 · `HANDOFF.md` §4 |
| 完成 phase / 里程碑 | `HANDOFF.md` · `docs/handoff/*` · `CLAUDE.md` §7 · `checklist.md` |
| workflow 本身 | `.claude/skills/frontend-agent-workflow/` + `CLAUDE.md` §0 |

验证：`cd frontend && pnpm typecheck` · 大改 `pnpm build`
