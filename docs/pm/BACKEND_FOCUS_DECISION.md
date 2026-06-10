# AgentCFO 后端聚焦决策文档

> 日期：2026-06-10
> 决策人：交付总控
> 受众：后端同学（W5W8L9jlu）
> 目的：明确后端剩余 3 天做什么、不做什么、怎么做
> 核对状态：已逐项对照 `app/routers/payments.py`、`app/models.py`、`app/services/risk_engine.py`、`app/services/caw_adapter.py`、`app/main.py`、`tests/test_mvp_flow.py` 验证

---

## 一、核心判断：评委看什么

Cobo Agentic Commerce 赛道评委关注的是：

| 评委关注点 | 我们当前状态 | 得分 |
|-----------|-------------|------|
| Agent 能否通过 Cobo Agentic Wallet 发起真实付款？ | ✅ 有 1 笔 testnet tx evidence | 中 |
| 从输入到付款到审计的完整链路？ | ✅ P0 mock 全通 | 高 |
| 风险控制是否真实有效？ | ✅ 6 条规则 + fail-closed | 高 |
| 是否有链上可验证证据？ | ⚠️ 只有 1 笔，需要更多 | 低→中 |
| Demo 是否流畅、能打动人？ | ⚠️ 从未彩排 | 未知 |
| 代码质量和工程完成度？ | ✅ 测试覆盖 + 文档齐全 | 高 |

**结论：后端代码完成度已经很高，评委不会因为"没做 Sablier"扣分。但会因为"只有 1 笔 tx"和"Demo 卡壳"扣分。**

---

## 二、后端剩余 3 天：3 个优先级

### P0（必须做）：保证 Demo 不崩

这些不是新功能，是**防御性工作**。

| 任务 | 说明 | 工作量 | 交付物 |
|------|------|--------|--------|
| **Demo 主流程稳定性验证** | 在 Render 线上环境跑通完整 P0 链路：demo-sample → payment-plan → risk-check → execute-payment → audit-report → caw-status。记录每步的 curl 命令和响应。 | 1-2h | 线上冒烟测试记录 |
| **Edge case 防御** | 确认以下场景不崩：①全部 blocked ②超预算 ③重复地址 ④空输入 ⑤caw-status 查不存在的 id。当前 risk_engine.py 和 payments.py 应该已覆盖，但要实际跑一遍。 | 1h | edge case 测试结果 |
| **Render 环境稳定性** | 确认 Render 服务不会因 idle 冷启动过慢。如果冷启动 >10s，考虑加 health check cron。 | 30min | 冷启动时间记录 |
| **错误信息友好化** | 确认所有 4xx/5xx 返回的 error message 对前端友好（不是 Python traceback）。 | 30min | 错误响应样例 |

### P1（应该做）：增强 Demo 说服力

这些是**锦上添花**，做 1-2 个就够。

| 任务 | 说明 | 工作量 | 交付物 | Demo 价值 |
|------|------|--------|--------|-----------|
| **CAW 第 2-3 笔 testnet tx** | 和 CAW 同学配合，走完整链路再执行 2 笔低额 testnet transfer。每笔都需要 humanApproval.approved=true。 | 2-3h | tx hash + 截图 | ⭐⭐⭐ 链上证据数量直接影响评分 |
| **Demo scenario pack 完善** | 已有 `/api/p2/demo-scenarios`，确认返回的 scenario 数据能直接给前端用（Alice 正常、Bob 被拦、Charlie 正常）。 | 30min | scenario 响应确认 | ⭐⭐ 路演时直接用 |
| **Runbook 检查** | 已有 `/api/demo/runbook`，确认和实际 Demo 流程一致。如果有出入，更新 runbook。 | 30min | runbook 更新 | ⭐⭐ 路演讲稿依据 |

### P2（可以做）：如果还有时间

这些是**加分项**，只在 P0/P1 全部完成后才做。

