# AgentCFO Console Visual Upgrade Plan

> **Branch**: `feat/console-aceternity-upgrade` (from `feat/frontend-dev`)
> **Target**: 5 Console Pages + Collapsible Sidebar
> **Philosophy**: 把简单的财务流程做成「AI 财控指挥中心」的沉浸体验
> **Date**: 2026-06-10

---

## 1. 设计目标与核心命题

### 1.1 一句话定位

**AgentCFO Console 不是普通后台面板，它是 DAO 的「AI 财控指挥中心」。**

评委打开页面应该感受到：
- 这是一个 **有生命的系统**（动效、光晕、粒子）
- 这是一个 **有角色的系统**（3D Agent 人物、对话式交互）
- 这是一个 **有故事的系统**（付款流程像电影分镜一样推进）

### 1.2 设计原则

| 原则 | 说明 | 反例 |
|---|---|---|
| **大胆创新** | 在现有流程骨架上，视觉表现要出人意料 | 不要只换颜色和圆角 |
| **动效叙事** | 每个状态变化都用动效讲故事 | 不要静态跳切 |
| **层次分明** | 背景层 → 氛围层 → 内容层 → 焦点层 | 不要所有元素同一层级 |
| **品牌一致性** | 严格使用 AgentCFO 配色（lime/cyan/coral/violet/blue） | 不要引入不协调的亮色 |
| **性能优先** | 所有动效用 CSS/transform，避免 layout thrashing | 不要每帧触发重排 |

### 1.3 情绪板关键词

```
Dark Command Center  ·  Holographic UI  ·  Cyberpunk Treasury
Data Flow Particles  ·  AI Companion  ·  Cinematic Workflow
```

---

## 2. 资产清单

### 2.1 Aceternity 已提取资产

**静态图片** (`public/aceternity/`):
| 文件 | 大小 | 用途 |
|---|---|---|
| `noise.webp` | 715KB | 全局暗色 noise 纹理叠加 |
| `skeleton-one.png` | 574KB | Dashboard 骨架屏/加载态参考 |
| `dashboard-x.png` | 565KB | Dashboard preview 背景 |
| `dashboard.png` | 345KB | Dashboard preview 备用 |
| `banner.png` | 322KB | CTA / Hero 装饰背景 |
| `landing.webp` | 70KB | 轻量背景/装饰 |

**TSX 组件** (`components/ui/aceternity/`):
| 组件 | 来源 | 核心能力 |
|---|---|---|
| `NoiseOverlay` | `background.tsx` | 固定暗色噪点纹理，`mix-blend-soft-light` |
| `GridBackground` | `background.tsx` | CSS grid 线条，`radial-gradient mask` |
| `DotBackground` | `background.tsx` | 圆点阵列背景，`radial-gradient` |
| `GradientOrb` | `background.tsx` | 大光晕毛球，`blur-[120px]`，支持 6 色 |
| `BentoGrid` + `BentoCard` | `bento-grid.tsx` | 不对称卡片网格，`group-hover` glow |
| `BentoSkeleton` | `bento-grid.tsx` | 加载骨架屏 |
| `Card` + `CardTitle` + `CardDescription` | `card.tsx` | 标准卡片，`inset shadow` |
| `StatsSection` | `stats-section.tsx` | Tab 切换式数据面板，`AnimatePresence` |
| `StatCard` | `stats-section.tsx` | 独立统计卡片，`whileInView` |
| `ShootingStars` | `shooting-stars.tsx` | SVG 流星动画，`requestAnimationFrame` |
| `Sparkles` | `sparkles.tsx` | 闪烁粒子，`FM animate opacity/scale` |
| `AnimatedNumber` | `animated-number.tsx` | 数字滚动，`useSpring` + `useTransform` |
| `ColourfulText` | `colourful-text.tsx` | 逐字颜色循环动画 |
| `GradientText` | `colourful-text.tsx` | 静态渐变文字 |

