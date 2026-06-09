# Safe Module Boundary

Status: draft  
Mode: documentation only  
External systems touched: false

## Purpose

Record future Safe module considerations without implementing Safe module transactions. This document does not enable modules, submit Safe transactions, call Safe APIs, store module addresses, or change payment execution.

Official concept:

- Safe modules extend Safe Smart Accounts and can execute transactions under configured permissions.
- Modules are a sensitive security boundary and require careful review.

Reference:

- https://docs.safe.global/advanced/smart-account-modules

## Future Questions

- Does AgentCFO need Safe at all, or is CAW policy enough for the demo?
- Which Safe account would be used?
- Who approves module enablement?
- Which actions would the module be allowed to perform?
- How would module permissions interact with CAW pact/policy rules?
- What audit evidence proves module configuration and execution?

## Fail-Closed Boundary

- No module address is trusted unless supplied by the Safe/CAW owner and independently reviewed.
- Missing Safe owner approval means no module action.
- Missing module audit/security review means no module action.
- AgentCFO must never call `enableModule` or execute Safe module transactions in the current backend.
