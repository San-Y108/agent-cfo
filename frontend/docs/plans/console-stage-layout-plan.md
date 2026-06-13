# Console 四模块页 — Stage 布局与视觉统一计划（Phase 7.3 → 7.5）

> **创建日期**: 2026-06-13  
> **修订日期**: 2026-06-13（吸收 `console-design-report-2026-06-13.md`）  
> **关联 Checklist**: `docs/plans/console-stage-layout-checklist.md`  
> **设计思想源**: `docs/reports/console-design-report-2026-06-13.md`  
> **动效参考**: `docs/reports/gsap-animation-research-2026-06-11.md` · `lib/gsap.ts` · Taste Skill（Console 改写版）  
> **风格标杆**: `components/console/agent-hub.tsx`（Agent 页，非四模块复制对象）  
> **边界**: 只改 `frontend/`；不碰 Landing、后端契约；不新增 npm 依赖

---

## 0. 计划重定向说明（必读）

Phase 7.3 原目标偏 **「压缩竖排、三栏 Stage、单层滚动」** — 方向正确，但 **不足以解决当前最大风险**：

> 同一产品、五种方言 — 布局壳已统一，**仪表语言（Typography / Panel / Glow / Button / Motion）仍未对齐 Agent 标杆**。

本计划 **保留** Phase 7.3 已完成的 Stage Shell 成果，并将 **后续执行重心** 调整为：

```text
Phase 7.3  空间秩序（ModuleStageLayout）     ← 已完成主体
Phase 7.4  Command Deck 视觉统一（P0）       ← 当前主战场
Phase 7.5  状态驱动动效（P1，受控 GSAP）   ← 锦上添花，严守语义
Phase 7.6  代码收敛 + 路演验收（P1/P2）     ← 收尾
```

**一句话目标**：四模块页与 Agent Hub 共享 **同一套 HUD 仪表语言**；**模块色保留区分度**；**lime 留给品牌叙事**；动效 **跟着状态走**，不做 Landing 式滚动叙事。

---

## 1. Design Read（Taste Skill 改写）

> **Reading this as**: Web3 B2B fintech **command center** for DAO treasury operators, with a **dark HUD / cockpit** language, leaning toward **Ramp Lime** brand + **Command Deck** primitives — **not** a Landing hero page, **not** a generic shadcn dashboard.

### 1.1 三旋钮（Console 取向，非 Taste Skill 默认）

| 旋钮 | Taste 默认 | **Console 四模块** | 说明 |
|------|-----------|-------------------|------|
| **DESIGN_VARIANCE** | 8 | **6–7** | 可预测舰桥栅格；侧栏宽度固定；主角模块每页一个 |
| **MOTION_INTENSITY** | 6 | **5–6** | 状态点动（BUSY / scan / pulse）；禁止全屏电影转场 |
| **VISUAL_DENSITY** | 4 | **7–8** | 金融 HUD：预算、笔数、blocked 需同屏可扫 — **不可再降密度** |

### 1.2 从 Taste Skill 采纳

- **Anti-Default**：拒绝 AI 紫渐变模板、无意义玻璃堆叠  
- **Redesign — preserve**：Landing 的 pill nav、logo 发光、lime-cyan 底线 → Console Navbar 镜像  
- **Page Theme Lock**：Console 强制 `dark`，不跟系统浅色  
- **Shape Consistency**：`rounded-card` / `rounded-control` / `rounded-field`  
- **Eyebrow 节制**：去掉装饰性眉标；`HudLabel` 的 `MODULE::` 是 **数据协议**，不是 eyebrow  
- **Contrast-first**：暗底上标签 `text-white/70–80`，数值 `text-base tabular-nums` + 语义色  

### 1.3 Console 豁免（有意识突破 Taste 红线）

