# Handoff — Console 工作台修复（2026-06-12）

> 本交接文档用于切换到 Claude fable 模型继续推进。
> 当前会话已完成 Phase 1-3 并部分推进 Phase 4，工作区有未提交改动。

---

## 1. 项目背景

AgentCFO Console（`/console`）进入路演冲刺阶段。本轮目标是修复布局、主题、数据联动与模块细节问题，使其在路演时可稳定演示。

范围边界：**只修改 `frontend/` 内文件**；不改动后端 API、不新增依赖、不重构 Landing Page。

---

## 2. 今天已完成的工作

### ✅ 已提交（2 个 commit）

#### Commit 1: `feat(console): layout skeleton + HUD tokens + console state context`

- **布局骨架**
  - `app/console/layout.tsx`：用 CSS Grid 替换 margin 避让，左右面板同时打开时主内容区有 `minmax(320px, 1fr)` 保护
  - `components/console/module-panel.tsx`：改为填充 grid cell 的 frosted panel
  - `components/console/edge-capsule.tsx`：固定 `z-[45]`，hover 展开 label
  - 新增移动端底部 Sheet（`MobileModuleSheet`）用于打开 Treasury/Policy 等模块
- **主题与颜色**
  - 移除 `app/console/layout.tsx` 强制 `.dark` 类
  - `components/ui/holographic-button.tsx`：`COLOR_MAP` 改用 globals.css HUD token（`--glow-lime/cyan/coral/violet/blue`）
- **全局状态雏形**
  - 新建 `lib/console/console-state.tsx`：Context + useState 管理 `budgetRule` / `records` / `plan` / `step` / `isExecuting` / `cawStatuses`

#### Commit 2: `feat(console): wire AgentHub, Treasury, Policy and Drawer to global state`

- **TreasuryModule** 接入 `useConsoleState`
  - 本地 business state 全部移除
  - 生成计划 / 执行付款 / 重置流程调用全局 action
  - step 改用 `FlowStep` 枚举
- **AgentHub** 接入全局状态
  - Quick Action "生成计划"/"检查风险"/"查看审计"调用真实 action 并生成状态摘要
  - `/console/agent/page.tsx` 直接复用 `AgentHub`，删除 800+ 行重复代码
- **PolicyModule** 接入全局状态
  - 阈值/白名单初始化读取 `budgetRule`
  - 保存时调用 `updateSingleLimit` / `updateMonthlyBudget` / `updateWhitelist`
- **ConsoleDrawer** Live Rules 改为只读显示全局 guardrails，移除重复编辑控件
- **mock 数据源统一**
  - `lib/mock/budget-rules.ts` 和 `contribution-records.ts` 改为 re-export `lib/demo/console-mock.ts`

### 🟡 已做但未提交（工作区改动）

#### Phase 4 部分推进

| 文件 | 改动 |
|---|---|
| `app/console/policy/page.tsx` | 接入 `useConsoleState`；阈值/白名单从全局读取并同步 |
| `app/console/analytics/page.tsx` | KPI 从 `plan` / `records` 派生；RangePills 切换三组 mock chart data |
| `components/console/modules/analytics.tsx` | 同上，模块版也接入 |
| `components/console/charts/area-chart-card.tsx` | 新增可选 `data` prop，支持外部传入 chart data |
| `app/console/wallets/page.tsx` | 转账限额读取全局 `singlePaymentLimit`；代币价值统一用 `tokenValueUsd()` helper |
| `components/console/modules/wallets.tsx` | 同上，模块版也接入 |

---

## 3. 当前工作区状态

```
 M app/console/analytics/page.tsx
 M app/console/policy/page.tsx
 M app/console/wallets/page.tsx
 M components/console/charts/area-chart-card.tsx
 M components/console/modules/analytics.tsx
 M components/console/modules/wallets.tsx
?? docs/reports/2026-06-12-status-token-limit-recovery.md
?? lib/console/console-state.tsx   (已提交，但显示 ?? 因为相对路径)
```

> 注意：`lib/console/console-state.tsx` 实际已在 commit `fa796241` 中提交，只是 `git status` 相对路径显示问题。

---

## 4. 验证结果

