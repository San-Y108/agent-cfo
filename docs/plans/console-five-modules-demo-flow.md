# AgentCFO Console 五模块演示流程梳理

> 用途：2026-06-14 Demo Day 合约审计环节  
> 聚焦：Console `/console/*` 五个功能模块的按钮、操作、数据流转  
> 配套：`frontend/components/console/modules/*` · `lib/console/console-state.tsx` · `lib/demo/console-mock.ts`

---

## 一、导航总览

Console 顶部 Pill Nav 固定 5 个入口：

| 入口 | 路由 | 颜色 | 模块职责 |
|---|---|---|---|
| Agent | `/console` / `/console/agent` | lime | 聊天式 CFO，快捷触发核心流程 |
| Treasury | `/console/treasury` | cyan | 付款计划 → 风控 → 执行 → 审计 |
| Wallets | `/console/wallets` | blue | 多签 / Agent Vault / Cold Storage 视图与划拨 |
| Analytics | `/console/analytics` | violet | 执行量、拦截量、Gas 节省、效率对比 |
| Policy | `/console/policy` | coral | 护栏规则、阈值、白名单管理 |

全局状态 `ConsoleStateProvider` 包裹所有路由，`budgetRule` / `records` / `plan` / `cawStatuses` 在五模块间实时共享。

顶部右侧还有：
- **Mock/Real 徽章**：当前为 Mock（`NEXT_PUBLIC_DEMO_MODE=mock`）。
- **Sandbox 按钮**（烧瓶）：打开右侧抽屉 Sandbox 标签。
- **Rules 按钮**（滑块）：打开右侧抽屉 Rules 标签，显示当前预算/限额/白名单只读视图。
- **Activity 入口**：在 Agent Hub 的 PersonaRail 底部或某些模块中可打开，显示操作日志。

---

## 二、默认数据（Mock）

```ts
// lib/demo/console-mock.ts
MOCK_RULES = {
  monthlyBudget: 50,
  singlePaymentLimit: 25,
  allowedToken: "USDC",
  whitelist: [
    "0xAlice1234567890abcdef1234567890abcdef12",
    "0xCharlie1234567890abcdef1234567890abcdef",
    "0xDataAPI1234567890abcdef1234567890abcde",
  ],
}

MOCK_RECORDS = [
  { name: "Alice",   wallet: "0xAlice...",   amount: 20 },  // 在白名单 → Ready
  { name: "Bob",     wallet: "0xBobUn...",   amount: 15 },  // 不在白名单 → Blocked
  { name: "Charlie", wallet: "0xCharlie...", amount: 10 },  // 在白名单 → Ready
  { name: "Data API",wallet: "0xDataAPI...", amount: 5 },   // 在白名单 → Ready
]
```

**演示记忆点**：3 笔 Ready（Alice/Charlie/Data API），1 笔 Blocked（Bob）。

---

## 三、模块 1：Agent Hub（`/console`）

### 3.1 页面结构

- **左侧 PersonaRail**：吉祥物 + 状态 + 4 个预算/状态 KPI（预算余额、记录数、待执行、已拦截）。
- **右侧 ChatPanel**：
  - 种子对话（已预置 3 条）。
  - 快捷按钮：「生成计划」「检查风险」「查看审计」。
  - 输入框 + 发送。
  - Demo 预检面板（消息数 ≤3 且未思考时显示）。

### 3.2 可点击元素

| 元素 | 作用 | 数据流 |
|---|---|---|
| 快捷按钮「生成计划」 | 调用 `generatePlan()` | `records` → `evaluateItem()` → `plan` 状态变为 Review；`activityLog` 追加 plan 记录 |
| 快捷按钮「检查风险」 | 若 `plan` 为空先 `generatePlan()`，然后输出风险摘要 | 读取当前 `plan` 和 `budgetRule`，Agent 气泡显示摘要 |
| 快捷按钮「查看审计」 | 若未执行先 `executePlan()`，然后输出审计摘要 | `plan` 中 Ready 项变为 Executed；`cawStatuses` 生成；输出 txHash 摘要 |
| 输入框 + 发送 | 调用后端 `/api/agent/chat`（MiniMax 代理） | 当前 `budgetRule/records/plan/step` 作为 context 传入 |
| PersonaRail 底部「查看执行记录」 | `openDrawer("activity")` | 打开右侧抽屉 Activity 标签 |

### 3.3 推荐演示动作

1. 进入 `/console`，指着顶栏 Mock 徽章说「演示模式」。
2. 点击「生成计划」→ Agent 气泡出现计划摘要（3 pass / 1 blocked）。
3. 点击「检查风险」→ 出现风险扫描摘要。
4. 点击「查看审计」→ 自动执行并出现审计摘要。

