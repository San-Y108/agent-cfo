# Agent workflow

## 标准流程

```text
Issue
→ report（可选）
→ PRD draft
→ 用户 approved
→ task handoff
→ 实施
→ 验证
→ awaiting-review
→ 用户通过
→ commit / archive
```

## 路径

- 调研：`docs/output/report/<theme>/`
- PRD：`docs/output/prd/<theme>/prd.md`
- 任务交接：`docs/output/handoff/<theme>/`
- 决策：`docs/adr/`
- 批次提交记录：`docs/commit-history/`

## 当前配置

- Issue tracker：GitHub Issues
- Triage：canonical 五角色，见 `triage-labels.md`
- Context：多 Context，见根 `CONTEXT-MAP.md`
- Handoff：默认只启用 A 场景，也就是业务任务实施前交接
- 首个 theme：`treasury-payout`

## Gate

PRD 未获用户批准时，不写该 theme 的业务功能代码。实施完成后停在 `awaiting-review`，用户 Review 先于 commit。

## 现有流程兼容

`docs/pm/`、`docs/backend/`、`frontend/docs/` 继续作为历史与领域专项入口。新业务主题从 `docs/output/` 开始，不机械搬迁旧文件。
