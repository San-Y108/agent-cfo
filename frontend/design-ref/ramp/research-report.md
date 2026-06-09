# Ramp Redesign — 参考素材研究报告

> 生成时间：2026-06-09
> 分支：`feat/frontend-ramp-redesign`
> 来源：Web-Prototype (GSAP 3D Wallet) + 兔子.txt (Inner Circle) + 当前代码扫描

---

## 一、参考素材总览

| 素材 | 路径 | 核心可借鉴内容 |
|------|------|---------------|
| **Web-Prototype** | `D:\OneDrive\Desktop\Web-Prototype\index.html` | GSAP 3D 卡片分身合并动画、Ramp 风格 CSS token、Bento 网格、Reveal 入场 |
| **兔子.txt** | `D:\OneDrive\Desktop\兔子.txt` | Nav Kit、Marquee 滚动弹幕、Scroll-driven 架构、GSAP Split-text、Video Scrubbing、Tile Hover |
| **当前代码** | `frontend/` | 17 个组件清单、颜色迁移映射、风险点、执行顺序建议 |

---

## 二、Web-Prototype 可借鉴元素

### 2.1 GSAP 3D Wallet 卡片分身合并动画（核心亮点）

**架构**：ScrollTrigger `pin + scrub`，400vh 滚动容器，视口固定 100vh。

**五阶段 Timeline**：

| 阶段 | 进度 | 动作 |
|------|------|------|
| Phase 1 | 0-25% | Center 卡展示，`wlStart` label |
| Phase 2 | 25-45% | Center 分裂消失，Left/Right 3D 展开（rotateY ±15°）|
| Phase 3 | 45-70% | 两侧虚拟卡保持，`wlSplit` label |
| Phase 4 | 70-90% | 收回中心，切换为黄绿 accent 版本，`wlMerge` label |
| Phase 5 | 90-100% | 合并完成状态保持 |

**关键代码**：
```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.wallet-stage',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.2,
    pin: '.wallet-pinned',
    anticipatePin: 1,
  }
});

// Phase 2: Split
tl.to(wCenter, { rotateY: -35, scale: 0.85, opacity: 0, duration: 0.2 }, 0.25);
tl.to(wLeft,   { x: -200, rotateY: 15, opacity: 1, scale: 1, duration: 0.2 }, 0.25);
tl.to(wRight,  { x: 200,  rotateY: -15, opacity: 1, scale: 1, duration: 0.2 }, 0.25);

// Phase 4: Merge back + accent switch
tl.call(() => { centerCard.classList.add('ramp-card-accent'); }, [], 0.78);
```

**3D 关键 CSS**：
```css
.wallet-pinned { perspective: 1200px; }
.wallet-scene  { transform-style: preserve-3d; }
.wallet-item   { transform-style: preserve-3d; will-change: transform, opacity; }
```

**Reduced Motion 降级**：
```javascript
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  tl.kill();
  gsap.set([wCenter, wLeft, wRight], { clearProps: 'all' });
  gsap.set(wCenter, { opacity: 1 });
  centerCard.classList.add('ramp-card-accent');
}
```

### 2.2 CSS Token 架构

**色彩**：TasteSkew 暖白画布 + Ramp 黄绿 accent
```css
:root {
  --bg:      #FAF8F5;   /* 暖白背景 */
  --surface: #FFFFFF;
  --fg:      #111111;
  --muted:   #6B7280;
  --border:  #E8E4DE;
  --accent:  #B5FF4D;   /* Ramp 黄绿 */
  --accent-soft: color-mix(in oklch, var(--accent) 14%, transparent);
}
```

**字体**：衬线标题 + 无衬线正文
```css
--font-display: Georgia, 'Iowan Old Style', 'Times New Roman', serif;
--font-body:    -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
--font-mono:    'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;
```

**间距**：8px base，单断点 `max-width: 920px`
```css
--gap-xs: 8px; --gap-sm: 12px; --gap-md: 20px;
--gap-lg: 32px; --gap-xl: 56px; --gap-2xl: 96px;
--container: 1120px;
```

