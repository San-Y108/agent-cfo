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

### 2.2 已提取组件限制与修复建议

| 组件 | 关键限制 | 修复建议 | 优先级 |
|------|---------|---------|--------|
| `ShootingStars` | `useEffect` 未清理递归 `setTimeout`，存在内存泄漏风险 | 返回清理函数 `clearTimeout(timeoutId)` | **高** |
| `GradientOrb` | 只支持 6 个预设颜色，不支持任意品牌色 | 添加 `customColorClass` prop 覆盖内部颜色 | 中 |
| `BentoCard` | hover glow 固定为 lime，不支持其他主题色 | 添加 `glowColor` prop 或 CSS 变量覆盖 | 中 |
| `Sparkles` | `color` 只接受 Tailwind className，不支持 hex 值 | 文档标注清楚，或扩展为同时支持 hex | 低 |
| `AnimatedNumber` | spring 参数固定，不支持自定义 | 添加 `springConfig` prop | 低 |
| `ColourfulText` | 每个字符拆分为独立 `motion.span`，长文本性能差 | 超过 50 字符时降级为 `GradientText` | 低 |

### 2.3 草稿池新发现（待提取）

> 来源：`components/ui/aceternity/_drafts/` 深度扫描

| 组件 | 来源文件 | 核心效果 | 适用页面 | 优先级 |
|------|---------|---------|---------|--------|
| `BeamCollision` | `hero-1.tsx` | 4 条光束射入容器碰撞产生粒子爆炸 | Treasury 执行区 / Agent 思考态 | **P0** |
| `SvgGradientLines` | `hero-7.tsx` | 5 子组件完整边框光效系统：渐变线条 + 径向光晕 + 角落折线 | 任意卡片边框 / Header 背景 | **P0** |
| `ScrollScatter` | `hero-4.tsx` | 滚动时 6 张卡片向左右飞散，电影感叙事 | Landing 信任背书（如需要）| P1 |
| `StickyScroll` | `4.tsx` | 滚动吸附 + 背景色渐变切换 + 双栏视差 | Workflow 步骤展示 | P1 |
| `AvatarStack` | `hero-2.tsx` | 头像堆叠 hover tooltip + 无限滚动 logo 云 | Team / 贡献者展示 | P1 |
| `MobileMockup` | `hero-6.tsx` | 纯 SVG iPhone 骨架屏，`currentColor` 暗色自动适配 | Treasury 扫描态 / Agent 预览 | P1 |
| `SkewedRectangles` | `6.tsx` | `[perspective:1000px]` + `rotateX(±45deg)` 3D 科幻地面 | Agent 3D 角色底座 | P1 |
| `PathDrawIcon` | `hero-2.tsx` | `motion.path` `pathLength` 0→1 SVG 图标自绘动画 | 任意图标动画 | P1 |
| `RoughNotation` | `hero-6.tsx` | 手绘风格文字高亮/圈注（需 `react-rough-notation`）| 产品功能展示 | P2 |
| `LogoCloudMarquee` | `hero-2.tsx` | `react-fast-marquee` 无限滚动 Logo 云（需额外依赖）| Landing 社交证明 | P2 |
| `SkewedLines` | `7.tsx` | SVG pattern 斜向线条背景，`[mask-image]` 淡出 | 备用背景纹理 | P2 |

### 2.4 自定义组件（本次需新建）

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

**品牌色体系**：

| Token | 值 | 用途 |
|---|---|---|
| `--bg-base` | `#0D0D0D` | 全局底色 |
| `--bg-surface` | `rgba(255,255,255,0.02)` | 卡片底色 |
| `--border-subtle` | `rgba(255,255,255,0.06)` | 卡片边框 |
| `--border-hover` | `rgba(255,255,255,0.12)` | hover 边框 |
| `--fg-primary` | `#FFFFFF` | 主文字 |
| `--fg-subtle` | `rgba(255,255,255,0.6)` | 次要文字 |
| `--accent-lime` | `#B5FF4D` | **AgentCFO 品牌色** — 所有 CTA、核心数据高亮、hover glow |
| `--accent-cyan` | `#5EEAD4` | 信息/执行态（扫描、Agent 思考、加载） |
| `--accent-coral` | `#FB7185` | 风险/拦截态（Bob blocked、安全警告） |
| `--accent-violet` | `#C084FC` | 分析/图表态（Analytics 数据可视化） |
| `--accent-blue` | `#60A5FA` | 钱包/资产态（Wallets 转账、签名） |
| `--accent-gold` | `#FFD700` | 导师/特殊标识 |

