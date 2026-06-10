# AgentCFO — Ramp 风格全面 Redesign 计划

> 分支：`feat/frontend-ramp-redesign`
> 目标：Landing (`/`) + Demo (`/demo`) 全页面 UI 重构，迁移至 Ramp 设计系统
> 设计锚点：黄绿 `#B5FF4D` + 近黑 `#0D0D0D` + 白画布 `#ffffff`

---

## 一、设计方向

### 1.1 核心原则

| 原则 | 说明 |
|------|------|
| **Dual Palette** | Marketing 页用 dark (`#0D0D0D`)，Demo 控制台用 light (`#ffffff`)，统一黄绿 accent |
| **Savings = 黄绿** | `#B5FF4D` 只用于：CTA、关键指标高亮、成功态、品牌卡片 —— 传递"省钱/高效"情感 |
| **暗色卡片体系** | 废弃 warm-cream (`#fff8f0`)，改用 `#141414` / `#0d0d0d` surface，确保黄绿对比度 |
| **字体保留 Inter** | 不引入 Ramp Grotesk（避免字体加载成本），用 Inter + system-ui 栈，保持 -0.02em tracking |
| **动效渐进增强** | 先保证无动画时可用，再叠加 GSAP ScrollTrigger / Framer Motion |

### 1.2 色彩映射表

| 当前值 | 目标值 | 用途 |
|--------|--------|------|
| `#ff4f00` (orange) | `#B5FF4D` | 所有 accent：CTA、标签、图标、高亮 |
| `#fff8f0` (warm-cream) | `#141414` | 卡片 surface（暗色替代） |
| `#211817` (coffee ink) | `#f5f5f5` | 暗底上的主文本 |
| `#4a4138` / `#8a7f76` | `#a3a3a3` / `#6b7280` | 次要/三级文本 |
| `bg-black` / `#000000` | `#0D0D0D` | 页面背景（统一 near-black） |
| `amber-500/600` | `#B5FF4D` | Demo 中的 amber 状态色 |
| `emerald` 成功态 | 保留 emerald | 成功 = emerald，品牌 = 黄绿，不混淆 |

---

## 二、Landing Page (`/`) 变更方案

### 2.1 页面结构重排

```
Before:
├── VelorixHero (视频背景 + 黑底白字)
├── LandingSections
│   ├── OperatorStartCard (warm-cream 卡片)
│   ├── SystemFeatureGrid (warm-cream 卡片)
│   ├── RuntimeArchitecture (暗色 + orange)
│   ├── ToolkitShowcase (暗色 + orange)
│   └── GuardrailsCTA (暗色 + orange)

After:
├── RampHero (黑白交替背景 + 大标题 + 单字段 CTA)
├── MarqueeTrust (客户/合作伙伴 Logo 无限滚动)
├── OperatorStartCard (暗色卡片 + 黄绿 accent)
├── SystemFeatureGrid (暗色卡片 + 黄绿 accent)
├── RuntimeArchitecture (暗色 + 黄绿)
├── ToolkitShowcase (暗色 + 黄绿)
├── GuardrailsCTA (暗色 + 黄绿 CTA)
└── Footer
```

### 2.2 VelorixHero → RampHero

**变更点**：
- ❌ 移除视频背景（减少加载 + 更简洁）
- ✅ 背景改为纯白 → 近黑交替区域（CSS gradient 或 section 切换）
- ✅ 标题加大：`clamp(2.5rem, 6vw, 4rem)`，字重 700，tracking -0.03em
- ✅ 副标题改为 Inter 14px，muted 色
- ✅ CTA 改为黄绿底 + 黑字 pill 按钮（`#B5FF4D` bg，`#0D0D0D` text）
- ✅ Navbar：保持透明，hover 状态改为黄绿 underline

**文件**：`components/landing/velorix-hero.tsx`

### 2.3 新增：MarqueeTrust

**参考**：兔子.txt Marquee 模式
- 无限滚动合作伙伴/生态 Logo 墙
- `mask-image` 左右 fade
- 速度：25s 一圈，hover pause
- 内容：Cobo、GitHub、Notion、以太坊等图标（文字版）

