# Multi-Chain Boundary

Status: draft  
Mode: mock / documentation only  
External systems touched: false

## Purpose

Prepare a future chain/token support matrix while keeping all current execution single-mode mock. This document does not add chain RPC calls, token contracts, bridge logic, gas estimation, CAW chain config, or multi-chain execution.

## Draft Capability Matrix

| chainId | networkName | tokenSymbol | tokenAddress | supported | reason |
| --- | --- | --- | --- | --- | --- |
| null | mock-testnet | USDC | null | false | Demo-only mock network; no real CAW chain evidence |
| null | future-testnet | USDC | null | false | Awaiting CAW teammate confirmation |
| null | future-mainnet | USDC | null | false | Mainnet is explicitly out of scope |

## Required Future Inputs

- CAW-supported chain list.
- Testnet and token address.
- Token decimals.
- Gas/payment fee handling.
- Explorer URL pattern.
- Wallet allowlist and policy per chain.
- Audit evidence requirements.

## Fail-Closed Boundary

- Unknown chain means blocked.
- Missing token address or decimals means blocked.
- Missing CAW policy/pact support means blocked.
- Missing testnet transaction evidence means not complete.
- Mainnet execution remains out of scope for this backend demo.