**页面氛围色分配**（`GradientOrb` 光晕按页面区分，增强导航辨识度）：

| 页面 | 氛围主色 | 说明 |
|---|---|---|
| Treasury | **lime** `#B5FF4D` | 付款执行中心，品牌色主导 |
| Wallets | **blue** `#60A5FA` | 资产管理，蓝色科技感 |
| Analytics | **violet** `#C084FC` | 数据分析，紫色洞察感 |
| Policy | **coral** `#FB7185` | 风控策略，暖色警戒感 |
| Agent | **cyan** `#5EEAD4` | AI 交互，青色智能感 |

**配色原则**：
- 品牌色 lime 无处不在（按钮、重点数据、hover glow），保持品牌一致性
- 每个页面的 `GradientOrb` 氛围光晕不同，让用户一眼识别当前模块
- 辅助色仅在状态指示、图表、特定功能区域使用，不抢夺品牌色焦点

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

### 3.4 字体层级（升级：Inter → Geist）

> **迁移说明**：根据 Taste-Skill 规范，Inter 是 LLM 默认字体（AI Tell），需替换为 Geist。Geist 的 tighter tracking 更适合数据界面，且与 Geist Mono 原生配对。

```tsx
// app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
```

| 层级 | Size | Weight | 字体 | 备注 |
|---|---|---|---|---|
| 页面标题 | 24px | 600 | **Geist** | 替代 Inter |
| 区块标题 | 16px | 600 | **Geist** | 替代 Inter |
| 正文 | 13-14px | 400 | **Geist** | 替代 Inter |
| 数据/数字 | 20-32px | 700 | **Geist Mono** | 替代 'Courier New'，tabular-nums 防抖动 |
| 标签 | 11px | 500 | **Geist Mono**, uppercase | 替代 monospace |

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

#### E. 技术映射（Aceternity × GSAP × Taste-Skill）

| 区域 | Aceternity 资产 | GSAP 技术 | Taste-Skill 约束 |
|------|----------------|-----------|-----------------|
| Header | `GradientText` (lime→cyan) | `SplitText` 逐字砸入 | 无 eyebrow，标题即导航 |
| KPI Cards | `BentoCard` + `AnimatedNumber` | `staggerReveal` 滑入 + `ScrambleText` 数字解码 | 卡片圆角统一 12px |
| Records Table | `BentoCard` 包裹行 | `DrawSVG` 状态指示线绘制 | 行 stagger delay ≤ 0.15s |
| Action Panel Step 1 | `MobileMockup` SVG 手机骨架屏 + `GridBackground` 局部高亮 | `ScrambleText` 扫描状态解码 | 扫描动画叠加在手机屏幕上增强真实感 |
| Action Panel Step 3 | `HolographicButton` + `Sparkles` + `ShootingStars` | `Flip` 面板状态切换 + `ScrambleText` 解码 | 状态变化用动效叙事，非静态跳切 |
| Risk Gate | 现有 Framer Motion shake | `ScrambleText` 拦截原因解码 | 风险态 coral glow 是语义反馈，非装饰 |
| 卡片边框装饰 | `SvgGradientLines` 的 `SideLines` 子组件 | `DrawSVG` 角落线条绘制 | 可缩放至任意卡片尺寸 |

**创新概念**："Flow State Command Center" — 全屏沉浸式流程，每一步像电影转场。Blocked 时触发 chromatic aberration（色差故障）+ 屏幕震动。

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

#### G. 技术映射（Aceternity × GSAP × Taste-Skill）

| 区域 | Aceternity 资产 | GSAP 技术 | Taste-Skill 约束 |
|------|----------------|-----------|-----------------|
| Header | `GradientText` (blue→cyan) + `GradientOrb`(blue) | — | 无 eyebrow |
| Wallet List | `BentoCard` + `AnimatedNumber` | `Flip` 过滤重排 + `ScrambleText` 余额更新 | 卡片 hover glow 0.3s 内完成 |
| WalletTopology | `Sparkles` 节点 hover | `MotionPath` 数据包曲线路径 + `DrawSVG` 连线绘制 | 性能优先，粒子数 ≤ 20 |
| WalletHoloCard | `BentoCard` mini + `AnimatedNumber` | `3D rotateY` 增强透视 + `transformOrigin` 深度 | 触摸设备禁用 3D tilt |
| Transfer Panel | `HolographicButton` (blue) | `MotionPath` 资金流动粒子 + `DrawSVG` 路径绘制 | 状态变化用动效叙事 |
| Signers Matrix | `BentoCard` + `Sparkles` | — | 图标统一用 Phosphor |

