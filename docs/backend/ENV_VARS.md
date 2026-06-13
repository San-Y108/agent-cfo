# Environment Variables

> 从合并前 [`README-20260613-pre-polish.md`](../backup/README-20260613-pre-polish.md) 拆出。

默认 mock 模式不读取任何 CAW secrets。只有显式启用 testnet real adapter 时，后端才会从环境变量读取 CAW 配置：

| 变量类别 | 用途 | 状态 |
| --- | --- | --- |
| PAYMENT_PLANNER_MODE | `mock` 或 `openai`，默认 `mock` | 可选 |
| OPENAI_API_KEY | 显式启用 OpenAI planner 时使用 | 不提交，必须走环境变量 |
| OPENAI_MODEL | OpenAI planner 模型，默认 `gpt-4.1-mini` | 可选 |
| CAW_ADAPTER_MODE | `mock` 或 `real`，默认 `mock` | 可选 |
| CAW_ENABLE_TRANSFERS | 必须为 `true` 才允许真实 testnet transfer attempt | 可选 |
| AGENT_WALLET_API_URL | Cobo Agentic Wallet API base URL | real mode 必需 |
| AGENT_WALLET_API_KEY | 调用 Cobo Agentic Wallet 和申请 pact-scoped key | real mode 必需，不提交 |
| AGENT_WALLET_WALLET_ID | 选择 Agent Wallet | real mode 必需 |
| CAW_ALLOWED_CHAIN_IDS | 测试网 chain id allowlist | real mode 必需 |
| CAW_ALLOWED_TOKEN_IDS | token id allowlist | real mode 必需 |
| CAW_ALLOWED_RECIPIENTS | recipient allowlist | real mode 必需 |
| CAW_SOURCE_ADDRESS | 多个兼容源地址时指定扣款地址 | 可选，但 live test 推荐设置 |
| CAW_MAX_AMOUNT | 单笔最大金额 | real mode 必需 |
| REQUEST_FINANCE_MODE | `mock` 或 `live`，默认 `mock` | 可选 |
| REQUEST_FINANCE_API_BASE_URL | Request Finance API base URL，默认 `https://api.request.finance/` | 可选 |
| REQUEST_FINANCE_API_KEY | Request Finance API key | live mode 必需，不提交 |
| REQUEST_FINANCE_AUTH_SCHEME | `api_key` 或 `oauth_bearer`，默认 `api_key` | 可选；OAuth/Bearer 必须显式开启 |
| REQUEST_FINANCE_ALLOW_INVOICE_CREATE | 预留的 invoice-create guard；默认 `false` | 可选，当前仍不得开启 |
| AGENTCFO_DB_PATH | SQLite demo database path | 可选，本地默认 `agentcfo_demo.sqlite3` |
| AGENTCFO_STORE_BACKEND | 可选切回 in-memory store | 仅本地临时 demo 使用 |
| CORS_ALLOWED_ORIGINS | 生产前端 origin | Render 部署推荐设置 |
| MINIMAX_API_KEY | Agent Hub 聊天代理调用 MiniMax | 不提交，必须走环境变量 |
| MINIMAX_BASE_URL | MiniMax OpenAI 兼容 base URL，默认 `https://api.minimaxi.com/v1` | 可选 |
| MINIMAX_MODEL | Agent 聊天模型，默认 `MiniMax-M2.5-highspeed` | 可选 |

不要提交 `.env`、API key、private key、token 或生产钱包凭证。

## 相关

- CAW real mode 变量详解：[`CAW_ADAPTER.md`](CAW_ADAPTER.md)
- Render 部署：[`DEPLOYMENT.md`](DEPLOYMENT.md)
- Request Finance：[`REQUEST_FINANCE.md`](REQUEST_FINANCE.md)
