# Console Demo 修复与补全计划

> 生成日期：2026-06-12
> 负责人：前端（Aafff623）
> 范围：`frontend/` 内 Console 工作台模块

---

## 1. 背景与目标

PM 通过群聊传达了评委演示的核心优先级：**P0 链路必须跑稳，Demo 不能断**。
当前 Console 工作台存在以下两层问题：

1. **业务流程「断线」** — Treasury 模块的完整 5 步流程在 real mode 下从未真正调用后端 API，始终走本地 `evaluateItem()` 模拟逻辑；
2. **部署未对齐** — PR #1 (`feat/frontend-bootstrap`) 长期 OPEN，未合并到 main，Vercel 部署状态不明确。

---

## 2. P0 完整业务链路 vs 当前 UI 对照

### 2.1 后端 P0 链路（PM 指定）

```
demo-sample
  → POST /api/payment-plan
  → POST /api/risk-check
  → POST /api/execute-payment
  → GET  /api/audit-report/{id}
  → GET  /api/caw-status/{id}
```

### 2.2 前端 UI 对应映射

| 后端步骤 | Console UI 位置 | 当前状态 |
|---|---|---|
| `demo-sample` (4条记录) | Treasury → Records 列表 | ✅ mock 数据正确（Alice/Bob/Charlie/Data API = 50 USDC，Bob 不在白名单） |
| `POST /api/payment-plan` | Treasury → "Generate Plan" 按钮 | ❌ 仅调用本地 `evaluateItem()`，未调用后端 |
| `POST /api/risk-check` | Treasury → 扫描动画 → 结果展示 | ❌ 风险检查逻辑内嵌在本地 evaluateItem，未调用后端 |
| Human Approval | Treasury → "Approve & Execute" 按钮 | ⚠️ 按钮存在，但直接跳到执行，无显式人工确认 step |
| `POST /api/execute-payment` | Treasury → 执行动画（Step 3） | ❌ 调用 mock setTimeout 生成随机 txHash，未调用后端 |
| `GET /api/audit-report/{id}` | Treasury → Step 4 审计快照 | ❌ 表格数据来自本地 plan state，非后端 AuditReport 对象 |
| `GET /api/caw-status/{id}` | Treasury → Step 4 CAW Status 刷新 | ❌ 刷新逻辑是 mock setTimeout，未调用后端 |

### 2.3 AgentHub（主页）流程分析

| UI 区域 | 功能 | 状态 |
|---|---|---|
| FlowStepper（6步进度条） | 显示当前流程位置 | ⚠️ 仅装饰性 — 与 Treasury 实际流程完全脱节 |
| AgentPersona | 全息 AI 人格展示 | ✅ 动效完整 |
| ChatSatellite 对话框 | AI 响应演示 | ⚠️ 全部 mock 硬编码回复，不调用真实 API |
| QuickActionsStrip | Generate Plan / Check Risk / View Audit | ⚠️ 全部 mock 回复，不触发 Treasury 流程 |

### 2.4 API 层现状核查

| 文件 | PM 描述问题 | 当前实际状态 |
|---|---|---|
| `lib/api/risk.ts` | "是空的" | ✅ **已实现** — `runRiskCheck()` 存在 |
| `lib/api/audit.ts` | "是空的" | ✅ **已实现** — `getAuditReport()` 存在 |
| `lib/api/types.ts` | "需要追加 AuditReport" | ✅ **已存在** — 第 109 行 |
| `lib/workflow/run-demo-flow.ts` | — | ✅ **已实现** — 完整 4 步编排链路 |

结论：**API adapter 层已完整实现，但 Treasury 模块从未调用它。**

---

## 3. 缺口优先级列表

### P0 — 演示关键路径（必须修）

