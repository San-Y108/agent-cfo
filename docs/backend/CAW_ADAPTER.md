# CAW Adapter — Contract、Phase 4C 与 Read-Only Observer

> 从合并前 [`README-20260613-pre-polish.md`](../backup/README-20260613-pre-polish.md) 拆出。契约真相源：`app/models.py` · `app/routers/payments.py` · `tests/test_mvp_flow.py`

## Cobo Agentic Wallet Evidence

以下内容按当前可验证状态维护。公开文档只记录脱敏地址和公开 tx hash；不要补 API key、pact-scoped key、`.env`、raw provider response 或未脱敏钱包地址。

| 证据项 | 当前状态 |
| --- | --- |
| CAW API Key | ✅ 已申请并配置（不写入仓库） |
| Agent Wallet | ✅ 已创建；公开文档只使用 masked source `0x2cda...76da` |
| SDK | ✅ 确认 `cobo-agentic-wallet v0.1.40` |
| Testnet / Chain | ✅ Sepolia / `SETH` |
| Token | ✅ `SETH` |
| Transaction Hash (demo payment) | ✅ `0x85a5a2e934ca0e34c7fb3e038ca06e54e15bd29b56b64e5b01ff80eb20ed4d98` |
| Transaction Hash (internal transfer) | ✅ `0x6bd793bc3030c995245b2e73a466898e46278be092aa9f7a3c86cad21cbbae8a` |
| CAW Request ID | ✅ `agentcfo_exec_demo_002_pay_001`（demo payment） |
| Provider final status | ✅ `900` |
| CAW audit actions | ✅ `transfer.allowed` and `transfer.initiate` were allowed |
| CAW config notes | ✅ 已交付 518 行后端对接说明 |
| Payment screenshots | 待补充；截图必须先脱敏 |

真实付款必须通过 Cobo Agentic Wallet。Mock mode 只能用于演示兜底，必须明确标注。

### Phase 4C successful testnet evidence — demo payment

| Field | Public evidence |
| --- | --- |
| `chain` / `token` | `SETH` / `SETH` |
| `amount` | `0.001` |
| recipient | `0xAf3f...594B` |
| source | `0x2cda...76da` |
| `request_id` / `cawRequestId` | `agentcfo_exec_demo_002_pay_001` |
| provider final status | `900` |
| `txHash` | `0x85a5a2e934ca0e34c7fb3e038ca06e54e15bd29b56b64e5b01ff80eb20ed4d98` |
| audit log summary | `transfer.allowed` and `transfer.initiate` were allowed |

### Phase 4C — internal transfer (same wallet)

| Field | Public evidence |
| --- | --- |
| `chain` / `token` | Sepolia / `SETH` |
| `amount` | `0.001` |
| source | `0x2cda...76da` |
| counterparty | `0xaa55...c199` |
| `txHash` | `0x6bd793bc3030c995245b2e73a466898e46278be092aa9f7a3c86cad21cbbae8a` |
| note | 同 Agent Wallet 地址下的内部划转验证；**不替代** demo payment 证据 |

This proves two low-value CAW testnet transfers. It does not prove three separate commercial payment tx hashes.

## CAW Adapter Contract

当前代码定义了 CAW adapter contract、默认 `MockCawAdapter`，以及 testnet-only 的 opt-in `RealCawAdapter` skeleton。完整 Demo 默认仍然不需要 CAW secrets。

共同 contract：

- `create_transfer(execution_id, payment)`：返回标准 `PaymentExecutionItem`。
- `failed_transfer(execution_id, payment, error)`：返回标准失败 `PaymentExecutionItem`。
- adapter 必须暴露 `mode`、`network`、`agent_wallet_address`。
- 默认 factory 返回 mock adapter；只有显式设置 real mode 和 transfer flag 时才会尝试真实 testnet adapter。

