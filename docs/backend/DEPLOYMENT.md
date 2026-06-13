# Deployment — Render、持久化与 Planner

> 从合并前 [`README-20260613-pre-polish.md`](../backup/README-20260613-pre-polish.md) 拆出。

## Tech Stack

- **Language**: Python 3.14 当前本机可用；如依赖安装失败，改用 Python 3.12/3.13。
- **Framework**: FastAPI
- **Validation**: Pydantic
- **Testing**: pytest + FastAPI TestClient
- **Server**: Uvicorn
- **Storage**: SQLite demo store with repository abstraction
- **CAW**: Cobo Agentic Wallet SDK (`cobo-agentic-wallet==0.1.40`), default mock adapter, opt-in testnet RealCawAdapter skeleton

## Local Development

### Teammate Handoff

如果你是前端或 CAW 同学，按下面步骤拿到后端 mock API：

```bash
git clone https://github.com/San-Y108/agent-cfo.git
cd agent-cfo
```

如果你已经 clone 过仓库：

```bash
git pull
```

确认当前后端交付提交：

```bash
git log --oneline --max-count=3
```

创建虚拟环境：

```bash
python -m venv .venv
```

安装依赖：

```bash
.venv/bin/python -m pip install -r requirements.txt
```

运行测试：

```bash
.venv/bin/python -m pytest -q
```

启动开发服务：

```bash
.venv/bin/python -m uvicorn app.main:app --reload
```

默认服务地址：`http://127.0.0.1:8000`

健康检查：

```bash
curl.exe http://127.0.0.1:8000/health
```

版本和 demo sample：

```bash
curl http://127.0.0.1:8000/version
curl http://127.0.0.1:8000/api/demo-sample
```

`/api/demo-sample` 只返回可复制的 mock demo payload，不创建 plan、不写入数据库、不执行付款。Alice 和 Charlie 在白名单内，Bob 故意不在白名单内，方便前端展示 blocked risk。

FastAPI 自动 docs / OpenAPI 当前已关闭。运行时暴露 P0 业务 API、只读查询 API、demo sample 和部署健康检查。后续进入联调或需要文档展示时，可以在 `app/main.py` 重新开启。

```text
Core routes:
POST /api/payment-plan
POST /api/risk-check
POST /api/execute-payment
GET  /api/audit-report/{auditReportId}
GET  /api/caw-status/{cawRequestId}
GET  /api/caw-status/{cawRequestId}/refresh
GET  /api/demo-sample
GET  /version
GET  /health
```

## Render Deployment

Phase 1 demo backend can be deployed as a Render Web Service.

Render settings:

