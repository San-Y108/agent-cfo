# 后端 API 联调调查报告

> 调查时间：2026-06-10
> 后端 commit：main 最新（含 P0 + P2）
> 前端分支：feat/frontend-dev

---

## 一、后端 API 全景（已确认存在）

### P0 核心 API（payments.py）

| 方法 | 路径 | 状态 | 前端 adapter |
|---|---|---|---|
| POST | `/api/payment-plan` | ✅ 已部署 | ✅ `lib/api/payment.ts` |
| POST | `/api/risk-check` | ✅ 已部署 | ✅ `lib/api/risk.ts` |
| POST | `/api/execute-payment` | ✅ 已部署 | ✅ `lib/api/caw.ts` |
| GET | `/api/audit-report/{auditReportId}` | ✅ 已部署 | ✅ `lib/api/audit.ts` |
| GET | `/api/caw-status/{cawRequestId}` | ✅ 已部署 | ❌ **缺失** |
| GET | `/api/caw-status/{cawRequestId}/refresh` | ✅ 已部署 | ❌ **缺失** |
| GET | `/api/payment-plan/{paymentPlanId}` | ✅ 已部署 | ❌ **缺失** |
| GET | `/api/execution/{executionId}` | ✅ 已部署 | ❌ **缺失** |
| GET | `/api/demo-sample` | ✅ 已部署 | ❌ **缺失** |

### P2 扩展 API（p2_extensions.py）

| 方法 | 路径 | 状态 | 前端 adapter |
|---|---|---|---|
| POST | `/api/external-references` | ✅ 已部署 | ❌ **缺失** |
| GET | `/api/external-references/{id}` | ✅ 已部署 | ❌ **缺失** |
| GET | `/api/external-references?paymentPlanId=` | ✅ 已部署 | ❌ **缺失** |
| POST | `/api/request-invoices` | ✅ 已部署 | ❌ **缺失** |
| GET | `/api/request-invoices/{id}` | ✅ 已部署 | ❌ **缺失** |
| POST | `/api/sablier-stream-previews` | ✅ 已部署 | ❌ **缺失** |
| POST | `/api/safe-permission-references` | ✅ 已部署 | ❌ **缺失** |
| GET | `/api/multichain-readiness` | ✅ 已部署 | ❌ **缺失** |
| GET | `/api/treasury-budget-partitions/{paymentPlanId}` | ✅ 已部署 | ❌ **缺失** |

---

## 二、类型定义差距

### 后端 models.py 已有，但 frontend `lib/api/types.ts` 缺失的类型

| 后端类型 | 关键字段 | 前端状态 |
|---|---|---|
| `CawStatus` | cawRequestId, providerStatus, normalizedStatus, txHash, lastCheckedAt... | ❌ **缺失** |
| `AuditReport` 扩展字段 | inputSummary, decisionTrail, riskRuleEvidence, humanApprovalEvidence, cawEvidence, outcomeSummary, snapshot, auditVersion | ❌ **缺失** |
| `ExternalReference` | externalReferenceId, referenceType, provider, label, status, metadata... | ❌ **缺失** |
| `RequestInvoiceRecord` | requestFinanceInvoiceId, hostedUrl, txHashReference... | ❌ **缺失** |
| `SablierStreamPreview` | streamCreated, durationDays, ratePerSecond, safetyNotes... | ❌ **缺失** |
| `SafePermissionReference` | moduleEnabled, safeAddress, moduleName, safetyNotes... | ❌ **缺失** |
| `MultichainReadiness` | currentExecutionBoundary, chains, safetyNotes... | ❌ **缺失** |
| `TreasuryBudgetPartition` | partitions, authorizationChanged, safetyNotes... | ❌ **缺失** |

---

## 三、关键业务规则确认

### 3.1 Audit Report vs CAW Status 区分

```
后端保证：
- Audit Report 是 immutable snapshot（snapshot.immutable = true）
- CAW Status refresh 不会改写 Audit Report
- mock 模式下 txHash 始终为 null
- 真实 CAW 测试网 refresh 后可获得 txHash
```

### 3.2 P2 API 安全口径

```
- 所有 P2 API 返回 mode="metadata-only"
- liveIntegrationEnabled = false
- 不创建真实 Sablier stream
- 不启用 Safe module
- 不改变 multi-agent 授权
```

### 3.3 错误处理

| 场景 | 状态码 | 前端处理 |
|---|---|---|
| CAW status not found | 404 | 显示"未找到" |
| CAW provider tx not found | 404 | 显示"provider 未找到" |
| Unsupported CAW status | 502 | 显示"状态不支持" |
| CAW refresh failed | 502 | 显示"刷新失败" |
| P2 API 404 | 404 | **隐藏 P2 区块** 或显示 "backend pending deploy" |

---

## 四、前端现状

### Treasury 页面（app/console/page.tsx）

- 当前使用 `lib/demo/console-mock.ts` 静态数据
- 未调用任何真实 API adapter
- 未区分 Audit Report snapshot 和 Latest CAW Status
- 无 P2 Preview / Linked Evidence 区域

### Mock 数据现状

```
lib/mock/
  ├── audit-report.ts     → 只有基础字段，缺少 P0 扩展字段
  ├── caw-execution.ts    → txHash 始终为 null（符合 mock 口径）
  ├── payment-plan.ts     → 基础结构正确
  ├── risk-check.ts       → 基础结构正确
  └── budget-rules.ts     → 静态配置
```

---

## 五、联调任务清单

### 任务 A：P0 API 类型补全 + adapter 补齐

- [ ] types.ts 补全 AuditReport 扩展字段
- [ ] types.ts 新增 CawStatus 类型
- [ ] caw.ts 新增 getCawStatus / refreshCawStatus
- [ ] payment.ts 新增 getPaymentPlan
- [ ] audit.ts 确认 getAuditReport 字段完整

### 任务 B：P2 API 前端适配

- [ ] types.ts 新增 P2 相关类型（ExternalReference, RequestInvoiceRecord 等）
- [ ] 新建 lib/api/p2.ts adapter
- [ ] Treasury 页面新增 "P2 Preview / Linked Evidence" 区域
- [ ] P2 区域 404 时优雅降级（隐藏或显示 pending）

### 任务 C：Treasury 页面改造

- [ ] Audit Report 区域：展示 immutable snapshot（含 decisionTrail, cawEvidence 等）
- [ ] Latest CAW Status 区域：展示实时状态 + Refresh 按钮
- [ ] P2 Preview 区域：独立展示，不覆盖 Audit Report
- [ ] 区分 mock（txHash=null）和 real mode

---

## 六、测试验证路径

### 本地后端启动

```bash
cd backend
python -m uvicorn app.main:app --reload
# Base URL: http://127.0.0.1:8000
```

### P0 完整流程测试

```
1. POST /api/payment-plan  → 获取 plan
2. POST /api/risk-check    → 获取 risk（Bob blocked）
3. POST /api/execute-payment → 获取 execution（txHash=null）
4. GET /api/audit-report/{id} → 获取 snapshot（immutable）
5. GET /api/caw-status/{id}   → 获取当前状态（txHash=null）
6. GET /api/caw-status/{id}/refresh → 刷新状态（mock 下仍 null）
```

### P2 API 测试

```
GET /api/multichain-readiness
GET /api/treasury-budget-partitions/{planId}
```

---

*报告生成者：Claude Opus 4.8*
*下一步：等待用户确认任务优先级和实现方案*