`RealCawAdapter` 必须保持 P0 API 行为不变：Risk Check 仍是唯一决定 `Ready` / `NeedsApproval` / `Blocked` 的地方，Execute Payment 仍必须要求 `humanApproval.approved=true`，blocked payment 不能进入 adapter。缺少 base URL、auth、wallet id、pact active 状态、policy rules、approval flow、chain/token/recipient allowlist 或 amount limit 时必须 fail closed。

## Phase 4C Testnet CAW Adapter

Phase 4C-0 / 4C-1 adds a testnet-only `RealCawAdapter` skeleton behind the existing `CawAdapter` contract. Default mode remains mock. The real adapter is opt-in and fail-closed.

Required environment variable names:

| Name | Purpose | Secret |
| --- | --- | --- |
| `CAW_ADAPTER_MODE` | `mock` or `real`; default is `mock` | No |
| `CAW_ENABLE_TRANSFERS` | must be `true` before any real transfer attempt | No |
| `AGENT_WALLET_API_URL` | CAW API base URL | No |
| `AGENT_WALLET_API_KEY` | Agent API key used only to submit/poll pact | Yes |
| `AGENT_WALLET_WALLET_ID` | Agent Wallet wallet id | No |
| `CAW_ALLOWED_CHAIN_IDS` | comma-separated testnet chain ids, for example `SETH` | No |
| `CAW_ALLOWED_TOKEN_IDS` | comma-separated token ids | No |
| `CAW_ALLOWED_RECIPIENTS` | comma-separated recipient allowlist | No |
| `CAW_SOURCE_ADDRESS` | optional source address for wallets with multiple compatible addresses | No |
| `CAW_MAX_AMOUNT` | decimal natural-unit max amount | No |

Local example with placeholders only:

```text
CAW_ADAPTER_MODE=real
CAW_ENABLE_TRANSFERS=true
AGENT_WALLET_API_URL=<provided-by-caw-teammate>
AGENT_WALLET_API_KEY=<provided-by-caw-teammate>
AGENT_WALLET_WALLET_ID=<provided-by-caw-teammate>
CAW_ALLOWED_CHAIN_IDS=<testnet-chain-id>
CAW_ALLOWED_TOKEN_IDS=<testnet-token-id>
CAW_ALLOWED_RECIPIENTS=<test-recipient-address>
CAW_SOURCE_ADDRESS=<wallet-source-address-if-needed>
CAW_MAX_AMOUNT=<low-testnet-amount>
```

Safety behavior:

- Real adapter is used only when `CAW_ADAPTER_MODE=real`.
- Real transfer attempts are blocked unless `CAW_ENABLE_TRANSFERS=true`.
- Missing `AGENT_WALLET_API_URL`, `AGENT_WALLET_API_KEY`, or `AGENT_WALLET_WALLET_ID` fails closed.
- Chain, token, recipient, and amount are checked locally before any SDK transfer call.
- Only configured testnet chain ids are allowed; mainnet is not implemented.
- Contract calls are not implemented.
- The adapter submits a pact, polls until active with a bounded limit, then uses only the in-memory pact-scoped API key for `transfer_tokens`.
- Stable `request_id` is generated per payment item.
- `txHash` stays `null` unless CAW returns a real `transaction_hash`.
- Policy denial and provider failures are returned as redacted public error codes.
- `caw_pact_submit_error` means pact submission failed before a transfer attempt.
- `caw_transfer_submit_error` means pact activation passed but transfer submission failed.
- `caw_policy_denied` means CAW policy rejected the transfer attempt.

Do not commit `cobo-agentic-wallet-backend-quickstart.md`. Do not create or commit `.env`. Do not paste `AGENT_WALLET_API_KEY` or any pact-scoped API key into code, docs, logs, tests, screenshots, or chat.

Manual live test checklist, only after explicit approval:

1. Confirm the test recipient address.
2. Confirm testnet chain, token id, and low amount.
3. Confirm the Agent Wallet has testnet balance.
4. Confirm all env vars are set through the deployment/user environment, not `.env`.
5. Run `python -m pytest -q`.
6. Start the server.
7. Execute one approved, risk-checked, low-value payment.
8. Verify `/api/caw-status/{cawRequestId}`, `/api/caw-status/{cawRequestId}/refresh`, and `/api/audit-report/{auditReportId}`.