**圆角**：
```css
--radius: 16px; --radius-lg: 24px; --radius-xl: 32px;
```

### 2.3 组件体系

| 组件 | 描述 | 可复用性 |
|------|------|---------|
| `ramp-card` | 340×214 黑卡，双层 radial-gradient 光泽，芯片/卡号/姓名 | 高（AgentCFO 可改为 Agent Wallet 卡） |
| `ramp-card-accent` | 黄绿变体，黑字，发光 shadow | 高（accent CTA 卡片） |
| `mini-card` | 280×170 虚拟卡，含进度条 | 中（Demo 中 contributor 卡片） |
| `bento-card` | 网格卡片，`wide` 跨两列 | 高（Landing feature 网格） |
| `reveal` | `opacity:0 translateY(24px)` → GSAP ScrollTrigger `top 85%` 触发 | 高（通用区块入场） |

### 2.4 ScrollTrigger 配置模式

```javascript
// Pin + Scrub（核心产品展示）
scrollTrigger: {
  trigger: '.wallet-stage',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1.2,
  pin: '.wallet-pinned',
  anticipatePin: 1,
}

// Reveal 入场（通用区块）
gsap.to(el, {
  scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
  opacity: 1, y: 0, duration: 0.6, ease: 'power2.out'
});
```

---

## 三、兔子.txt (Inner Circle) 可借鉴元素

### 3.1 Nav Kit

**结构**：
- Logo 组（SVG + 三行副标题）→ 点击回到顶部
- 桌面导航：4 个锚点按钮，`hover:bg-white hover:text-black` 反色过渡
- 移动端汉堡：圆形按钮 → 全屏 overlay（`backdrop-blur-xl`）
- Active section tracking：`scrollProgress` 区间映射

**B2B 适配**：
```ts
// scrollProgress → activeSection 映射
< 0.18   → "hero"
0.18-0.45 → "products"
0.45-0.68 → "solutions"
0.68-1.15 → "about"
else      → "contact"
```

### 3.2 Fade-in / Reveal Effects

**核心模式**：基于 `scrollProgress` 的 `easeProgress` 计算
```ts
const easeProgress = clamp01((scrollProgress - triggerStart) / range);
// translateX = (easeProgress - 1) * offset;
// opacity = easeProgress;
// filter = blur(${(1 - easeProgress) * 12}px);
```

**B2B 适用**：Feature cards 从底部 `translateY(40px)` + `blur(8px)` 渐入；Stats 数字 `scale(0.95→1)`。

### 3.3 Marquee / 滚动弹幕

**实现**：
```css
@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee-container {
  mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
}
.marquee-track {
  animation: marquee-scroll linear infinite;
  will-change: transform;
}
```

**组件 API**：`<Marquee gap="80px" speed={25} fade>`

**B2B 适用**：Trust badges（客户 Logo 无限滚动）、实时汇率 ticker。

### 3.4 Scroll-driven Architecture

**状态机**：
```
scrollProgress (0 → 3.5)
  ↓
lerpedScrollProgress (rAF 平滑: current += (target - current) * 0.08)
  ↓
├── VideoScrubber: video.currentTime = lerp(current, target, 0.15)
├── ScrollExitSplitText: gsap.to(timeline, { progress, duration: 0.6 })
├── SoapTiles: easeProgress 计算
├── SecondScreen: translateY + blur
└── CylindricalTextDrum: targetIndex 计算
```

**Gesture Controller**：
```ts
// Wheel: scaleFactor = 0.0006
// Touch: scaleFactor = 0.0015
// Programmatic Nav: 1200ms easeInOutCubic
```

### 3.5 Text Effects