**文件**：`components/landing/marquee-trust.tsx`

### 2.4 OperatorStartCard

**变更点**：
- 卡片背景：`#fff8f0` → `#141414`
- 标签文字：`#ff4f00` → `#B5FF4D`
- Tab active：`#ff4f00` bg → `#B5FF4D` bg，`#0D0D0D` text
- 卡片 hover border：`#ff4f00`/40 → `#B5FF4D`/40
- Icon bg：`#ff4f00`/10 → `#B5FF4D`/10
- Icon color：`#ff4f00` → `#B5FF4D`
- 底部 CTA bar：`#211817` → `#0D0D0D`，黄绿高亮

**文件**：`components/landing/operator-start-card.tsx`

### 2.5 SystemFeatureGrid

**变更点**：
- 卡片背景：`#fff8f0` → `#141414`
- 标签：`#ff4f00` → `#B5FF4D`
- 图标 bg：`#ff4f00`/10 → `#B5FF4D`/10
- 图标 color：`#ff4f00` → `#B5FF4D`
- Visual 区：保持暗色渐变，accent 改为黄绿
- 编号 color：`#8a7f76` → `#6b7280`

**文件**：`components/landing/system-feature-grid.tsx`

### 2.6 RuntimeArchitecture

**变更点**：
- 中心 runtime box：`#ff4f00`/30 border → `#B5FF4D`/30 border
- 标签 color：`#ff4f00` → `#B5FF4D`
- Icon color：`#ff4f00` → `#B5FF4D`
- 箭头/connector：`#ff4f00` → `#B5FF4D`
- 原则卡片编号：`#ff4f00` → `#B5FF4D`

**文件**：`components/landing/runtime-architecture.tsx`

### 2.7 ToolkitShowcase

**变更点**：
- Tab active：`#ff4f00` → `#B5FF4D`
- 按钮 hover：`bg-[#ff4f00]` → `bg-[#B5FF4D]`，`text-white` → `text-[#0D0D0D]`
- Product frame：保持 `#0d0d0d`，browser chrome 微调

**文件**：`components/landing/toolkit-showcase.tsx`

### 2.8 GuardrailsCTA

**变更点**：
- 背景 radial-gradient：`rgba(255,79,0,...)` → `rgba(181,255,77,...)`（黄绿微光）
- 标签：`#ff4f00` → `#B5FF4D`
- CTA 按钮：`#ff4f00` → `#B5FF4D`，`text-white` → `text-[#0D0D0D]`

**文件**：`components/landing/guardrails-cta.tsx`

---

## 三、Demo Page (`/demo`) 变更方案

### 3.1 页面结构

```
Before: pure-black + amber accent
After: light canvas (#ffffff) + 黄绿 accent
```

### 3.2 DemoFlow

**变更点**：
- 移除 `.demo-pure-black` scope，改用全局 light mode
- Header：白底 + 黄绿 accent line
- Logo 区：黄绿渐变 `from-[#B5FF4D] to-[#9ef916]`
- Command Center badge：`amber` → `lime`（黄绿 bg + 黑字）
- 背景：移除 `bg-black`，改用 `bg-white`
- 文本：`text-fg` → `#0D0D0D`

**文件**：`components/demo/demo-flow.tsx`

### 3.3 StatsStrip

**变更点**：
- `tone: "amber"` → `tone: "lime"`
- 新增 lime toneStyles：`bg-[#B5FF4D]/10 text-[#7acc00] border-[#B5FF4D]/20`
- 数字动画保留，颜色迁移

**文件**：`components/demo/stats-strip.tsx`

### 3.4 StepProgress

**变更点**：
- Active circle：`border-amber-500 bg-amber-500/20 text-amber-600` → `border-[#B5FF4D] bg-[#B5FF4D]/20 text-[#0D0D0D]`
- Active text：`text-amber-600` → `text-[#0D0D0D]`
- Done connector：`bg-emerald-500/30` → 保留 emerald（成功态不与品牌色混淆）

