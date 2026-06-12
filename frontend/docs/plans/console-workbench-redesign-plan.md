# Console 工作台重构计划（2026-06-12）

> 目标：路演可用。顶部导航替换悬浮球、AgentHub 主次重排、Drawer 打磨 + 执行记录、Handoff 遗留修复。
> 边界：只动 `frontend/`，不新增依赖，不碰 Landing Page，不改后端。

## 设计判读

Dark HUD command workspace。沿用 Landing 的 lime/cyan HUD token 体系。
Dials: VARIANCE 5 / MOTION 5 / DENSITY 6。GSAP 不进 Console（工作台不做滚动叙事），微动效全部 Framer Motion。

## 信息架构（新）

```
顶部导航（仿 Landing 居中胶囊 nav，64px）
  /console            Agent     #B5FF4D  （主页：人格栏 + 聊天主体）
  /console/treasury   Treasury  #5EEAD4  （新页面，复用 TreasuryModule）
  /console/wallets    Wallets   #60A5FA
  /console/analytics  Analytics #C084FC
  /console/policy     Policy    #FB7185
右上：Sepolia 状态 / Sandbox|Rules（开 Drawer）/ 返回首页
/console/agent → redirect /console
```

废除：EdgeCapsuleGroup、ModulePanel 左右面板、MobileModuleSheet、ConsoleTopbar、ConsoleSidebar。
（组件文件保留不删，仅 layout 不再引用；待用户确认后清理。PolicyModule/WalletsModule/AnalyticsModule 同理成为 dead code。）

## 模块改动

### 1. console-state
- 新增 `ActivityEntry { id, ts, type: plan|execute|rule|records|system, message }` + `activityLog` + `logActivity`
- generatePlan / executePlan / updateSingleLimit / updateMonthlyBudget / updateWhitelist / addRecords / resetFlow 写入日志
- 新增 drawer 全局状态：`drawerOpen / drawerTab / openDrawer(tab?) / closeDrawer`（AgentHub「View log」与导航按钮共用）

### 2. ConsoleNavbar（新文件 components/console/navbar.tsx）
- fixed top，h-16，frosted（blur + 底部 lime 渐变 hairline，对应 Landing scrolled 态）
- 中央胶囊组：framer `layoutId` sliding pill，active 项 tab 色 icon + 白字
- 移动端：logo 行 + 第二行横向滚动 pills（共 ~108px，main 相应 padding）

### 3. AgentHub 重排
- `lg:grid-cols-[300px_1fr]`：左人格栏紧凑化（128px 光环、对比度修复、TELEMETRY 2x2 派生指标、RECENT 最近 3 条执行记录）
- 聊天面板成为主体；Quick Commands 改为输入框上方 chips（Generate Plan / Check Risk / View Audit）
- 对比度：状态/标语文字移出光晕，使用 fg / fg-muted

### 4. Drawer 重设计
- `w-[min(460px,94vw)]`，磨砂 + sheen + corner glow，关闭按钮加大
- 三 tab：Sandbox（保留）/ Rules（只读 guardrails，微调样式）/ Activity（执行记录时间线，空态精修）

### 5. Treasury 页面（新 app/console/treasury/page.tsx）
- max-w-3xl 容器 + 页头（HudLabel + 标题 + StatusPulse），内嵌 TreasuryModule

### 6. Handoff 遗留
- ThresholdSlider：globals.css 增加 `.hud-range` thumb 样式，移除两处 `<style jsx>`（policy page；module 版已是 dead code 仅同步替换 className）
- FlowTimeline：根部 overflow-x-auto + min-w，防窄屏挤压
- Policy 页 WhitelistStrip：<md 改卡片列表

## 验证

`pnpm typecheck` 分段跑；最后 `pnpm build` + `PORT=3100 pnpm dev` 冒烟（HTTP 200 检查 5 条路由）；视觉验收由用户在浏览器完成（375/768/1440）。

## 提交切分

1. `feat(console): phase 4 state wiring`（已有未提交改动）
2. `feat(console): top navbar replaces edge capsules + treasury page`
3. `feat(console): agent hub hierarchy redesign + integrated quick commands`
4. `feat(console): drawer polish + activity log`
5. `fix(console): slider css, flow timeline overflow, whitelist mobile cards`
