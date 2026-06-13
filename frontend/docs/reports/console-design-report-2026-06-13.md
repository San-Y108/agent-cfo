# AgentCFO Console 工作台设计报告

> **日期**：2026-06-13  
> **基准页面**：`http://localhost:3100/console`（Agent Hub）  
> **文档性质**：设计思想与视觉语言总结，供后续 AI / 开发者吸收后自行制定各模块调整方案  
> **非目标**：本文不包含落地清单、任务勾选或强制执行项

---

## 0. 这份报告解决什么问题

Console 工作台由多阶段迭代而成：Phase 6 建立了 Command Deck 设计语言，Phase 7 完成了路由级五页导航，随后 Agent 页经历 Plan A 布局重构与一轮风格统一打磨。Treasury、Wallets、Analytics、Policy 由其他会话并行演进，容易出现「同一产品、五种方言」的割裂感。

本报告只回答三件事：

1. **Console 工作台是如何被设计出来的**（产品立场、信息架构、视觉隐喻）
2. **风格统一与排版是如何被处理的**（对比度、层级、空间、组件复用）
3. **视觉动效语言如何建立，并与 Taste Skill 如何对话**（采纳什么、改写什么、拒绝什么）

读完后，接手者应能提炼原则，结合各自页面的功能密度与交互复杂度，自行推导改造路径。

---

## 1. 设计立场：Console 是什么

### 1.1 Design Read

在 Taste Skill 的 Brief Inference 框架下，Console 的读法不是 Landing，也不是通用 Dashboard：

> **Reading this as**: Web3 B2B fintech command center for DAO treasury operators, with a **dark HUD / cockpit** language, leaning toward the existing **Ramp Lime** brand and a **Command Deck** primitive system inherited from Landing.

这意味着：

- **受众**是路演评委与 DAO 财务操作者，需要在 30 秒内看懂「Agent 思考 → 风控 → 人工确认 → CAW 执行」的故事线。
- **气质**是「受控的指挥中心」，不是营销页的情绪渲染，也不是 Excel 式表格堆砌。
- **延续性**要求 Console 看起来像 Landing 的「进入工作台」：同样的暗底、同样的 lime 底线、同样的 pill 导航语法。

### 1.2 核心产品命题如何映射到界面

业务流程：

```
Contribution Records → Payment Plan → Risk Check → Human Approval → CAW → Audit Report
```

界面设计始终服务这条链：

| 业务阶段 | 界面表达 |
|---------|---------|
| Agent 生成计划 | 对话 + Quick Commands，让评委看见「AI 在说话」 |
| 风险拦截（Bob blocked） | coral 语义色、风险词高亮、Telemetry 中的 BLOCKED 计数 |
| 人工确认 | Policy / Drawer Rules 与主流程呼应，而非孤立设置页 |
| CAW 执行 | Wallets / Treasury 的操作面板带 scanline、粒子、状态脉冲 |
| 审计 | Analytics / Activity log 提供事后追溯感 |

**Agent 页是叙事入口，四模块页是能力纵深。** 统一风格时，不应把四页都做成聊天界面，而应让它们共享同一套 HUD 语法，同时保留各自的信息密度差异。

### 1.3 信息架构决策（Phase 7 之后）

早期 Console 使用 Edge Capsule + 左右分屏 Module Panel；当前版本已收敛为 **顶部五页路由**：

```
/console          Agent      （默认首页，人格 + 对话）
/console/treasury Treasury   （付款执行流水线）
/console/wallets  Wallets    （金库与划拨）
/console/analytics Analytics  （图表与 KPI）
/console/policy   Policy     （规则与护栏）
```

这一决策的直接设计后果：

- **导航即模块色**：每个 Tab 在 Navbar 中绑定一种 HUD 强调色，用户切换页面时，色彩语义连续，而非每次重新学习布局。
- **Agent 独占「人格化」表达**：吉祥物、聊天、Demo 快捷指令只留在 Agent 页，避免五页争抢同一视觉焦点。
- **模块页共享 `ModuleStageLayout`**：左轨 / 主舞台 / 右轨 / 可折叠 Detail Deck，保证「指挥中心」的空间节奏一致。

---

## 2. Taste Skill：如何参考、如何改写

Taste Skill 默认面向 Landing / Portfolio。直接套用会得到错误密度与错误布局。Console 的做法是 **借其判断方法，改其默认参数**。

### 2.1 三旋钮（Three Dials）的实际取向