**GSAP Split-text**：
```ts
const chars = splitText.split({ type: "lines,words,chars" });
tl.fromTo(chars,
  { opacity: 1, yPercent: 0, scaleY: 1, scaleX: 1 },
  { opacity: 0, yPercent: 300, y: "25vh", scaleY: 1.2, scaleX: 0.9, stagger: 0.03 }
);
gsap.to(timeline, { progress: scrollProgress, duration: 0.6, ease: "power1.out" });
```

**Cylindrical Text Drum**（3D 文本滚筒）：
```ts
R = 380; lineHeight = 32;
translateY = indexDiff * 32;
angleRad = translateY / R;
translateZ = Math.cos(angleRad) * R - R;
baseScale = 0.78 + Math.cos(angleRad) * 0.22;
opacity = Math.max(0, (Math.cos(angleRad) - 0.2) / 0.8);
```

### 3.6 Video Scrubbing

```ts
targetTime = clamp(scrollProgress * duration, 0, duration);
currentTime += (targetTime - currentTime) * 0.15;
if (!video.seeking && Math.abs(video.currentTime - currentTime) > 0.01) {
  video.currentTime = currentTime;
}
```

**鼠标视差**：`gsap.to(container, { x: -mx*40, y: -my*40, duration: 1.2, ease: "power2.out" })`

### 3.7 Tile / Card Hover Effects (SoapTiles)

- 3 个白色 pill-cards 垂直堆叠
- Hover：当前 tile scale 1.2，邻居垂直位移 ±13.8px
- 入场：`scrollProgress > 0.75`，从左侧滑入 + blur 消退

---

## 四、当前代码映射分析

### 4.1 组件清单

**Landing (`/`)**：VelorixHero, LandingSections (OperatorStartCard, SystemFeatureGrid, RuntimeArchitecture, ToolkitShowcase, GuardrailsCTA)

**Demo (`/demo`)**：DemoFlow, DemoSidebar, StatsStrip, StepIntro, StepPlan, StepRisk, StepApproval, StepExecution, StepAudit

**共享 UI**：BentoGrid, DemoBackdrop, GradientOrb, GlassPanel, ThemeLanguageToggle

### 4.2 颜色迁移映射

| 当前 Token/值 | 当前 (dark) | 目标 Ramp | 备注 |
|--------------|------------|-----------|------|
| `--accent` | `#f59e0b` amber | `#B5FF4D` | **主替换** |
| `--landing-orange` | `#ff4f00` | `#B5FF4D` | Landing 专用 orange |
| `--landing-paper` | `#fff8f0` warm-cream | 需决策 | 保留或改为 `#141414` |
| `amber-500/600` | 多处硬编码 | `#B5FF4D` | Demo header, progress, CTA |
| `bg-black` | `#000000` | `#0D0D0D` | 统一 near-black |

### 4.3 文件变更影响评估

| 优先级 | 文件 | 工作量 | 说明 |
|--------|------|--------|------|
| 🔴 高 | `operator-start-card.tsx` | 大 | `#ff4f00` x6, warm-cream 卡片 |
| 🔴 高 | `system-feature-grid.tsx` | 大 | `#ff4f00` x3, visual mocks |
| 🟡 中 | `runtime-architecture.tsx` | 中 | `#ff4f00` x5 |
| 🟡 中 | `toolkit-showcase.tsx` | 中 | `#ff4f00` x4, 暗色卡片 |
| 🟡 中 | `guardrails-cta.tsx` | 中 | `#ff4f00` x3 |
| 🟡 中 | `demo-flow.tsx` | 中 | amber header, progress |
| 🟡 中 | `steps/step-intro.tsx` | 中 | amber CTA, GradientOrb |
| 🟢 低 | `bento-grid.tsx` | 小 | toneGlow amber→lime |
| 🟢 低 | `stats-strip.tsx` | 小 | toneStyles amber→lime |
| ⚪ 极低 | `velorix-hero.tsx` | 极小 | 可保留（恒暗 Hero）|

### 4.4 风险点

