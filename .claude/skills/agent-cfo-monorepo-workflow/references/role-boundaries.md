# AgentCFO 角色边界

先确认「我是谁、改哪里」，再写代码。

## 角色 ↔ 目录 ↔ 入口

| 角色 | 工作目录 | 入口文档 | 禁止 |
|---|---|---|---|
| **前端** (threetwoa) | `frontend/` | `frontend/CLAUDE.md` · `frontend/HANDOFF.md` | 改 `app/` · 根部署配置（未授权） |
| **后端** | `app/` · `tests/` | `README.md` · `docs/backend/` | 改 `frontend/` UI |
| **PM** | `docs/` | `docs/README.md` · `docs/pm/TASK_BOARD.md` | 改 `app/` · `frontend/` 代码 |
| **物料** | `inbox/` → `assets/` | `inbox/README.md` · `assets/README.md` | 改业务代码 |
| **合约** | 团队约定 | — | 跨域未对齐 |

## 文档 vs 资产 vs 投递

| 路径 | 放什么 |
|---|---|
| `docs/` | Markdown、清单、报告、plan |
| `assets/` | PPT、视频、已归类图片 |
| `inbox/` | 待整理新投递 |
| `frontend/docs/` | 前端专项 plan / handoff（与竞赛 docs 分开） |

## 前端 Agent 特别说明

- 主开发者 threetwoa，常用 Claude Code + **多 Agent 分模块**
- 进入 `frontend/` 后启用 **`frontend-agent-workflow`** skill
- Landing 默认锁定；Console 为主业务域
- API 契约真相：`app/models.py` · `app/routers/payments.py` · `tests/test_mvp_flow.py`

## 跨边界申请模板

向用户说明：

1. 当前角色 / 任务域
2. 需要改的路径（为何越界）
3. 影响面（前后端契约 / 交付物 / 其他 Agent）
4. 建议：由谁改、或拆成两个 scope commit
