# AgentCFO Backend Spec

This document is the backend source of truth for AgentCFO. It defines what the backend must provide. `AGENTS.md` defines how agents should work in this repository.

The current MVP scaffold uses Python, FastAPI, Pydantic, and pytest. The business contract in this document remains the source of truth even if the implementation framework changes later.

## 1. Product Goal

AgentCFO is an AI financial officer for Web3 small teams and DAOs.

The MVP proves that an AI agent can:

- Read contribution records and budget rules.
- Generate a structured Payment Plan with reasons.
- Run deterministic Risk Check before execution.
- Require Human Approval.
- Execute approved testnet payments through Cobo Agentic Wallet.
- Produce an auditable settlement report with tx hash evidence.

Required demo loop:

```text
Contribution Records
-> AI Payment Plan
-> Risk Check
-> Human Approval
-> CAW Execution
-> Audit Report
```

## 2. Scope

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
- Backend README update after scaffold.

P2:

- Request Network invoice records.
- Sablier payroll or stream payment.
- Safe module references.
- Multi-agent treasury management.
- Multi-chain support.

Do not implement P2 before P0 is demonstrably working.

## 3. Core Status Model

Payment items should use these statuses:

- `Ready`: risk checks passed, not yet approved or executed.
- `Blocked`: must not execute; includes concrete reasons.
- `NeedsApproval`: risk checks passed but human approval is still required.
- `Approved`: human approval recorded.
- `Executing`: CAW request submitted or in progress.
- `Executed`: execution completed and tx hash is available when CAW provides it.
- `Failed`: execution failed after approval or CAW submission.

Mock execution must be distinguishable from real CAW execution with an explicit `mode` field or equivalent marker.

## 4. Required APIs

Use these API names unless the project owner approves a change.

### POST /api/payment-plan

Purpose:

- Receive contribution records and budget rules.
- Generate a structured payment plan with payment reasons.

Request example:

```json
{
  "contributions": [
    {
      "name": "Alice",
      "role": "Content Contributor",
      "task": "Wrote event recap article",
      "wallet": "0xAlice...",
      "amount": 20,
      "token": "USDC"
    }
  ],
  "budgetRule": {
    "monthlyBudget": 50,
    "singlePaymentLimit": 25,
    "allowedToken": "USDC",
    "whitelist": ["0xAlice..."],
    "requiresHumanApproval": true
  }
}
```

Response example:

```json
{
  "paymentPlanId": "plan_demo_001",
  "summary": "AgentCFO generated a payment plan for 1 contributor.",
  "totalAmount": 20,
  "riskLevel": "Unchecked",
  "payments": [
    {
      "id": "pay_001",
      "recipient": "Alice",
      "task": "Wrote event recap article",
      "wallet": "0xAlice...",
      "amount": 20,
      "token": "USDC",
      "reason": "Completed event recap article",
      "status": "Ready",
      "risks": []
    }
  ]
}
```

### POST /api/risk-check

Purpose:

- Apply deterministic rules to a payment plan.
- Mark each payment as ready, blocked, or needing approval.

Request example:

```json
{
  "paymentPlanId": "plan_demo_001",
  "budgetRule": {
    "monthlyBudget": 50,
    "singlePaymentLimit": 25,
    "allowedToken": "USDC",
    "whitelist": ["0xAlice..."],
    "requiresHumanApproval": true
  }
}
```

Response example:

```json
{
  "paymentPlanId": "plan_demo_001",
  "overallStatus": "NeedsApproval",
  "remainingBudget": 30,
  "requiresHumanApproval": true,
  "payments": [
    {
      "id": "pay_001",
      "status": "NeedsApproval",
      "risks": []
    }
  ]
}
```

### POST /api/execute-payment

Purpose:

- Execute approved and risk-checked payments through CAW.

Request example:

```json
{
  "paymentPlanId": "plan_demo_001",
  "approvedPaymentIds": ["pay_001"],
  "humanApproval": {
    "approved": true,
    "approvedBy": "demo-operator"
  }
}
```

Response example:

```json
{
  "executionId": "exec_demo_001",
  "mode": "mock",
  "agentWalletAddress": "mock-agent-wallet",
  "payments": [
    {
      "paymentItemId": "pay_001",
      "status": "Executed",
      "mode": "mock",
      "network": "mock-testnet",
      "txHash": null,
      "cawRequestId": "mock_caw_exec_demo_001_pay_001"
    }
  ]
}
```