### 2.2 自定义组件（本次需新建）

| 组件 | 位置 | 说明 |
|---|---|---|
| `AgentCharacter` | `components/console/agent-character.tsx` | 3D 动漫人物（见 §6） |
| `CollapsibleSidebar` | 改造 `components/console/sidebar.tsx` | 可折叠侧边栏（见 §7） |
| `FlowTimeline` | `components/console/flow-timeline.tsx` | 付款流程时间线动效 |
| `RiskGateAnimation` | `components/console/risk-gate-anim.tsx` | Bob 被拦截的戏剧化动效 |
| `HolographicButton` | `components/ui/holographic-button.tsx` | 全息光晕 CTA 按钮 |

---

## 3. 全局视觉系统

### 3.1 背景层架构（所有 Console 页面共用）

```
Z-Index 层级（从底到顶）：
┌─────────────────────────────────────┐
│  z-0: 纯色底色 #0D0D0D              │
│  z-0: GradientOrb（页面主色光晕）    │
│  z-0: GridBackground（48px 网格线）  │
│  z-0: NoiseOverlay（4% 噪点纹理）    │
│  z-10: 页面内容                      │
│  z-50: 悬浮元素（Agent 头像等）      │
└─────────────────────────────────────┘
```

**实现**: 在 `console/layout.tsx` 中注入全局背景层，所有子页面共享。

### 3.2 配色规范

| Token | 值 | 用途 |
|---|---|---|
| `--bg-base` | `#0D0D0D` | 全局底色 |
| `--bg-surface` | `rgba(255,255,255,0.02)` | 卡片底色 |
| `--border-subtle` | `rgba(255,255,255,0.06)` | 卡片边框 |
| `--border-hover` | `rgba(255,255,255,0.12)` | hover 边框 |
| `--fg-primary` | `#FFFFFF` | 主文字 |
| `--fg-subtle` | `rgba(255,255,255,0.6)` | 次要文字 |
| `--accent-lime` | `#B5FF4D` | AgentCFO 品牌色 |
| `--accent-cyan` | `#5EEAD4` | 信息/执行 |
| `--accent-coral` | `#FB7185` | 风险/拦截 |
| `--accent-violet` | `#C084FC` | 分析/图表 |
| `--accent-blue` | `#60A5FA` | 钱包/资产 |

### 3.3 动效时间规范

| 场景 | Duration | Easing |
|---|---|---|
| 卡片进入 | 0.5s | `[0.16, 1, 0.3, 1]` (easeOutExpo) |
| Hover glow | 0.3s | `ease-out` |
| 数字滚动 | 1.2s | `stiffness:90, damping:28` |
| Sidebar 折叠 | 0.4s | `spring: stiffness:380, damping:30` |
| 页面切换 | 0.3s | `ease-in-out` |
| 粒子闪烁 | 2-4s loop | `easeInOut` |
| 流星划过 | 速度 8-20 | `requestAnimationFrame` |

### 3.4 字体层级

| 层级 | Size | Weight | 字体 |
|---|---|---|---|
| 页面标题 | 24px | 600 | Inter |
| 区块标题 | 16px | 600 | Inter |
| 正文 | 13-14px | 400 | Inter |
| 数据/数字 | 20-32px | 700 | JetBrains Mono / monospace |
| 标签 | 11px | 500 | monospace, uppercase |

---

## 4. 逐页升级方案

### 4.1 Treasury 页 (`/console`) — 付款执行中心

**当前问题**: KPI Cards 扁平、Records Table 传统、Action Panel 像表单、整体无焦点。

**升级方向**: **「指挥中心仪表盘」** — 像飞船驾驶舱，数据实时跳动，流程像发射程序。

#### A. Header 区域
- **当前**: 静态标题 + 描述
- **升级**:
  - 标题使用 `GradientText`（lime → cyan 渐变）
  - 添加 `Sparkles` 粒子在标题右侧（count=8, color=lime）
  - 副标题下方加微型「系统状态条」：● Online | Sepolia Testnet | CAW Connected（用颜色点表示状态）