| Taste 红线 | Console 处理 |
|-----------|-------------|
| Max 1 accent | **五页五色** = 信息架构（Navbar `NAV_TABS` 是总开关） |
| 低密度 | 模块页 **7–8 密度**；仅 Agent 聊天气泡区可略疏 |
| NO neon glow | **受控** `--glow-*`，仅 FrostedPanel 外缘 + 状态 |
| GSAP 滚动叙事 | **禁止**用于四模块工作台；保留给 Landing / 特殊段落 |

### 1.4 明确不做

- 四页都做成 Agent 双栏聊天  
- 五页重复 mascot / 3D 角色  
- 第六、第七种强调色  
- 用 ScrollTrigger pin 驱动模块页主布局  
- 为「好看」常驻 scanline / 粒子  

---

## 2. 产品命题 → 四页分工

```text
Records → Plan → Risk → Approval → CAW → Audit
```

| 页面 | 模块色 | Hex | 叙事角色 | Stage 主角（唯一视觉重心） |
|------|--------|-----|----------|---------------------------|
| Agent | lime | `#B5FF4D` | 叙事入口、Demo 快捷指令 | ChatPanel（标杆，本计划不改结构） |
| Treasury | cyan | `#5EEAD4` | 付款执行主战场 | Payment Pipeline + ActionPanel |
| Wallets | blue | `#60A5FA` | 金库与划拨 | WalletTopology |
| Analytics | violet | `#C084FC` | 事后追溯、KPI | Area Chart Hero |
| Policy | coral | `#FB7185` | 规则护栏、Bob 故事 | NeuralGuardrailsGraph |

**跨 Tab 只读联动**（已实现，验收时保留）：

- Bob blocked → Policy whitelist 高亮 + DetailDeck  
- `step === Done` → Analytics KPI / Wallets SETTLED  
- Analytics 空态 → CTA 链 Treasury  

---

## 3. 现状诊断（Phase 7.3 完成后）

### 3.1 已对齐 ✅

- `ModuleStageLayout`：Header → 三栏 Grid → DetailDeck  
- 四页去掉 GradientText / Sparkles 大页头  
- Treasury 三栏：Records | Pipeline | Metrics  
- Policy Graph 主角化；Wallets/Analytics DetailDeck Tab  
- `100dvh` 视口 + `--console-stage-h` 高度链  

### 3.2 仍偏离 Agent 标杆 ❌（Phase 7.4 必改）

| 维度 | Agent 标杆 | 四模块现状 | 严重度 |
|------|-----------|-----------|--------|
| **模块主色** | Persona violet / Chat lime **分工明确** | Treasury stage 误用 **lime glow** | P0 |
| **面板标题** | `text-[14px] font-bold` + `border-b border-white/[0.1] px-5 py-4` | `text-sm`、header `py-2` 偏薄 | P0 |
| **Telemetry 格** | `rounded-xl border-white/[0.1] bg-white/[0.04]`，标签 `text-white/75` | 混用 `rounded-lg`、`text-fg-subtle` | P0 |
| **容器宽度** | Agent `max-w-none`，舰桥感 | 模块 `max-w-7xl` 居中，像嵌入页 | P0 |
| **按钮方言** | 品牌 lime 实心 **仅** Agent/Navbar Home | 模块内混用原生 button / 手写 border | P1 |
| **HudLabel 重复** | Stage 内节制 | Header 已有 `MODULE::` + Stage 内再 `PIPELINE::` | P1 |
| **FrostedPanel** | sheen + 模块色 glow + 状态 scanline | scanline 静态常驻、Policy 叠 GradientOrb | P1 |
| **圆角 token** | `rounded-card` 统一 | 散落 `rounded-lg` / `rounded-field` | P1 |
| **代码组织** | agent-hub 单文件清晰 | page.tsx 300–770 行未抽 `stages/` | P2 |

---

## 4. 统一设计语言（执行规格）

> 代码真相源：`globals.css` · `command-deck/*` · `navbar.tsx` · `agent-hub.tsx` · `module-stage-layout.tsx`

### 4.1 空间秩序（继承 Phase 7.3，微调）

