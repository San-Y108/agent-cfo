# Triage labels

采用五种 canonical 角色。GitHub label 使用 `triage:<role>`。

| Label | 责任 | AgentCFO 映射 |
| --- | --- | --- |
| `triage:product` | 问题定义、范围、PRD、优先级 | PM、交付总控 |
| `triage:design` | UX、视觉、内容与资产 | 前端视觉、物料 |
| `triage:frontend` | Web UI、状态、API adapter、E2E | `frontend/` |
| `triage:backend` | API、数据、Agent、风控 | `app/`、`tests/` |
| `triage:platform` | CAW、链上、部署、安全与 CI | CAW、Vercel、Render |

## 辅助标签

- 类型：`type:bug`、`type:feature`、`type:docs`、`type:chore`
- 优先级：`priority:p0`、`priority:p1`、`priority:p2`
- 状态：`status:blocked`、`status:needs-review`
- Theme：`theme:treasury-payout`

## 规则

每个 Issue 必须有且只有一个 `triage:*` 主标签。跨域任务以最终交付责任方为主标签，其他团队通过 Issue 描述和 handoff 协作。
