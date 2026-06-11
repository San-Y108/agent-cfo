# Landing Page Taste-Skill 打磨规划

> 基于 taste-skill 规范对 AgentCFO 官网落地首页的深度分析 + 优化方案。
> 范围：Hero section 所属区域（Landing Page），不包含 Console/Wallets/Analytics/Policy 等业务页面。
> 创建时间：2026-06-10
> 对应分支：`feat/frontend-dev`

---

## 1. Design Read

> **"Reading this as: Web3/SaaS landing for hackathon judges + technical buyers, with a dark-tech / trust-first language, leaning toward Tailwind v4 + native CSS + GSAP scroll-driven motion."**

## 2. Dial Setting

| Dial | Value | 理由 |
|------|-------|------|
| **DESIGN_VARIANCE** | **7** | 有不对称元素（HolographicCard 3D tilt、CardSplitter scatter），但整体结构偏对称 |
| **MOTION_INTENSITY** | **8** | GSAP ScrollTrigger + framer-motion 3D card + scroll-driven card split + horizontal pin scroll |
| **VISUAL_DENSITY** | **6** | 信息密度较高，含数据矩阵、日志模拟、状态卡片、stats grid |

## 3. 现有组件结构

```
VelorixHero (video bg + GSAP scroll shrink)
├── Navbar (pill nav + mobile drawer)
├── Eyebrow / Headline / Subtitle / CTA / Trust microcopy
└── ScrollTrigger: video scale + content fade

TransactionMarquee (infinite CSS animation)

LandingSections
├── Row 1: [HolographicCard + Web3NodeCloud] | [CardSplitter]
├── Row 2: PipelineShowcase (5-stage GSAP horizontal pin scroll)
├── Row 3: GuardrailsCTA (copy + BlockedReportCard)
├── Row 4: FAQSection (3 items) | HSMMonitor (stats matrix)
└── LandingFooter (giant wordmark + 4 columns)
```

---

## 4. 问题诊断（按 taste-skill 规范）

### 4.1 高优先级（AI Tells — 必须修复）