```text
┌─ ConsoleNavbar (fixed) ─────────────────────────────────────┐
├─ ModuleStageHeader (~52–56px, border-b white/10) ───────────┤
├─ leftRail 260–288px ─┬─ stage flex-1 ─┬─ rightRail 220–260px ┤
│  上下文 / 列表        │  唯一主角       │  Telemetry / 摘要    │
├──────────────────────┴─────────────────┴────────────────────┤
└─ DetailDeck (collapsed default, max 40vh, mono toggle) ─────┘
```

- 外层容器：**`max-w-none px-4 md:px-5 lg:px-6`**（对齐 Agent，取消 `max-w-7xl` 居中）  
- Stage 高度：继续 `--console-stage-h`；所有嵌套面板 **`min-h-0` 高度链**  
- Mobile：left/right → accordion（已有）；rightRail 可隐藏进 DetailDeck  

### 4.2 排版阶（全模块强制）

| 层级 | 类名规格 | 用途 |
|------|---------|------|
| 模块 Header 标题 | `text-[14px] font-bold text-fg` | 与 ChatPanel header 同级 |
| 面板小节标题 | `text-[14px] font-bold` 或 `text-sm font-semibold` | Stage 内单一标题 |
| 正文 / 表单 | `text-[14px] leading-relaxed` | 说明、表格正文 |
| HUD 标签 | `text-[10px]–[11px] uppercase tracking-wider text-white/75` | Telemetry、Deck toggle |
| HUD 数值 | `text-base font-bold tabular-nums` + 模块/语义色 | 预算、计数 |
| 弱化说明 | `text-[12px] text-white/55` | Demo hint |
| **禁止** | 单独 `text-fg-subtle` 作 HUD 标签 | 改用 `text-white/75` |

### 4.3 FrostedPanel 方言

| 区域 | glowColor | sheen | scanline | 说明 |
|------|-----------|-------|----------|------|
| leftRail / rightRail | **moduleColor** | ✓ | ✗ | 配角面板 |
| stage | **moduleColor** | ✓ | **仅进行中** | Treasury Executing、Wallets Transferring |
| DetailDeck | moduleColor 或 neutral | ✓ | ✗ | 次要信息 |

- 边框：`border-white/[0.06]`；Telemetry 内格：`border-white/[0.1] bg-white/[0.04]`  
- **Treasury**：stage glow 从 lime 改为 **cyan**；lime 仅用于「通过 / 成功」StatusPulse  

### 4.4 按钮双轨（不可合并）

| 方言 | 组件 | 场景 |
|------|------|------|
| **品牌实心 CTA** | lime pill `#B5FF4D` / `#0D0D0D` 字 | **仅** Agent「生成计划」、Navbar Home |
| **模块操作** | `HolographicButton` + `moduleColor` | Generate Plan（Treasury 内）、Save Rules、Broadcast |
| **次要 / Ghost** | `border-white/[0.14] bg-white/[0.06]` | View Audit、Activity log 类 |

模块页 **不得** 把主操作改成 lime 实心（会抢 Agent 叙事入口）。

### 4.5 新增共享 primitive（Phase 7.4 优先抽取）

| 组件 | 路径 | 职责 |
|------|------|------|
| `ConsoleTelemetryCell` | `components/console/command-deck/telemetry-cell.tsx` | Agent PersonaRail 2×2 格语法复用 |
| `ConsoleTelemetryGrid` | 同上 | `grid grid-cols-2 gap-2.5` 容器 |
| `ConsolePanelHeader` | `components/console/command-deck/panel-header.tsx` | `border-b border-white/[0.1] px-4 py-3 md:px-5 md:py-4` + title + optional action |
| `ConsoleGhostButton` | 可选，或 inline 统一 class | 次要按钮方言 |

### 4.6 Aceternity 资产：适度调用（与 Command Deck 合流）

> 资产目录：`components/ui/aceternity/` · 历史映射：`docs/plans/console-visual-upgrade-plan.md` · 排查：`docs/reports/aceternity-deep-audit-2026-06-11-supplement.md`  
> **原则**：Aceternity 是 **表现层增强**，不能替代 Command Deck 方言；与设计报告 §2.4 一致 — **不为好看堆装饰**。

