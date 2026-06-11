# AgentCFO Console Visual Upgrade — Execution Prompt

> **Role**: You are an expert React/Next.js frontend engineer.
> **Task**: Implement the visual upgrade for AgentCFO Console.
> **Branch**: `feat/console-aceternity-upgrade`
> **Work Dir**: `frontend/`

---

## 0. 启动检查清单（必读）

进入工作前，先确认：
- [ ] 当前分支是 `feat/console-aceternity-upgrade`
- [ ] 已读 `frontend/CLAUDE.md`（项目总纲）
- [ ] 已读 `frontend/docs/plans/console-visual-upgrade-plan.md`（详细规划）
- [ ] 已读 `frontend/docs/plans/HANDOFF.md`（交接文档）
- [ ] 已读本节下面的「资产速查」

---

## 1. 资产速查（Aceternity 已提取）

### 静态资源
```
public/aceternity/
  noise.webp         # 全局 noise 纹理
  skeleton-one.png   # Dashboard 骨架屏
  dashboard-x.png    # Dashboard mockup
  dashboard.png      # Dashboard mockup 备用
  banner.png         # CTA 背景
  landing.webp       # 轻量背景
```

### TSX 组件（在 `components/ui/aceternity/`）
```
background.tsx      → NoiseOverlay, GridBackground, DotBackground, GradientOrb
bento-grid.tsx      → BentoGrid, BentoCard, BentoSkeleton
card.tsx            → Card, CardTitle, CardDescription, CardSkeletonContainer
stats-section.tsx   → StatsSection, StatCard
shooting-stars.tsx  → ShootingStars, ShootingStarsBackground
sparkles.tsx        → Sparkles
animated-number.tsx → AnimatedNumber
colourful-text.tsx  → ColourfulText, GradientText
```

**使用方式**: 直接 `import { BentoCard } from "@/components/ui/aceternity/bento-grid"`

---

## 2. Phase 1: 基础设施（必须先完成）

### 2.1 全局背景层（`app/console/layout.tsx`）

**目标**: 所有 Console 页面共享统一的暗色氛围背景。

**实现**:
```tsx
// app/console/layout.tsx
import { NoiseOverlay, GridBackground } from "@/components/ui/aceternity/background";

export default function ConsoleLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-[#0D0D0D]">
      {/* 全局背景层 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GridBackground />
        <NoiseOverlay className="opacity-[0.03]" />
      </div>
      
      {/* Sidebar */}
      <ConsoleSidebar />
      
      {/* Main */}
      <div className="ml-[260px] flex flex-1 flex-col relative z-10">
        <ConsoleTopbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
```

**验证**: 打开任意 console 页面，应该能看到 subtle grid 线和 noise 纹理。

### 2.2 Sidebar 折叠改造（`components/console/sidebar.tsx`）

**目标**: Sidebar 可折叠，主面板自动伸缩。

**关键改动**:
1. 添加 `open` state（`useState(true)`）
2. Sidebar 宽度从固定 260px → `motion.div` animate（260 ↔ 72）
3. layout.tsx 中的 `ml-[260px]` → 动态 `marginLeft`
4. Nav labels 在折叠态隐藏（`motion.span opacity`）
5. Active indicator 在折叠态改为背景圆点

**代码框架**:
```tsx
// sidebar.tsx
const [open, setOpen] = useState(true);

// Sidebar container
<motion.aside
  animate={{ width: open ? 260 : 72 }}
  transition={{ type: "spring", stiffness: 380, damping: 30 }}
  className="fixed left-0 top-0 z-40 h-screen border-r border-white/[0.06] bg-[#0D0D0D]"
>
  {/* Collapse toggle button */}
  <button
    onClick={() => setOpen(!open)}
    className="absolute -right-3 top-6 z-50 ..."
  >
    {open ? "◀" : "▶"}
  </button>
  
  {/* Nav items */}
  {NAV_ITEMS.map(item => (
    <Link key={item.href} href={item.href}>
      <Icon size={16} />
      <motion.span
        animate={{ opacity: open ? 1 : 0, display: open ? "inline" : "none" }}
      >
        {item.label}
      </motion.span>
    </Link>
  ))}
</motion.aside>
```

**layout.tsx 同步**:
```tsx
// layout.tsx 中 main 容器的 margin 也要动画
<motion.div
  className="flex flex-1 flex-col"
  animate={{ marginLeft: open ? 260 : 72 }}
  transition={{ type: "spring", stiffness: 380, damping: 30 }}
>
```

**新增导航项**:
```tsx
// sidebar.tsx NAV_ITEMS 增加 Agent 页
{
  href: "/console/agent",
  labelKey: "console.tab.agent",
  shortLabel: "Agent",
  icon: Bot,  // 或 Sparkles
  color: "#C084FC",  // violet
}
```

**验证**: 点击折叠按钮 → Sidebar 收缩 → 主面板撑满。再点击 → 展开。

