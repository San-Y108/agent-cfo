# Sablier Stream Drafts

Status: draft  
Mode: mock  
External systems touched: false

## Purpose

Prepare a future stream-payment draft shape for payroll-like payouts. This document does not deploy a stream, approve tokens, call Sablier contracts, call Sablier APIs, generate stream ids, or create tx hashes.

Official concepts:

- Sablier supports streaming payments over time.
- Payroll use cases involve scheduled or continuous token flow.
- Future integration must use official Sablier protocol/app details and chain/token confirmation.

References:

- https://docs.sablier.com/
- https://sablier.com/payroll/

## Mock Schema Shape

```json
{
  "streamDraftId": "stream_draft_001",
  "paymentPlanId": "plan_demo_001",
  "paymentItemId": "pay_001",
  "source": "mock",
  "status": "draft",
  "externalSystemTouched": false,
  "recipient": "0xAlice",
  "token": "USDC",
  "amount": 20,
  "startAt": "2026-06-09T00:00:00Z",
  "endAt": "2026-07-09T00:00:00Z",
  "streamId": null,
  "txHash": null
}
```

## Required Future Inputs

- Product decision: one-time payout vs stream.
- Stream type and official contract/API path.
- Chain id, token address, token decimals.
- Approval and allowance requirements.
- Who can create, pause, cancel, or withdraw.

## Fail-Closed Boundary

- Do not approve tokens or create streams from AgentCFO until policy, chain, token, and approval details are confirmed.
- Do not treat a `streamDraftId` as a real Sablier stream id.
- Do not add stream execution to P0 API behavior.