#### 三层技术栈（执行时按此优先级）

```text
Command Deck 方言（FrostedPanel / HudLabel / Telemetry）  ← 结构 & 可读性（P0）
  + 项目 UI 按钮（HolographicButton / DirectionAwareButton） ← 操作层级（P0）
    + Aceternity 点缀（AnimatedNumber / Sparkles / 边框光）   ← 状态 & 按钮反馈（P1）
      + GSAP 状态叙事（Flip / Scramble / DrawSVG）            ← 仅变化点（P1，§7.5）
```

#### 已提取、四模块 **应保留/加强** 的 Aceternity

| 组件 | 场景 | 模块 |
|------|------|------|
| `AnimatedNumber` | Telemetry / KPI 数值 | 四模块 rightRail、Analytics |
| `HolographicButton` | 模块主操作（色 = moduleColor） | Treasury / Wallets / Policy |
| `NoiseOverlay` + `GridBackground` | 全局壳（已在 layout） | 全 Console |
| `Sparkles` | **仅** Executing / Transferring / Done 庆祝 | Treasury step3、Wallets broadcast |
| `BentoCard` | DetailDeck 内卡片容器（非 Stage 栅格） | Analytics Pie、Wallets Signers |

#### 四模块 **应降级/移除** 的 Aceternity（与设计报告冲突）

| 组件 | 问题 | 处置 |
|------|------|------|
| `GradientText` / `ColourfulText` | 页头 eyebrow 式装饰，Agent 已去掉 | 模块页 **禁止** 大标题；txHash 等 **单字段** 可保留 |
| `Sparkles` 包页头 | 喧宾夺主 | 从 Header/Stage 顶区移除 |
| `GradientOrb` | Policy 叠层与 Agent 标杆不一致 | Policy stage **移除**；必要时改为模块色 `CornerGlow` |
| `BentoGrid` 整页布局 | 与 ModuleStageLayout 打架 | 不用于 Stage 三栏，仅 DetailDeck 单卡 |

#### 草稿池 **适度提取**（Phase 7.4–7.5，按需）

| 候选 | 来源 | 用途 | 优先级 |
|------|------|------|--------|
| `SvgGradientLines` / SideLines | `hero-7` draft | Stage 面板 **角落** 1px 光边（moduleColor） | P1 |
| `BeamCollision` | `hero-1` draft | Treasury **Executing** 短促粒子（替代满屏 Sparkles） | P1 |
| `MobileMockup` | `hero-6` draft | Treasury Scanning 步骤设备隐喻 | P2 |
| `ShootingStars` | 已提取 | Wallets Topology 背景 **低频率** | P2 |
| `SkewedRectangles` | `6.tsx` draft | **不用**于四模块（Agent 专属底座语义） | — |

#### 按钮 UI 升级路径（双轨 + Aceternity 反馈）

| 层级 | 组件 | 说明 |
|------|------|------|
| 品牌 CTA | Agent 实心 lime pill | 四模块 **不用** |
| 模块 Primary | `HolographicButton` `variant={moduleColor}` `size="md"` | 已有；统一替换手写 border button |
| 模块 Secondary | Ghost 方言 或 `DirectionAwareButton`（module 色 gradient 传入） | View Audit、Cancel、Tab 旁操作 |
| 数值反馈 | `AnimatedNumber` 或 GSAP `ScrambleValue` | KPI 变化：优先 AnimatedNumber；hash 用 Scramble |
| 成功/进行中 | `Sparkles` density 低 或 BeamCollision 一次 | 非 loop 常驻 |

**Taste 约束**：Aceternity 的 neon / 粒子 **服从** Console 豁免 — 只在 `--glow-*` 语义内、且 **prefers-reduced-motion** 下关闭。

---

## 5. 分阶段实施

### Phase 7.3 — 空间秩序 ✅（已完成，仅维护）

