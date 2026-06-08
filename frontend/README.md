# AgentCFO Frontend / DAO AI 财务官

AgentCFO is an AI CFO for Web3 small teams and DAOs. It turns contribution records and treasury rules into risk-checked payout plans, human-approved execution, and auditable settlement reports.

**Slogan:** *Give every DAO an AI CFO with a controlled wallet.*

## Live URLs

| Environment | URL | Status |
|---|---|---|
| **Production** | [https://agentcfo-frontend.vercel.app](https://agentcfo-frontend.vercel.app) | ✅ mock mode，公开可访问 |
| **Landing Page** | `/` | ✅ Velorix IIC 风格 Hero（纯 CSS 动效）|
| **Demo Console** | `/demo` | ⚠️ 静态看板，待 redesign |

## What the demo shows

1. **Payment Plan Generation** — AI generates a consolidated payout plan from contributor records and subscription bills
2. **Risk Gate** — automatic checks for budget, whitelist, single-payment limit, duplicate payment, and token policy
3. **Human Approval** — explicit human confirmation required before execution; blocked items (e.g. Bob) are rejected
4. **Simulated Cobo Agentic Wallet Execution** — mock execution showing Agent Wallet, permission boundary, and transaction hash
5. **Settlement Receipt / Audit Report** — formal audit summary with approved count, blocked count, risk summary, and execution summary

**Demo scenario:** Alice 20 / **Bob 15 (blocked, wallet not in whitelist)** / Charlie 10 / Data API 5 USDC. Monthly budget 50, single-payment limit 25.

## Mock / Real Boundary

| Layer | Status | Note |
|---|---|---|
| Frontend UI | ✅ Implemented | Landing Hero + Demo Console v0 |
| Mock Data | ✅ Ready | 4 items; Bob blocked by whitelist |
| API Types / Adapter | ✅ Aligned | `lib/api/*` mirrors backend Pydantic models |
| Mock Shape | ✅ Aligned | Same structure as real backend responses |
| Workflow (Real Chain) | ✅ Verified | `runDemoFlow()` tested against local uvicorn |
| Backend API | ✅ Implemented | FastAPI, 4 endpoints, `pytest` 12 passed |
| CAW Execution | ⚠️ Simulated | Mock mode; real CAW integration pending |
| Blockchain Transaction | ❌ None | No real on-chain transaction yet |
| Demo Redesign | 🔜 In Progress | Static dashboard → step-by-step agent workflow |

## Tech Stack

- Next.js 16 (App Router / Turbopack)
- React 19
- TypeScript (strict)
- Tailwind CSS v4
- Framer Motion 12
- GSAP 3.15 + `@gsap/react`
- lucide-react
- pnpm

## Local Development

```bash
pnpm install
PORT=3100 pnpm dev
# open http://localhost:3100
```

> ⚠️ **Do not use port 3001** — a stale Service Worker from a previous Vite/PWA app will hijack the page and cause a blank white screen. Port 3000 may also be occupied.

Other commands:

```bash
pnpm typecheck   # TypeScript type check
pnpm build       # Production build
pnpm start       # Start production server
```

## Sponsor Track Fit — Cobo

- **Agentic treasury payout:** AgentCFO autonomously analyzes payment requests and generates payout plans
- **Permission boundary:** Budget limit, single-payment cap, token whitelist, and recipient whitelist are enforced before execution
- **Human-in-the-loop:** Risk-checked plans require explicit human approval — no autonomous fund transfer
- **Auditability:** Every decision (risk check, approval, execution) is recorded in a settlement receipt
- **Agent Wallet execution path:** UI demonstrates how a Cobo Agentic Wallet would execute approved payouts under policy constraints

## Project Status

| Item | Status |
|---|---|
| Landing Hero (Velorix IIC) | ✅ Done |
| Demo Console v0 | ✅ Done |
| API Contract Aligned | ✅ Done |
| Mock Data & Workflow | ✅ Done |
| Vercel Deployment | ✅ Done |
| Demo Console Redesign | 🔜 In Progress |
| Real Backend Integration | ⏳ Blocked (waiting for Render URL + CORS) |
| Landing Scroll Sections | ⏳ Pending |

## Safety Notes

This project is a **hackathon demo**. No real funds, real wallets, or real blockchain transactions are involved in mock mode. All execution results are simulated. Do not use for production treasury operations.
