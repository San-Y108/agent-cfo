# docs/backend — 后端技术深文档

从根目录 [`README.md`](../../README.md) 拆出的**运行、部署、CAW、P2** 等技术细节。首页只保留摘要与链接。

> **状态**：✅ 已从 [`docs/backup/README-20260613-pre-polish.md`](../backup/README-20260613-pre-polish.md) 拆出（2026-06-13）

## 文档索引

| 文件 | 内容 |
| --- | --- |
| [`CAW_ADAPTER.md`](CAW_ADAPTER.md) | CAW Adapter Contract、Phase 4C、Read-Only Observer、testnet 证据 |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | 本地开发、Render、Persistent Disk、Planner、Persistence、Smoke Test |
| [`ENV_VARS.md`](ENV_VARS.md) | 环境变量全表 |
| [`P2_APIS.md`](P2_APIS.md) | P2 Demo-safe Extension APIs |
| [`REQUEST_FINANCE.md`](REQUEST_FINANCE.md) | P2F Request Finance Live Spike |
| [`TESTING.md`](TESTING.md) | 验收标准、curl 完整示例 |

## 契约真相源（不变）

- `app/models.py`
- `app/routers/payments.py`
- `tests/test_mvp_flow.py`

合并前完整技术说明：[`docs/backup/README-20260613-pre-polish.md`](../backup/README-20260613-pre-polish.md)
