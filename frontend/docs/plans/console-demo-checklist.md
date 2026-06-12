# Console Demo 修复 Checklist

> 关联计划：`docs/plans/console-demo-repair-plan.md`
> 执行层对照清单，按优先级顺序操作，完成后在对应行打 ✅

---

## P0 — 路演关键路径（必须全部完成）

### 部署对齐

- [ ] **T-001** 检查 Vercel dashboard，确认 production 当前指向的 commit / 分支
- [ ] **T-002** 处理 PR #1（feat/frontend-bootstrap）：合并到 main，或确认 Vercel 已指向正确分支（任意一种即可）
- [ ] **T-003** 确认 Vercel 生产环境变量：`NEXT_PUBLIC_DEMO_MODE=mock`（演示默认走 mock）

### Treasury 模块 API 接入

- [ ] **T-004** 在 `treasury.tsx` state 中新增 `paymentPlanId`、`auditReportId`、`loadingState` 字段
- [ ] **T-005** 改造 `handleGenerate`：mock mode 保留 `evaluateItem()`，real mode 调用 `createPaymentPlan()` + `runRiskCheck()`
- [ ] **T-006** 将后端 `PaymentItem[]` 映射为本地 `PaymentPlanItem[]`（status 枚举字段对齐检查）
- [ ] **T-007** 改造 `handleExecute`：mock mode 保留 setTimeout mock，real mode 调用 `executePayment()`，存储返回的 `auditReportId`
- [ ] **T-008** 改造 Step 4 审计渲染：real mode 调用 `getAuditReport(auditReportId)` 替换本地 plan state，展示真实 txHash
- [ ] **T-009** 改造 CAW Status 刷新：real mode 调用 `refreshCawStatus(cawRequestId)` 替换 setTimeout mock
- [ ] **T-010** 每个 real mode API 调用加 try/catch：失败时设 `loadingState="error"`，展示内联错误文字，允许重试

### 功能验证（mock mode）

- [ ] **T-011** 本地起 `PORT=3100 pnpm dev`，打开 Treasury 面板
- [ ] **T-012** 验证 Records 列表显示 4 条：Alice 20 / Bob 15 / Charlie 10 / Data API 5
- [ ] **T-013** 点击 Generate Plan → 扫描动画正常播放（~1.2s）
- [ ] **T-014** 结果展示：Alice/Charlie/Data API = Ready，Bob = Blocked（原因：not whitelisted）
- [ ] **T-015** 点击 Approve & Execute → 执行动画播放（~2s）
- [ ] **T-016** Step 4：3条 EXECUTED + 1条 BLOCKED，txHash 列有值（mock 下随机值可接受）
- [ ] **T-017** CAW Status 刷新按钮可点击，状态卡片更新
- [ ] **T-018** Reset 按钮清空状态，回到 Step 0

### 构建验证

- [ ] **T-019** `pnpm typecheck` 零报错
- [ ] **T-020** `pnpm build` 构建成功，无 ESLint 阻塞错误

---

## P1 — 演示质量提升（尽力完成）

### 人工确认步骤显化

- [ ] **T-021** 在 Step 2 底部、Execute 按钮前增加「Human Approval」确认卡片
- [ ] **T-022** 卡片内列出所有 Ready 项目（名称 + 金额 + Ready 标签）
- [ ] **T-023** 卡片内列出所有 Blocked 项目（名称 + Blocked 标签，灰色/不可选）
- [ ] **T-024** 点击 Approve 后才进入执行阶段（`humanApproval: { approved: true }`）

### FlowStepper 联动（可选）

- [ ] **T-025** AgentHub FlowStepper `currentStep` 随 Treasury 执行阶段同步更新（或可点击跳转对应 panel）

---

## P2 — 锦上添花（时间充裕再做）

- [ ] **T-026** ChatSatellite 对话：QuickAction 触发时联动更新 FlowStepper 进度
- [ ] **T-027** real mode 下增加全局 loading indicator（Topbar 进度条 or spinner）
- [ ] **T-028** real mode 下添加 Render 冷启动等待提示（"Backend warming up, ~30s..."）

---

## 已确认无需操作

| 项 | 原因 |
|---|---|
| `lib/api/risk.ts` | ✅ 已实现，`runRiskCheck()` 存在 |
| `lib/api/audit.ts` | ✅ 已实现，`getAuditReport()` 存在 |
| `lib/api/types.ts AuditReport` | ✅ 第 109 行已存在 |
| `lib/workflow/run-demo-flow.ts` | ✅ 完整 4 步编排已实现 |
| `console-mock.ts` 数据 | ✅ 4条正确（Alice/Bob/Charlie/Data API），Bob 不在白名单 |
| CORS 配置 | ✅ PM 确认后端已配好 |

---

## 演示彩排 Checklist（路演当天）

- [ ] Vercel 生产 URL 可访问：https://agentcfo-frontend.vercel.app
- [ ] Landing Page 正常加载
- [ ] Console 路由 `/console` 正常进入
- [ ] Treasury 左侧胶囊可点击、面板正常展开
- [ ] 跑完完整 5 步流程一遍（≤ 5 分钟）
- [ ] Policy 面板展开，白名单地址可见
- [ ] Wallets 面板展开，余额显示
- [ ] Analytics 面板展开，图表渲染
- [ ] 中英文切换正常
- [ ] 无控制台报错（F12 检查）