1. **Warm-cream 卡片体系**：`#fff8f0` + `#B5FF4D` 对比度可能不足。建议：改为暗色 surface (`#141414`) + lime accent。
2. **Amber→Lime 映射**：色温差异大，需验证视觉和谐度。建议：创建 `lime-500` Tailwind 映射。
3. **多色状态体系**：`#B5FF4D` 与 emerald 成功态可能混淆。建议：lime = 品牌/CTA，emerald = 成功，red = 危险。
4. **CSS Token 同步**：修改 `:root` + `.dark` + `@theme inline` 三处。

---

## 五、综合建议：可直接复用的模式

| 模式 | 来源 | 优先级 | B2B 落地场景 |
|------|------|--------|-------------|
| **Scroll-driven 3D split/merge** | Web-Prototype | 高 | Landing 核心产品展示（Wallet/Card 分身合并） |
| **Marquee（Logo 滚动）** | 兔子.txt | 高 | Trust badges、客户 Logo 墙 |
| **Fade-in + blur reveal** | 两者 | 高 | Feature cards、stats、CTA 入场 |
| **CSS Token 架构** | Web-Prototype | 高 | 统一颜色/字体/间距系统 |
| **ramp-card 组件** | Web-Prototype | 高 | Agent Wallet 卡片展示 |
| **Bento 网格** | Web-Prototype | 高 | Landing feature 展示 |
| **Nav Kit** | 兔子.txt | 高 | Landing 导航栏 |
| **Programmatic nav** | 兔子.txt | 高 | 单页锚点滚动 |
| **GSAP Split-text** | 兔子.txt | 中 | Hero headline 字符级动画 |
| **Video Scrubbing** | 兔子.txt | 中 | Product demo 滚动驱动 |
| **Tile hover（scale + shift）** | 兔子.txt | 中 | Feature cards hover |
| **Cylindrical text drum** | 兔子.txt | 低 | 创意展示（需谨慎适配 B2B） |

---

## 六、建议执行顺序

```
Phase 1: Token 基础设施
├── globals.css 新增 Ramp token（保留现有体系作 fallback）
├── @theme inline 暴露 lime utilities
└── 验证：pnpm build

Phase 2: Landing Hero 重写
├── velorix-hero.tsx：白底/黑底交替，大标题 + 单字段 CTA
├── 移除视频背景
└── 验证：截图

Phase 3: Landing 下方模块
├── operator-start-card.tsx：orange→lime
├── system-feature-grid.tsx：orange→lime
├── runtime-architecture.tsx：orange→lime
├── toolkit-showcase.tsx：orange→lime
├── guardrails-cta.tsx：orange→lime
└── 验证：截图

Phase 4: Demo 页
├── demo-flow.tsx：amber→lime
├── stats-strip.tsx：黄绿高亮关键指标
├── demo-sidebar.tsx：黄绿 active indicator
├── steps/*：逐个更新视觉
└── 验证：截图

Phase 5: 动画增强（可选）
├── Landing：GSAP Reveal 入场
├── Landing：Marquee trust badges
├── Landing：3D Wallet split/merge（核心亮点）
├── Demo：savings counter 动画
└── 验证：截图 + 交互测试

Phase 6: 清理
├── 删除未使用的 landing-* token
├── 统一 bg-black → #0D0D0D
├── 检查剩余硬编码颜色
└── 最终 build + screenshot
```

---

## 七、关键文件路径

| 文件 | 路径 |
|------|------|
| 本报告 | `frontend/design-ref/ramp/research-report.md` |
| Ramp 设计系统 | `frontend/design-ref/ramp/DESIGN.md` |
| Web-Prototype 源文件 | `D:\OneDrive\Desktop\Web-Prototype\index.html` |
| 兔子.txt 源文件 | `D:\OneDrive\Desktop\兔子.txt` |
| Token 总源头 | `frontend/app/globals.css` |
| Landing 入口 | `frontend/app/page.tsx` |
| Demo 入口 | `frontend/app/demo/page.tsx` |

---

*报告由 3 个并行分析 agent 汇总生成。*