| 旋钮 | Taste Skill 默认 | Console 取向 | 理由 |
|------|-----------------|-------------|------|
| **DESIGN_VARIANCE** | 8 | **6–7** | 模块页需要可预测的栅格；Agent 页允许左窄右宽的轻度不对称，但不追求 Awwwards 式混沌 |
| **MOTION_INTENSITY** | 6 | **5–6** | 动效服务于状态（BUSY、扫描、脉冲），不做全屏电影转场 |
| **VISUAL_DENSITY** | 4 | **7–8** | 金融 HUD 需要同时看见预算、记录数、就绪/拦截笔数；低密度只适合聊天气泡区 |

Taste Skill 中「trust-first / regulated」信号在 Console 被转化为 **对比度优先**：暗色底上，标签与数值必须可扫读，不能为了氛围牺牲 AA 级可读性。

### 2.2 从 Taste Skill 明确采纳的原则

**Anti-Default Discipline**  
拒绝 AI 紫渐变模板、拒绝无意义的玻璃拟态堆叠。品牌锚点锁定在 `#0D0D0D` 暗底 + `#B5FF4D` lime Accent，与 Landing 一致。

**Redesign — preserve**  
Landing 已确立 pill nav、logo 发光、lime-cyan 渐变底线。Console Navbar 是有意「镜像」Landing scrolled 态，而非另起炉灶。

**Page Theme Lock**  
Console 强制 `dark` class，不跟随系统浅色模式。工作台是长时间盯盘场景，浅色会破坏 HUD 氛围与发光语义。

**Shape Consistency**  
圆角、边框、面板容器收敛到 token 体系（`rounded-card` / `rounded-control` / `rounded-field`），避免每页手写不同半径。

**Eyebrow 节制**  
Taste Skill 反对过多装饰性小标签。Agent 页打磨时移除了喧宾夺主的 `AGENT::`、`TELEMETRY`、`Quick` 等眉标式标题，改为语义明确的正文小标题（如「预算与状态」）。`HudLabel` 的 `MODULE::` 前缀保留，因为它是 **数据协议语法**，不是装饰 eyebrow。

### 2.3 对 Taste Skill 的 Console 豁免（有意识突破）

| Taste Skill 红线 | Console 处理 | 设计论证 |
|-----------------|-------------|---------|
| Max 1 accent color | **五页各有一色** | 五色不是装饰，是 **信息架构**：用户靠颜色定位「我在哪个能力域」 |
| 低密度 Gallery | **模块页高密度** | Treasury 表格、Policy 规则卡需要信息并排；密度差异本身构成层级 |
| NO neon glows | **受控 glow** | `--glow-*` 只用于 FrostedPanel 外缘与状态反馈，不做满屏霓虹 |
| Inter 禁用 | **部分保留 Inter** | Navbar 与正文仍用 Inter；数值与前缀走 Geist Mono。完全换字体成本高于收益，但 mono 层必须统一 |

### 2.4 Taste Skill 未采纳、且不应回退的方向

- 把 Console 做成 **居中 Hero + 三卡特性** 的 Landing 副产物
- 为「好看」引入第六、第七种强调色
- 在五页重复 Agent 吉祥物或 3D 球体角色
- 用 GSAP 滚动叙事驱动工作台（GSAP 保留给 Landing / Treasury 特殊段落，非全局默认）

---

## 3. 视觉语言：Command Deck 体系

Phase 6 将 Console 从「等距 Bento 网格」升级为 **Command Deck**。这不是单一组件，而是一套 **可组合的 HUD 语法**。

### 3.1 语义层：六色 HUD

在 `globals.css` 中沉淀：

| 名称 | Hex | 角色 |
|------|-----|------|
| lime | `#B5FF4D` | 品牌、通过、金额、Agent 主舞台 |
| cyan | `#5EEAD4` | Treasury、BUSY 分析态 |
| blue | `#60A5FA` | Wallets、链上操作 |
| violet | `#C084FC` | Analytics、Agent 左轨氛围 |
| coral | `#FB7185` | Policy、风险、blocked |
| amber | `#F59E0B` | 警告（节制使用） |

每种颜色配套 `--glow-*` 变量，供外阴影与 hover 使用。**颜色首先表达状态与模块，其次才是装饰。**

五页导航色与模块色一一对应（见 `navbar.tsx` 中 `NAV_TABS`），这是全站色彩统一的 **总开关**。

### 3.2 容器层：FrostedPanel

`FrostedPanel` 是 Command Deck 的「标准卡片方言」：