> 注意：若后端 `/api/agent/chat` 未配置 `MINIMAX_API_KEY`，会返回 503；建议走快捷按钮，它们只读本地 state，不依赖后端 Agent。

---

## 四、模块 2：Treasury（`/console/treasury`）

### 4.1 页面结构（ModuleStageLayout 三栏 + DetailDeck）

- **左栏 Records Satellite**：贡献记录列表 + 添加/导入/重置 + 吉祥物。
- **中栏 Stage**：
  - FlowTimeline（5 步）。
  - ActionPanel（随 `step` 切换：Idle / Scanning / Review / Executing / Done）。
- **右栏 Live Metrics**：风险概览仪表盘（分数、检查/通过/拦截/警告、预算/剩余）。
- **右下角 DetailDeck**：
  - Risk HUD Panel（扫描中/审核中显示）。
  - Risk Gate Animation（Blocked 项显示）。
  - Audit Snapshot（Done 后显示）。
  - CAW Status（Done 后可刷新）。

### 4.2 状态机 `FlowStep`

```ts
Idle = 0      // 初始，显示「生成付款计划」按钮
Scanning = 1  // AI 扫描中动画
Review = 2    // 风险结果列表，显示 Approve & Execute / Back
Executing = 3 // CAW 执行动画
Done = 4      // 执行完成，显示审计与 CAW 状态
```

### 4.3 可点击元素

| 元素 | 作用 | 数据流 |
|---|---|---|
| 「生成付款计划」大按钮 | `generatePlan()` | Mock：本地 `evaluateItem()`；Real：POST `/api/payment-plan` + `/api/risk-check` |
| 「批准并执行」按钮 | `executePlan()` | Mock：Ready 项 → Executed，生成随机 txHash；Real：POST `/api/execute-payment` + GET `/api/audit-report/{id}` |
| 「返回」按钮 | `resetFlow()` 的部分行为（当前实现是回到 Idle） | `plan` 清空，`step` 回到 Idle |
| 「处理下一周期」按钮 | `resetFlow()` | 全部重置为 MOCK_RECORDS / MOCK_RULES |
| Records 列表底部 + 按钮 | `addRecords()` | 新增 ContributorRecord，刷新 records；但当前表单需要手动填姓名/地址/金额 |
| 导入图标（Upload） | 打开 `RecordsImport` modal | 可粘贴/上传 CSV/JSON 格式的 records |
| 重置图标（RefreshCw） | `resetFlow()` | 重置 |
| CAW Status「刷新」按钮 | `refreshCawStatus()` | Mock：给未完成 txHash 补随机 hash；Real：GET `/api/caw-status/{id}/refresh` |
| DetailDeck 折叠/展开 | 控制面板开合 | 纯 UI |

### 4.4 推荐演示动作

1. 进入 Treasury，左栏显示 4 条记录，Bob 尚无状态。
2. 点击「生成付款计划」→ 中栏进入 Scanning 动画 → 进入 Review，Bob 显示 Blocked，其余 Ready。
3. 指着右栏 Metrics：3 Pass / 1 Blocked，预算 50，剩余 35（因为 15 被拦截）。
4. 点击「批准并执行」→ Executing 动画 → Done。
5. 展开右下角 DetailDeck：Audit Snapshot 显示 3 笔 Executed + Bob Blocked；CAW Status 显示 mock 状态。
6. 点击「刷新」CAW Status，补全 txHash（Mock 行为）。

---

## 五、模块 3：Wallets（`/console/wallets`）

### 5.1 页面结构

- **Vault Topology 卡片**：3D/全息拓扑图，展示 3 个钱包及总资产。
- **Wallet List Satellite**：左侧/上方钱包列表，可切换 active wallet。
- **Wallet Detail Satellite**：显示当前钱包地址、资产组合、总价值。
- **Transfer Floating**：可折叠的「发起外部划拨」表单。
- **Signers Matrix Strip**：当前钱包的 HSM Signers。
- **Add Wallet Modal**：点击 + 后弹出，可新增 Agent Vault / Multi-sig。

### 5.2 初始钱包数据

```ts
INITIAL_WALLETS = [
  { id: "w-1", name: "AgentCFO Master Treasury", type: "Agent Vault", tokens: [USDC 12450, USDT 5000, ETH 4.85] },
  { id: "w-2", name: "Gnosis Safe Operations",    type: "Multi-sig",   tokens: [USDC 25000, ETH 12] },
  { id: "w-3", name: "Cobo Backup Cold Storage",  type: "Cold Storage",tokens: [USDC 150000] },
]
```

### 5.3 可点击元素