### 2.3 HolographicButton（`components/ui/holographic-button.tsx`）

**目标**: 所有主要 CTA 按钮统一为全息光晕风格。

**实现**:
```tsx
"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const COLOR_MAP = {
  lime:   { border: "border-[#B5FF4D]/30", glow: "shadow-[#B5FF4D]/20", text: "text-[#B5FF4D]" },
  blue:   { border: "border-[#60A5FA]/30", glow: "shadow-[#60A5FA]/20", text: "text-[#60A5FA]" },
  coral:  { border: "border-[#FB7185]/30", glow: "shadow-[#FB7185]/20", text: "text-[#FB7185]" },
  violet: { border: "border-[#C084FC]/30", glow: "shadow-[#C084FC]/20", text: "text-[#C084FC]" },
};

export function HolographicButton({
  children, variant = "lime", size = "md", className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof COLOR_MAP; size?: "sm" | "md" | "lg" }) {
  const c = COLOR_MAP[variant];
  const sizeClass = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-8 py-3 text-base" }[size];
  
  return (
    <motion.button
      whileHover={{ scale: 1.02, boxShadow: `0 0 30px rgba(${variant === "lime" ? "181,255,77" : variant === "blue" ? "96,165,250" : variant === "coral" ? "251,113,133" : "192,132,252"},0.15)` }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-xl font-semibold backdrop-blur-sm transition-colors",
        "bg-white/[0.03] hover:bg-white/[0.06]",
        "border", c.border, c.text,
        sizeClass,
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

---

## 3. Phase 2: Treasury 页升级（`app/console/page.tsx`）

### 3.1 KPI Cards

**当前**: 4 张 `KpiCard` 组件，静态数字。

**升级后**:
```tsx
// 用 StatCard + AnimatedNumber 替换
import { StatCard } from "@/components/ui/aceternity/stats-section";
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";

<StatCard
  label="Monthly Budget"
  value={<AnimatedNumber value={totalBudget} />}
  subtext="USDC"
  icon={<Wallet className="w-4 h-4" />}
/>
```

**视觉增强**:
- 卡片加 `GradientOrb` 在背景（极淡，通过 absolute positioning）
- 不同卡片不同 orb 颜色：Budget=lime, Pending=cyan, Blocked=coral, Remaining=blue
- Blocked 卡片默认带 coral 微光边框

### 3.2 Records Table

**升级**:
- 每行用 `motion.tr` 包裹，stagger 进入
- Hover 左侧出现 2px 色条
- Bob（Blocked）行持续微光 pulse

```tsx
<tbody>
  {records.map((r, i) => (
    <motion.tr
      key={r.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.03 }}
      className="relative hover:bg-white/[0.02]"
    >
      {/* 左侧色条 */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity",
        status === "Ready" ? "bg-[#B5FF4D]" : status === "Blocked" ? "bg-[#FB7185]" : "bg-emerald-500"
      )} />
      ...
    </motion.tr>
  ))}
</tbody>
```

### 3.3 Action Panel 分步动效

**Step 0 (Idle)**:
- "Generate Plan" 按钮 → `HolographicButton`（lime, lg）
- 按钮周围加 `Sparkles`（count=6, color=lime）

**Step 1 (Scanning)**:
- 中央同心圆 ripple（CSS @keyframes）
- 文字用 `ColourfulText`
- 背景临时加 `GradientOrb`（cyan）

**Step 2 (Review)**:
- Plan items 用 `BentoGrid`（2x2）
- Bob 卡片：`AnimatePresence` shake

**Step 3 (Executing)**:
- 旋转环 + `ShootingStars` 从中心向外
- 进度条 shimmer

**Step 4 (Done)**:
- 三区域用 `StatsSection` Tab 切换
- txHash 用 `GradientText`

### 3.4 RiskGateAnimation（Bob 被拦截）

```tsx
// components/console/risk-gate-anim.tsx
"use client";
import { motion } from "framer-motion";

