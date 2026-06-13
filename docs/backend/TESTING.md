# Testing And Acceptance

> 从合并前 [`README-20260613-pre-polish.md`](../backup/README-20260613-pre-polish.md) 拆出。

## 验收标准

后端完成前至少要验证：

- Payment Plan schema validation。
- Budget exceeded 会 block。
- Single payment limit exceeded 会 block。
- Non-whitelisted wallet 会 block。
- Duplicate task 或 duplicate recipient 会被识别。
- Missing human approval 不会执行付款。
- Blocked payment 不会发送到 CAW adapter。
- CAW adapter failure 会进入 Audit Report。
- Mock execution 明确标注为 mock。

完成标准：

- 核心业务 API 支持完整 Demo flow。
- 前端可以展示 Payment Plan、Risk Check、Execution Result 和 Audit Report。
- 至少一笔 CAW testnet transaction 有真实证据，或明确标注当前使用 mock mode。
- README 和实际实现保持一致。

## Curl Verification

验证本地后端 API：

创建 Payment Plan：

```bash
curl.exe -X POST http://127.0.0.1:8000/api/payment-plan -H "Content-Type: application/json" -d "{\"contributions\":[{\"name\":\"Alice\",\"role\":\"Content Contributor\",\"task\":\"Wrote event recap article\",\"wallet\":\"0xAlice\",\"amount\":20,\"token\":\"USDC\"}],\"budgetRule\":{\"monthlyBudget\":50,\"singlePaymentLimit\":25,\"allowedToken\":\"USDC\",\"whitelist\":[\"0xAlice\"],\"requiresHumanApproval\":true}}"
```

执行 Risk Check：

```bash
curl.exe -X POST http://127.0.0.1:8000/api/risk-check -H "Content-Type: application/json" -d "{\"paymentPlanId\":\"plan_demo_001\",\"budgetRule\":{\"monthlyBudget\":50,\"singlePaymentLimit\":25,\"allowedToken\":\"USDC\",\"whitelist\":[\"0xAlice\"],\"requiresHumanApproval\":true}}"
```

执行 mock payment：

```bash
curl.exe -X POST http://127.0.0.1:8000/api/execute-payment -H "Content-Type: application/json" -d "{\"paymentPlanId\":\"plan_demo_001\",\"approvedPaymentIds\":[\"pay_001\"],\"humanApproval\":{\"approved\":true,\"approvedBy\":\"demo-operator\"}}"
```

查看 Audit Report：

```bash
curl.exe http://127.0.0.1:8000/api/audit-report/audit_demo_001
```

查看当前 CAW status：

```bash
curl.exe http://127.0.0.1:8000/api/caw-status/mock_caw_exec_demo_001_pay_001
```

刷新 latest CAW status：

```bash
curl.exe http://127.0.0.1:8000/api/caw-status/mock_caw_exec_demo_001_pay_001/refresh
```

验证部署后端：

```bash
curl.exe https://agentcfo-backend.onrender.com/health
```

默认 mock 执行结果是 `mode="mock"`，`txHash=null`。Real CAW refresh 返回真实 `txHash` 时，前端应把它展示在 latest CAW status 区域，不要改写 Audit Report 快照。

在 Render mock-demo 环境中，`/api/caw-status/{mockId}/refresh` 返回 `404 CAW provider transaction not found` 是安全预期：它只说明 mock request 没有真实 CAW provider transaction，不会调用 `transfer_tokens`。

## 运行测试

```bash
.venv/bin/python -m pytest -q
```

Windows：

```powershell
.venv\Scripts\python -m pytest -q
```