| 元素 | 作用 | 数据流 |
|---|---|---|
| 拓扑图上的钱包节点 | `setActiveWalletId(id)` | 切换 active wallet，下方详情和划拨表单同步 |
| Wallet List 中某一行 | `setActiveWalletId(id)` | 同上 |
| 「+」按钮（列表标题右侧） | `setIsAddingWallet(true)` | 打开 Add Wallet Modal |
| Add Wallet Modal 中表单 | `handleCreateWallet()` | 新增钱包到 `wallets` 数组，默认 0 USDC |
| Transfer Floating 折叠按钮 | `setExpanded()` | 展开/收起划拨表单 |
| 划拨表单「Broadcast」按钮 | `handleTransferSubmit()` | 检查金额是否 > `singlePaymentLimit`；若超限显示 Blocked Alert；否则扣减本地余额 |
| 地址复制按钮 | `navigator.clipboard.writeText()` | 复制完整地址，2 秒后恢复 |

### 5.4 风控联动

Wallets 从全局 `budgetRule.singlePaymentLimit` 读取单笔限额。若输入金额 > 25 USDC，会弹出红色 Blocked Alert：

> 「单笔限额 25 USDC，您尝试转账 X USDC 已超出安全边界。」

### 5.5 推荐演示动作

1. 进入 Wallets，默认选中 AgentCFO Master Treasury，总资产约 53,990 USD。
2. 点击拓扑图或列表切换到 Gnosis Safe Operations，观察详情变化。
3. 展开 Transfer Floating，输入金额 30 USDC + 任意地址，点击 Broadcast → 被拦截。
4. 改为 10 USDC，点击 Broadcast → 成功，余额扣减。
5. 点击列表 + 新增一个 Agent Vault（随便填地址）→ 列表增加一项。

---

## 六、模块 4：Analytics（`/console/analytics`）

### 6.1 页面结构

- **2×2 KPI Grid**：
  - VOLUME：已执行总金额（Executed 项求和，无数据则 fallback 91700）。
  - BLOCKED：被拦截金额（Blocked 项求和）。
  - CYCLES：执行笔数。
  - RECORDS：当前 records 数量。
- **Area Chart Hero**：支出曲线（30d/90d/1y 可选）。
- **Pie Chart Satellite**：支出分类饼图。
- **Comparison Matrix**：Caw Relayer vs Direct 的三组对比。

### 6.2 数据来源

| KPI | 来源 | 说明 |
|---|---|---|
| VOLUME | `plan.filter(i => i.status === "Executed").reduce(amount)` | Treasury 执行后自动刷新 |
| BLOCKED | `plan.filter(i => i.status === "Blocked").reduce(amount)` | 反映风控拦截 |
| CYCLES | `Executed.length` | 执行笔数 |
| RECORDS | `records.length` | 当前记录数 |
| Area Chart | `RANGE_DATA[activeRange]` | 静态 mock 数据，仅范围切换 |
| Pie Chart | 内部 mock | 静态分类数据 |
| Comparison Matrix | 静态 i18n 文案 | 展示效率对比 |

### 6.3 可点击元素

| 元素 | 作用 | 数据流 |
|---|---|---|
| 30d / 90d / 1y Range Pills | `setActiveRange()` | 切换 Area Chart 数据 |
| KPI 卡片 | 无点击 | 仅展示 |
| 图表悬停 | tooltip | 纯展示 |

### 6.4 推荐演示动作

1. 先在 Treasury 执行完付款计划。
2. 进入 Analytics，指着 VOLUME / BLOCKED / CYCLES 说「执行结果实时同步到这里」。
3. 切换 30d / 90d / 1y，展示曲线变化。
4. 指着 Comparison Matrix 说「批量执行比单笔多签节省 84% Gas」。

---

## 七、模块 5：Policy（`/console/policy`）

### 5.1 页面结构

- **Neural Guardrails Graph**：五边形规则拓扑图，悬停高亮。
- **Rules Satellite**：5 条规则节点列表（Budget Cap / Whitelist / Single Limit / Token Policy / Duplicate Guard）。
- **Threshold Satellite**：
  - 单笔限额滑块（5–100 USDC）。
  - 月预算滑块（50–500 USDC）。
  - 微支付阈值滑块（1–50 USDC，演示用，不写入全局规则）。
  - Slack webhook 输入框。
  - 「Commit modifications」按钮。
- **Whitelist Strip**：白名单表格 + 删除 + 注册新地址。
- **Guard Integrity**：两个状态卡片（Cobo Core validator / Slack relayer）。

### 5.2 可点击元素