**文件**：`components/demo/demo-flow.tsx` (StepProgress inline)

### 3.5 DemoSidebar

**变更点**：
- 背景：`bg-surface-2`（light 下为 `#f1f5f9`）
- Active indicator：amber → 黄绿
- Hover：黄绿 subtle bg

**文件**：`components/demo/demo-sidebar.tsx`

### 3.6 Steps 组件

逐个更新：
- StepIntro：GradientOrb amber→lime，CTA 按钮黄绿
- StepPlan：表格 accent 色
- StepRisk：风险检查图标颜色
- StepApproval：批准按钮黄绿
- StepExecution：tx 状态色
- StepAudit：报告高亮色

**文件**：`components/demo/steps/*.tsx`

---

## 四、Token / CSS 变更方案

### 4.1 globals.css 更新

```css
/* 新增 Ramp token — 保留现有体系作 fallback */
@theme inline {
  --color-lime-500: #B5FF4D;
  --color-lime-600: #A8F040;
  --color-lime-400: #C8FF70;
  --color-ink: #0D0D0D;
  --color-canvas: #ffffff;
  --color-surface-dark: #141414;
  --color-surface-darker: #0a0a0a;
}
```

### 4.2 语义 Token 映射

```css
:root {
  /* 保留现有 light token，accent 改为 lime */
  --accent: #B5FF4D;
  --accent-fg: #0D0D0D;
}

.dark {
  /* dark mode 下 accent 同样为 lime */
  --accent: #B5FF4D;
  --accent-fg: #0D0D0D;
}
```

### 4.3 Landing token 废弃

```css
/* 废弃以下 token，组件内改为硬编码或新 token */
--landing-orange: #ff4f00;        → 删除
--landing-orange-soft: ...        → 删除
--landing-paper: #fff8f0;         → 改为 --surface-dark: #141414
--landing-paper-muted: #eee7df;   → 删除
--landing-ink: #211817;           → 改为 --fg: #f5f5f5
```

---

## 五、新增组件规划

| 组件 | 路径 | 说明 | 优先级 |
|------|------|------|--------|
| `MarqueeTrust` | `components/landing/marquee-trust.tsx` | Logo 无限滚动墙 | 高 |
| `RampCard` | `components/ui/ramp-card.tsx` | 3D 卡片组件（黄绿/黑双色） | 中 |
| `Reveal` | `components/ui/reveal.tsx` | GSAP ScrollTrigger 入场包装 | 高 |
| `SavingsCounter` | `components/ui/savings-counter.tsx` | 数字递增动画 | 中 |
| `SplitText` | `components/ui/split-text.tsx` | GSAP 字符级 stagger 动画 | 低 |

---

## 六、动画增强规划（Phase 5）

### 6.1 Reveal 入场（全页面）
- 所有 section 使用 GSAP ScrollTrigger
- `start: 'top 85%'`，`toggleActions: 'play none none none'`
- 动画：`opacity: 0→1, y: 24→0, duration: 0.6, ease: power2.out`
- 逐步替换现有 Framer Motion `whileInView`

### 6.2 Marquee Trust Badges
- 参考兔子.txt 实现
- `translateX(-50%)` + duplicated content
- `mask-image` left/right fade
- `will-change: transform`
- hover pause

### 6.3 3D Wallet Split/Merge（核心亮点）
- 参考 Web-Prototype GSAP 实现
- ScrollTrigger `pin + scrub`，400vh 滚动容器
- 五阶段：center → split → hold → merge → accent switch
- `rotateY ±15°`，`perspective: 1200px`
- Reduced motion 降级：直接显示最终状态

### 6.4 Savings Counter
- Ramp 签名动效
- 数字递增：`0 → 目标值`，`duration: 2s`，`ease: power2.out`
- `prefers-reduced-motion` 时直接显示最终值
- 用于 Demo 页 KPI 或 Landing CTA 区

---

## 七、执行顺序