| 任务 | 说明 | 工作量 | Demo 价值 |
|------|------|--------|-----------|
| Request Finance 前端展示 | 前端在 "P2 Preview" 区域展示 mock invoice records | 需前端配合 | ⭐ 展示集成潜力 |
| Sablier payroll simulation 展示 | 前端调用 `/api/p2/sablier/payroll-simulation` 展示 | 需前端配合 | ⭐ 展示未来规划 |
| Evidence timeline 展示 | 前端调用 `/api/p2/evidence-timeline/{id}` | 需前端配合 | ⭐ 审计完整性 |

---

## 三、明确不做（向后端同学确认）

以下功能**不做**，原因不是技术不行，而是：

1. **时间不够**：距离提交仅 3 天
2. **Demo 不需要**：评委不会因为没做这些扣分
3. **风险太高**：做一半比不做更糟

| 不做 | 原因 | 代码依据 |
|------|------|----------|
| Sablier 真实 stream 创建 | 需要钱包签名、新 risk rules、stream lifecycle 管理，至少 2 天 | 当前只有 `SablierStreamPreview`（preview-only），`streamCreated=False` |
| Safe module 部署/启用 | 需要 owner approval、security review、threshold 配置 | 当前 `SafePermissionReference.moduleEnabled=False` |
| 多链执行 | 当前 CAW 只配了 Sepolia/SETH，加链需要新的 allowlist + 测试 | `TESTNET_CHAIN_IDS = {"SETH", "TBASE_SETH", "SOLDEV_SOL"}`，真实执行仅限已配置链 |
| Multi-agent 授权系统 | 需要新的 authorization model、budget allocation、conflict resolution | 当前 `TreasuryCoordinationSimulation.authorizationChanged=False` |
| Request Finance 真实发票创建 | 已有 1 笔验证，再多不会增加 Demo 价值 | `REQUEST_FINANCE_ALLOW_INVOICE_CREATE` guard 已关回 |
| 生产级数据库迁移 | Render ephemeral SQLite 够用，Postgres 迁移是赛后的事 | — |

---

## 四、如果后端同学要做 P1 中的某个功能，需要什么

后端同学说"文档写得比较泛，需要比较细的文档"。以下逐项给出**精确的实现规格**：

### 4.1 CAW 第 2-3 笔 testnet tx（P1 最高优先级）

**不需要新代码**。现有代码已经支持。流程：

```bash
# 1. 确认环境变量已设置（caw_adapter.py CawAdapterConfig.from_env 读取）
CAW_ADAPTER_MODE=real
CAW_ENABLE_TRANSFERS=true
AGENT_WALLET_API_URL=<caw-api-url>
AGENT_WALLET_API_KEY=<caw-api-key>
AGENT_WALLET_WALLET_ID=<wallet-id>
CAW_ALLOWED_CHAIN_IDS=SETH
CAW_ALLOWED_TOKEN_IDS=SETH
CAW_ALLOWED_RECIPIENTS=<recipient-address>
CAW_MAX_AMOUNT=0.001

# 2. 启动后端
python -m uvicorn app.main:app --reload

# 3. 创建 payment plan
curl -X POST http://127.0.0.1:8000/api/payment-plan \
  -H "Content-Type: application/json" \
  -d '{
    "contributions": [
      {"name": "Alice", "role": "Contributor", "task": "Task 2", "wallet": "<recipient>", "amount": 0.001, "token": "SETH"}
    ],
    "budgetRule": {
      "monthlyBudget": 1,
      "singlePaymentLimit": 0.01,
      "allowedToken": "SETH",
      "whitelist": ["<recipient>"],
      "requiresHumanApproval": true
    }
  }'

# 4. Risk check（用上一步返回的 paymentPlanId）
curl -X POST http://127.0.0.1:8000/api/risk-check \
  -H "Content-Type: application/json" \
  -d '{"paymentPlanId": "<上一步的 paymentPlanId>", "budgetRule": {"monthlyBudget": 1, "singlePaymentLimit": 0.01, "allowedToken": "SETH", "whitelist": ["<recipient>"], "requiresHumanApproval": true}}'

# 5. Execute（必须包含 approvedPaymentIds + humanApproval.approvedBy）
curl -X POST http://127.0.0.1:8000/api/execute-payment \
  -H "Content-Type: application/json" \
  -d '{"paymentPlanId": "<paymentPlanId>", "approvedPaymentIds": ["pay_001"], "humanApproval": {"approved": true, "approvedBy": "demo"}}'

# 6. 查状态
curl http://127.0.0.1:8000/api/caw-status/<cawRequestId>
curl http://127.0.0.1:8000/api/caw-status/<cawRequestId>/refresh
curl http://127.0.0.1:8000/api/audit-report/<auditReportId>
```