**创新概念**："Holographic Vault System" — 全息投影系统 + CRT 扫描线效果 + 生物识别授权动画（指纹波纹）。

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

#### E. 技术映射（Aceternity × GSAP × Taste-Skill）

| 区域 | Aceternity 资产 | GSAP 技术 | Taste-Skill 约束 |
|------|----------------|-----------|-----------------|
| KPI Banner | `BentoCard` + `AnimatedNumber` | `ScrambleText` 数字更新 | 数据数字必须用 `tabular-nums` |
| Area Chart | `BentoCard` 包裹 | `ScrollTrigger` + `DrawSVG` 图表绘制展开 | 图表需稳定可读，motion 克制 |
| Pie Chart | `BentoCard` + `AnimatedNumber` | `Flip` 图例卡片重排 | hover 外扩 + 发光 |
| Comparison Matrix | `BentoCard` + `Sparkles` | `Flip` 卡片重排 + `staggerReveal` | 水平 scroll-snap "数据切片" |

**创新概念**："Living Data Organism" — 图表像呼吸的有机体，Area chart 填充像液体波动，KPI 数字用 slot-machine 滚动效果（机场航班牌）。

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

#### E. 技术映射（Aceternity × GSAP × Taste-Skill）

| 区域 | Aceternity 资产 | GSAP 技术 | Taste-Skill 约束 |
|------|----------------|-----------|-----------------|
| 5 Rules | `BentoGrid` + `AnimatedNumber` | `ScrambleText` 数字解码 + `SplitText` 标题砸入 + `DrawSVG` 边框绘制 | **打破规范**：编号 `01-05` → `0x1A` 十六进制节点 ID |
| Whitelist Table | `BentoCard` 行包裹 | `Flip` 列表增删动画 + `SplitText` 标签淡入 | 行 stagger delay ≤ 0.15s |
| Threshold Sliders | `AnimatedNumber` | `Observer` 统一手势 + `ScrambleText` 值更新 + `gsap.utils.mapRange` 颜色映射 | Slider 轨道 gradient（深色→lime→深色）|
| Security Gateway | `BentoCard` + `Sparkles` | `3D rotateX` 卡片翻转立起 | 图标迁移至 Phosphor |

**创新概念**："Neural Guardrails Interface" — 5 条规则变为神经网络可视化节点，相互之间有脉冲连接。Slider 调整时神经元亮度实时变化。白名单地址像 DNA 基因片段排列。

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
  - **方案 1（确认）: 使用 Three.js 加载低多边形 3D 角色（`.glb` 格式）**
    - 通过 `next/dynamic` lazy load，避免首屏阻塞
    - 角色模型需自行制作或采购（推荐风格：低多边形科幻风 / 赛博朋克风）
    - 灯光设置：key light (lime) + rim light (cyan) + ambient (dark)
  - 方案 2（备用）: Live2D / Vtuber 风格（`pixi-live2d-display`）
  - 方案 3（最简）: 高质量循环动画 `.webm` / `.lottie`
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

#### F. 技术映射（Aceternity × GSAP × Taste-Skill）

| 区域 | Aceternity 资产 | GSAP 技术 | Taste-Skill 约束 |
|------|----------------|-----------|-----------------|
| 3D Agent 角色 | `GradientOrb` (lime+cyan) + `GridBackground` + `SkewedRectangles` 全息地面 | `3D rotateY` 状态切换翻转 + `MorphSVG` 图标变形 | **打破规范**：AI 头像表情是角色设计，不是随意 emoji |
| 角色背景光晕 | `SvgGradientLines` 的 `TopGradient` + `BottomGradient` | — | 蓝色径向光晕替代简单 `GradientOrb` |
| Chat 界面 | `BentoCard` 消息气泡 | `SplitText` 逐词淡入 + `ScrambleText` 用户消息解码 | 消息气泡 stagger delay 0.02s |
| Quick Actions | `HolographicButton` + `PathDrawIcon` 图标自绘 | `Flip` 按钮飞向输入区 + `3D rotateX` hover 倾斜 | 按钮统一高度 40px (md) |
| 页面背景 | `NoiseOverlay`(6%) + `ShootingStars` + `GradientOrb`(双光球) | `gsap.utils.random` 粒子随机化 | 粒子数单页面 ≤ 20 |

