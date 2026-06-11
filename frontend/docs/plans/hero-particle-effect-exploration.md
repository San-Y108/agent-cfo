# Hero 标题粒子效果方案探索

> **Scope**: `frontend/components/landing/velorix-hero.tsx` 的 `HighlightedTitle` 组件
> **目标**: 将 5 个关键字（DAO / treasury / decisions / executable / payment flows）的 lime 高亮升级为粒子效果，同时为非关键字文字添加阴影，保持暗色主题沉浸感
> **日期**: 2026-06-10
> **状态**: 只出方案，不修改文件

---

## 0. 当前实现速览

当前 `HighlightedTitle` 的行为：

- 5 个关键字用 `#B5FF4D` + `text-shadow` 高亮
- GSAP 入场：`opacity/y/scale` stagger + `back.out(1.7)`
- GSAP 循环：关键字 `textShadow` 呼吸脉冲（36px/72px glow，1.6s yoyo）
- 非关键字：纯白，无阴影

背景：Hero 有全屏视频 + `#0D0D0D` 暗角遮罩 + 半透明黑色 overlay。

---

## 1. 方案 A：CSS/Canvas 粒子围绕关键字

### 原理

在关键字文字周围渲染一群微小发光点，模拟"能量粒子环绕文字"的效果。

两种实现路径：

1. **纯 CSS（伪元素 + box-shadow）**
   - 每个关键字 `<span>` 前后用 `::before`/`::after` 放 1-2 个圆点
   - 用 `box-shadow` 复制出 4-8 个粒子，配合 `@keyframes` 做环绕/浮动
   - 粒子颜色用 `#B5FF4D` 带透明度变化

2. **Canvas 2D（推荐）**
   - 在每个关键字 `<span>` 上方绝对定位一个 `<canvas>`
   - 用 `requestAnimationFrame` 绘制 10-20 个粒子
   - 粒子运动：随机漂移 + 轻微环绕（向心力）+ 生命周期淡入淡出
   - 粒子与文字边界做简单碰撞/避让

### 复杂度

| 路径 | 复杂度 | 说明 |
|---|---|---|
| CSS | 低 | 无需 JS，但粒子数受限（≤8），运动轨迹单一 |
| Canvas 2D | 中 | 需要 RAF 循环、粒子状态管理、响应式重绘 |

### 性能影响

- CSS：零 JS 开销，GPU 加速（transform/opacity），60fps 无压力
- Canvas：每关键字一个 canvas，最多 5 个 RAF 同时运行
  - 粒子总数控制在 80-100 以内，现代浏览器无压力
  - 注意 Retina 屏 `dpr` 缩放，避免过度绘制
  - 滚动离开视口时应 `cancelAnimationFrame`

### 是否适合本项目

**适合**。Landing Page 首屏需要"第一眼震撼"，粒子环绕能强化"AI 财控指挥中心"的科技氛围。Canvas 方案可控性高，与现有 GSAP 入场时间线容易配合。

---

## 2. 方案 B：文字粒子消散/重组动画

### 原理

把关键字的文字"打散"成大量微小像素/字符粒子，实现：

- **入场**：粒子从随机位置飞入，组装成关键字
- **Hover/定时**：关键字偶尔"闪烁重组"或"风吹消散"后恢复
- **离场/滚动**：粒子向外飘散

技术路径：

1. **HTML5 Canvas + 离屏文字采样**
   - 在 offscreen canvas 上绘制关键字文字
   - `getImageData()` 获取文字像素坐标
   - 每个非透明像素对应一个粒子，赋予目标位置
   - 入场时粒子从随机位置 lerp 到目标位置

2. **简化版：字符级粒子**
   - 不拆像素，而是把每个字母/汉字单独渲染成 `<motion.span>`
   - 用 Framer Motion 的 `staggerChildren` 做飞入效果
   - 配合 `filter: blur()` 模拟"从粒子凝聚成字"

### 复杂度

| 路径 | 复杂度 | 说明 |
|---|---|---|
| Canvas 像素采样 | 高 | 需要处理字体加载、DPR、动态字号、多语言 |
| 字符级 FM 动画 | 中 | 实现简单，但"粒子感"较弱，更像 stagger 文字 |

### 性能影响

- 像素采样：每个关键字可能生成 500-2000 个粒子，移动端压力大
- 需要 `will-change: transform` 和 GPU 层
- 5 个关键字同时做消散动画，低端设备可能掉帧

### 是否适合本项目