**注意事项**：
- 每笔金额必须很低（0.001 SETH）
- recipient 必须在 `CAW_ALLOWED_RECIPIENTS` 白名单内
- 每笔需要单独的 humanApproval
- `approvedPaymentIds` 必须是非空数组（`payments.py` 校验：`if not request.approvedPaymentIds: raise 400`）
- `humanApproval` 的字段是 `approvedBy`（不是 `approver`）
- 记录 txHash、cawRequestId、provider status
- 截图必须脱敏（masked address）

### 4.2 Demo 主流程稳定性验证（P0 最高优先级）

**验证清单**（逐项跑）：

```bash
BASE="https://agentcfo-backend.onrender.com"

# 1. 健康检查
curl $BASE/health
# 预期: {"status":"ok","service":"agent-cfo-backend"}

# 2. 版本
curl $BASE/version
# 预期: {"service":"agent-cfo-backend","version":"0.1.0","apiMode":"mock-demo","cawMode":"mock",...}

# 3. Demo sample
curl $BASE/api/demo-sample
# 预期: {"mode":"mock-demo","externalSystemTouched":false,"notes":[...],"paymentPlanRequest":{...}}
# 注意：响应有外层包装，需要取 paymentPlanRequest 字段作为下一步的 body

# 4. Payment plan（用 demo-sample 的 paymentPlanRequest 字段）
curl -X POST $BASE/api/payment-plan \
  -H "Content-Type: application/json" \
  -d '<上一步 response.paymentPlanRequest 的内容>'
# 预期: 3 个 payment items（Alice pay_001 / Bob pay_002 / Charlie pay_003）

# 5. Risk check（用上一步返回的 paymentPlanId）
curl -X POST $BASE/api/risk-check \
  -H "Content-Type: application/json" \
  -d '{"paymentPlanId":"<paymentPlanId>","budgetRule":{"monthlyBudget":50,"singlePaymentLimit":25,"allowedToken":"USDC","whitelist":["0xAlice","0xCharlie"],"requiresHumanApproval":true}}'
# 预期: Bob=Blocked("Recipient wallet is not in whitelist"), Alice=NeedsApproval, Charlie=NeedsApproval

# 6. Execute（只执行 Ready/NeedsApproval 的，不执行 Blocked 的）
curl -X POST $BASE/api/execute-payment \
  -H "Content-Type: application/json" \
  -d '{"paymentPlanId":"<paymentPlanId>","approvedPaymentIds":["pay_001","pay_003"],"humanApproval":{"approved":true,"approvedBy":"demo"}}'
# 预期: Alice/Charlie executed, Bob 不在 approvedPaymentIds 中所以不执行, txHash=null (mock mode)

# 7. Audit report（用上一步返回的 auditReportId）
curl $BASE/api/audit-report/<auditReportId>
# 预期: 完整审计报告，auditVersion="p0-evidence-v1"

# 8. CAW status（用上一步返回的 cawRequestId）
curl $BASE/api/caw-status/<cawRequestId>
# 预期: mode="mock", normalizedStatus="Executed", txHash=null
```

**如果任何一步失败**：记录错误，修 bug，重新跑。这是 P0，不能跳过。

### 4.3 Edge case 防御（P0）

在本地跑以下场景（`risk_engine.py` 实际实现的 6 条规则）：