**创新概念**："Sentient CFO Persona" — 3D 全息头像有表情状态（思考时粒子聚集，回答时扩散）。对话气泡采用打字机 + 语义高亮（金额自动标绿，风险词自动标红）。Quick Actions 变为思维泡泡，像漫画一样从 AI 头像旁飘出。

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

### Phase 0: Taste-Skill 基础对齐（前置，1-2 天）

**目标**：消除 AI Tells，建立统一视觉基线。

| # | 任务 | 文件 | 验收标准 |
|---|------|------|---------|
| 0.1 | **字体迁移**：Inter → Geist + Geist Mono | `app/layout.tsx`, `globals.css` | 所有文字渲染为 Geist，无 Inter fallback |
| 0.2 | **图标迁移启动**：安装 @phosphor-icons/react，Sidebar 5 个图标替换 | `package.json`, `components/console/sidebar.tsx` | Sidebar 使用 Phosphor 图标，样式一致 |
| 0.3 | **圆角统一**：卡片 12px (`rounded-xl`) / 输入框 8px (`rounded-lg`) / 按钮 pill (`rounded-full`) | `globals.css @theme` | 无 `rounded-[14px]` 等硬编码 |
| 0.4 | **h-screen → min-h-[100dvh]** | `console/layout.tsx` | 移动端无白边 |
| 0.5 | **移除 sidebar v0.1 版本标签** | `components/console/sidebar.tsx` | 无版本号显示 |
| 0.6 | **削减 eyebrow**：每个页面只保留 0-1 个真正 eyebrow | 各 page.tsx | 页面标题不算 eyebrow |
| 0.7 | **Policy 编号改造**：`01-05` → `0x1A` 十六进制节点 ID | `app/console/policy/page.tsx` | 六进制哈希风格 |
| 0.8 | **GSAP 插件注册**：Flip, SplitText, ScrambleText, DrawSVG, MotionPath | `lib/gsap.ts` | `gsap.registerPlugin(...)` |

### Phase 1: 基础设施 + 全局系统（第 1 轮，2-3 天）

| # | 任务 | 文件 | 验收标准 |
|---|------|------|---------|
| 1.1 | 全局背景层注入（`console/layout.tsx`） | `app/console/layout.tsx` | 5 层 Z-Index 架构就位 |
| 1.2 | `NoiseOverlay` + `GridBackground` + `GradientOrb` 全局挂载 | 同上 | 所有 Console 页面共享背景 |
| 1.3 | **页面氛围色系统**：Treasury=lime, Wallets=blue, Analytics=violet, Policy=coral, Agent=cyan | 各 page.tsx | `GradientOrb` 颜色按页面变化 |
| 1.4 | Sidebar 折叠改造（`CollapsibleSidebar`） | `components/console/sidebar.tsx` | 260px↔72px spring 动画，主面板自动伸缩 |
| 1.5 | `HolographicButton` 组件完善（lime/blue/coral/violet 四主题） | `components/ui/holographic-button.tsx` | 4 种 variant 可用 |
| 1.6 | `AnimatedNumber` 组件集成 | `components/ui/aceternity/animated-number.tsx` | 数字从 0 滚动到目标值，1.2s |
| 1.7 | **GSAP 文字特效组件**：`SlamText` + `ScrambleValue` | `components/ui/gsap-text-effects.tsx` | SplitText 逐字砸入 + ScrambleText 解码 |

### Phase 2: Treasury 页升级 — "Flow State Command Center"（第 2 轮，3-4 天）