| 元素 | 作用 | 数据流 |
|---|---|---|
| 规则拓扑图节点 | `setActiveRuleId(id)` | 高亮对应规则，Rules Satellite 同步高亮 |
| Rules Satellite 行 | `onMouseEnter/onMouseLeave` | 同上 |
| 阈值滑块 | `setMaxSingle()` / `setDailyCum()` / `setAutoUnder()` | 本地 state 变化，数值实时闪烁；未 Save 时不写入全局 |
| 「Commit modifications」按钮 | `handleSave()` | 调用 `updateSingleLimit(maxSingle)`、`updateMonthlyBudget(dailyCum)`、`updateWhitelist([...])`；全局 `budgetRule` 更新；1.5 秒后显示 success |
| 白名单「注册」按钮 | `setIsAddingItem(true)` | 打开 Add Whitelist Modal |
| Add Whitelist Modal 表单 | `handleAdd()` | `syncWhitelistToContext()` → 全局 whitelist 更新 |
| 白名单行删除按钮 | `handleDelete()` | 全局 whitelist 移除该项 |

### 5.3 跨模块联动

Policy 修改后：
- `budgetRule.singlePaymentLimit` 改变 → Treasury 的 `evaluateItem()` 立即使用新限额。
- `budgetRule.monthlyBudget` 改变 → Analytics 的 VOLUME/剩余预算计算变化。
- `budgetRule.whitelist` 改变 → Treasury 中 Bob 如果地址被加入则变为 Ready；Wallets 划拨也受白名单概念影响（但 Wallets 划拨只检查限额，不检查白名单）。

### 5.4 推荐演示动作

1. 进入 Policy，指着 Neural Guardrails Graph 说「五道规则」。
2. 悬停 Whitelist 节点，解释 Bob 被拦截的原因。
3. 把单笔限额从 25 拖到 10，点击 Commit。
4. 切回 Treasury，重置后重新生成计划 → Alice（20）也会 Blocked，说明规则实时生效。
5. 再把单笔限额调回 25，Commit。
6. 在白名单里把 Bob 的地址加进去 → 切回 Treasury 重置生成计划 → Bob 变为 Ready。

---

## 八、五模块串联演示流程（建议顺序）

### 版本 A：审计员视角（强调规则与风控）

1. **Policy** → 展示五道规则、当前阈值、白名单里没有 Bob。
2. **Treasury** → 生成计划，Bob Blocked，其余 Ready；执行后审计。
3. **Analytics** → 看执行结果同步到指标。
4. **Wallets** → 展示金库拓扑，尝试超额转账被拦截。
5. **Agent Hub** → 用快捷按钮快速复述一遍全流程。

### 版本 B：CFO 操作视角（强调端到端）

1. **Agent Hub** → 生成计划 → 检查风险 → 查看审计。
2. **Treasury** → 展开看时间轴、Audit Snapshot、CAW Status。
3. **Wallets** → 看资金从哪里出、多重签名结构。
4. **Analytics** → 看本次执行的数据表现。
5. **Policy** → 解释规则为什么让 Bob 被拦。

### 版本 C：2 分钟极速版

1. **Agent Hub**：3 个快捷按钮走完全流程（30 秒）。
2. **Treasury**：指着 Bob Blocked + 审计报告（25 秒）。
3. **Policy**：展示规则拓扑 + 白名单（20 秒）。
4. 收尾：Mock 模式说明 + GitHub 证据（15 秒）。

---

## 九、关键数据流图

```
MOCK_RECORDS / MOCK_RULES
        │
        ▼
┌─────────────────┐
│   Agent Hub     │──快捷按钮──┐
│  (chat + KPI)   │            │
└─────────────────┘            │
        │                      │
        ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│    Treasury     │◄───┤ generatePlan()  │
│  (plan/execute) │    │  / executePlan()│
└─────────────────┘    └─────────────────┘
        │
        ▼
┌─────────────────┐
│    Analytics    │◄── plan/records 实时读取
│  (KPI/charts)   │
└─────────────────┘
        ▲
        │
┌─────────────────┐
│     Policy      │── updateSingleLimit / updateMonthlyBudget / updateWhitelist
│ (rules/thresholds)│
└─────────────────┘
        │
        ▼
┌─────────────────┐
│    Wallets      │◄── singlePaymentLimit（划拨拦截）
│  (vaults/transfer)│
└─────────────────┘
```

---

## 十、Demo 纪律

- Mock 模式下 Wallets 划拨、CAW Status 刷新都是本地模拟，**不发起真实链上交易**。
- 不要展示完整钱包地址（界面已做截断）。
- 不要 claims 已完成 3 笔商业付款 tx；真实证据只有 README 中的 2 笔 Sepolia testnet。
- Policy 的修改是演示友好的， Commit 后会真实影响 Treasury 的后续计划生成。