| ID | 缺口 | 影响 |
|---|---|---|
| GAP-01 | Treasury `handleGenerate` 仅调用本地 `evaluateItem()`，real mode 下不调后端 `/api/payment-plan` | Demo 跑不通真实链路 |
| GAP-02 | Treasury `handleExecute` 生成随机 txHash，不调 `/api/execute-payment` | txHash 是假的，评委能看出来 |
| GAP-03 | Step 4 审计报告不调 `/api/audit-report/{id}`，数据来源是本地 state | 无法展示真实后端 AuditReport 结构 |
| GAP-04 | CAW status 刷新不调 `/api/caw-status/{id}/refresh` | 刷新后 txHash 仍是随机值 |
| GAP-05 | PR #1 未合并，Vercel 部署分支状态不明 | 可能演示的不是最新代码 |

### P1 — 演示质量（应修）

| ID | 缺口 | 影响 |
|---|---|---|
| GAP-06 | AgentHub FlowStepper 与实际流程脱节 | 步骤指示器显示错误状态 |
| GAP-07 | "Approve & Execute" 直接执行，没有显式人工确认卡片 | 评委看不出「人工把关」这个关键卖点 |
| GAP-08 | QuickActions 回复全是硬编码字符串 | 和 Treasury 模块流程无交互感 |

### P2 — 锦上添花（有时间再做）

| ID | 缺口 | 影响 |
|---|---|---|
| GAP-09 | ChatSatellite 无 real API 接入 | — |
| GAP-10 | 无后端错误降级（loading/error 状态） | — |

---

## 4. 修复计划

### Phase 1 — API 接入（解决 GAP-01 ~ GAP-04）

**目标**：Treasury 模块在 real mode 下走真实后端链路；mock mode 保留原有行为。

**工作范围**：`frontend/components/console/modules/treasury.tsx`

#### 4.1 `handleGenerate` 改造

**当前**：直接调用本地 `records.map(evaluateItem)` 返回结果。

**改后**：
```
if (isMockMode()) {
  // 现有逻辑不变
  records.map(evaluateItem)
} else {
  // real mode: 调用 createPaymentPlan → runRiskCheck
  const plan = await createPaymentPlan(...)
  const riskResult = await runRiskCheck(...)
  // 将 riskResult.payments 映射回 PaymentPlanItem[] 格式
}
```

数据转换：后端 `PaymentItem.status` 枚举（Ready/Blocked/...）需要映射到本地 `PaymentPlanItem.status`，字段名已对齐（`lib/api/types.ts` 与 `lib/types/console.ts` 对照确认）。

#### 4.2 `handleExecute` 改造

**当前**：`setTimeout` 2s 后生成随机 txHash，模拟执行。

**改后**：
```
if (isMockMode()) {
  // 现有 setTimeout mock 不变
} else {
  // real mode: 调用 executePayment()
  const result = await executePayment({
    paymentPlanId,          // 从 phase 1 state 存储
    approvedPaymentIds,     // riskResult.payments.filter(p => p.status !== 'Blocked').map(p => p.id)
    humanApproval: { approved: true, approvedBy: "console-operator" }
  })
  // 存储 result.auditReportId 供下一步使用
}
```

#### 4.3 Step 4 Audit 数据改造

**当前**：直接读 `plan` state 渲染表格。

**改后**（real mode）：
```
const audit = await getAuditReport(auditReportId)
// 使用 audit.execution.payments[].txHash 渲染真实 txHash
// 使用 audit.remainingBudget 更新预算显示
```

#### 4.4 CAW Status 刷新改造

**当前**：mock setTimeout。

**改后**（real mode）：
```
// 对每个 executed payment 调用 refreshCawStatus(cawRequestId)
// 更新 cawStatuses state
```

#### 4.5 状态存储扩展

需要在 TreasuryModule state 新增：
- `paymentPlanId: string | null` — 来自 createPaymentPlan 响应
- `auditReportId: string | null` — 来自 executePayment 响应
- `loadingState: "idle" | "loading" | "error"` — real mode 下的异步状态

#### 4.6 错误处理

real mode 下每个 API 调用需要 try/catch，失败时：
1. 设置 `loadingState = "error"`
2. 展示内联错误提示（不必做复杂 toast，一个红色文字即可）
3. 允许重试（返回上一步按钮）

---

