# Console Demo — To-Do List（待 Review）

> 状态：等待 Review，未开始执行
> 文件路径：docs/plans/console-demo-todo.md
> 关联 Plan：docs/plans/console-demo-repair-plan.md

---

## 一、类型契约对齐（后端 contract 合规）

### T-01 — `PaymentPlanItem.status` 补全缺失状态

**问题**：`lib/types/console.ts` 里 `PaymentPlanItem.status` 只有 `"Ready" | "Blocked" | "Executed"`，
缺少后端 contract 里的 `"NeedsApproval"` 和 `"Failed"`。
实际后端 risk-check 返回通过项为 `"NeedsApproval"`，不是 `"Ready"`——现在 UI 永远不会匹配真实后端响应。

**改动文件**：`frontend/lib/types/console.ts`
```diff
- status: "Ready" | "Blocked" | "Executed";
+ status: "Ready" | "NeedsApproval" | "Blocked" | "Executed" | "Failed";
```

---

### T-02 — `BudgetRules` 补全 `requiresHumanApproval`

**问题**：`lib/types/console.ts` 里 `BudgetRules` 缺少 `requiresHumanApproval: boolean`，
但 `lib/api/types.ts` 里的 `BudgetRule` 有这个字段（后端必传）。

**改动文件**：`frontend/lib/types/console.ts`
```diff
  interface BudgetRules {
    monthlyBudget: number;
    singlePaymentLimit: number;
    allowedToken: string;
    whitelist: string[];
+   requiresHumanApproval: boolean;
  }
```

---

## 二、数据源统一（消除双数据体系）

### T-03 — Treasury 模块切换到 `lib/mock/` 规范数据

**问题**：Treasury 模块使用 `lib/demo/console-mock.ts`（本地非契约类型），
而 `lib/mock/` 下有完整的 backend-contract-compliant mock 数据（`mockContributions`、
`mockBudgetRule`、`mockPaymentPlan`、`mockRiskCheckResult`、`mockExecutionResult`、
`mockAuditReport`）却从未被使用。

**改动文件**：`frontend/components/console/modules/treasury.tsx`

```diff
- import { MOCK_RECORDS, MOCK_RULES } from "@/lib/demo/console-mock";
- import { ContributorRecord, PaymentPlanItem } from "@/lib/types/console";
+ import { mockContributions } from "@/lib/mock/contribution-records";
+ import { mockBudgetRule } from "@/lib/mock/budget-rules";
+ import { mockPaymentPlan } from "@/lib/mock/payment-plan";
+ import { mockRiskCheckResult } from "@/lib/mock/risk-check";
+ import { mockExecutionResult } from "@/lib/mock/caw-execution";
+ import { mockAuditReport } from "@/lib/mock/audit-report";
+ import type { PaymentItem, PaymentExecutionItem } from "@/lib/api/types";
```

Records state 初始值从 `MOCK_RECORDS` → `mockContributions` 映射（加上前端本地 id）。

---

### T-04 — 统一钱包地址（消除两套地址的不一致）

**问题**：
- `lib/mock/contribution-records.ts`：Alice = `0xAliceWalletAddress`
- `lib/demo/console-mock.ts`：Alice = `0xAlice1234567890abcdef1234567890abcdef12`
- Policy 模块白名单展示的是第二套地址

**改动文件**：`lib/mock/contribution-records.ts`
将 `WALLETS` 常量的值改为和 `console-mock.ts` 对齐的完整地址，
或反过来，以 `lib/mock/contribution-records.ts` 的地址为准更新所有引用。

**建议**：以 `lib/mock/` 为 single source of truth，`console-mock.ts` 地址跟进修改；
`console-mock.ts` 最终可废弃。

---

### T-05 — Policy 模块白名单地址与贡献记录对齐

**问题**：`modules/policy.tsx` 里的 `INITIAL_WHITELIST` 展示 Alice 地址 `0xAlice1234...`，
和统一后的地址不一致，评委可能发现。

**改动文件**：`frontend/components/console/modules/policy.tsx`
白名单地址与 `lib/mock/contribution-records.ts` 的 `WALLETS` 常量保持一致。

---

## 三、UI 业务流程补全

### T-06 — 增加 `NeedsApproval` 状态徽章

**问题**：risk-check 返回通过项状态为 `NeedsApproval`，当前 `StatusBadge` 组件只处理
`Ready / Blocked / Executed`，`NeedsApproval` 会 fallback 到 `—`，什么都不显示。

**改动文件**：`treasury.tsx` 内 `StatusBadge` 组件
```diff
+ if (status === "NeedsApproval") {
+   return <span className="...yellow badge...">Needs Approval</span>
+ }
```

---

### T-07 — 显化「人工确认」步骤

**问题**：当前 Step 2 只有一个「Approve & Execute」按钮，直接触发执行。
后端合约要求 `humanApproval: { approved: true, approvedBy: "..." }` 明确传入。
评委卖点是「AI 规划 → 人工把关 → CAW 受控执行」，人工这一环目前在 UI 上隐形。

**方案**：Step 2 拆为两个子 step：
1. **Review** — 展示 Ready（NeedsApproval）和 Blocked 列表，只有 Review 确认按钮
2. **Approve** — 展示确认摘要（谁/多少 USDC），有「Reject All」和「Approve & Execute」按钮

「Approve & Execute」点击时构造 `humanApproval: { approved: true, approvedBy: "console-operator" }`。

**改动文件**：`treasury.tsx` 内 `ActionPanel` 组件

---

### T-08 — Step 4 审计报告使用真实 `AuditReport` 数据结构