| # | 任务 | 文件 | 验收标准 |
|---|------|------|---------|
| 2.1 | Header：`GradientText` (lime→cyan) + `SplitText` 逐字砸入 + `Sparkles` | `app/console/page.tsx` | 标题有 neon glow |
| 2.2 | **KPI Cards**：`BentoCard` + `AnimatedNumber` + `staggerReveal` 滑入 | 同上 | 4 张卡片 stagger 进入，数字滚动 |
| 2.3 | **Records Table**：`BentoCard` 行包裹 + `DrawSVG` 状态指示线 + stagger | 同上 | 行 hover 左侧色条，新增行滑入 |
| 2.4 | **Action Panel Step 0**：`HolographicButton` + `Sparkles` | 同上 | "Generate Plan" 按钮有 scanline |
| 2.5 | **Action Panel Step 1**：`ColourfulText` + `GridBackground` 局部高亮 + `GradientOrb`(cyan) | 同上 | 扫描状态文字变色 |
| 2.6 | **Action Panel Step 2**：`BentoGrid` + `Flip` 面板切换 + Bob shake | 同上 | 面板状态平滑切换 |
| 2.7 | **Action Panel Step 3**：全屏 overlay + `ShootingStars` + 旋转环 + shimmer 进度条 | 同上 | 加密核心动画 |
| 2.8 | **Action Panel Step 4**：`StatsSection` Tab 切换 + `GradientText` txHash | 同上 | 三面板 Tab 切换 |
| 2.9 | **Risk Gate**：Framer Motion shake + `ScrambleText` 拦截原因解码 | 同上 | 从乱码解码为 "Address not whitelisted" |
| 2.10 | **创新特效**：Chromatic aberration（色差故障）风险态 | `lib/effects/chromatic-aberration.ts` | Blocked 时屏幕边缘 RGB 分离 |

### Phase 3: Wallets + Analytics（第 3 轮，3-4 天）

**Wallets — "Holographic Vault System"**

| # | 任务 | 文件 | 验收标准 |
|---|------|------|---------|
| 3.1 | Header：`GradientText` (blue→cyan) + `GradientOrb`(blue) | `app/console/wallets/page.tsx` | 蓝色光晕主题 |
| 3.2 | **Wallet List**：`BentoCard` + `Flip` 过滤重排 + `ScrambleText` 余额更新 | 同上 | 过滤时卡片平滑飞入新位置 |
| 3.3 | **WalletTopology**：`Sparkles` 节点 hover + `MotionPath` 曲线路径 + `DrawSVG` 连线 | 同上 | 数据包沿贝塞尔曲线运动 |
| 3.4 | **WalletHoloCard**：`BentoCard` mini + `3D rotateY` 增强透视 | 同上 | 更强烈的浮出屏幕效果 |
| 3.5 | **Transfer Panel**：`HolographicButton`(blue) + `MotionPath` 资金流动 + `DrawSVG` | 同上 | 转账粒子沿路径飞行 |
| 3.6 | **Signers Matrix**：`BentoCard` + `Sparkles` + Phosphor 图标 | 同上 | HSM badge 粒子点缀 |
| 3.7 | **创新特效**：CRT scanline 全息材质 + 生物识别授权动画 | `lib/effects/crt-scanline.ts` | 扫描线 + 指纹波纹 |

**Analytics — "Living Data Organism"**

| # | 任务 | 文件 | 验收标准 |
|---|------|------|---------|
| 3.8 | KPI Banner：`BentoCard` + `AnimatedNumber` + `ScrambleText` | `app/console/analytics/page.tsx` | 数字 slot-machine 滚动 |
| 3.9 | Area Chart：`BentoCard` 包裹 + `ScrollTrigger` + `DrawSVG` 绘制展开 | 同上 | 图表从上往下绘制 |
| 3.10 | Pie Chart：`BentoCard` + `AnimatedNumber` 中心 + `Flip` 图例重排 | 同上 | hover 外扩 + 发光 |
| 3.11 | Comparison Matrix：`BentoCard` + `Sparkles` + `Flip` 重排 + 水平 scroll-snap | 同上 | "数据切片"式滑动 |
| 3.12 | **创新特效**：液体波动图表（CSS `animation: liquid-wave`） | `lib/effects/liquid-wave.css` | Area chart 填充像液体波动 |

### Phase 4: Policy + Agent（第 4 轮，4-5 天）

**Policy — "Neural Guardrails Interface"**