#### B. KPI Cards（4 张）
- **当前**: 标准卡片，静态数字
- **升级**:
  - 卡片改用 `BentoCard` 结构（圆角更大 `rounded-2xl`，hover glow）
  - 数字使用 `AnimatedNumber`，页面加载时从 0 滚动到目标值
  - 每张卡片配不同 `GradientOrb` 在背景（Budget=lime, Pending=cyan, Blocked=coral, Remaining=blue）
  - 图标区域加 `ShootingStars` 微型版本（只在 hover 时触发一条流星）
  - **Blocked 卡片特殊处理**: 默认边框带 coral 微光 `box-shadow: 0 0 20px rgba(251,113,133,0.1)`

#### C. Records Table
- **当前**: 标准 HTML table
- **升级**:
  - 表头固定，行 item 用 `motion.div` 包裹，stagger 进入（delay=index*0.03）
  - 每行 hover 时左侧出现 2px 色条（根据状态：Ready=lime, Blocked=coral, Executed=emerald）
  - Blocked 行（Bob）整行背景带 coral 5% 透明度，持续微光 pulse
  - 添加行时（批量导入后）新行从上方滑入 `initial={{ opacity:0, y:-10 }}`

#### D. Action Panel
- **当前**: 按 step 条件渲染不同 UI
- **升级**:
  - **Step 0 (Idle)**: 
    - "Generate Plan" 按钮改用 `HolographicButton`（lime 光晕 + scanline 效果）
    - 按钮周围环绕微型 `Sparkles`
  - **Step 1 (Scanning)**:
    - 中央放大的扫描动画：同心圆 ripple + `GridBackground` 局部高亮
    - 文字使用 `ColourfulText` 循环变色
    - 背景临时加 `GradientOrb`（cyan）
  - **Step 2 (Review)**:
    - Plan items 用 `BentoGrid` 展示（2x2 或 1x4 根据宽度）
    - Bob 的卡片背景 coral，带 `AnimatePresence` shake 动画
    - Ready 卡片带 lime border glow
  - **Step 3 (Executing)**:
    - 全屏 overlay（半透明黑色 + `GridBackground`）
    - 中央：加密核心动画（旋转环 + `ShootingStars` 从中心向外发射）
    - 底部进度条：lime 色，带 shimmer 效果
  - **Step 4 (Done)**:
    - 三区域（Audit / CAW Status / P2）用 `StatsSection` Tab 切换展示
    - txHash 显示用 `GradientText` + 复制按钮 hover glow
    - "Process next cycle" 按钮用 `HolographicButton`

---

### 4.2 Wallets 页 (`/console/wallets`) — 资产管理

**当前亮点**: 已有 `WalletHoloCard`（3D 倾斜 + 光标眩光）和 `WalletTopology`（节点图 + 数据包流动）。

**升级方向**: **「全息金库」** — 强化科幻感，让资产管理像操作未来银行终端。

#### A. Header
- 添加 `GradientOrb`（blue）在 header 背景
- 标题使用 `GradientText`（blue → cyan）

#### B. Wallet List（左侧）
- 卡片用 `BentoCard` 替换当前 div
- Active wallet 的卡片 border 用 blue 光晕 `box-shadow: 0 0 30px rgba(96,165,250,0.15)`
- Hover 时卡片微抬 `translateY(-2px)` + 光晕增强
- 资产总值数字用 `AnimatedNumber`

#### C. WalletTopology（已有，微调）
- 节点 hover 时发射 `Sparkles`（3-5 个粒子）
- 数据包流动轨迹加 trail 效果（渐变透明度）
- 点击节点切换时，连接线用 `motion.path` 绘制动画

#### D. WalletHoloCard（已有，微调）
- 内部 Token Cards 用 `BentoCard` mini 版
- 总资产数字使用 `AnimatedNumber`，带 lime 渐变
- 添加 `ShootingStars` 在卡片边缘（低频率，仅装饰）