- 磨砂：`bg-surface/60 backdrop-blur-xl`
- 细边框：`border-white/[0.06]`
- 可选 `sheen`：顶部 1px 渐变高光，颜色跟随 `glowColor`
- 可选 `scanline`：流程/转账等 **进行中** 语义
- 内层强制：`flex h-full min-h-0 flex-col`，保证嵌套滚动与底部钉扎有效

**设计意图**：任何「信息块」都应看起来像同一艘飞船上的舷窗，而不是各自为政的 shadcn 卡片。

### 3.3 数据层：HudLabel + StatusPulse

- **HudLabel**：`font-mono` 前缀 + 彩色数值，表达「这是可机读的数据字段」
- **StatusPulse**：呼吸圆点 + 大写标签，表达「系统活着」

Agent 页 Telemetry 2×2 格是这套语法的浓缩示范：标签 10px 半透明白，数值 `text-base` + 语义色，单位 10px 弱化。**前缀不必处处出现**；当数据本身就是主角时，用自然语言小标题 + 数值即可。

### 3.4 操作层：两套按钮方言（刻意并存）

这是 Agent 页打磨中做出的 **有意识分化**：

| 方言 | 形态 | 场景 |
|------|------|------|
| **品牌实心 CTA** | `#B5FF4D` 底 + `#0D0D0D` 字 + lime glow | Agent「生成计划」、Navbar「首页」 |
| **HolographicButton** | 半透明底 + 模块色描边 + hover glow | Treasury / Wallets / Policy 内的执行类操作 |

并非疏漏。**对话区的 Primary 属于产品叙事**（评委第一眼看到 Demo 入口），**模块内的 Primary 属于功能域**（色随模块变）。统一风格时，应理解这种 **双轨按钮语义**，而不是把所有按钮都改成 lime 或都改成 holographic。

---

## 4. 布局与排版：如何建立空间秩序

### 4.1 全局 Shell

```
固定 Navbar（z-50）
  └─ ConsoleMain（padding-top 适配 nav 高度）
       └─ 页面内容
全局背景：GridBackground + 极低透明度 NoiseOverlay
侧滑：ConsoleDrawer（Sandbox / Rules / Activity）
```

- 画布：`#0D0D0D`，`100dvh`，`overflow-hidden`
- Navbar：磨砂暗色 + lime-cyan 渐变底线，与 Landing 视觉血缘相连
- **高度预算**：模块页用 `--console-stage-h` 扣除 nav、module header、底部留白，避免「页面能滚但舞台被挤扁」

### 4.2 Agent 页：Plan A 布局哲学

Agent 页是当前 **风格标杆**，其核心决策是 **主次分离**：

```
Desktop:
┌ PersonaRail 260–288px ─┬ ChatPanel flex-1 ─────────────┐
│ 身份与态势（次信息）      │ 对话与操作（主工作面）          │
└────────────────────────┴───────────────────────────────┘
```

**为何左窄右宽**  
人格、吉祥物、Telemetry 负责「谁在说、系统状态如何」；聊天与 Quick Commands 负责「发生什么、评委点哪里」。用户视线应自然落在右侧；左侧是锚点，不是第二主角。

**为何吉祥物移出主卡片**  
早期版本把 mascot 放在主舞台中心，挤压了对话的操作感。Plan A 将 mascot 降格为 PersonaRail 的 **身份符号**，主舞台完全让给对话——这符合「Agent-first」的产品口号。

**底部钉扎的实现要点**  
Chat 区三段式：`header shrink-0` → `messages flex-1 min-h-0 overflow-y-auto` → `footer mt-auto shrink-0`。FrostedPanel 内层也必须参与 `min-h-0` 高度链，否则输入框会浮在中间。这是排版层面最关键的工程约束，也是视觉「稳定感」的来源。

### 4.3 模块页：ModuleStageLayout 哲学

四模块页共享：

```
ModuleStageHeader（MODULE:: 标签 + 标题 + StatusPulse）
  └─ 三栏 Grid（lg+）：leftRail | stage | rightRail
  └─ Detail Deck（可选，折叠）
```

**设计隐喻**：像舰桥上的「主显示屏 + 两侧副屏 + 下方日志抽屉」。  
**leftRail / rightRail** 放上下文与辅助指标，**stage** 放该页唯一的主角可视化（Pipeline、Topology、Chart、Guardrails Graph）。  
**不应**把四页都改成 Agent 式双栏；应在同一 Stage 语法下，让 **主角模块各自不同**。

