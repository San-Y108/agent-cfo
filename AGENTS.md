# AGENTS.md

Project-level instructions for agents working in this backend workspace.

Default explanation language: Chinese.

## Read First

- Read `spec.md` before implementing backend behavior.
- Treat `spec.md` as the source of truth for API shape, data models, risk rules, CAW integration, audit reports, and demo fallback behavior.
- Keep changes small and reviewable.
- Do not add a concrete backend framework unless the user asks or approves it.

## Project Mission

AgentCFO is a hackathon MVP for the Cobo Agentic Commerce track.

The backend must prove this loop:

```text
Contribution records
-> Agent payment plan
-> Risk check
-> Human approval
-> Cobo Agentic Wallet execution
-> Tx hash and audit report
```

This is not a generic finance backend. The core value is controlled AI-assisted treasury execution.

## Backend P0 Scope

Implement only the smallest reliable backend needed for the demo:

- `POST /api/payment-plan`
- `POST /api/risk-check`
- `POST /api/execute-payment`
- `GET /api/audit-report/:id`
- Mock contribution input support.
- Deterministic risk checks.
- CAW adapter for payment execution.
- Audit report output.
- Frontend-ready response shapes.

Do not implement P2 ideas such as Request Network, Sablier, Safe modules, multi-agent treasury, or multi-chain support until P0 works.

## Architecture Rules

- Keep business rules in services, not controllers.
- Keep CAW access behind a small adapter.
- Keep LLM usage behind a planner or agent service.
- Keep deterministic risk checks separate from LLM output.
- Prefer explicit types, schemas, and validation.
- Add comments only when intent is not obvious.

## LLM Rules

The LLM may:

- Summarize contribution records.
- Generate payment reasons.
- Produce a structured payment plan.
- Explain suspicious items.

The LLM must not:

- Authorize payments.
- Bypass risk checks.
- Invent wallet addresses.
- Invent transaction hashes.
- Invent CAW configuration.
- Execute payments directly.

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

## CAW Rules

- All real payment execution must go through Cobo Agentic Wallet.
- Use environment variables for CAW credentials and wallet configuration.
- Never commit secrets, tokens, private keys, `.env` values, or wallet credentials.
- If CAW credentials are missing, return a clear configuration error.
- Mock execution is allowed only when clearly labeled as mock.
- Do not present mock tx hashes as real transactions.

## Audit Rules

Audit output is part of the product.

Record enough information to explain:

- Input received.
- Payment plan generated.
- Risk checks passed or failed.
- Human approval status.
- CAW execution result.
- Tx hash for each executed payment.
- Blocked or failed payment reasons.
- Remaining budget.

## Build And Validation

- If tests exist, add or update tests for behavior changes.
- Run the fastest relevant check first.
- For API changes, run route-specific tests before a full suite.
- If no test framework exists, provide curl examples or a small manual validation path.
- Do not run formatters or generators that rewrite unrelated files.

## Output Expectations

For code or document changes, final responses must include:

- Short summary.
- Files changed.
- Commands run.
- Remaining risk.

For debugging, include:

- Hypotheses.
- Experiments run.
- Minimal fix.

