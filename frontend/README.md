# AgentCFO / DAO AI 财务官

AgentCFO is an AI CFO for Web3 small teams and DAOs. It turns contribution records and treasury rules into risk-checked payout plans, human-approved execution, and auditable settlement reports.

## Demo

- **Local demo route:** [`/demo`](http://localhost:3000/demo)
- **Live demo:** [https://hackathon-frontend-sigma.vercel.app](https://hackathon-frontend-sigma.vercel.app)
- **Demo status:** mock-only frontend demo
- **Real transaction status:** no real blockchain transaction yet

## What the demo shows

1. **Payment Plan Generation** — consolidate contributor payouts and subscription bills into a single settlement plan
2. **Risk Gate** — automatically check budget, whitelist, single-payment limit, and duplicate payment policy
3. **Human Approval** — require explicit human approval before any payout execution; blocked items are rejected
4. **Simulated Cobo Agentic Wallet Execution** — mock execution showing Agent Wallet, permission boundary, and transaction hash (simulated on Base Sepolia testnet)
5. **Settlement Receipt / Audit Report** — formal audit summary with approved count, blocked count, risk summary, and execution summary

## Mock / Real Boundary

| Layer | Status | Note |
|---|---|---|
| Frontend UI | ✅ Implemented | Demo Console v0 with 6 core sections |
| Mock Data | ✅ Ready | 3 contributors + 1 subscription; Bob blocked by whitelist |
| Payment Plan Logic | ✅ Mock | Generated from static mock data |
| Risk Gate Logic | ✅ Mock | Policy checks against static rules |
| Human Approval Flow | ✅ Mock | Static approved / blocked states |
| CAW Execution | ⚠️ Simulated | **No real Cobo Agentic Wallet call**; tx hashes are mock |
| Blockchain Transaction | ❌ None | **No real on-chain transaction occurred** |
| Backend API | ❌ Not connected | `lib/api/*` adapters are placeholders |

UI has reserved display slots for Agent Wallet address, permission boundary, tx hash, and audit report. These can be wired to real Cobo Agentic Wallet / testnet execution in subsequent iterations.

## Sponsor Track Fit — Cobo

- **Agentic treasury payout:** AgentCFO autonomously analyzes payment requests and generates payout plans
- **Permission boundary:** Budget limit, single-payment cap, token whitelist, and recipient whitelist are enforced before execution
- **Human-in-the-loop:** Risk-checked plans require explicit human approval — no autonomous fund transfer
- **Auditability:** Every decision (risk check, approval, execution) is recorded in a settlement receipt
- **Agent Wallet execution path:** UI demonstrates how a Cobo Agentic Wallet would execute approved payouts under policy constraints
- **Future real CAW integration:** `lib/api/caw.ts` adapter is pre-structured for real Cobo Agentic Wallet API calls

## Local Development

```bash
pnpm install
pnpm dev
# open http://localhost:3000/demo
```

Other commands:

```bash
pnpm typecheck   # TypeScript type check
pnpm build       # Production build
pnpm start       # Start production server
```

## Current Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Mock-first frontend architecture

## Project Status

| Item | Status |
|---|---|
| Demo Console v0 | ✅ Done |
| DESIGN.md | ✅ Done |
| Mock data & workflow | ✅ Done |
| Real backend API | ❌ Not implemented |
| Real CAW execution | ❌ Not implemented |
| Vercel deployment | ✅ Done |
| README demo orientation | ✅ Done |

## Safety Notes

This project is a **hackathon demo only**. No real funds, real wallets, or real blockchain transactions are involved. All execution results are simulated. Do not use for production treasury operations.