### 4.4 排版层级（Agent 打磨后的收敛值）

| 层级 | 规格 | 用途 |
|------|------|------|
| 面板标题 | `text-[14px] font-bold` 或 `text-sm font-semibold` | Chat header、模块小节 |
| 正文 / 气泡 | `text-[14px] leading-relaxed` | 对话、表单说明 |
| Agent 名称 | `text-lg font-bold` | PersonaRail 身份 |
| HUD 标签 | `text-[10px]–[11px] uppercase tracking-wider text-white/70–80` | Telemetry、折叠标签 |
| HUD 数值 | `text-base font-bold tabular-nums` + 语义色 | 预算、计数 |
| 弱化说明 | `text-[12px] text-white/55` | Demo hint |

**对比度策略**  
暗色 Console 中，`text-fg-subtle` 单独使用往往偏暗。Agent 页统一将 **标签层** 提升到 `text-white/75` 左右，**数值层** 用模块色或 `text-fg` 提亮。这一策略应视为全站暗色可读性的基准，而非 Agent 页特例。

### 4.5 圆角与间距

来自 `@theme` token：

- 卡片：`--radius-card`（16px）→ `rounded-card`
- 控件：`--radius-control`（12px）
- 字段：`--radius-field`（8px）
- Pill：`--radius-pill`

面板默认内边距 `p-4`；主舞台或表单密集区可用 `p-5`。间距尺度偏小（`gap-2.5` / `gap-3`），与高密度 HUD 一致。

---

## 5. 动效语言：何时动、动什么

### 5.1 动效优先级

```
CSS keyframes（常驻、轻量）
  → framer-motion（交互反馈、入场、layoutId）
    → GSAP（仅特殊叙事段落，非默认）
```

### 5.2 动效语义表

| 动效 | 技术 | 语义 |
|------|------|------|
| StatusPulse 呼吸 | CSS `status-pulse` | 系统在线 / BUSY |
| Scanline 扫描 | CSS `scanline-sweep` | 流程进行中、转账广播 |
| Grid 背景脉动 | CSS `grid-pulse` | 环境活着，不抢焦点 |
| 消息入场 | framer `opacity + y` | 对话真实感 |
| Typewriter 气泡 | JS 逐字 | 最新 Agent 回复是「刚生成的」 |
| Nav pill 滑动 | framer `layoutId` | 模块切换连续 |
| Mascot 悬浮 | framer `y` 循环 | 人格化，但幅度克制（±8–9px） |
| 按钮 hover | framer `scale 1.02` | 可点击确认，非炫技 |

### 5.3 Taste Skill 在动效上的提醒

Taste Skill 强调 **Motion claimed = motion shown**。Console 的应对不是到处加动画，而是：

- 在 **状态变化点** 动（思考、扫描、脉冲）
- 在 **用户操作反馈点** 动（按钮、发送、Tab 切换）
- 静态表格区域保持静态，避免廉价干扰

Agent mascot 在 `prefers-reduced-motion` 下会退化为静态或减弱位移，这是动效伦理的一部分。

---

## 6. 风格统一：实际做了什么

2026-06-13 前后对 Agent 页进行了一轮 **跨页可迁移** 的打磨，其思想如下。

### 6.1 对比度统一（P0 思想）

**问题**：光晕与半透明层叠后，10px 标签几乎看不见。  
**处理**：抬高标签与说明文字到 `white/70–80`；数值升到 `text-base`；去掉无信息量的装饰眉标。  
**可迁移原则**：暗色 HUD 上，「氛围」靠 glow 与边框，「可读性」靠明确的字重与字号阶，二者不可互相替代。

### 6.2 按钮层级统一（P0 思想）

**问题**：Quick Commands 与 Send 按钮视觉权重相近，评委找不到 Demo 入口。  
**处理**：「生成计划」升为全站唯一的实心 lime pill；其余降为模块色描边 chip；Send 在「有输入」时才亮起 lime 边框与 glow。  
**可迁移原则**：每屏最多一个「品牌级」实心 CTA；模块内主操作跟模块色走。

### 6.3 空间与字号统一（P1 思想）

**问题**：容器 `max-w` 过窄、聊天气泡偏小，工作台显得像嵌入页而非主舞台。  
**处理**：Agent 外层 `max-w-none`；聊天气泡升至 14px；左轨宽度 `minmax(260px, 288px)`。  
**可迁移原则**：Console 是主产品界面，不是 Landing 里的 demo iframe；正文基准 14px，HUD 标签 10–11px。