#### E. Transfer Panel
- 输入框 focus 时 border 蓝色光晕扩散动画
- "Broadcast" 按钮用 `HolographicButton`（blue 主题）
- 转账成功后的 success toast 从按钮位置扩散波纹
- Blocked  alert 出现时，整个面板边缘 coral pulse

#### F. Signers Matrix
- Signer 卡片用 `BentoCard`
- HSM SECURED badge 加 `Sparkles` 点缀
- Active 状态指示器（绿点）用 `animate-pulse` + 外发光

---

### 4.3 Analytics 页 (`/console/analytics`) — 数据分析

**当前亮点**: KPI 渐变文字、AreaChart、PieChart、Comparison Matrix。

**升级方向**: **「数据指挥塔」** — 图表像全息投影，数据像实时信息流。

#### A. KPI Banner（4 张）
- 保持渐变文字（已很好）
- 数字改用 `AnimatedNumber`，加载时滚动
- 卡片用 `BentoCard`，hover 时图表图标旋转 15°
- 每张卡片背景加对应色 `GradientOrb`（很淡，10% 透明度）

#### B. Area Chart
- 图表容器用 `BentoCard` 包裹
- Area gradient 加强（violet 35% → 1%）
- 添加 `GridBackground` 在图表背后（极淡，2% 透明度）
- Tooltip 出现时用 `AnimatePresence` scale 进入
- X/Y axis 线条加 glow 效果

#### C. Pie Chart
- 圆环中心放 `AnimatedNumber`（总资产）
- 切片 hover 时外扩 + 发光
- 图例项 hover 时对应切片高亮
- 容器用 `BentoCard`

#### D. Comparison Matrix
- 3 张对比卡片用 `BentoCard`
- 优胜项（绿色值）加 `Sparkles` 点缀
- 卡片 stagger 进入（delay=0.1s）
- 悬停时卡片内出现 subtle grid 背景动画

---

### 4.4 Policy 页 (`/console/policy`) — 风控策略

**当前亮点**: 5 Rules Big-Number、Lime Thumb Slider、Whitelist Table。

**升级方向**: **「安全防火墙」** — 规则像防御塔的护盾，调整参数像操控能量阈值。

#### A. 5 Rules Showcase
- **当前**: 5 张卡片，大数字 + hover 渐变
- **升级**:
  - 改用 `BentoGrid`（5 列或响应式折叠）
  - 数字用 `AnimatedNumber`，页面加载时从 0 滚动
  - 每张卡片背景加对应色 `GradientOrb`（极淡）
  - Hover 时数字放大 1.1x + 光晕扩散
  - 卡片边框在 hover 时从透明变为对应色 20% 透明度

#### B. Whitelist Table
- 表头固定，行 stagger 进入
- 每行 hover 左侧出现色条（根据 category 不同色）
- Delete 按钮 hover 时放大 + coral glow
- Add 按钮用 `HolographicButton`（lime 小号版）

#### C. Threshold Sliders
- **当前**: 已很好（lime thumb + glow shadow）
- **升级**:
  - Slider 轨道加 subtle gradient（深色 → lime → 深色）
  - 值变化时，`AnimatedNumber` 滚动过渡
  - Flash 效果保持（已有）
  - 保存按钮用 `HolographicButton`
  - 保存成功时，整个 adjuster panel 边框 lime pulse 一次

#### D. Security Gateway Cards
- 改用 `BentoCard`
- CheckCircle 图标加 `Sparkles`（3 个粒子）
- Hover 时卡片内出现 shield 图标水波纹

---

### 4.5 Agent 页 (`/console/agent`) — AI 财务官

**全新页面** — 这是本次升级的灵魂。

**定位**: 用户与 AI AgentCFO 的交互界面。不是普通聊天框，而是「AI 财务官坐在你面前汇报工作」的沉浸体验。