**谨慎推荐**。视觉效果最惊艳，但实现复杂、对响应式/多语言/i18n 支持成本高。如果只做入场一次，后续保持静态高亮，性价比可以接受。若要求持续消散/重组，性能风险较大。

---

## 3. 方案 C：WebGL/Three.js 粒子

### 原理

用 Three.js / React-Three-Fiber 在 Hero 标题区域渲染 3D 粒子系统：

- **点云（Points）**：大量粒子（1000-5000）围绕关键字飞舞
- **着色器材质（ShaderMaterial）**：用 GLSL 控制粒子颜色、大小、发光、运动
- **文字 SDF 采样**：将关键字渲染为纹理，用 shader 让粒子只在文字轮廓附近聚集
- **后期辉光（UnrealBloomPass）**：让 lime 粒子产生真实光晕

可选库：

- `three` + `@react-three/fiber` + `@react-three/drei`
- `three-bmfont-text` 或 MSDF 文字渲染
- `postprocessing` 做 bloom

### 复杂度

**高**。需要：

- 新增 Three.js 依赖（约 600KB+ gzip）
- 着色器编写/调试
- 文字纹理生成与响应式更新
- 与现有 GSAP 时间线同步
- SSR/Next.js 动态导入处理（`next/dynamic` + `ssr: false`）

### 性能影响

- 初始化开销大，首屏 JS 增加明显
- 低端 GPU/移动设备可能发热、掉电
- Bloom 后期效果对 fill-rate 敏感
- 必须做 `prefers-reduced-motion` 降级

### 是否适合本项目

**不推荐作为首选**。虽然效果顶级，但：

1. 项目当前无 Three.js 依赖
2. Hero 已有视频背景，再加 WebGL 属于"双重重型视觉"
3. 性能预算与维护成本不匹配一个标题动效

可以作为**未来升级方向**或单独做一个可选的"炫彩模式"。

---

## 4. 推荐方案

### 最推荐：方案 A 的 Canvas 2D 变体 —— "关键字能量粒子场"

**理由**：

1. **视觉冲击力足够**：暗色背景下，lime 粒子发光环绕非常吸睛
2. **复杂度可控**：200 行以内可完成核心逻辑，不引入新依赖
3. **性能友好**：纯 2D canvas，粒子数少，无 shader/后期开销
4. **与现有代码兼容**：保留 GSAP 入场 stagger，在入场完成后启动粒子循环
5. **i18n/响应式友好**：canvas 尺寸跟随关键字 `<span>` 的 `getBoundingClientRect()`

### 实现步骤

1. **新建组件** `components/landing/hero-keyword-particles.tsx`
2. **每个关键字包裹** `<KeywordParticleCanvas text={actualWord} color="#B5FF4D" />`
3. **组件内部**：
   - `useRef` 持有 `<canvas>` 和容器 `<span>`
   - `useEffect` 中：
     - 测量容器尺寸，设置 canvas `width/height`（考虑 `window.devicePixelRatio`）
     - 初始化 12-16 个粒子，位置随机，速度随机
     - `requestAnimationFrame` 循环：更新位置、边界反弹、绘制发光圆点
   - 监听 `resize` 重设 canvas 尺寸
   - 组件 unmount 时取消 RAF
4. **与 GSAP 配合**：
   - 粒子动画在 GSAP 入场完成后启动（delay ≈ 1.2s）
   - 或初始 `opacity: 0`，等 GSAP `onComplete` 后淡入
5. **非关键字文字加阴影**：
   - 外层 `<h1>` 或普通文字 span 加 `text-shadow: 0 2px 24px rgba(0,0,0,0.6)`
   - 增强可读性，同时让文字从视频背景中"浮"出来

### 关键代码示例

```tsx
"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

function initParticles(w: number, h: number): Particle[] {
  const count = 14;
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4 - 0.2, // 轻微向上飘
    radius: Math.random() * 1.5 + 0.8,
    alpha: Math.random() * 0.6 + 0.3,
    life: Math.random() * 100,
    maxLife: 120 + Math.random() * 80,
  }));
}

export function KeywordParticleCanvas({
  children,
  color = "#B5FF4D",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = initParticles(rect.width, rect.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      const rect = wrap.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;

        // 生命周期淡入淡出
        let a = p.alpha;
        if (p.life < 20) a *= p.life / 20;
        if (p.life > p.maxLife - 20) a *= (p.maxLife - p.life) / 20;

        // 边界重生
        if (p.x < -4 || p.x > w + 4 || p.y < -4 || p.y > h + 4 || p.life >= p.maxLife) {
          p.x = Math.random() * w;
          p.y = h + 2;
          p.vx = (Math.random() - 0.5) * 0.5;
          p.vy = -(Math.random() * 0.4 + 0.15);
          p.life = 0;
          p.maxLife = 120 + Math.random() * 80;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.max(0, a);
        ctx.fill();

        // 发光晕
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        g.addColorStop(0, color);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.globalAlpha = Math.max(0, a * 0.35);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [color]);

  return (
    <span ref={wrapRef} className="relative inline-block" style={{ color }}>
      {children}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        style={{ mixBlendMode: "screen" }}
      />
    </span>
  );
}
```