**问题**：当前 Step 4 渲染从本地 `plan: PaymentPlanItem[]` 读取数据（前端自定义结构），
`lib/mock/audit-report.ts` 里有完整的 backend-shape `AuditReport` 对象，
包含 `decisionTrail`、`riskRuleEvidence`、`cawEvidence`、`outcomeSummary` 等字段，
全部未被渲染。

**改动文件**：`treasury.tsx` Step 4 渲染逻辑

mock mode 下使用 `mockAuditReport`，real mode 下调用 `getAuditReport(auditReportId)`。
渲染补充：
- `decisionTrail`（展示 5 步决策链路）
- `cawEvidence[].cawRequestId` + `txHash`（替换当前随机生成的 txHash）
- `outcomeSummary.blockedPaymentIds`（拦截原因）
- `remainingBudget`（执行后剩余预算）

---

### T-09 — CAW Status 使用规范数据

**问题**：`handleExecute` 里生成 mock `CawStatus` 用的是 `Math.random()` txHash
和硬编码字段，而 `mockExecutionResult.payments[].cawRequestId` 已经有正确值。

**改动文件**：`treasury.tsx` `handleExecute` handler
mock mode 下从 `mockExecutionResult` 的 `payments` 构造 `CawStatus[]`；
`cawRequestId` 用 `mockExecutionResult.payments[i].cawRequestId`（`mock_caw_exec_demo_001_pay_XXX`）。

---

## 四、真实 API 接入（real mode 分支）

> 以下改动均为 `if (!isMockMode())` 分支，mock 行为完全保留。

### T-10 — `handleGenerate` 接入 `createPaymentPlan`

**改动文件**：`treasury.tsx` `handleGenerate`

```
// real mode
const planResult = await createPaymentPlan({
  contributions: mockContributions,   // 或用户导入的记录
  budgetRule: mockBudgetRule,
})
setPaymentPlanId(planResult.paymentPlanId)
// 映射 planResult.payments → 本地显示格式
```

---

### T-11 — `handleGenerate` 接入 `runRiskCheck`

**改动文件**：`treasury.tsx` `handleGenerate`（紧接 T-10）

```
// real mode, after createPaymentPlan
const riskResult = await runRiskCheck({
  paymentPlanId: planResult.paymentPlanId,
  budgetRule: mockBudgetRule,
})
// 映射 riskResult.payments → 本地 PaymentPlanItem[] 格式
// 含 NeedsApproval 状态处理
```

---

### T-12 — `handleExecute` 接入 `executePayment`

**改动文件**：`treasury.tsx` `handleExecute`

```
// real mode
const execResult = await executePayment({
  paymentPlanId,
  approvedPaymentIds: riskResult.payments
    .filter(p => p.status !== "Blocked")
    .map(p => p.id),
  humanApproval: { approved: true, approvedBy: "console-operator" },
})
setAuditReportId(execResult.auditReportId)
```

---

### T-13 — Step 4 接入 `getAuditReport`

**改动文件**：`treasury.tsx` Step 4 入口

```
// real mode
const auditReport = await getAuditReport(auditReportId)
// 用 auditReport 渲染 Step 4 全部字段
```

---

### T-14 — CAW Refresh 接入 `refreshCawStatus`

**改动文件**：`treasury.tsx` `handleRefreshCawStatus`

```
// real mode
const updated = await refreshCawStatus(cawStatus.cawRequestId)
// 更新对应 cawStatuses 条目
```

---

### T-15 — 新增 state：`paymentPlanId`、`auditReportId`、`loadingState`

**改动文件**：`treasury.tsx` state 声明区

```ts
const [paymentPlanId, setPaymentPlanId] = useState<string | null>(null);
const [auditReportId, setAuditReportId] = useState<string | null>(null);
const [loadingState, setLoadingState] = useState<"idle" | "loading" | "error">("idle");
const [errorMsg, setErrorMsg] = useState<string | null>(null);
```

real mode 下每个 async 操作前设 `loading`，catch 后设 `error` + `errorMsg`，
界面展示内联错误（不需要 toast，文字即可）。

---

## 五、部署对齐

### T-16 — 确认 PR #1 合并状态（T-069）

检查 Vercel dashboard → production 对应 commit。
根据结果：合并 PR #1 到 main，或确认 Vercel 已跟踪正确分支。

---

### T-17 — 确认生产环境变量

Vercel 生产保持 `NEXT_PUBLIC_DEMO_MODE=mock`（demo 默认走 mock 更稳）。
记录 real mode 切换方式供必要时使用：
```
NEXT_PUBLIC_DEMO_MODE=real
NEXT_PUBLIC_API_BASE_URL=https://agentcfo-backend.onrender.com
```

---

## 六、验证清单（执行完毕后过）

- [ ] `pnpm typecheck` 零报错
- [ ] `pnpm build` 构建成功
- [ ] mock mode 下跑完整 5 步流程（Records → Generate → Risk Review → Approve → Audit）
- [ ] Bob = Blocked（原因：not whitelisted），Alice/Charlie/Data API = NeedsApproval → Executed
- [ ] Step 4 审计报告展示 `cawRequestId`、`decisionTrail`
- [ ] Policy 模块白名单地址与贡献记录一致
- [ ] CAW Status 卡片展示正确 `cawRequestId` 格式

---

## 执行顺序建议

```
优先级 P0（路演前必须）:
  T-01, T-02           → 类型修复，3 分钟
  T-03, T-04, T-05     → 数据统一，30~45 分钟
  T-06, T-07           → 状态 badge + 人工确认步骤，45 分钟
  T-08, T-09           → Step 4 审计 + CAW 数据，30 分钟
  T-16, T-17           → 部署确认，15 分钟

优先级 P1（有时间做）:
  T-10 ~ T-15          → real mode API 接入，2~3 小时
```

---

*等待 Review 确认后开始执行*