#### A. 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (collapsible)                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │                      │  │  Chat History                │ │
│  │   3D Agent           │  │  ──────────────────────────  │ │
│  │   Character          │  │  🤖 Agent: 已扫描 4 条记录   │ │
│  │   (Anime Style)      │  │  👤 You: 生成付款计划        │ │
│  │                      │  │  🤖 Agent: [Plan Card]       │ │
│  │   [idle / thinking   │  │  ...                         │ │
│  │    / speaking]       │  │                              │ │
│  │                      │  │  ┌──────────────────────┐    │ │
│  │   说话时嘴巴/手势    │  │  │  Input Box           │    │ │
│  │   有动画             │  │  │  [Type or select...] │    │ │
│  │                      │  │  └──────────────────────┘    │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
│                                                              │
│  Quick Actions: [Generate Plan] [Check Risk] [View Audit]   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### B. 3D Agent 角色

- **位置**: 左侧 40% 宽度，垂直居中
- **实现方式**:
  - 方案 1（推荐）: 使用 **Live2D / Vtuber 风格** 的 Web 渲染（`pixi-live2d-display` 或 `live2d-widget`）
  - 方案 2（备用）: 用 Three.js 加载一个低多边形 3D 角色（`.glb` 格式）
  - 方案 3（最简）: 高质量循环动画 `.webm` / `.lottie`（动漫人物 idle 动画）
- **状态动画**:
  - `idle`: 呼吸动画（轻微上下浮动）
  - `thinking`: 手托下巴 / 头微歪 + 思考气泡（...）
  - `speaking`: 嘴巴同步 + 手势配合
  - `happy`: 完成付款后的庆祝动作
  - `warning`: 发现风险时的警觉表情
- **背景**: 角色背后加 `GradientOrb`（lime + cyan 混合）+ `GridBackground`

#### C. Chat 界面
- 消息气泡用 `BentoCard` 风格
- Agent 消息左侧带角色头像（小圆图）
- 用户消息右侧，深色气泡
- 消息进入用 `AnimatePresence` + `initial={{ opacity:0, x: -20 }}`
- Agent 正在输入时显示「typing indicator」（3 个跳动的点）
- 生成的 Payment Plan 直接在聊天中渲染为 `BentoCard`

#### D. Quick Actions
- 底部横向排列 3-4 个快捷按钮
- 按钮用 `HolographicButton`
- Hover 时按钮上方出现微型预览提示

#### E. 页面背景
- 最强的氛围层：
  - `NoiseOverlay`（6% 透明度，比其他页面更强）
  - `GridBackground`（中心放射状 mask）
  - `ShootingStars`（低频率，从左上到右下）
  - `GradientOrb`（lime 400px + cyan 400px，双光球）

---

## 5. 组件详细设计

### 5.1 HolographicButton

```tsx
// 全息光晕按钮 — 用于所有主要 CTA
interface HolographicButtonProps {
  children: React.ReactNode;
  variant?: "lime" | "blue" | "coral" | "violet";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}
```

**视觉效果**:
- 背景：半透明 + 对应色渐变边框
- Hover：光晕扩散 `box-shadow: 0 0 30px {color}40`
- Active：内缩 + 光晕收缩
- 可选：Scanline 扫描线纹理叠加（仅 Agent 页使用）

### 5.2 FlowTimeline

```tsx
// 付款流程时间线 — 用于 Treasury 页和 Agent 页
interface FlowTimelineProps {
  currentStep: number; // 0-4
  steps: { label: string; icon: React.ReactNode }[];
}
```

**视觉效果**:
- 横向步骤条
- 已完成步骤：lime 实心圆 + 连线
- 当前步骤：cyan 脉动圆 + `Sparkles` 环绕
- 未到达步骤：灰色空心圆
- 步骤切换时连线用 `motion.div` width 动画绘制

### 5.3 RiskGateAnimation

```tsx
// Bob 被拦截的戏剧化动效
interface RiskGateProps {
  isBlocked: boolean;
  reason: string;
}
```