```text
Build command: pip install -r requirements.txt
Start command: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Render environment variables:

```text
PYTHON_VERSION=3.13.5
CORS_ALLOWED_ORIGINS=https://agentcfo-frontend.vercel.app
CAW_ADAPTER_MODE=mock
CAW_ENABLE_TRANSFERS=false
```

Production must set `CORS_ALLOWED_ORIGINS` to the actual frontend origin. If this variable is not set, the backend only uses local development defaults:

```text
http://localhost:5173
http://127.0.0.1:5173
http://localhost:3000
```

Deployed health check:

```bash
curl.exe https://agentcfo-backend.onrender.com/health
```

Deployed smoke checks:

```bash
curl https://agentcfo-backend.onrender.com/version
curl https://agentcfo-backend.onrender.com/api/demo-sample
```

预期返回：

```json
{"status":"ok","service":"agent-cfo-backend"}
```

This deployment is still mock backend mode by default: no real Cobo Agentic Wallet transfer, no `.env`, and no secrets in the repository. Render should set `CAW_ADAPTER_MODE=mock` and `CAW_ENABLE_TRANSFERS=false` for P1 online verification.

### Render Persistent Disk For Demo Evidence

Use SQLite on a Render persistent disk only as durable demo evidence storage. Do not treat it as a production-grade finance ledger, multi-instance database, or final accounting source of truth.

Recommended Render disk settings:

```text
Mount path: /var/data
AGENTCFO_DB_PATH=/var/data/agentcfo_demo.sqlite3
```

The backend already reads `AGENTCFO_DB_PATH` when creating the SQLite store. If the Render service does not have a persistent disk mounted at `/var/data`, this path will not provide durable evidence and may fail or lose data depending on the filesystem state.

Before enabling this on Render, add a persistent disk in the Render Dashboard or through the Render API, then set `AGENTCFO_DB_PATH=/var/data/agentcfo_demo.sqlite3` and redeploy. Keep P1 online verification in mock mode:

```text
CAW_ADAPTER_MODE=mock
CAW_ENABLE_TRANSFERS=false
```

Persistence verification checklist after the disk exists:

1. Create a P0/P2 mock evidence record through the normal mock API flow.
2. Read it back through the relevant API, such as Audit Report or CAW Status.
3. Trigger a Render redeploy or service restart.
4. Read the same record again and confirm the id and evidence fields are unchanged.

Current Render persistence decision: do not claim durable evidence storage until the persistent disk is attached, redeployed, and the checklist above passes.

## Payment Planner Mode

The backend defaults to the deterministic mock planner:

```text
PAYMENT_PLANNER_MODE=mock
```

OpenAI Structured Outputs can be enabled explicitly:

```text
PAYMENT_PLANNER_MODE=openai
OPENAI_API_KEY=<set in Render or local environment>
OPENAI_MODEL=gpt-4.1-mini
```

The default is always `mock`. The backend only calls OpenAI when `PAYMENT_PLANNER_MODE=openai` and `OPENAI_API_KEY` exists. Missing keys, API errors, timeouts, schema validation failures, or draft payments that change recipient, wallet, task, token, or amount fall back to the mock planner.

The LLM can only draft the Payment Plan summary and payment reasons. The backend still assigns `paymentPlanId`, payment ids, `status="Ready"`, `risks=[]`, `riskLevel="Unchecked"`, and `totalAmount`. Risk Check remains the only place that can decide `Ready`, `NeedsApproval`, or `Blocked`, and Execute Payment still requires `humanApproval.approved=true`.

## Persistence

The backend now uses a repository abstraction with SQLite as the default local demo store. The database path is configured with:

```text
AGENTCFO_DB_PATH=agentcfo_demo.sqlite3
```

If `AGENTCFO_DB_PATH` is not set, the backend writes to `agentcfo_demo.sqlite3` in the current working directory. Tests use an in-memory SQLite database and reset state before each test.

For temporary local demos, you can force the old in-memory store:

```text
AGENTCFO_STORE_BACKEND=memory
```

On Render, SQLite is only suitable for a single-instance demo. To keep SQLite data across deploys or restarts, first get explicit approval, then attach a Render persistent disk at `/var/data` and set `AGENTCFO_DB_PATH=/var/data/agentcfo_demo.sqlite3`. If SQLite is stored on Render's normal ephemeral filesystem, deploys or restarts can lose the database file. For long-running audit storage, multi-instance services, or production-like usage, use Postgres in a later phase instead; do not implement Postgres without explicit approval.

Audit Reports are saved as execution-time snapshots. Later CAW status refreshes must not rewrite historical Audit Report content.

## Demo Smoke Test

本地或 Render 部署后，建议按这个顺序给前端 / PM / 评委做快速检查：

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/version
curl http://127.0.0.1:8000/api/demo-sample
```

联调约定：

| 项目 | 当前值 |
| --- | --- |
| API mode | `mock-demo` |
| CAW mode | `mock` |
| Mock tx hash | `null` |
| Real CAW transfer | Render mock flow 不执行；仅本地 Phase 4C 记录了 2 笔 testnet evidence |
| Demo sample | `GET /api/demo-sample`，非写入 |
| P0 flow | `payment-plan -> risk-check -> execute-payment -> audit-report` |