- `ModuleStageLayout` + CSS vars + Treasury 三栏 + 四页 wrapper  
- 验收：1440×900 Treasury 首屏可见 Timeline + Records；单层滚动  

**遗留**：S-024~S-028 stages 抽取、S-044~S-048 验收 → 并入 Phase 7.6  

---

### Phase 7.4 — Command Deck 视觉统一（当前 P0）

**目标**：五页并排截图时，像 **同一艘船的不同舱室**，而非五个皮肤 patch。

#### 7.4-A 壳层与 Token（全模块）

1. **`ModuleStageLayout` 升级**
   - Header：`py-3 md:py-3.5`，`border-b border-white/[0.1]`，标题升至 `text-[14px] font-bold`
   - 外层：`max-w-none`，padding 对齐 Agent
   - DetailDeck toggle：`text-[10px] font-mono uppercase tracking-wider text-white/75`
   - Rail 桌面列宽：`lg:grid-cols-[minmax(240px,260px)_minmax(0,1fr)_minmax(220px,260px)]`

2. **对比度 pass（四页 grep `text-fg-subtle`）**
   - HUD 标签 → `text-white/75`
   - 数值 → `text-fg` 或模块色
   - 保留 `text-fg-subtle` 仅用于非 HUD 长说明（且 ≥ `text-white/55` 等效）

3. **圆角 audit**
   - 面板外壳 → `rounded-card`
   - 内嵌 telemetry → `rounded-xl`
   - 输入 / 小 chip → `rounded-field` / `rounded-control`

#### 7.4-B 分模块改造要点

| 模块 | P0 改动 | P1 改动 |
|------|---------|---------|
| **Treasury** | stage `glowColor="cyan"`；Metrics 改用 `ConsoleTelemetryGrid`；去掉 stage 重复大标题 | ActionPanel 按钮 → HolographicButton(cyan)；Executing 才 scanline |
| **Wallets** | Topology stage 全宽 blue glow；rightRail 摘要格对齐 Telemetry | DetailDeck Tab header 用 `ConsolePanelHeader` |
| **Analytics** | inline KPI 条 → Telemetry 语法；Chart hero violet glow | 空态 CTA 用 Ghost 方言，不用 lime 实心 |
| **Policy** | 移除/降级 GradientOrb；Graph stage coral glow 唯一主角 | Threshold slider 区对齐 rightRail 格；Integrity 卡片进 Deck |

#### 7.4-C 验收标准（Phase 7.4 gate）

- [ ] 五页 Navbar 切换：色彩连续，无「换了一个产品」感  
- [ ] Treasury stage 主 glow 为 **cyan**，非 lime  
- [ ] 任意页 Telemetry 格与 Agent PersonaRail 2×2 **像素级同语法**（允许模块色不同）  
- [ ] 全模块 HUD 标签在 1440 暗底上 **无需眯眼即可读**  
- [ ] 每页 stage 内 **仅一个** 视觉重心  
- [ ] `pnpm typecheck` + `pnpm build` 通过  

---

### Phase 7.5 — 状态驱动动效（P1，Taste + GSAP 纪律）

> **动效优先级**（设计报告 §5.1）：`CSS keyframes` → `framer-motion` → `GSAP（仅特殊语义）`  
> GSAP 已注册于 `lib/gsap.ts`；**禁止**在四模块页引入 ScrollSmoother / 全页 pin 叙事。

#### 7.5-A 技术分层

| 层级 | 技术 | Console 四模块允许场景 |
|------|------|------------------------|
| L0 常驻 | CSS `status-pulse`, `scanline-sweep`, `grid-pulse` | StatusPulse、Executing scanline、背景 grid |
| L1 交互 | framer `opacity/y`, `layoutId`, `scale 1.02` | Tab 切换、DetailDeck 展开、按钮 hover、Nav pill |
| L2 状态叙事 | GSAP Flip / ScrambleText / DrawSVG / MotionPath | **仅**见下表 |

#### 7.5-B GSAP 允许清单（状态触发，非装饰）