**视觉效果**:
- Blocked 时：红色盾牌图标从中心放大弹出
- 屏幕边缘 coral 闪光（1 次）
- 被拦截项用 `AnimatePresence` shake（左右 3 次，每次 5px）
- 原因文字用 `ColourfulText`（coral 色调）

### 5.4 AgentCharacter

```tsx
// 3D 动漫 Agent 角色
interface AgentCharacterProps {
  state: "idle" | "thinking" | "speaking" | "happy" | "warning";
  onLoad?: () => void;
}
```

**实现要点**:
- 使用 `lottie-react` 或 `@pixi/live2d-display` 或 `three.js`
- 状态切换时过渡动画（cross-fade 或 morph）
- 底部加名字标签「AgentCFO」+ 呼吸灯状态指示

---

## 6. 侧边栏折叠设计

### 6.1 交互规格

| 状态 | Width | 内容 | 动画 |
|---|---|---|---|
| Expanded | 260px | Logo + 5 nav items + labels + bottom controls | — |
| Collapsed | 72px | Logo icon only + 5 nav icons only + bottom icons | `spring: stiffness:380, damping:30` |

### 6.2 折叠触发

- **Click**: 顶部 Logo 旁边的「◀」按钮（hover 时才显示）
- **Hover edge**: 鼠标移到左侧边缘 4px 内时显示展开 handle
- **Keyboard**: `Cmd/Ctrl + B` 快捷键

### 6.3 动画细节

**展开 → 折叠**:
1. Nav labels 透明度先降至 0（0.15s）
2. Sidebar width 收缩至 72px（0.35s, spring）
3. Active indicator dot 缩小并移到图标中心
4. Logo 从文字版切换为图标版（cross-fade）

**折叠 → 展开**:
1. Sidebar width 展开至 260px（0.35s, spring）
2. Nav labels 透明度升至 1（0.2s delay 0.15s）
3. Active indicator dot 恢复左侧竖条
4. Logo 图标版切换为文字版

### 6.4 主面板自动伸缩

```tsx
// console/layout.tsx 核心逻辑
const [sidebarOpen, setSidebarOpen] = useState(true);

// Sidebar
<motion.aside
  animate={{ width: sidebarOpen ? 260 : 72 }}
  transition={{ type: "spring", stiffness: 380, damping: 30 }}
/>

// Main content
<motion.main
  className="flex-1"
  animate={{ marginLeft: sidebarOpen ? 260 : 72 }}
  transition={{ type: "spring", stiffness: 380, damping: 30 }}
/>
```

**关键**: `marginLeft` 必须与 sidebar width 同步动画，使用相同 spring 参数。

### 6.5 折叠态的 Nav Item

- 只显示 icon（20x20）
- Icon 下方可选显示首字母（如 T/W/A/P/🤖）
- Active 状态：icon 颜色 + 背景圆角矩形（而不是竖条）
- Hover tooltip：右侧浮现 label（`AnimatePresence`）

---

## 7. 动效实现矩阵

| 动效 | 库 | 复杂度 | 用于 |
|---|---|---|---|
| 卡片进入 stagger | Framer Motion | 低 | 所有页面 |
| 数字滚动 | Framer Motion `useSpring` | 低 | KPI, Stats |
| Hover glow | CSS transition | 低 | 所有卡片 |
| Sidebar 折叠 | Framer Motion `animate` | 中 | Layout |
| 粒子闪烁 | Framer Motion `animate` loop | 低 | Sparkles |
| 流星 | RAF + SVG | 中 | ShootingStars |
| 3D 角色 | Three.js / Live2D / Lottie | **高** | Agent 页 |
| 流程时间线 | Framer Motion `layout` | 中 | Treasury, Agent |
| Risk shake | Framer Motion `animate` | 低 | Treasury |
| 扫描 ripple | CSS @keyframes | 低 | Treasury scanning |
| 打字机效果 | Framer Motion `staggerChildren` | 中 | Agent chat |
| 图表动画 | Recharts + FM | 中 | Analytics |
| 背景网格 | CSS `mask-image` | 低 | 全局 |
| 光晕球 | CSS `blur` + FM | 低 | 全局 |
| 全息按钮 | CSS `box-shadow` + gradient | 中 | CTA buttons |

