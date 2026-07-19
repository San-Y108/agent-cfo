# Theme outputs

新业务工作统一进入：

```text
docs/output/
├── report/<theme>/
├── prd/<theme>/
└── handoff/<theme>/
```

## 状态流

```text
report（可选）
→ PRD draft
→ 用户 approved
→ handoff
→ 实施
→ awaiting-review
→ accepted
```

现有 `docs/pm/`、`docs/backend/`、`docs/reports/` 与 `frontend/docs/` 保持原位。它们是历史和领域专项文档，不批量迁移。

首个 theme：`treasury-payout`。