| 场景 | 输入 | 预期 | 对应规则 |
|------|------|------|----------|
| 全部 blocked | 3 个贡献者都不在白名单（如 wallet 都用 `0xEvil`） | risk-check 返回 3 个 Blocked，execute 返回 400 "At least one payment item must be approved" | `Recipient wallet is not in whitelist` |
| 超预算 | totalAmount > monthlyBudget（如 monthlyBudget=20，3 人共 45） | 所有 payment 标记 Blocked | `Total payment amount exceeds monthly budget` |
| 单笔超限 | 单笔 amount > singlePaymentLimit（如 amount=30, limit=25） | 该笔 Blocked | `Payment amount exceeds single payment limit` |
| 重复地址 | 两个贡献者同一 wallet | 两笔都 Blocked | `Duplicate recipient wallet` |
| 重复任务 | 两个贡献者同一 task | 两笔都 Blocked | `Duplicate task` |
| Token 不允许 | token="DAI" 但 allowedToken="USDC" | 该笔 Blocked | `Token is not allowed` |
| 空输入 | contributions=[] | payment-plan 返回 200 + 空 plan，risk-check 返回空，execute 返回 400 | Pydantic 允许空 list，但 execute 要求 `approvedPaymentIds` 非空 |
| 不存在的 planId | risk-check 用不存在的 paymentPlanId | 返回 404 "Payment plan not found" | `store.get_payment_plan` 返回 None |
| 不存在的 auditReportId | GET /api/audit-report/nonexistent | 返回 404 "Audit report not found" | `store.get_audit_report` 返回 None |
| 不存在的 cawRequestId | GET /api/caw-status/nonexistent | 返回 404 "CAW status not found" | `store.get_caw_status` 返回 None |
| Blocked payment 不能执行 | approvedPaymentIds 包含 Blocked 的 payment id | 返回 400 "Blocked payments cannot be executed" | `payments.py` 显式检查 |
| 未做 risk-check 就 execute | 直接调 execute-payment | 返回 400 "Risk check is required before execution" | `store.get_risk_check` 返回 None |
| 未批准就 execute | humanApproval.approved=false | 返回 400 "Human approval is required before execution" | 显式检查 |

**如果任何场景崩溃（500）**：修 bug。如果是 4xx + 友好错误信息：OK。

---

## 五、后端同学今日（6月10日）行动清单

按优先级排序：

1. ☐ **[P0] 跑一遍线上 Demo 主流程**（4.2 节），记录结果
2. ☐ **[P0] 跑一遍 edge case**（4.3 节），修 bug
3. ☐ **[P0] 确认 Render 冷启动时间**，如果 >10s 想办法
4. ☐ **[P1] 和 CAW 同学配合，执行第 2-3 笔 testnet tx**（4.1 节）
5. ☐ **[P1] 确认 demo-scenarios 和 runbook 数据正确**
6. ☐ 晚上 22:00 站会汇报

**不要做的事**：
- ❌ 不要开始做 Sablier/Safe/多链/多-agent
- ❌ 不要重构现有代码
- ❌ 不要加新的 P2 功能
- ❌ 不要花时间在文档上（除了跑完测试后记录结果）

---

## 六、如果后端同学问"为什么不继续做 P2"

**一句话回答**：评委不看你做了多少功能，看你的 Demo 能不能打动人。

**两分钟回答**：

我们的赛道是 Cobo Agentic Commerce。评委的核心问题是："这个 Agent 能不能安全地通过 Cobo 钱包花钱？" 我们已经证明了：

1. ✅ Agent 能生成付款计划并解释原因（payment_planner.py 支持 mock + OpenAI Structured Outputs）
2. ✅ Risk Engine 能拦截不合规付款（6 条规则，Bob 被拦是 Demo 核心戏剧点）
3. ✅ Human Approval 保留最终确认权（`requiresHumanApproval=true` + execute 必须 `approved=true`）
4. ✅ CAW 能执行真实 testnet 转账（1 笔 evidence，provider status 900）
5. ✅ Audit Report 把全过程串成可审计记录（snapshot.immutable=true，后续 refresh 不改写历史）

Sablier/Safe/多链/多-agent 是**未来规划**，不是当前 Demo 的核心。评委看到我们有完整的 P2 boundary docs 和 mock endpoints，就知道我们想清楚了未来怎么做。这比做一半然后 Demo 崩了好得多。

**把时间花在**：让现有 Demo 跑得更稳、有更多链上证据、路演讲得更清楚。