---

## 8. Taste-Skill 打磨清单

### 8.1 Spacing

- 卡片内边距统一 `p-5` 或 `p-6`
- 卡片间隙统一 `gap-3` 或 `gap-4`
- 区块间距统一 `space-y-6`
- 避免 1px 边框，统一用 `rgba(255,255,255,0.06)`

### 8.2 Typography

- 数据数字必须用 `tabular-nums`（等宽，防止抖动）
- 标签统一 `uppercase` + `tracking-wider` + `font-mono`
- 标题避免纯白色，用 `text-fg`（带变量控制）
- 中文混排时，英文/数字用 monospace，中文用 Inter

### 8.3 Color

- 所有强调色必须经过 `opacity` 降级用于背景（如 lime → `rgba(181,255,77,0.1)`）
- 避免使用纯黑 `#000000`， darkest 用 `#0D0D0D`
- 状态色统一：Success=emerald, Warning=amber, Error=coral, Info=blue

### 8.4 Motion

- 同一页面内的 stagger delay 不超过 0.15s
- Hover 动效必须在 0.3s 内完成
- 页面加载动画总时长不超过 1.5s
- 不使用 `animate-bounce`（太 toy）
- 所有 transform 使用 `translate3d` 或 `scale3d`（GPU 加速）

### 8.5 Consistency

- 所有卡片统一圆角 `rounded-xl` 或 `rounded-2xl`
- 所有按钮统一高度（sm=32px, md=40px, lg=48px）
- 所有图标统一大小（卡片内 16px, 按钮内 20px, 装饰 24px）
- 所有页面共享同一套背景层（通过 layout.tsx）

---

## 9. 实现顺序

### Phase 1: 基础设施（第 1 轮）
1. ✅ 分支创建（`feat/console-aceternity-upgrade`）
2. ✅ Aceternity 资产提取
3. 全局背景层注入（`console/layout.tsx`）
4. `NoiseOverlay` + `GridBackground` + `GradientOrb` 全局挂载
5. Sidebar 折叠改造（`CollapsibleSidebar`）
6. `HolographicButton` 组件
7. `AnimatedNumber` 组件集成

### Phase 2: Treasury 页升级（第 2 轮）
8. KPI Cards → `BentoCard` + `AnimatedNumber`
9. Records Table → stagger + hover 色条
10. Action Panel → 分步动效（扫描/审查/执行/完成）
11. `FlowTimeline` 组件
12. `RiskGateAnimation` 组件

### Phase 3: Wallets + Analytics（第 3 轮）
13. Wallets → `BentoCard` 改造 + Token 卡片升级
14. Wallets → `ShootingStars` + `Sparkles` 点缀
15. Analytics → 图表容器升级
16. Analytics → `AnimatedNumber` 集成

### Phase 4: Policy + Agent（第 4 轮）
17. Policy → 5 Rules `BentoGrid`
18. Policy → Slider + Save 动效
19. **Agent 页新建** — 页面骨架
20. **Agent 角色** — 3D 动漫人物接入
21. Agent Chat 界面
22. Quick Actions

### Phase 5: 打磨（第 5 轮）
23. 所有页面响应式检查
24. `pnpm typecheck` + `pnpm build`
25. 动效性能检查（Chrome DevTools Performance）
26. Taste-skill 清单逐项核对
27. 截图 + 文档更新

---

## 10. 技术注意事项

### 10.1 依赖检查

