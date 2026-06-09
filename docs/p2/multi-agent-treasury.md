# Multi-Agent Treasury Draft

Status: draft  
Mode: documentation only  
External systems touched: false

## Purpose

Define a future multi-agent treasury management sketch without granting any agent execution authority. This document does not create agents, permissions, wallets, API clients, transfers, or external calls.

## Draft Roles

| Role | Future responsibility | Current boundary |
| --- | --- | --- |
| Planner agent | Draft payment plans and reasons | Cannot authorize payment |
| Risk agent | Evaluate deterministic policy evidence | Cannot bypass risk engine |
| Approval operator | Human approval and review | Must remain human-controlled |
| Audit agent | Summarize evidence and outcomes | Read-only evidence generation |
| Treasury coordinator | Budget allocation suggestions | No direct transfer authority |

## Required Future Inputs

- Budget ownership and departmental limits.
- Human approval policy per agent/domain.
- Conflict resolution rules.
- Audit requirements.
- Wallet and CAW policy mapping.

## Fail-Closed Boundary

- No agent can authorize execution alone.
- Deterministic Risk Check remains mandatory.
- Human Approval remains mandatory.
- CAW policy/pact remains mandatory for any future real execution.
- Missing budget owner or policy means blocked.
