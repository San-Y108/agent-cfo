# Backend and CAW context

## 范围

- Runtime：`app/`
- Tests：`tests/`
- 技术文档：`docs/backend/`

## 契约真相

1. `app/models.py`
2. `app/routers/payments.py`
3. `tests/test_mvp_flow.py`

## 不变量

- LLM 只生成计划摘要和 reason，不决定风险或授权；
- Risk Check 必须先于 Execute Payment；
- blocked payment 不得进入 CAW adapter；
- Human Approval 必须存在，但 production 还需可信身份与签名；
- Real CAW 默认关闭，缺少 env、allowlist、限额时 fail closed；
- CAW status refresh 不得重写 Audit Report 快照；
- mock txHash 必须为 `null` 或明确的非链上占位，不得伪装成真实交易。

## 生产化方向

优先补齐 API 鉴权、金额精度、幂等键、PostgreSQL、迁移、异步执行、可观测性和追加式审计事件。

## 验证

```bash
python -m pytest -q
```

真实 CAW 验证必须使用 testnet、小额、recipient allowlist，并单独保存 runbook 与公开脱敏证据。
