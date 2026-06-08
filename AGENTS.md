# AGENTS.md

Project-level instructions for backend agents working on AgentCFO.

Default explanation language: Chinese.

## Project Context

AgentCFO is a hackathon MVP for the Cobo Agentic Commerce track.

The backend is responsible for the AgentCFO brain:

- Parse contribution records and budget rules.
- Generate structured payment plans.
- Run deterministic risk checks.
- Require human approval before execution.
- Execute approved payments through Cobo Agentic Wallet.
- Return transaction results and audit reports.

This is not a generic finance backend. The core demo loop is:

```text
Contribution records
-> Agent payment plan
-> Risk check
-> Human approval
-> CAW execution
-> Tx hash and audit report
```

## Backend Mission

Build the smallest reliable backend that proves:

- An AI agent can understand DAO payment needs.
- The agent can prepare a payment plan with reasons.
- Fund movement is constrained by budget, whitelist, single-payment limit, duplicate checks, and human approval.
- Real or testnet payment execution goes through Cobo Agentic Wallet, not a mock wallet.
- Every payment has an auditable trail.

Prefer a working end-to-end demo over broad feature coverage.

## Scope And Priorities

P0 backend scope:

- `POST /api/payment-plan`
- `POST /api/risk-check`
- `POST /api/execute-payment`
- `GET /api/audit-report/:id`
- Mock contribution input support.
- Deterministic risk engine.
- CAW adapter.
- Audit log output.
- Frontend integration contract.

P1 scope:

- Deployment-ready configuration.
- Persistent storage if needed.
- Better status polling for CAW execution.
- API docs and README backend section.

P2 scope:

- Request Network invoice records.
- Sablier payroll or stream payment.
- Safe module references.
- Multi-agent treasury management.
- Multi-chain support.

Do not implement P2 before the P0 demo loop works.

## Required Backend Capabilities

The backend must provide:

- Payment plan generation from contribution records and budget rules.
- Structured JSON responses suitable for frontend rendering.
- Explicit risk result for each payment item.
- Clear status transitions: planned, ready, blocked, approved, executing, executed, failed.
- Transaction result fields, including transaction hash when available.
- Audit report generation from the full workflow.

Do not hide errors behind silent fallback values.

## API Contract

Use these API names unless the project owner approves a change.

### POST /api/payment-plan

Input:

- Contribution records.
- Budget rules.
- Optional organization or demo session metadata.

Output:

- Payment plan id.
- Summary.
- Total amount.
- Payment items.
- Natural-language payment reasons.
- Initial risk hints if available.

### POST /api/risk-check

Input:

- Payment plan id or full payment plan.
- Budget rules.
- Prior payment references if duplicate detection needs them.

Output:

- Risk status for the whole plan.
- Risk status for each payment item.
- Blocking reasons.
- Remaining budget.
- Whether human approval is required.

### POST /api/execute-payment

Input:

- Payment plan id.
- Approved payment item ids.
- Human approval flag or approval metadata.

Output:

- Execution id.
- Agent wallet address.
- Transaction hash when available.
- Per-payment execution status.
- CAW request ids when available.

Rules:

- Never execute payment without human approval.
- Never execute blocked payments.
- Never execute payment items that have not passed risk check.

### GET /api/audit-report/:id

Output:

- Original input summary.
- Final payment plan.
- Risk check results.
- Human approval record.
- CAW execution results.
- Transaction hashes.
- Remaining budget.
- Failed or blocked payment explanations.

## Data Models

Keep data models small and explicit.

Recommended model names:

- `ContributionRecord`
- `BudgetRule`
- `PaymentPlan`
- `PaymentItem`
- `RiskCheckResult`
- `PaymentExecutionResult`
- `AuditReport`

Contribution record fields:

- `name`
- `role`
- `task`
- `wallet`
- `amount`
- `token`

Budget rule fields:

- `monthlyBudget`
- `singlePaymentLimit`
- `allowedToken`
- `whitelist`
- `requiresHumanApproval`

Payment item fields:

- `id`
- `recipient`
- `wallet`
- `amount`
- `token`
- `reason`
- `status`
- `risks`

Execution result fields:

- `id`
- `paymentItemId`
- `status`
- `agentWalletAddress`
- `txHash`
- `cawRequestId`
- `error`

## Agent / LLM Rules

The LLM may:

- Summarize contribution records.
- Generate payment reasons.
- Normalize payment-plan structure.
- Explain why a payment is suspicious.

The LLM must not:

- Decide final authorization.
- Bypass risk checks.
- Invent wallet addresses.
- Invent transaction hashes.
- Invent CAW configuration.
- Execute payments directly.

Always validate LLM output against a strict schema before using it.

If LLM output is malformed, return an explicit validation error or retry with a bounded retry policy. Do not silently coerce unsafe payment data.

## Risk Engine Rules

Risk checks are deterministic business rules, not LLM judgments.

MVP rules:

- Total payment amount must not exceed monthly budget.
- Each payment amount must not exceed single-payment limit.
- Token must match the allowed token.
- Recipient wallet must be in whitelist.
- Duplicate recipient and duplicate task must be detected.
- Human approval must be present before execution.

Risk result vocabulary:

- `Ready`: item passed all checks but has not executed.
- `Blocked`: item must not execute.
- `NeedsApproval`: item passed checks but requires human approval.
- `Executed`: item was executed through CAW.
- `Failed`: execution failed after approval.

Every blocked item must include a concrete reason.

Avoid defensive checks without a real scenario. Fix root causes instead of masking errors.

## CAW Integration Rules

All real payment execution must go through the Cobo Agentic Wallet integration layer.

Implement CAW access behind a small adapter, for example:

- `createTransfer`
- `getTransferStatus`
- `getAgentWallet`

The rest of the backend should depend on the adapter interface, not raw CAW SDK or HTTP details.

Required CAW-related output:

- Agent Wallet address.
- Testnet chain or network.
- Transaction hash when available.
- CAW request id or execution reference when available.
- Per-payment execution status.

Secrets and credentials must come from environment variables.

Never commit:

- API keys.
- Wallet private keys.
- Access tokens.
- `.env` values.
- Production wallet credentials.

If CAW credentials are missing, return a clear configuration error. For frontend demo continuity, a separately labeled mock mode may be used, but it must not be presented as a real CAW transaction.

## Audit Log Rules

The audit report is a core product feature, not an afterthought.

Record enough information to explain:

- What input was received.
- What the agent planned.
- Which rules passed or failed.
- Who or what approved the payment.
- Which payments were executed.
- Which payments were blocked.
- Which transaction hash belongs to which payment.
- How much budget remains.

MVP storage can be in-memory or local JSON if no database exists yet. If the backend project already has a persistence layer, use the existing pattern.

## Security And Secrets

Follow these rules strictly:

- Do not paste secrets into code, logs, README, or test fixtures.
- Use environment variables for all credentials.
- Do not log full authorization headers.
- Do not log private keys or wallet secrets.
- Do not add analytics, telemetry, or unrelated network calls.
- Keep testnet and production configuration clearly separated.

Payment execution is a sensitive action. Prefer explicit errors over silent fallback behavior.

## Testing And Validation

If the project has tests, add or update tests for behavior changes.

Minimum useful backend tests:

- Payment plan schema validation.
- Budget exceeded blocks execution.
- Single-payment limit blocks execution.
- Non-whitelisted wallet blocks execution.
- Duplicate task or recipient is detected.
- Missing human approval blocks execution.
- Blocked payment is not sent to CAW adapter.
- CAW adapter failure appears in audit report.

Run the fastest relevant check first.

When no test framework exists yet, provide a small manual test script or documented curl examples.

## Demo Fallback Rules

The demo must remain explainable even if CAW or network access is unstable.

Allowed fallback:

- Mock mode for payment planning and risk check.
- Mock execution result clearly labeled as mock.
- Previously recorded testnet tx hash provided by the CAW teammate.
- Screenshots or recorded video for CAW execution proof.

Not allowed:

- Presenting mock tx hashes as real transactions.
- Skipping human approval.
- Executing blocked payments.
- Claiming CAW integration is complete without CAW evidence.

## Collaboration With Frontend And CAW

Frontend needs:

- Stable response shapes.
- Clear payment statuses.
- Risk reasons per payment item.
- Copyable transaction hash fields.
- Audit report data suitable for rendering.

CAW or contract teammate needs:

- Expected transfer request shape.
- Token, chain, wallet id, and policy constraints.
- Environment variable names.
- Testnet execution status.

Backend should expose mock data early so frontend can build the complete workflow before CAW is fully ready.

## Output Expectations

For code changes, final responses must include:

- Short summary.
- Files changed.
- Commands run.
- Remaining risk.

For debugging, final responses must include:

- Hypotheses.
- Experiments run.
- Minimal fix.

Keep explanations concise and concrete.