export function RiskGateAnimation({ isBlocked, reason }: { isBlocked: boolean; reason?: string }) {
  if (!isBlocked) return null;
  
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 text-[#FB7185]"
    >
      <motion.div
        animate={{ x: [0, -5, 5, -5, 5, 0] }}
        transition={{ duration: 0.5 }}
      >
        <ShieldAlert className="w-5 h-5" />
      </motion.div>
      <span className="text-sm font-semibold">{reason || "Blocked"}</span>
    </motion.div>
  );
}
```

---

## 4. Phase 3: Wallets + Analytics

### 4.1 Wallets 页

**Wallet List**:
- 卡片 → `BentoCard`
- Active card → blue glow border
- 资产数字 → `AnimatedNumber`

**WalletTopology**:
- 节点 hover → 发射 `Sparkles`（3-5 个）
- 连接线 → `motion.path` 绘制动画

**WalletHoloCard**:
- Token Cards → mini `BentoCard`
- 总资产 → `AnimatedNumber` + lime gradient

**Transfer Panel**:
- "Broadcast" → `HolographicButton`（blue）
- 成功 → 波纹扩散

### 4.2 Analytics 页

**KPI Banner**:
- 数字 → `AnimatedNumber`
- 卡片 → `BentoCard`

**Charts**:
- 容器 → `BentoCard`
- Area Chart gradient 加强
- Tooltip → `AnimatePresence` scale

**Comparison Matrix**:
- 卡片 → `BentoCard`
- 优胜项 → `Sparkles`

---

## 5. Phase 4: Policy + Agent

### 5.1 Policy 页

**5 Rules**:
- → `BentoGrid`（5 列或响应式）
- 数字 → `AnimatedNumber`
- Hover → 数字放大 1.1x + 光晕

**Whitelist Table**:
- 行 stagger 进入
- Hover 左侧色条
- Delete hover → coral glow

**Threshold Sliders**:
- 值变化 → `AnimatedNumber` 滚动
- Save → `HolographicButton`
- 成功 → panel border lime pulse

### 5.2 Agent 页（新建）

**文件**: `app/console/agent/page.tsx`

**页面结构**:
```tsx
export default function AgentPage() {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* 左侧：3D 角色区 */}
      <div className="w-2/5 relative">
        <AgentCharacter state="idle" />
        <GradientOrb color="lime" className="top-1/4 left-1/4" />
        <GradientOrb color="cyan" className="bottom-1/4 right-1/4" />
      </div>
      
      {/* 右侧：聊天区 */}
      <div className="w-3/5 flex flex-col">
        <ChatHistory />
        <ChatInput />
        <QuickActions />
      </div>
    </div>
  );
}
```

**AgentCharacter 组件**:
```tsx
// components/console/agent-character.tsx
// Phase 1: 先用占位
export function AgentCharacter({ state }: { state: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-64 h-64 rounded-full bg-gradient-to-br from-lime-500/20 to-cyan-500/20 flex items-center justify-center">
        <Sparkles count={12} color="bg-lime-400" />
        <Bot className="w-24 h-24 text-lime-400" />
      </div>
      <p className="mt-4 text-lg font-semibold text-fg">AgentCFO</p>
      <p className="text-sm text-fg-subtle">{state === "thinking" ? "Thinking..." : "Ready"}</p>
    </div>
  );
}
```

**后续**: 将占位替换为真实 3D 角色（Lottie/Three.js/Live2D）。

**Chat 界面**:
- Agent 消息 → 左侧，浅色气泡
- 用户消息 → 右侧，深色气泡
- 消息进入 → `AnimatePresence` + `initial={{ opacity:0, x: -20 }}`
- Typing indicator → 3 个跳动的点

**Quick Actions**:
- 3 个 `HolographicButton`：Generate Plan / Check Risk / View Audit

---

## 6. Phase 5: 打磨与验证

### 6.1 必跑命令

```bash
cd frontend

# 类型检查
pnpm typecheck

# 构建
pnpm build

# 开发预览
PORT=3100 pnpm dev
```

### 6.2 检查清单

- [ ] Sidebar 折叠/展开流畅
- [ ] 5 个导航项都能访问
- [ ] Treasury 完整流程可跑通
- [ ] 所有 KPI 数字有滚动动画
- [ ] Bob blocked 有 shake
- [ ] Agent 页可访问（至少占位态）
- [ ] `pnpm typecheck` 零错误
- [ ] `pnpm build` 成功
- [ ] 无 console error

---

## 7. 常见错误与修复

### Error: `Module not found: @/components/ui/aceternity/xxx`
**Fix**: 检查文件是否在 `components/ui/aceternity/` 下，使用 `@/` alias。

### Error: `framer-motion` 动画不工作
**Fix**: 确认组件有 `"use client"` directive。

### Error: Sidebar 折叠后主内容没有同步
**Fix**: 确保 `layout.tsx` 中的 `marginLeft` 也用了 `motion.div` 且 spring 参数相同。

### Error: 背景层挡住点击
**Fix**: 背景层必须有 `pointer-events-none`。

### Error: 暗色主题下某些元素看不见
**Fix**: 检查是否用了硬编码的 `text-black` 或 `bg-white`，应使用 `text-fg` / `bg-surface`。

---

## 8. 提交指南

每完成一个 Phase 就提交一次：

```bash
git add .
git commit -m "feat(console): Phase 1 — global background + collapsible sidebar"
git commit -m "feat(treasury): Phase 2 — KPI cards, table, action panel animations"
git commit -m "feat(wallets+analytics): Phase 3 — BentoCard upgrade + chart polish"
git commit -m "feat(policy+agent): Phase 4 — rules grid + Agent chat page"
git commit -m "polish: Phase 5 — typecheck, build, responsive fixes"
```

---

*Execute with confidence. Make it stunning.*
