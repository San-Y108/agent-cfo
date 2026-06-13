# AgentCFO Frontend / DAO AI 财务官

AgentCFO is an AI CFO for Web3 small teams and DAOs. It turns contribution records and treasury rules into risk-checked payout plans, human-approved execution, and auditable settlement reports.

**Slogan:** *Give every DAO an AI CFO with a controlled wallet.*

**主开发者：** threetwoa（Claude Code · 工作目录 `frontend/`）

---

## Live URLs

| Environment | URL | Status |
|---|---|---|
| **Production** | [https://agentcfo-frontend.vercel.app](https://agentcfo-frontend.vercel.app) | ✅ mock mode |
| **Landing** | `/` | ✅ Hero + scroll sections |
| **Console** | `/console` | ✅ Agent-first Command Center |

Console sub-routes: `/console/treasury` · `/console/wallets` · `/console/analytics` · `/console/policy`

---

## What the demo shows

1. **Payment Plan** — AI consolidates contributor records into a payout plan
2. **Risk Gate** — budget, whitelist, single-payment limit, duplicate, token checks
3. **Human Approval** — explicit confirmation; Bob blocked (wallet not whitelisted)
4. **CAW Execution** — simulated Agent Wallet execution with tx hash
5. **Audit Report** — approved/blocked counts, risk summary, settlement receipt
6. **Agent Hub** — chat-first Agent CFO at `/console` with edge-capsule module panels

**Demo scenario:** Alice 20 / **Bob 15 (blocked)** / Charlie 10 / Data API 5 USDC. Budget 50, limit 25.

---

## Mock / Real Boundary

| Layer | Status |
|---|---|
| Landing + Console UI | ✅ Implemented |
| Console mock data | ✅ `lib/demo/console-mock.ts` |
| API types / adapter | ✅ Aligned with backend |
| `runDemoFlow()` real chain | ✅ Verified locally |
| Console real mode UI | ❌ Pending Render URL + CORS |
| CAW on-chain | ⚠️ Simulated in mock mode |

---

## Tech Stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion · GSAP · recharts · pnpm

Custom i18n via `lib/i18n/` (EN / ZH). Landing stays dark-only; Console supports light/dark theme toggle.

---

## Local Development

```bash
pnpm install
PORT=3100 pnpm dev
# open http://localhost:3100/console
```

> ⚠️ Do not use port **3001** — stale Service Worker causes blank screen.

```bash
pnpm typecheck
pnpm build
```

---

## Claude Code / 多 Agent 工作流

本目录日常由 **Claude Code + 多 Agent 分模块开发**。

| Skill | 路径 |
|---|---|
| **frontend-agent-workflow** | `.claude/skills/frontend-agent-workflow/SKILL.md` |
| 仓库级（跨角色） | 根目录 `.claude/skills/agent-cfo-monorepo-workflow/` |

完整规范见 **[`CLAUDE.md`](CLAUDE.md)**，以下为速查。

### 冷启动（每个新 Session）

1. `CLAUDE.md` → 确认本 Session **任务域**（Treasury / Wallets / Landing / API …）
2. `HANDOFF.md` → 最新 phase handoff
3. 相关 `docs/plans/*-checklist.md`

### Commit 分类（按模块 scope）

| scope | 示例 |
|---|---|
| `console/treasury` | `feat(console/treasury): wire real payment-plan API` |
| `console/wallets` | `fix(console/wallets): CAW status badge overflow` |
| `landing` | `feat(landing): guardrails CTA copy` |
| `api` | `feat(api): align RiskCheckResult with models.py` |
| `docs` / `docs(handoff)` | `docs(handoff): phase 8 real-mode handoff` |

一 commit 一意图；**仅用户要求时**才 commit；多 Agent 并行避免跨域混提交。

### 改动后维护联想

改完代码后对照 [`CLAUDE.md` §2.2](CLAUDE.md#22-改动后维护联想清单) 检查：路由 → `app/README.md`；组件结构 → `components/README.md`；API → `lib/api/README.md`；phase 完成 → `HANDOFF.md` + `docs/handoff/*`。

### Phase 交接（HANDOFF）

| 时机 | 动作 |
|---|---|
| 完成一个 **phase** | 新建 handoff + 更新 `HANDOFF.md` |
| 每再完成 **2 个 phase** | 合并更新 handoff + 刷新 `CLAUDE.md` §7 |
| 小 fix / 单组件微调 | ❌ 不写 handoff；commit message 即可 |
| 用户要求或 Session 将断 | ✅ 按 [`docs/handoff/TEMPLATE.md`](docs/handoff/TEMPLATE.md) 写交接 |

---

## Documentation Map

| File | Audience | Purpose |
|---|---|---|
| **`CLAUDE.md`** | Agent · 开发者 | **总纲**：任务域、执行流程、契约、设计、维护清单 |
| **`.claude/skills/frontend-agent-workflow/`** | Agent | 可执行 workflow skill（与 CLAUDE.md §1–§2 同步） |
| **`HANDOFF.md`** | Agent | 交接索引 → 最新 phase 文档 |
| **`docs/handoff/TEMPLATE.md`** | Agent | HANDOFF 文档模板 |
| **`checklist.md`** | 全员 | 任务勾选态 |
| **`backend-integration.md`** | Agent（API 域） | 联调指南 |
| **`docs/plans/*-checklist.md`** | Agent | 各 phase 细粒度进度 |
| 子目录 **`README.md`** | Agent · 开发者 | 局部目录地图（`app/` · `components/` · `lib/` …） |

### 文档分层

```text
CLAUDE.md          规范 & 流程（Agent 宪法）
README.md          人类入口 + Agent 速查
HANDOFF.md         当前阶段指针
docs/handoff/*     Phase 快照（可接力）
docs/plans/*       计划 & checklist
*/README.md        目录级说明
```

---

## Team Boundary

Frontend work stays in **`frontend/`** only. Backend contract source of truth: `app/models.py`, `app/routers/payments.py`, `tests/test_mvp_flow.py`.

---

## Safety

Hackathon demo only. No real funds in mock mode. Do not use for production treasury operations.