Rules:

- Never execute without human approval.
- Never execute blocked payments.
- Never execute items that have not passed risk check.
- Never execute through a non-CAW real wallet path.

### GET /api/audit-report/{auditReportId}

Purpose:

- Return the complete settlement audit report.

Response must include:

- Original input summary.
- Final payment plan.
- Risk check results.
- Human approval record.
- CAW execution results.
- Transaction hashes.
- Remaining budget.
- Blocked or failed payment explanations.
- Execution `mode`: `real` or `mock`.

## 5. Data Models

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

### BudgetRule

Fields:

- `monthlyBudget`
- `singlePaymentLimit`
- `allowedToken`
- `whitelist`
- `requiresHumanApproval`

### PaymentItem

Fields:

- `id`
- `recipient`
- `task`
- `wallet`
- `amount`
- `token`
- `reason`
- `status`
- `risks`

### PaymentExecutionResult

Fields:

- `id`
- `paymentItemId`
- `status`
- `mode`
- `network`
- `agentWalletAddress`
- `txHash`
- `cawRequestId`
- `error`

## 6. Agent And LLM Behavior

The LLM may normalize contribution records, generate payment reasons, generate a structured payment plan, and explain suspicious payment items.

The LLM must not decide final authorization, bypass risk checks, invent wallet addresses, invent transaction hashes, invent CAW configuration, or execute payments directly.

LLM output must be validated with a strict schema before downstream use.

If LLM output is malformed, return an explicit validation error or retry with a bounded retry policy. Do not silently coerce unsafe payment data.

## 7. Risk Engine

Risk checks must be deterministic.

MVP rules:

- Total payment amount must not exceed `monthlyBudget`.
- Each payment amount must not exceed `singlePaymentLimit`.
- Token must match `allowedToken`.
- Recipient wallet must be in `whitelist`.
- Duplicate recipient or duplicate task must be detected.
- Human approval must exist before execution.

Every blocked item must include a concrete frontend-readable reason.

## 8. CAW Integration

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
- Execution `mode`.

Configuration must come from environment variables.

Required safety behavior:

- Missing CAW credentials return a clear configuration error.
- Mock mode must be explicitly labeled as mock.
- Mock tx hashes must not be presented as real transactions.
- Production and testnet configuration must be clearly separated.

## 9. Audit Report

The audit report must explain:

- What input was received.
- What payment plan the agent generated.
- Which risk checks passed or failed.
- Who or what approved payment execution.
- Which payments were executed.
- Which payments were blocked.
- Which transaction hash belongs to which payment.
- Whether the execution was real or mock.
- How much budget remains.

MVP storage can be in-memory or local JSON if no backend framework or database exists yet.

If the project later gets a persistence layer, use the existing project pattern instead of inventing a parallel storage system.

## 10. Frontend Contract

Frontend needs:

- Stable response shapes.
- Clear payment statuses.
- Risk reasons per payment item.
- Copyable transaction hash fields.
- Audit report data suitable for rendering.
- A mock mode that still shows the complete workflow if CAW is unavailable.

The backend should expose mock data early so frontend can build the workflow before CAW is fully ready.

## 11. Demo Fallback

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

## 12. Acceptance Evidence

Before claiming the backend demo is complete, collect:

- API responses for the full P0 flow.
- Risk check output showing at least one blocked example.
- Human approval evidence in request or audit output.
- CAW evidence: Agent Wallet address, testnet name, and tx hash, or a clearly labeled mock execution.
- Audit report output linking payment reasons, statuses, risks, budget, and transaction results.

## 13. Testing

Minimum useful backend tests:

- Payment plan schema validation.
- Budget exceeded blocks execution.
- Single-payment limit blocks execution.
- Non-whitelisted wallet blocks execution.
- Duplicate task or recipient is detected.
- Missing human approval blocks execution.
- Blocked payment is not sent to CAW adapter.
- CAW adapter failure appears in audit report.
- Mock execution is labeled as mock.

Acceptance criteria:

- The four P0 APIs can support the full demo loop.
- Frontend can render payment plan, risk check, execution result, and audit report.
- At least one real testnet transaction can be shown through CAW or documented as CAW evidence.
- Mock mode remains clearly distinguishable from real CAW execution.