- `pnpm typecheck`：✅ 0 errors（刚刚修复 WalletsModule 遗漏的 `copiedText` 状态后通过）
- `pnpm build`：⚠️ 未在当前工作区运行（上次通过是在 Phase 3 提交前）
- 本地 dev 手动验证：❌ 未运行

---

## 5. 仍未完成的事项（给 Claude fable 的 todo）

### Phase 4 剩余

- [ ] **ThresholdSlider styled-jsx 替换**
  - 位置：`components/console/modules/policy.tsx` 和 `app/console/policy/page.tsx`
  - 当前使用 `<style jsx>`，Tailwind v4 下建议改用 arbitrary variants 或 inline CSS var
- [ ] **FlowStepper 窄桌面溢出**
  - 位置：`components/console/flow-stepper.tsx`
  - 约 1100px 时节点挤在一起，需加 `overflow-x-auto` 或允许折行
- [ ] **PolicyModule 白名单移动端改为卡片列表**
  - 位置：`components/console/modules/policy.tsx` 的 `WhitelistStrip`
  - 当前表格在小屏横向溢出
- [ ] **PolicyPage 白名单移动端改为卡片列表**
  - 位置：`app/console/policy/page.tsx` 的 `WhitelistStrip`
- [ ] **ConsoleSidebar 增加 label 或改为底部导航**
  - 位置：`components/console/sidebar.tsx`
  - 目前只有 icon，可发现性差

### Phase 5

- [ ] 运行 `pnpm build`
- [ ] 本地启动 `PORT=3100 pnpm dev` 手动验证 Console 完整流程
- [ ] 浏览器 DevTools 验证 375px / 768px / 1440px / 1920px 布局
- [ ] 提交 Phase 4 改动
- [ ] 更新 `HANDOFF.md` 或生成最终交接摘要

---

## 6. 关键文件速查

| 文件 | 作用 |
|---|---|
| `lib/console/console-state.tsx` | 全局状态：budgetRule / records / plan / step / cawStatuses |
| `app/console/layout.tsx` | Console 布局骨架、grid、移动端 sheet |
| `components/console/modules/treasury.tsx` | 付款流程，已接入全局状态 |
| `components/console/agent-hub.tsx` | Agent 首页 + 快速指令 |
| `components/console/modules/policy.tsx` | 规则与白名单（模块版） |
| `app/console/policy/page.tsx` | 规则与白名单（独立页面版） |
| `components/console/drawer.tsx` | 右侧抽屉（Sandbox + 只读 Live Rules） |
| `components/console/modules/analytics.tsx` | 数据看板（模块版） |
| `app/console/analytics/page.tsx` | 数据看板（独立页面版） |
| `components/console/modules/wallets.tsx` | 钱包模块（模块版） |
| `app/console/wallets/page.tsx` | 钱包模块（独立页面版） |

---

## 7. 给 Claude fable 的建议

1. **先 build 再动手**：当前工作区有未提交改动，先 `pnpm build` 确认 baseline。
2. **优先做 mobile 体验**：路演很可能用手机演示，Policy 白名单表格和 ConsoleSidebar 的 mobile 改造收益最高。
3. **ThresholdSlider 小心处理**：不要破坏现有视觉，用 Tailwind arbitrary variants 渐进替换 `<style jsx>`。
4. **不要扩大范围**：不要新增依赖、不要改 API、不要重构 Landing Page。
5. **每完成一个子任务就 typecheck**：当前代码量已较大，避免积累 type error。

---

## 8. 如何继续

```bash
# 1. 确认当前在 frontend/ 目录
pnpm typecheck
pnpm build

# 2. 若 build 通过，可继续 Phase 4 剩余任务

# 3. 完成后分批提交
#    - feat(console): phase 4 mobile polish and slider cleanup
#    - feat(console): derive analytics/wallets KPI from global state
```

---

**当前状态**：Phase 1-3 已提交，Phase 4 部分完成（PolicyPage/Analytics/Wallets 已接入全局状态），剩余 UI 细节未处理。`pnpm typecheck` 通过。

**下一步推荐**：Claude fable 接手后先 `pnpm build`，然后按上述 todo 继续 Phase 4/5。
