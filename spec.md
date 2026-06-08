# AgentCFO Backend Spec

This document defines the backend behavior for the AgentCFO hackathon MVP.

`AGENTS.md` defines how agents should work in this repository. This file defines what the backend must provide.

## 1. Product Goal

AgentCFO is an AI financial officer for Web3 small teams and DAOs.

The MVP proves that an AI agent can:

- Read contribution records and budget rules.
- Generate a structured payment plan.
- Run risk checks before execution.
- Require human approval.
- Execute approved testnet payments through Cobo Agentic Wallet.
- Produce an auditable settlement report.

The required demo loop is:

```text
Contribution records
-> Agent payment plan
-> Risk check
-> Human approval
-> CAW execution
-> Tx hash and audit report
```

## 2. Priorities

P0:

- Payment plan API.
- Risk check API.
- Execute payment API.
- Audit report API.
- Mock contribution data support.
- Deterministic risk engine.
- CAW adapter.
- Frontend integration.

P1:

- Deployment configuration.
- Persistent storage if needed.
- CAW status polling.
- Backend README section.

P2:

- Request Network invoice records.
- Sablier payroll or stream payment.
- Safe module references.
- Multi-agent treasury management.
- Multi-chain support.

Do not implement P2 before P0 is demonstrably working.

## 3. Required APIs

Use these API names unless the project owner approves a change.

### POST /api/payment-plan

Purpose:

- Receive contribution records and budget rules.
- Generate a structured payment plan with payment reasons.

Input:

- `contributions`: array of contribution records.
- `budgetRule`: budget and risk rule object.
- Optional demo or organization metadata.

Output:

- `paymentPlanId`
- `summary`
- `totalAmount`
- `riskLevel`
- `payments`

The output must be structured JSON suitable for frontend rendering.

### POST /api/risk-check

Purpose:

- Apply deterministic rules to a payment plan.
- Mark each payment as ready, blocked, or needing approval.

Input:

- `paymentPlanId` or full payment plan.
- `budgetRule`
- Optional prior payment references for duplicate detection.

Output:

- Overall risk status.
- Per-payment risk status.
- Blocking reasons.
- Remaining budget.
- Whether human approval is required.

### POST /api/execute-payment

Purpose:

- Execute approved and risk-checked payments through CAW.

Input:

- `paymentPlanId`
- Approved payment item ids.
- Human approval flag or approval metadata.

Output:

- `executionId`
- `agentWalletAddress`
- Per-payment execution status.
- `txHash` when available.
- `cawRequestId` when available.

Rules:

- Never execute without human approval.
- Never execute blocked payments.
- Never execute items that have not passed risk check.
- Never execute through a non-CAW real wallet path.

### GET /api/audit-report/:id

Purpose:

- Return the complete settlement audit report.

Output:

- Original input summary.
- Final payment plan.
- Risk check results.
- Human approval record.
- CAW execution results.
- Transaction hashes.
- Remaining budget.
- Blocked or failed payment explanations.

## 4. Data Models

Recommended model names:

- `ContributionRecord`
- `BudgetRule`
- `PaymentPlan`
- `PaymentItem`
- `RiskCheckResult`
- `PaymentExecutionResult`
- `AuditReport`

### ContributionRecord

Fields:

- `name`
- `role`
- `task`
- `wallet`
- `amount`
- `token`

Example:

```json
{
  "name": "Alice",
  "role": "Content Contributor",
  "task": "Wrote event recap article",
  "wallet": "0xAlice...",
  "amount": 20,
  "token": "USDC"
}
```

### BudgetRule

Fields:

- `monthlyBudget`
- `singlePaymentLimit`
- `allowedToken`
- `whitelist`
- `requiresHumanApproval`

Example:

```json
{
  "monthlyBudget": 50,
  "singlePaymentLimit": 25,
  "allowedToken": "USDC",
  "whitelist": ["0xAlice...", "0xCharlie...", "0xDataAPI..."],
  "requiresHumanApproval": true
}
```

### PaymentItem

Fields:

- `id`
- `recipient`
- `wallet`
- `amount`
- `token`
- `reason`
- `status`
- `risks`

Recommended statuses:

- `Ready`
- `Blocked`
- `NeedsApproval`
- `Approved`
- `Executing`
- `Executed`
- `Failed`

### PaymentExecutionResult

Fields:

- `id`
- `paymentItemId`
- `status`
- `agentWalletAddress`
- `txHash`
- `cawRequestId`
- `error`

## 5. Agent And LLM Behavior

The LLM may:

- Normalize contribution records.
- Generate payment reasons.
- Generate a structured payment plan.
- Explain suspicious payment items.

The LLM must not:

- Decide final authorization.
- Bypass risk checks.
- Invent wallet addresses.
- Invent transaction hashes.
- Invent CAW configuration.
- Execute payments directly.

LLM output must be validated with a strict schema before downstream use.

If LLM output is malformed, return an explicit validation error or retry with a bounded retry policy. Do not silently coerce unsafe payment data.

## 6. Risk Engine

Risk checks must be deterministic.

MVP rules:

- Total payment amount must not exceed `monthlyBudget`.
- Each payment amount must not exceed `singlePaymentLimit`.
- Token must match `allowedToken`.
- Recipient wallet must be in `whitelist`.
- Duplicate recipient or duplicate task must be detected.
- Human approval must exist before execution.

Every blocked item must include a concrete reason.

The risk engine should return frontend-readable explanations, not only booleans.

## 7. CAW Integration

All real payment execution must go through Cobo Agentic Wallet.

Implement CAW access behind an adapter. Suggested operations:

- `createTransfer`
- `getTransferStatus`
- `getAgentWallet`

Required CAW-related output:

- Agent Wallet address.
- Testnet chain or network.
- Transaction hash when available.
- CAW request id or execution reference when available.
- Per-payment execution status.

Configuration must come from environment variables.

Required safety behavior:

- Missing CAW credentials return a clear configuration error.
- Mock mode must be explicitly labeled as mock.
- Mock tx hashes must not be presented as real transactions.
- Production and testnet configuration must be clearly separated.

## 8. Audit Report

The audit report must explain:

- What input was received.
- What payment plan the agent generated.
- Which risk checks passed or failed.
- Who or what approved payment execution.
- Which payments were executed.
- Which payments were blocked.
- Which transaction hash belongs to which payment.
- How much budget remains.

MVP storage can be in-memory or local JSON if no backend framework or database exists yet.

If the project later gets a persistence layer, use the existing project pattern instead of inventing a parallel storage system.

## 9. Frontend Contract

Frontend needs:

- Stable response shapes.
- Clear payment statuses.
- Risk reasons per payment item.
- Copyable transaction hash fields.
- Audit report data suitable for rendering.
- A mock mode that still shows the complete workflow if CAW is unavailable.

The backend should expose mock data early so frontend can build the workflow before CAW is fully ready.

## 10. Demo Fallback

Allowed fallback:

- Mock mode for payment planning and risk check.
- Mock execution result clearly labeled as mock.
- Previously recorded testnet transaction hash from the CAW teammate.
- Screenshots or recorded video for CAW execution proof.

Not allowed:

- Presenting mock tx hashes as real transactions.
- Skipping human approval.
- Executing blocked payments.
- Claiming CAW integration is complete without CAW evidence.

## 11. Testing And Acceptance Criteria

Minimum useful backend tests:

- Payment plan schema validation.
- Budget exceeded blocks execution.
- Single-payment limit blocks execution.
- Non-whitelisted wallet blocks execution.
- Duplicate task or recipient is detected.
- Missing human approval blocks execution.
- Blocked payment is not sent to CAW adapter.
- CAW adapter failure appears in audit report.

Acceptance criteria:

- The four P0 APIs can support the full demo loop.
- Frontend can render payment plan, risk check, execution result, and audit report.
- At least one real testnet transaction can be shown through CAW or documented as CAW evidence.
- Mock mode remains clearly distinguishable from real CAW execution.