```
Phase 1: Token 基础设施
├── globals.css：新增 lime token，更新 accent
├── @theme inline：暴露 lime utilities
├── 废弃 landing-* orange token
└── 验证：pnpm build

Phase 2: Landing Hero 重写
├── velorix-hero.tsx → ramp-hero.tsx
├── 移除视频背景
├── 白/黑交替背景 + 黄绿 CTA
└── 验证：截图

Phase 3: Landing 模块颜色迁移
├── operator-start-card.tsx：orange→lime，卡片暗色化
├── system-feature-grid.tsx：orange→lime，卡片暗色化
├── runtime-architecture.tsx：orange→lime
├── toolkit-showcase.tsx：orange→lime
├── guardrails-cta.tsx：orange→lime
└── 验证：截图

Phase 4: Demo 页颜色迁移
├── demo-flow.tsx：amber→lime，light canvas
├── stats-strip.tsx：新增 lime tone
├── step-progress：amber→lime
├── demo-sidebar.tsx：lime active indicator
├── steps/*：逐个更新
└── 验证：截图

Phase 5: 动画增强
├── Reveal：GSAP ScrollTrigger 替换 FM whileInView
├── MarqueeTrust：新增 Logo 滚动墙
├── 3D Wallet：Landing 核心产品展示（可选）
├── SavingsCounter：Demo KPI 数字动画
└── 验证：交互测试

Phase 6: 清理与验证
├── 删除未使用 token
├── 统一 bg-black → #0D0D0D
├── 检查剩余硬编码颜色
├── 最终 build
└── 截图 + Codex review
```

---

## 八、风险点

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Warm-cream → 暗色卡片，视觉风格大变 | 高 | 先改一个组件截图确认 |
| `#B5FF4D` 在 white bg 上对比度不足 | 高 | 只在暗色 surface 或作为 bg fill 使用 |
| Amber→Lime 色温差异，可能不和谐 | 中 | 逐步替换，先改 accent 再改状态色 |
| 视频移除后 Hero 可能显空 | 中 | 用 CSS gradient/图案替代，确保视觉重量 |
| GSAP 增加 bundle 体积 | 中 | Tree-shake，按需 import |
| Demo light mode 与现有 dark 组件冲突 | 高 | 检查所有 `dark:` 类名，确保 light 下正常 |

---

## 九、文件变更清单

| 文件 | 变更类型 | 工作量 |
|------|----------|--------|
| `app/globals.css` | 修改 — token 更新 | 中 |
| `components/landing/velorix-hero.tsx` | 重写 — RampHero | 大 |
| `components/landing/operator-start-card.tsx` | 修改 — 颜色+卡片背景 | 中 |
| `components/landing/system-feature-grid.tsx` | 修改 — 颜色+卡片背景 | 中 |
| `components/landing/runtime-architecture.tsx` | 修改 — 颜色 | 小 |
| `components/landing/toolkit-showcase.tsx` | 修改 — 颜色 | 小 |
| `components/landing/guardrails-cta.tsx` | 修改 — 颜色 | 小 |
| `components/landing/marquee-trust.tsx` | 新增 | 中 |
| `components/demo/demo-flow.tsx` | 修改 — light mode + lime | 大 |
| `components/demo/stats-strip.tsx` | 修改 — lime tone | 小 |
| `components/demo/demo-sidebar.tsx` | 修改 — lime accent | 小 |
| `components/demo/steps/*.tsx` | 修改 — 逐个更新 | 中 |
| `components/ui/reveal.tsx` | 新增 | 小 |
| `components/ui/ramp-card.tsx` | 新增 | 中 |

---

## 十、验收标准

- [ ] Landing 全页面无 `#ff4f00` / `amber` 残留
- [ ] Demo 全页面无 `amber` 残留，light canvas 正常
- [ ] 所有 CTA 按钮为黄绿底 + 黑字
- [ ] 暗色卡片背景统一为 `#141414` 或 `#0d0d0d`
- [ ] `pnpm build` 无错误
- [ ] `pnpm typecheck` 无错误
- [ ] 截图对比：风格一致、无视觉回归
- [ ] Mobile 响应式正常

---

*计划基于 research-report.md 与 DESIGN.md 生成*