### 6.4 模块色与 glow 差异化（P2 思想）

**问题**：左右两面板同为 lime glow 时，主次不清。  
**处理**：PersonaRail 用 `violet` glow，ChatPanel 用 `lime` glow + 更强外阴影。  
**可迁移原则**：同一页内可用 **两种 HUD 色**，但必须 **分工明确**（氛围 vs 操作），不能随机分配。

### 6.5 Agent 资产统一

- 全身 mascot：`/console/mascots/agent-cfo-mascot.png`，紫色投影 + 脚底气晕
- 聊天头像：同素材裁切头部，`40px` 圆 + 紫色 ring，与 mascot 气质一致

其他四页 **不复制 mascot**；用模块 icon、CornerGlow、图表自身建立身份。

---

## 7. 与 Landing 的关系

Console 不是独立产品皮肤，而是 Landing 的 **工作台延续**：

| 元素 | Landing | Console |
|------|---------|---------|
| 暗底 | Hero 永久暗色 | 全站 `#0D0D0D` |
| 品牌色 | lime 按钮、gradient logo | lime CTA、gradient logo |
| 导航 | 居中 pill | 同款 pill + 模块色 icon |
| 底线 | lime-cyan 渐变 hairline | Navbar 底部同款 |
| 背景 | grid + noise | 同款组件复用 |

**差异是合理的**：Landing 追求叙事与情绪峰值；Console 追求信息密度与操作确定性。统一的是 **token 与组件方言**，不是把 Console 做成 Landing 的复制页。

---

## 8. 代码真相源（吸收后应对齐的实现层）

设计思想落地到代码时，以下文件是「方言词典」：

| 文件 | 承载的设计决策 |
|------|---------------|
| `app/globals.css` | 语义色、HUD 六色、`--glow-*`、圆角 token、动画 keyframes |
| `app/console/layout.tsx` | 暗色壳、全局背景、Navbar + Drawer |
| `components/console/navbar.tsx` | 五页色谱、 pill 动效、Landing 血缘 |
| `components/console/command-deck/*` | FrostedPanel、HudLabel、StatusPulse、Scanline |
| `components/console/module-stage-layout.tsx` | 模块页空间秩序 |
| `components/console/agent-hub.tsx` | Agent 标杆：双栏、对比度、按钮层级、聊天钉底 |
| `components/console/agent-cfo-mascot.tsx` | 人格化资产与动效幅度 |
| `components/ui/holographic-button.tsx` | 模块内操作按钮方言 |

---

## 9. 给后续 AI 的吸收提示（非清单）

接手 Treasury / Wallets / Analytics / Policy 时，建议先 **理解再改造**：

1. **先对齐语言，再对齐布局**  
   让各页卡片都讲 `FrostedPanel` + `HudLabel` 方言，比强行把四页改成 Agent 双栏更重要。

2. **保留模块色，不要抢 Agent 的 lime**  
   lime 是「品牌与叙事入口」；模块页主色应来自各自 `moduleColor`。

3. **主角模块每页只有一个**  
   Stage 区应有一个视觉重心（Pipeline / Topology / Chart / Graph），侧栏是配角。

4. **密度可以不同，层级不能不同**  
   Treasury 可以比 Agent 更挤，但标题、数值、标签的字号阶应一致。

5. **动效跟着状态走**  
   有 `isExecuting` / `isTransferring` 才上 scanline 与粒子；静态配置页不必套动画。

6. **自行制定改造方案**  
   本文 deliberately 不提供勾选清单。各页功能复杂度不同，应由接手者根据本报告的原则，结合页面现状（`app/console/*/page.tsx` 与 `components/console/modules/*`）推导局部方案。

---

## 10. 总结一句话

AgentCFO Console 的设计，是在 **Landing 品牌血缘** 之上，用 **Command Deck HUD 语法** 构建的 **暗色金融指挥中心**；Taste Skill 提供了判断方法与审美纪律，但 Console 主动提高了信息密度、接受了五色模块架构，并以 **Agent 对话主舞台 + 四模块舰桥舞台** 完成产品叙事与能力纵深的分工。风格统一的本质，不是五页长得一样，而是 **同一艘船上，不同舱室，同一套仪表语言**。

---

*相关历史文档：`docs/handoff/2026-06-12-phase6-command-deck-handoff.md` · `docs/plans/console-workbench-redesign-plan.md` · `docs/reports/taste-skill-deep-analysis-2026-06-11.md`*