### 非关键字阴影建议

```tsx
// 普通文字 span
<span
  style={{
    textShadow: "0 2px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)",
  }}
>
  非关键字文字
</span>
```

或统一在 `h1` 上加：

```css
filter: drop-shadow(0 4px 24px rgba(0, 0, 0, 0.55));
```

---

## 5. 其他创意方向

除粒子外，以下方向可单独或组合使用，增强 Hero 标题表现力：

### 5.1 霓虹灯闪烁（Neon Flicker）

- 关键字 `text-shadow` 模拟霓虹灯通电瞬间的闪烁
- CSS `@keyframes flicker`：随机 3-5 次快速 opacity/textShadow 抖动
- 适合赛博朋克/指挥中心氛围
- 实现：纯 CSS，复杂度低

```css
@keyframes neon-flicker {
  0%, 18%, 22%, 25%, 53%, 57%, 100% {
    text-shadow: 0 0 4px #B5FF4D, 0 0 11px #B5FF4D, 0 0 19px #B5FF4D;
  }
  20%, 24%, 55% {
    text-shadow: none;
  }
}
```

### 5.2 全息扫描线（Holographic Scanline）

- 关键字上覆盖一条水平扫描线，从上往下扫过一次
- 扫描线经过时文字亮度/色相轻微偏移
- 与 Console 页的 `HolographicButton` 设计语言一致
- 实现：伪元素 `::after` + `@keyframes scan`

### 5.3 SVG 路径动画 — 文字描边入场

- 关键字用 SVG `<text>` 渲染
- `stroke-dasharray` / `stroke-dashoffset` 做描边绘制动画
- 描边完成后填充颜色淡入
- 复杂度中，但文字轮廓锐利，适合大标题

### 5.4 遮罩渐变流动（Gradient Mask Flow）

- 关键字文字作为遮罩，内部流动彩虹/品牌渐变色
- 品牌五色（lime/cyan/coral/violet/blue）缓慢水平流动
- 实现：`-webkit-background-clip: text` + `@keyframes bg-shift`
- 复杂度低，视觉冲击强

```css
background: linear-gradient(
  90deg,
  #B5FF4D, #5EEAD4, #FB7185, #C084FC, #60A5FA, #B5FF4D
);
background-size: 200% auto;
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
animation: gradient-flow 4s linear infinite;
```

### 5.5 组合建议

**推荐组合（不引入新依赖）**：

1. **入场**：保留 GSAP stagger + back.out
2. **关键字常态**：方案 A 的 Canvas 粒子环绕 + 轻微呼吸 glow
3. **非关键字**：统一 `drop-shadow` 提升可读性
4. **偶尔事件**：霓虹闪烁（每 6-10 秒随机触发一次）

这样既有持续的"生命力"，又有偶尔的"惊喜点"，不会过度抢夺视频背景的视觉重心。

---

## 6. 决策点

在动手实现前，需要确认以下 3 点：

| # | 问题 | 选项 |
|---|---|---|
| 1 | 粒子效果是否只在桌面端启用？ | A. 全端启用（需做性能降级）<br>B. 仅桌面端，移动端回退为 lime text-shadow |
| 2 | 是否保留现有 GSAP 呼吸脉冲？ | A. 保留，与粒子叠加<br>B. 替换为粒子发光，取消脉冲 |
| 3 | 是否引入其他创意方向？ | A. 只加粒子<br>B. 粒子 + 霓虹闪烁<br>C. 粒子 + 全息扫描线<br>D. 粒子 + 渐变流动 |

---

## 7. 结论

- **首选方案**：方案 A（Canvas 2D 粒子环绕关键字）
- **备选方案**：方案 B 的简化字符级动画（如果希望更"文字化"的粒子感）
- **暂不上**：方案 C WebGL/Three.js（效果过剩、依赖重、维护成本高）
- **推荐组合**：Canvas 粒子 + 非关键字阴影 + 偶尔的霓虹闪烁

下一步：等待用户确认方向和组合后，再进入实现阶段。