| # | 任务 | 文件 | 验收标准 |
|---|------|------|---------|
| 4.1 | **5 Rules**：`BentoGrid` + `ScrambleText` 数字解码 + `SplitText` 标题砸入 + `DrawSVG` 边框 | `app/console/policy/page.tsx` | 编号 `0x1A` 风格 |
| 4.2 | **Threshold Sliders**：`Observer` 手势 + `ScrambleText` 值更新 + `mapRange` 颜色映射 | 同上 | Slider 释放时弹性回弹 |
| 4.3 | **Whitelist Table**：`Flip` 增删动画 + `SplitText` 标签淡入 | 同上 | 新增行平滑展开 |
| 4.4 | **Security Gateway**：`BentoCard` + `Sparkles` + `3D rotateX` 翻转立起 | 同上 | 卡片从水平翻转立起 |
| 4.5 | **创新特效**：神经网络可视化（Canvas 2D 力导向图） | `components/console/neural-network.tsx` | 5 个规则节点 + 脉冲连接 |

**Agent — "Sentient CFO Persona"（灵魂页面）**

| # | 任务 | 文件 | 验收标准 |
|---|------|------|---------|
| 4.6 | **页面骨架**：左侧 40% 3D 角色 + 右侧 Chat + 底部 Quick Actions | `app/console/agent/page.tsx` | 布局就位 |
| 4.7 | **3D Agent 角色**：Three.js `.glb` 低多边形 + `next/dynamic` lazy load | `components/console/agent-character.tsx` | 有 idle/thinking/speaking/happy/warning 状态 |
| 4.8 | **角色灯光**：key light (lime) + rim light (cyan) + ambient (dark) | 同上 | 灯光层次清晰 |
| 4.9 | **Chat 界面**：`BentoCard` 气泡 + `SplitText` 逐词淡入 + `ScrambleText` 解码 | `components/console/agent-chat.tsx` | 模拟 AI 打字效果 |
| 4.10 | **语义高亮**：金额自动标绿，风险词自动标红 | `lib/semantic-highlight.ts` | 正则解析高亮 |
| 4.11 | **Quick Actions**：`HolographicButton` + `Flip` 飞向输入区 + `3D rotateX` hover | 同上 | 思维泡泡式飘出 |
| 4.12 | **页面背景**：`NoiseOverlay`(6%) + `GridBackground`(中心放射) + `ShootingStars` + 双光球 | `app/console/agent/page.tsx` | 最强氛围层 |
| 4.13 | **创新特效**：语音波形可视化（Web Audio API） | `components/console/voice-waveform.tsx` | 说话时波形实时响应 |

### Phase 5: 打磨 + 验收（第 5 轮，2-3 天）

| # | 任务 | 验收标准 |
|---|------|---------|
| 5.1 | 所有页面响应式检查（Mobile/Tablet/Desktop） | 无布局错位 |
| 5.2 | `pnpm typecheck` 零错误 | 零 TS 错误 |
| 5.3 | `pnpm build` 成功 | 构建通过 |
| 5.4 | 动效性能检查：Chrome DevTools Performance，目标 60fps | 无掉帧 |
| 5.5 | `prefers-reduced-motion` 降级测试 | 所有动效可降级 |
| 5.6 | Lighthouse 性能审计，目标 LCP < 2.5s | 达标 |
| 5.7 | Taste-Skill 清单逐项核对（见 §8） | 所有项通过 |
| 5.8 | 截图文档更新：5 个页面截图 + 动效 GIF | 产出交付物 |

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

// Aceternity 草稿池提取可能新增
{
  "react-rough-notation": "^1.x", // P2: RoughNotation 手绘效果（hero-6.tsx）
  "react-fast-marquee": "^1.x",   // P2: LogoCloudMarquee 无限滚动（hero-2.tsx）
  "react-wrap-balancer": "^1.x"   // P2: 标题换行优化（hero-1.tsx，可能已有）
}

// Agent 角色动画（备选方案）
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
| Aceternity 草稿池图标库冲突 | 引入 `@tabler/icons-react` / `react-icons` 与项目 Phosphor 迁移冲突 | 提取组件时同步替换为 Phosphor 等价物，不引入新图标库 |
| `ShootingStars` 内存泄漏 | 组件卸载后定时器继续运行 | 修复 `useEffect` 清理函数，见 §2.2 |
| `ColourfulText` 长文本性能 | 超过 50 字符时大量 DOM 节点导致卡顿 | 长文本降级为 `GradientText`，仅短标题使用 `ColourfulText` |

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
