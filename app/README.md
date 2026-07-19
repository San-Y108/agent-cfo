# Backend application

`app/` 是 AgentCFO 的 FastAPI 产品代码根，不属于资产目录，也不应迁入 `docs/` 或 `assets/`。

## 结构

```text
app/
├── main.py                  # FastAPI 入口、CORS、health/version
├── models.py                # Pydantic API 契约
├── store.py                 # InMemory / SQLite repository
├── routers/
│   ├── payments.py          # P0 payment flow
│   ├── agent.py             # MiniMax Agent Chat
│   └── p2_extensions.py     # Demo-safe P2 routes
└── services/
    ├── payment_planner.py
    ├── risk_engine.py
    ├── caw_adapter.py
    ├── caw_observer.py
    ├── caw_read_only_client.py
    ├── request_finance.py
    └── p2_extensions.py
```

## 核心流程

```text
Payment Plan
→ Risk Check
→ Human Approval
→ CAW Adapter
→ Audit Report
```

## 契约真相

- `models.py`
- `routers/payments.py`
- `../tests/test_mvp_flow.py`

## 不变量

- LLM 不决定风险或授权；
- Risk Check 必须先于执行；
- blocked payment 不进入 CAW adapter；
- Real CAW 默认关闭，配置不完整时 fail closed；
- mock txHash 为 `null`；
- CAW status refresh 不改写历史 Audit Report。

## 运行

```bash
python -m uvicorn app.main:app --reload --port 8000
python -m pytest -q
```

部署和环境变量见 [`docs/backend/`](../docs/backend/README.md)。