For one-off local live-test scripts, set `AGENTCFO_DB_PATH` to an absolute repo-local path before importing `app.main`; otherwise the app process can initialize a different store than the script expects.

If a live test returns `txHash=null`, first query CAW by `request_id`. If CAW returns not found, check whether pact submission reached CAW before considering another transfer. The installed SDK requires `submit_pact(..., intent="...", spec={...})`; omitting `intent` fails before CAW creates a transaction record.

Evidence to capture after an approved live test:

| Field | Source |
| --- | --- |
| `chain` | `CAW_ALLOWED_CHAIN_IDS` and CAW transaction/status view |
| `token` | payment item token and CAW transaction/status view |
| `request_id` | stable CAW SDK request id generated per payment |
| `cawRequestId` | backend execution response and `/api/caw-status/{cawRequestId}` |
| `txHash` | CAW transaction response/status when available |
| `auditReportId` | backend execution response |
| `CAW status` | `/api/caw-status/{cawRequestId}` and CAW status/audit log view |

Render env checklist for testnet real mode:

```text
CAW_ADAPTER_MODE=real
CAW_ENABLE_TRANSFERS=true
AGENT_WALLET_API_URL=<provided-by-caw-teammate>
AGENT_WALLET_API_KEY=<Render secret env var>
AGENT_WALLET_WALLET_ID=<provided-by-caw-teammate>
CAW_ALLOWED_CHAIN_IDS=<testnet-chain-id>
CAW_ALLOWED_TOKEN_IDS=<testnet-token-id>
CAW_ALLOWED_RECIPIENTS=<test-recipient-address>
CAW_SOURCE_ADDRESS=<wallet-source-address-if-needed>
CAW_MAX_AMOUNT=<low-testnet-amount>
```

Rollback to mock mode:

```text
CAW_ADAPTER_MODE=mock
CAW_ENABLE_TRANSFERS=false
```

After rollback, restart the local server or redeploy Render so the app process reloads environment variables. Mock mode must return `mode="mock"` and `txHash=null`.

No live transfer is run by tests. Tests use fake SDK clients only.

## CAW Read-Only Observer

Phase 4B 加入了 CAW read-only observer skeleton；Phase 4C closeout 暴露了只读 refresh API。它们用来固定只读查询边界：

- pact status query
- transaction by `request_id`
- audit logs query
- provider status normalization

`GET /api/caw-status/{cawRequestId}` 读取当前本地保存的 CAW status。

`GET /api/caw-status/{cawRequestId}/refresh` 先确认本地 `cawRequestId` 存在，再通过 read-only client 按 `request_id` 查询 CAW 最新交易状态，归一化 provider status，保存更新后的 `CawStatus`，并返回更新结果。它不会调用 `transfer_tokens`，不会创建新付款计划，不会触发任何转账。

In mock or ephemeral Render mode, refresh can safely return `404 CAW provider transaction not found` for a mock `cawRequestId`, because no real CAW provider transaction exists for mock execution. This is expected and must not be retried by triggering a live transfer.

Audit Report 是执行时快照，后续 status refresh 不能改写历史 Audit Report。Frontend should treat Audit Report as immutable evidence and CAW Status as the latest refreshable status. If the audit snapshot has `txHash=null` but refreshed CAW Status has a real `txHash`, show the real hash in a separate “Latest CAW Status” area and keep the audit snapshot unchanged.

Observer 不持久化 raw provider error，只保存稳定的公开错误码。未知 provider status 必须 fail closed，API 返回安全公开错误，不回显 provider 原文。

真实 CAW read-only client 只用于查询，不用于转账。启用前需要 CAW 同学确认官方 SDK/API、auth、wallet、pact、policy、approval、chain/token、status query 和 audit log 细节；未知 provider status 必须 fail closed，不能自行猜测未确认的 REST endpoint。