### Phase 2 — 人工确认步骤显化（解决 GAP-07）

**目标**：在 Step 2（结果展示）和 Step 3（执行）之间插入一个显式确认卡片，体现「AI 已计算 → 人工签字 → CAW 执行」的安全架构卖点。

**改造位置**：`ActionPanel` 组件的 Step 2 → 3 过渡逻辑

**方案**：在 Step 2 底部的"Approve & Execute"按钮前增加一个带 `humanApproval: true/false` 开关的确认区块：

```
┌────────────────────────────────────────┐
│  Human Approval Required               │
│  ✓ Alice — 20 USDC   [Ready]           │
│  ✓ Charlie — 10 USDC  [Ready]          │
│  ✓ Data API — 5 USDC  [Ready]          │
│  ✗ Bob — 15 USDC      [Blocked]        │
│                                        │
│  [  Reject  ]  [ Approve & Execute ]   │
└────────────────────────────────────────┘
```

这样评委能看到「AI 建议 → 人确认 → 受控执行」的完整闭环。

---

### Phase 3 — FlowStepper 对齐（解决 GAP-06）

**目标**：AgentHub 的 FlowStepper 步骤指示器与 Treasury 实际执行进度同步。

**方案**：Treasury Module 执行状态通过回调或共享 context 向上传递给 AgentHub，FlowStepper `currentStep` 随之更新。

**可选简化方案（时间紧时）**：FlowStepper 步骤改为可点击导航，点击不同步骤时滚动到/打开对应的 panel，不必真正联动状态。

---

### Phase 4 — PR 合并与部署（解决 GAP-05）

**目标**：确认 Vercel 生产部署使用的是最新代码。

**操作清单**：
1. 检查 Vercel dashboard，确认当前 production 对应哪个 commit
2. 合并 PR #1（feat/frontend-bootstrap → main），或直接 push 到 main（由 PM/San-Y108 决定）
3. 生产部署仍保持 `NEXT_PUBLIC_DEMO_MODE=mock`（评委演示用 mock 更稳）
4. 如需切 real mode，设置：
   - `NEXT_PUBLIC_DEMO_MODE=real`
   - `NEXT_PUBLIC_API_BASE_URL=https://agentcfo-backend.onrender.com`

---

## 5. 不需要做的事（PM 明确 Scope Out）

- Sablier / Safe / 多链 / 多 Agent — 全部 **不做**
- 重写 Landing Page — 超出范围
- 修改后端代码 — 前端不碰 `app/`
- 修改 `lib/api/risk.ts` / `lib/api/audit.ts` — 已经是完整实现，无需修改
- 追加 `AuditReport` 类型 — 已存在于 types.ts

---

## 6. 执行顺序建议

```
Day 1 (路演前):
  [Phase 4] PR 合并 / Vercel 部署确认         ← 30 min（不需要写代码）
  [Phase 1 · GAP-01/02] handleGenerate/Execute 接入真实 API ← 3~4 hr
  [Phase 1 · GAP-03/04] Audit + CAW Status 接入 ← 1~2 hr
  [Phase 2] 人工确认卡片显化                  ← 1 hr
  验证：本地起 mock 模式过完整 5 步流程        ← 30 min

Day 1 (如有时间):
  [Phase 3] FlowStepper 对齐                  ← 1 hr

交付前:
  pnpm typecheck + pnpm build 验证无报错
  Vercel deploy --prod
```

---

## 7. 验收标准

演示路径验收（mock mode 下可完整走通）：

1. Treasury 面板 → 4 条贡献记录可见（Alice/Bob/Charlie/Data API）
2. 点击"Generate Plan" → 扫描动画 → 结果：3 Ready（Alice/Charlie/Data API）+ 1 Blocked（Bob，原因：not whitelisted）
3. 查看人工确认卡片 → 点击"Approve & Execute"
4. 执行动画 → Step 4 审计报告：3 条 EXECUTED + 1 条 BLOCKED + txHash 展示
5. CAW Status Refresh 可点击，返回 status/network/txHash
6. 全程无 JS 错误，无白屏