| # | 问题 | 位置 | taste-skill 条款 | 严重程度 |
|---|------|------|-----------------|----------|
| **1** | **Section numbering eyebrows** — "Stage 01 · Records", "Stage 02 · Risk" 等 | `PipelineShowcase` | Section 9.F: *"NO section-number eyebrows. `00 / INDEX`, `001 · Capabilities`, `06 · how it works`"* | 🔴 |
| **2** | **Version label in footer** — "v0.1 · 2026" | `LandingFooter` brand area + bottom row | Section 9.F: *"NO version footers on marketing pages."* | 🔴 |
| **3** | **Decoration text strip at hero bottom** — "testnet-simulated · Cobo Agentic Wallet · no real funds" | `VelorixHero` CTA 下方 | Section 9.F: *"NO decoration text strip at hero bottom"* | 🔴 |
| **4** | **Inter as default font** — 全页面 `fontFamily: "Inter, sans-serif"` | 所有组件 | Section 4.1 / 9.B: *"AVOID Inter as default"*，推荐 Geist、Satoshi、Cabinet Grotesk | 🔴 |
| **5** | **Lucide icons** — 项目使用 `lucide-react` | 全页面 | Section 3.C: *"Discouraged: lucide-react"*，推荐 Phosphor / HugeIcons / Radix / Tabler | 🟡 |
| **6** | **Middle-dot (`·`) 过度使用** — trust microcopy、footer 等多处使用多个 `·` | `VelorixHero`, `GuardrailsCTA`, `LandingFooter` | Section 9.F: *"Maximum 1 per line in metadata strips"* | 🟡 |
| **7** | **`min-h-screen` 而非 `min-h-[100dvh]`** | `VelorixHero` | Section 3.E: *"NEVER use `h-screen`... ALWAYS use `min-h-[100dvh]`"* | 🟡 |
| **8** | **多 accent 颜色** — 5 个颜色 (#B5FF4D, #5EEAD4, #FB7185, #60A5FA, #C084FC) | Pipeline stages + 各组件 | Section 4.2: *"Max 1 accent color"*，但 Pipeline 语义色可能需要保留 | 🟡 |

### 4.2 中优先级（布局 & 结构优化）

| # | 问题 | 位置 | taste-skill 条款 |
|---|------|------|-----------------|
| **9** | **Hero 居中布局** — 完全居中对齐 | `VelorixHero` | Section 4.3: *"Centered Hero avoided when DESIGN_VARIANCE > 4"*，建议 asymmetric split |
| **10** | **Eyebrow 数量超标** — 约 8 个 eyebrow（Hero + CardSplitter + 5 Stages + GuardrailsCTA） | 全页面 | Section 4.7: *"Maximum 1 eyebrow per 3 sections"*，9 个 section 最多 3 个 |
| **11** | **Hero stack > 4 元素** — eyebrow + headline + subtitle + CTA + trust microcopy = 5 | `VelorixHero` | Section 4.7: *"Hero stack discipline: max 4 text elements"* |
| **12** | **Section layout 重复** — 多个 section 使用相同 card/container 风格 | HolographicCard, CardSplitter, HSMMonitor, GuardrailsCTA | Section 4.7: *"Section-Layout-Repetition Ban"* |
| **13** | **Fake product UI (div-based)** — HolographicCard 右侧 log、CardSplitter 卡片、BlockedReportCard | 多个组件 | Section 9.F: *"NO div-based fake product UI in the hero"*，建议用真实截图或生成图片 |
| **14** | **圆角不统一** — rounded-full / rounded-[18px] / rounded-2xl / rounded-xl / rounded-3xl / rounded-[14px] | 全页面 | Section 4.4: *"SHAPE CONSISTENCY LOCK"* |
| **15** | **缺少真实图片** — 几乎无摄影/产品图，纯 CSS 构建 | 全页面 | Section 4.8: *"Even minimalist sites need real images"* |

### 4.3 低优先级 / 建议

| # | 问题 | 说明 |
|---|------|------|
| **16** | Marquee 数量 | 仅 1 个，符合 "max one per page" ✅ |
| **17** | Navigation | 单行、高度合理 ✅ |
| **18** | Dark mode 一致性 | 全页面 dark-only，无 section 翻转 ✅ |
| **19** | Motion motivation | 动画有明确目的（scroll 叙事、交互反馈），动机合理 ✅ |
| **20** | prefers-reduced-motion | 需检查是否实现 |

---

## 5. 设计切入点（优化方向）

### 5.1 字体层（最大视觉提升 / 最低风险）

**当前：** Inter + Courier New mono  
**建议：** `Geist` + `Geist Mono` 或 `Satoshi` + `JetBrains Mono`

| 元素 | 当前 | 建议 |
|------|------|------|
| Display / Headline | Inter | Geist (或 Cabinet Grotesk) |
| Body | Inter | Geist |
| Mono / Data | Courier New | Geist Mono (或 JetBrains Mono) |

**理由：** Inter 是 LLM 默认字体，是 taste-skill 首要避免的 "AI Tell"。Geist 是 Vercel 设计系统字体，与 Next.js 生态天然契合，且 Geist Mono 的代码/数据展示效果远优于 Courier New。

### 5.2 Hero 重构（从居中 → 不对称分屏）

**当前：** 全宽视频背景 + 居中文字叠加  
**建议：** **Asymmetric Split Hero** — 左侧文案区（40%）+ 右侧产品视觉区（60%）

```
┌─────────────────────────────────────────────┐
│  [Nav]                                      │
│  ┌──────────────┐  ┌─────────────────────┐  │
│  │  EYEBROW     │  │                     │  │
│  │  Headline    │  │   Product Visual    │  │
│  │  Subtitle    │  │   (3D Card /        │  │
│  │  [CTA]       │  │    Screenshot /      │  │
│  │              │  │    Generated Image)  │  │
│  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────┘
```

**具体改动：**
1. 将 HolographicCard 或一个生成的产品截图移到 Hero 右侧
2. 左侧文案左对齐，取消居中
3. 删除底部 trust microcopy（移出 hero 到独立 section）
4. 视频背景可保留但缩小为右侧视觉区的背景，或替换为静态高质量图

### 5.3 PipelineShowcase 改造（删除 Stage 编号）

**当前：** 每个 stage 有 "Stage 01 · Records" eyebrow  
**建议：**

| 当前 | 建议 |
|------|------|
| `Stage 01 · Records` | `Contribution Records` 或完全删除 eyebrow |
| `Stage 02 · Risk` | `Risk Engine` 或直接只用 headline |
| `Stage 03 · Approval` | `Human Approval` |
| `Stage 04 · Wallet` | `Wallet Execution` |
| `Stage 05 · Audit` | `Audit Trail` |

**同时：** 5 个 stage 的颜色系统可以保留（产品语义需要），但考虑统一为 1 个 accent + 灰度，或保留 2-3 个关键色。

### 5.4 减少 Eyebrow 数量

**当前 eyebrow 统计（约 8 个）：**
1. Hero: "DAO AI Treasury Officer"
2. CardSplitter: "INTERACTIVE SPLIT"
3-7. Pipeline: 5 个 Stage eyebrow
8. GuardrailsCTA: "Move funds with confidence"

**建议保留（最多 3 个）：**
1. Hero: "DAO AI Treasury Officer"（保留，品牌定位）
2. CardSplitter: 删除 eyebrow，headline 足够
3-7. Pipeline: 全部删除，用 headline 直接表达
8. GuardrailsCTA: 删除 eyebrow，headline 足够

### 5.5 信任标识移出 Hero

**当前：** Hero 底部有 "testnet-simulated · Cobo Agentic Wallet · no real funds"  
**建议：** 新建一个独立的 **Trust Bar Section**，放在 Hero 下方、Marquee 上方。

### 5.6 Footer 清理

**删除：**
- "v0.1 · 2026" 版本号
- Footer column 中的 "01 · Records" 等编号（改为 "Records", "Risk" 等）
- 底部 "Build status · green" 装饰状态点

### 5.7 圆角系统统一

**建议选择一个系统：**

| 方案 | 值 | 适用 |
|------|-----|------|
| all-soft | 12-16px | 卡片、按钮、输入框统一 rounded-xl (12px) 或 rounded-2xl (16px) |
| mixed-rule | 按钮 pill + 卡片 16px + 输入框 8px | 需要文档化规则 |

当前推荐 **all-soft (12-16px)**，将 GuardrailsCTA 的 `rounded-[18px]`、BlockedReportCard 的 `rounded-[14px]` 统一为 `rounded-2xl` (16px)。

### 5.8 添加真实视觉资产

**当前：** 纯 CSS/视频，无产品截图或摄影图  
**建议：**

| 位置 | 建议资产 |
|------|----------|
| Hero 右侧 | 生成一张产品界面截图（Console 的 Treasury 页面截图） |
| GuardrailsCTA 右侧 | 保留 BlockedReportCard（它是功能预览而非 fake UI，可接受） |
| PipelineShowcase | 每个 stage 配一张小图或 icon |

---

## 6. 预飞行检查清单（当前状态）

| 检查项 | 状态 | 说明 |
|--------|------|------|
| Design Read 声明 | ✅ | 已声明 |
| Dial 值显式设置 | ✅ | 7/8/6 |
| ZERO em-dashes | ⚠️ | 无 `—`，但有大量 `·` middle-dot |
| Page Theme Lock | ✅ | 全页面 dark-only |
| Color Consistency Lock | ⚠️ | 5 个 accent 色（产品语义需要） |
| Shape Consistency Lock | ❌ | 圆角不统一 |
| Hero fits viewport | ⚠️ | 5 个文本元素 > 4 |
| Hero top padding cap | ✅ | 合理 |
| Eyebrow count | ❌ | 约 8 个，严重超标 |
| Section-Layout-Repetition | ⚠️ | 多个 card 风格 section |
| Marquee max-one | ✅ | 仅 1 个 |
| Navigation one line | ✅ | 单行 |
| Real images | ❌ | 无真实图片 |
| No version labels | ❌ | footer 有 v0.1 |
| No section-numbering | ❌ | Pipeline 有 Stage 01-05 |
| Reduced motion | ⚠️ | 需检查 |
| min-h-[100dvh] | ❌ | 使用 min-h-screen |
| Inter default | ❌ | 全页面 Inter |

---

## 7. 执行优先级建议

| 优先级 | 改动 | 预估影响 | 风险 |
|--------|------|----------|------|
| **P0** | 删除所有 section numbering (Stage 01-05) | 消除最显著的 AI Tell | 低 |
| **P0** | 删除 footer 版本号 "v0.1 · 2026" | 消除 AI Tell | 低 |
| **P0** | 删除 hero 底部 trust microcopy | 消除 AI Tell + 符合 Hero Stack 规则 | 低 |
| **P1** | 替换 Inter → Geist | 最大视觉提升 | 中（需测试字形） |
| **P1** | Hero 重构为 asymmetric split | 布局升级 | 中（设计决策） |
| **P2** | 减少 eyebrow 数量至 ≤3 | 消除模板感 | 低 |
| **P2** | 统一圆角系统 | 细节打磨 | 低 |
| **P2** | min-h-screen → min-h-[100dvh] | 移动端修复 | 低 |
| **P3** | 添加真实产品截图 | 视觉丰富度 | 中（需生成/截图） |
| **P3** | 减少 middle-dot 使用 | 细节打磨 | 低 |
| **P3** | 检查 prefers-reduced-motion | 可访问性 | 低 |

---

## 8. 结论

当前 Landing Page 的**基础质量很好**：视频背景 Hero、GSAP scroll-driven 动画、3D card tilt、dark-only 一致性、颜色语义清晰。这些是亮点，应该保留。

但存在**多个显著的 AI Tells**，主要是：
1. **Stage 编号 eyebrow**（最显眼）
2. **Inter 默认字体**（最基础）
3. **版本号 + 装饰文字条**（最容易修复）
4. **Eyebrow 数量超标**（最模板化）

**建议执行顺序：** 先快速修复 P0 级 AI Tells（编号、版本号、trust strip），再考虑 P1 级字体替换和 Hero 重构。这样可以在最小风险下获得最大视觉提升。

---

*文档维护：每次执行完一批优化后，更新此文件的 "预飞行检查清单" 和 "执行优先级" 状态。*
