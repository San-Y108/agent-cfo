# P2 Integration Boundaries

Status: draft  
Mode: mock / documentation only  
External systems touched: false

This folder prepares future P2 integration discussion for AgentCFO. It does not implement Request Network, Sablier, Safe, multi-agent treasury, multi-chain execution, CAW transfer, SDK clients, webhooks, chain RPC calls, signatures, or credentials.

## Current Boundary

P0/P1 runtime remains:

```text
Payment Plan -> Risk Check -> Human Approval -> Mock CAW Adapter -> Audit Report
```

P2 artifacts in this folder are not imported by runtime code. They are drafts for future product and integration review.

## Global Fail-Closed Rules

- Missing official SDK/API details means the integration remains `draft`.
- Missing auth, wallet, chain, token, policy, approval, or audit details means no execution.
- Mock ids, draft ids, and schema examples must not be shown as real external records.
- No P2 component may bypass deterministic Risk Check or Human Approval.
- No P2 component may create, sign, submit, stream, transfer, or enable modules.

## Official References

- Request Network docs: https://docs.request.network/
- Request lifecycle: https://docs.request.network/general/lifecycle-of-a-request
- Sablier docs: https://docs.sablier.com/
- Sablier payroll: https://sablier.com/payroll/
- Safe modules: https://docs.safe.global/advanced/smart-account-modules
