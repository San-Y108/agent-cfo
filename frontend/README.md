# AgentCFO Frontend / DAO AI 财务官

AgentCFO is an AI CFO for Web3 small teams and DAOs. It turns contribution records and treasury rules into risk-checked payout plans, human-approved execution, and auditable settlement reports.

**Slogan:** *Give every DAO an AI CFO with a controlled wallet.*

## Live URLs

| Environment | URL | Status |
|---|---|---|
| **Production** | [https://agentcfo-frontend.vercel.app](https://agentcfo-frontend.vercel.app) | ✅ mock mode |
| **Landing** | `/` | ✅ Hero + scroll sections |
| **Console** | `/console` | ✅ Agent-first Command Center |

Console sub-routes: `/console/treasury` · `/console/wallets` · `/console/analytics` · `/console/policy`

## What the demo shows

1. **Payment Plan** — AI consolidates contributor records into a payout plan
2. **Risk Gate** — budget, whitelist, single-payment limit, duplicate, token checks
3. **Human Approval** — explicit confirmation; Bob blocked (wallet not whitelisted)
4. **CAW Execution** — simulated Agent Wallet execution with tx hash
5. **Audit Report** — approved/blocked counts, risk summary, settlement receipt
6. **Agent Hub** — chat-first Agent CFO at `/console` with edge-capsule module panels

**Demo scenario:** Alice 20 / **Bob 15 (blocked)** / Charlie 10 / Data API 5 USDC. Budget 50, limit 25.

## Mock / Real Boundary

| Layer | Status |
|---|---|
| Landing + Console UI | ✅ Implemented |
| Console mock data | ✅ `lib/demo/console-mock.ts` |
| API types / adapter | ✅ Aligned with backend |
| `runDemoFlow()` real chain | ✅ Verified locally |
| Console real mode UI | ❌ Pending Render URL + CORS |
| CAW on-chain | ⚠️ Simulated in mock mode |

## Tech Stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion · GSAP · recharts · pnpm

Custom i18n via `lib/i18n/` (EN / ZH). Landing stays dark-only; Console supports light/dark theme toggle.

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

## Documentation

| File | Purpose |
|---|---|
| `CLAUDE.md` | Master spec — read first |
| `HANDOFF.md` | Handoff index → latest phase docs |
| `checklist.md` | Task checklist |
| `backend-integration.md` | API integration guide |
| `docs/plans/console-upgrade-checklist.md` | Detailed phase progress |

## Team Boundary

Frontend work stays in **`frontend/`** only. Backend contract source of truth: `app/models.py`, `app/routers/payments.py`, `tests/test_mvp_flow.py`.

## Safety

Hackathon demo only. No real funds in mock mode. Do not use for production treasury operations.