| 模块 | 动效 | 插件 | 触发条件 |
|------|------|------|----------|
| Treasury | Pipeline 步骤内容切换 | **Flip** | `FlowStep` 变化 |
| Treasury | txHash / 金额更新 | **ScrambleText** | Execute 完成 |
| Treasury | Risk 原因文案 | **ScrambleText** | blocked 出现 |
| Wallets | 拓扑连接线绘制 | **DrawSVG** | mount / vault 选中 |
| Wallets | 转账粒子路径 | **MotionPath** | `isTransferring === true` |
| Wallets | 列表过滤重排 | **Flip** | filter / 选中变化 |
| Analytics | KPI 数字切换 | **ScrambleText** | range / execution 后 |
| Analytics | 对比卡片重排 | **Flip** | Compare tab 数据变 |
| Policy | Graph 节点 pulse | framer（优先） | whitelist blocked |
| Policy | Threshold 数值 | **ScrambleText** | slider release |

#### 7.5-C GSAP 禁止清单

- ScrollTrigger **pin 整个 stage** 或模块页 document 滚动劫持  
- SplitText 砸入 **页面标题**（Eyebrow 节制；模块页无大标题动画）  
- 常驻无限 MotionPath 粒子（仅 transferring 时）  
- GSAP 与 framer **同一 DOM 节点** 同时 transform  
- 无 `prefers-reduced-motion` 降级  

#### 7.5-D 共享动效 hook（可选抽取）

```text
lib/console/motion/
  use-flip-layout.ts      # Flip.getState / Flip.from 封装
  use-scramble-value.ts   # 金额 / hash 更新
  use-draw-path-once.ts   # SVG 路径单次绘制
```

优先复用 `components/ui/gsap-text-effects.tsx` 中已有 `ScrambleValue` 等，避免重复造轮。

#### 7.5-E 验收

- [ ] 静态页（Policy 配置态、Analytics 无数据）**无** scanline / GSAP 循环  
- [ ] Demo 路径跑通：动效只出现在 **状态变化点**  
- [ ] `prefers-reduced-motion: reduce` 下动效退化为 instant / 静态  

---

### Phase 7.6 — 代码收敛与路演验收（P1/P2）

1. **stages 抽取**（原 S-024~S-039）
   - `components/console/stages/{treasury,wallets,analytics,policy}-stage.tsx`
   - `app/console/*/page.tsx` ≤ 80 行，仅 wiring

2. **响应式 QA**（S-044）：375 / 768 / 1440 无横向溢出  

3. **滚动审计**（S-045）：最多一层纵向滚动  

4. **Demo 彩排**（S-046）：Treasury 5 步 → Policy → Analytics ≤ 5 分钟  

5. **i18n**（S-047）：Header / DetailDeck label  

6. **文档**（S-048）：`HANDOFF.md` · `CLAUDE.md` §5  

---

## 6. 四页 Stage 映射（修订版，布局 + 视觉）

| 路由 | leftRail | stage (hero) | rightRail | DetailDeck | 主 glow |
|------|----------|--------------|-----------|------------|---------|
| `/console/treasury` | Records | FlowTimeline + ActionPanel | Telemetry 2×2 | Risk / Audit / CAW | **cyan** |
| `/console/wallets` | — | WalletTopology | Vault 摘要 Telemetry | Signers / Transfer Tab | **blue** |
| `/console/analytics` | — | Area Chart | Inline KPI → Telemetry 条 | Pie / Compare Tab | **violet** |
| `/console/policy` | — | NeuralGuardrailsGraph | Threshold 紧凑 | Whitelist / Integrity | **coral** |

---

## 7. 文件规划（修订）

### 7.1 新增 / 抽取

| 文件 | Phase | 职责 |
|------|-------|------|
| `command-deck/telemetry-cell.tsx` | 7.4 | 统一 Telemetry 格 |
| `command-deck/panel-header.tsx` | 7.4 | 统一面板头 |
| `lib/console/motion/use-flip-layout.ts` | 7.5 | Flip 封装 |
| `stages/*-stage.tsx` | 7.6 | 页面组装下沉 |

