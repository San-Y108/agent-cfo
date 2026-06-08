# AGENTS.md

Project-level instructions for AI coding agents working in this backend workspace.

Default explanation language: Chinese.

## Start Here

- Read `spec.md` before implementing backend behavior.
- Treat `spec.md` as the source of truth for APIs, data models, risk rules, CAW integration, audit reports, and demo fallback.
- Read `README.md` for project context and current repository status.
- Keep changes small and reviewable.
- Do not invent APIs, configs, CAW settings, wallet addresses, tx hashes, or file paths.

## Project Mission

AgentCFO is a hackathon MVP for the Cobo Agentic Commerce track.

The backend must prove this controlled finance loop:

```text
Contribution records
-> AI Payment Plan
-> Risk Check
-> Human Approval
-> Cobo Agentic Wallet Execution
-> Tx Hash and Audit Report
```

This is not a generic finance backend. The core value is controlled AI-assisted DAO treasury execution.

## Working Order

Before editing:

- Identify whether the task is P0, P1, or P2 using `spec.md`.
- State the files to change and the plan in 3-6 bullets.
- Search existing docs or code before assuming names, paths, or contracts.
- Prefer the smallest change that advances the demo loop.

When uncertain:

- Ask before choosing a backend framework.
- Ask before changing API names or response shapes.
- Ask before adding P2 features.
- Ask before touching production funds, real CAW credentials, or live transaction evidence.

## Backend P0 Scope

P0 is the only default implementation scope:

- `POST /api/payment-plan`
- `POST /api/risk-check`
- `POST /api/execute-payment`
- `GET /api/audit-report/:id`
- Mock contribution input support.
- Deterministic risk checks.
- CAW adapter for payment execution.
- Audit report output.
- Frontend-ready response shapes.

Do not implement Request Network, Sablier, Safe modules, multi-agent treasury, or multi-chain support unless explicitly requested.

## Architecture Rules

- Keep business rules in services, not controllers.
- Keep CAW access behind a small adapter.
- Keep LLM usage behind a planner or agent service.
- Keep deterministic risk checks separate from LLM output.
- Prefer explicit schemas, types, and errors.
- Prefer explicit error handling over silent fallback behavior.
- Add comments only when intent is not obvious.

## LLM Rules

The LLM may summarize contribution records, generate payment reasons, produce a structured payment plan, and explain suspicious items.

The LLM must not authorize payments, bypass risk checks, invent wallet addresses, invent tx hashes, invent CAW configuration, or execute payments directly.

Validate LLM output with a strict schema before use.

## Risk And Payment Rules

Risk checks are deterministic business rules.

Before execution, verify:

- Total amount does not exceed monthly budget.
- Each item is under the single-payment limit.
- Token matches the allowed token.
- Recipient wallet is in the whitelist.
- Duplicate recipient or duplicate task is detected.
- Human approval exists.

Never execute blocked payments or payments that have not passed risk check.

## CAW And Secrets

- All real payment execution must go through Cobo Agentic Wallet.
- Use environment variables for CAW credentials and wallet configuration.
- Never commit secrets, tokens, private keys, `.env` values, or wallet credentials.
- Never paste secrets into code, logs, README, examples, or test fixtures.
- If CAW credentials are missing, return a clear configuration error.
- Mock execution is allowed only when clearly labeled as mock.
- Do not present mock tx hashes as real transactions.

## Validation And Output

- If tests exist, add or update tests for behavior changes.
- Run the fastest relevant check first.
- For API changes, run route-specific tests before a full suite.
- If no test framework exists, provide curl examples or a manual validation path.
- Final responses for changes must include: summary, files changed, commands run, and remaining risk.