```json
// 确认已安装（package.json 中应该已有）
{
  "framer-motion": "^12.x",
  "lucide-react": "^1.17.x",
  "recharts": "^2.x"
}

// 可能需要新增
{
  "lottie-react": "^2.x",        // Agent 角色动画
  "@pixi/live2d-display": "^0.x" // 备选 Live2D
}
```

### 10.2 性能预算

- 首屏加载：背景层 + Sidebar + 当前页内容，控制在 100KB JS 以内
- 动画帧率：所有动效保持 60fps
- 3D 角色：如果使用 Three.js，必须 lazy load（`next/dynamic`）
- 粒子数量：单页面 `Sparkles` count ≤ 20，`ShootingStars` 单实例

### 10.3 暗色主题

- Console 只支持 dark mode（不需要 light mode）
- `dark:` 前缀仍然保留以防未来扩展
- 所有颜色使用 CSS 变量或 Tailwind 的 `dark:` 规则

### 10.4 i18n

- 所有新增文案走 `useApp()` context
- Agent 页对话默认中文，支持切换英文
- 3D 角色的「思考气泡」也要支持 i18n

---

## 11. 风险与规避

| 风险 | 影响 | 规避方案 |
|---|---|---|
| 3D 角色资源找不到/加载慢 | Agent 页无法展示 | 准备 3 套方案（Live2D → Three.js → Lottie/webm），按优先级 fallback |
| 动效过多导致卡顿 | 所有页面掉帧 | 用 `prefers-reduced-motion` 检测，必要时降级为纯 CSS 过渡 |
| Aceternity 组件与现有样式冲突 | UI 错乱 | 所有 Aceternity 组件封装在 `components/ui/aceternity/`，props 化，不直接改源码 |
| Sidebar 折叠导致布局错位 | 主内容溢出或留白 | 用 `motion.div` 统一控制 sidebar + main 的 width/margin，避免手动计算 |
| 新增依赖导致构建失败 | CI/CD 失败 | 每轮结束后必须 `pnpm build` 验证 |

---

## 12. 验收标准

### 12.1 功能验收

- [ ] Sidebar 折叠/展开流畅，主面板自动伸缩
- [ ] 5 个导航项（Treasury/Wallets/Analytics/Policy/Agent）都能正常访问
- [ ] Agent 页有 3D 角色展示（至少 idle 状态）
- [ ] Treasury 页 Generate Plan → Execute 完整流程可跑通
- [ ] 所有 KPI 数字有滚动动画
- [ ] Bob blocked 有 shake 动画

### 12.2 视觉验收

- [ ] 所有页面有统一的背景层（noise + grid + orb）
- [ ] 卡片有统一的 hover glow 效果
- [ ] 没有「光秃秃」的纯白/纯黑区域
- [ ] 动效不卡顿（滚动、hover、切换都流畅）
- [ ] 移动端 Sidebar 可正常工作（mobile nav）

### 12.3 代码验收

- [ ] `pnpm typecheck` 零错误
- [ ] `pnpm build` 成功
- [ ] 没有 console error/warning
- [ ] 新增文件有适当注释
- [ ] 没有硬编码的颜色值（都用 theme token）

---

## 附录 A: 文件清单（预期变更）

### 新增文件
```
frontend/
  components/
    ui/
      aceternity/           # 已提取，不动
      holographic-button.tsx
    console/
      agent-character.tsx   # 3D 角色
      flow-timeline.tsx     # 流程时间线
      risk-gate-anim.tsx    # 拦截动效
    app/
      console/
        agent/
          page.tsx          # 全新 Agent 页
  docs/
    plans/
      console-visual-upgrade-plan.md  # 本文件
```

### 修改文件
```
frontend/
  app/
    console/
      layout.tsx            # 全局背景 + Sidebar 折叠
      page.tsx              # Treasury 升级
      wallets/
        page.tsx            # Wallets 升级
      analytics/
        page.tsx            # Analytics 升级
      policy/
        page.tsx            # Policy 升级
  components/
    console/
      sidebar.tsx           # 折叠功能
```

---

*End of Plan*