### 7.2 主改文件

| 文件 | Phase 7.4 | Phase 7.5 |
|------|-----------|-----------|
| `module-stage-layout.tsx` | Header / container / Deck | Deck 展开 framer |
| `modules/treasury.tsx` | cyan glow, Telemetry, 按钮 | Flip step, Scramble hash |
| `app/console/wallets/page.tsx` | Telemetry, PanelHeader | DrawSVG, MotionPath |
| `app/console/analytics/page.tsx` | KPI 语法, violet glow | Scramble KPI, Flip compare |
| `app/console/policy/page.tsx` | 去 GradientOrb, coral glow | Scramble threshold |

### 7.3 只读标杆（不改结构，可对齐 token）

- `components/console/agent-hub.tsx`  
- `components/console/navbar.tsx`  

---

## 8. 验证命令

```bash
cd frontend
pnpm typecheck
pnpm build
PORT=3100 pnpm dev
# 目视：/console /treasury /wallets /analytics /policy 五页并排
```

### 视觉冒烟（Phase 7.4+）

| 场景 | 期望 |
|------|------|
| Agent → Treasury 切换 | Navbar 色 cyan 连续；无 layout 突变 |
| Treasury Executing | cyan stage + scanline；Done 后 scanline 停 |
| Bob blocked → Policy | coral graph pulse；whitelist DetailDeck |
| 暗色可读性 | 10px 标签无需眯眼 |
| Reduced motion | 系统开启后无 scanline / 粒子 |

---

## 9. 风险与回退

| 风险 | 缓解 |
|------|------|
| 视觉统一大 diff | 7.4-A 壳层先行 → 7.4-B 分模块；每模块独立 commit |
| GSAP 与 framer 冲突 | 同一元素只绑一种；GSAP 用 ref 叶子组件 |
| SplitText 过度 | 禁止用于模块 Header；仅数值 / hash |
| 破坏 demo 数据 | Bob blocked、预算 50/25 不变 |

回退：`telemetry-cell` / `panel-header` 独立文件可单独 revert；Stage 布局不回退。

---

## 10. 建议 Commit 切分（修订）

1. `feat(console): align ModuleStageLayout with Agent HUD typography`  
2. `feat(console): add ConsoleTelemetryCell + contrast pass`  
3. `fix(console): treasury stage cyan glow + button dialect`  
4. `refactor(console): wallets analytics policy visual unification`  
5. `feat(console): state-driven GSAP for treasury flip + scramble`  
6. `feat(console): wallets topology drawsvg + motionpath on transfer`  
7. `refactor(console): extract stages/* + handoff docs`  

---

## 11. 参考文档

| 文档 | 用途 |
|------|------|
| `docs/reports/console-design-report-2026-06-13.md` | **设计思想主源** |
| `docs/reports/gsap-animation-research-2026-06-11.md` | GSAP 能力清单（需经 §7.5 纪律过滤） |
| `docs/plans/console-visual-upgrade-plan.md` | Aceternity × GSAP × Taste 历史映射 |
| `docs/reports/aceternity-deep-audit-2026-06-11-supplement.md` | 草稿池提取优先级 |
| `docs/reports/taste-skill-deep-analysis-2026-06-11.md` | Taste 历史分析 |
| `docs/plans/console-workbench-redesign-plan.md` | Phase 6/7 Navbar 约定 |
| `.claude/skills/taste-skill/SKILL.md` | 判断方法；Console 用 §1 改写参数 |

---

## 12. 总结

Phase 7.3 解决了 **「往哪放」**（舰桥布局）；Phase 7.4 解决 **「长什么样」**（Command Deck 仪表语言与 Agent 对齐）；Phase 7.5 解决 **「何时动」**（状态驱动、GSAP 克制使用）。

**风格统一的本质**：不是五页长得一样，而是 **同一艘船上，不同舱室，同一套仪表语言** — 模块色区分能力域，通用纹理 / 字号 / 面板 / 按钮层级保持一致。
