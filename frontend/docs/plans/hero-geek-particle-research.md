# Hero 标题极客粒子/扰乱效果方案 — 调研报告

> **Scope**: `frontend/components/landing/velorix-hero.tsx` 的标题交互效果
> **目标**: 极客风格：鼠标滑动抽离感、马赛克扰乱、空间波动、炫彩颜色
> **日期**: 2026-06-10
> **状态**: 调研完成，等待实现决策

---

## 1. 用户原始需求

标题: "Where DAO treasury decisions become executable payment flows"

要求:
1. ❌ 不要淡黄色荧光效果（已删除）
2. ✅ 极客风格的"粒子"效果
3. ✅ 鼠标滑动到上面有"抽离感"
4. ✅ "马赛克扰乱"感觉
5. ✅ "空间波动"感觉
6. ✅ 颜色炫彩，不要单一颜色

---

## 2. 专业术语映射

| 用户描述 | 专业术语 | 技术实现 |
|---|---|---|
| 粒子效果 | **particle text / pixel text** | Canvas 2D + `getImageData` 采样文字像素 |
| 抽离感 | **mouse-repulsive force field** | 粒子物理：鼠标位置产生排斥力，粒子被推开 |
| 马赛克扰乱 | **mosaic displacement / block glitch** | CSS clip-path、SVG filter、Canvas pixel manipulation |
| 空间波动 | **displacement distortion / ripple distortion** | SVG `feTurbulence + feDisplacementMap` |
| 炫彩 | **rainbow gradient / multi-color shimmer** | HSL 色相循环、品牌五色渐变 |

---

## 3. 推荐方案：三层叠加

不是只做一种效果，而是**三层叠加**，每层负责不同的感知：

```
Layer 1: Canvas 粒子文字 — 负责"抽离感"
Layer 2: SVG displacement filter — 负责"空间波动/水波纹"
Layer 3: CSS clip-path glitch — 负责"马赛克扰乱/数字撕裂"
```

---

## 4. Layer 1: Canvas 粒子文字 + 鼠标排斥

### 原理

1. 在 offscreen canvas 上绘制标题文字
2. `getImageData()` 获取文字像素坐标
3. 每个非透明像素对应一个"目标位置"
4. 入场时粒子从随机位置 lerp 到目标位置
5. 鼠标移动时，距离鼠标近的粒子受到排斥力，偏离目标位置
6. 鼠标离开后粒子缓慢恢复

### 炫彩方案

不使用单一颜色，而是：
- 粒子颜色基于目标位置的 x 坐标映射到 HSL 色相
- 或使用品牌五色（lime/cyan/coral/violet/blue）的渐变
- 被鼠标扰动的粒子颜色临时变亮/色相偏移

```ts
// 色相映射：x 坐标 → 0-360
const hue = (x / canvasWidth) * 360;
const color = `hsl(${hue}, 80%, 65%)`;
```

### 参考资源

- CodePen: "Mouse Follow Canvas Particles Animation" (`ndrpssdnt/XWBxbwm`)
- GSAP Community: "animate particles on mouse move"
- YouTube: "Vanilla JavaScript Text Animation Tutorial [Particles & ..."

### 代码骨架

```tsx
"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;      // 当前位置
  y: number;
  tx: number;     // 目标位置（文字像素坐标）
  ty: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export function ParticleHeroTitle({ text }: { text: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. 绘制文字到 offscreen canvas
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d")!;
    off.width = canvas.width;
    off.height = canvas.height;
    offCtx.font = "bold 64px Inter, sans-serif";
    offCtx.fillStyle = "white";
    offCtx.textAlign = "center";
    offCtx.fillText(text, off.width / 2, off.height / 2);

    // 2. 采样像素
    const imageData = offCtx.getImageData(0, 0, off.width, off.height);
    const data = imageData.data;
    const particles: Particle[] = [];

    const step = 4; // 每 4px 采一个粒子
    for (let y = 0; y < off.height; y += step) {
      for (let x = 0; x < off.width; x += step) {
        const i = (y * off.width + x) * 4;
        if (data[i + 3] > 128) {
          const hue = (x / off.width) * 360;
          particles.push({
            x: Math.random() * off.width,
            y: Math.random() * off.height,
            tx: x,
            ty: y,
            vx: 0,
            vy: 0,
            color: `hsl(${hue}, 75%, 65%)`,
            size: Math.random() * 1.5 + 0.8,
          });
        }
      }
    }
    particlesRef.current = particles;

    // 3. 动画循环
    let raf: number;
    const loop = () => {
      ctx.fillStyle = "rgba(13, 13, 13, 0.25)"; // 拖尾效果
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      for (const p of particles) {
        // 目标吸引力
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        p.vx += dx * 0.03;
        p.vy += dy * 0.03;

        // 鼠标排斥力
        const mx = p.x - mouse.x;
        const my = p.y - mouse.y;
        const dist = Math.sqrt(mx * mx + my * my);
        const radius = 120;
        if (dist < radius) {
          const force = (radius - dist) / radius;
          p.vx += (mx / dist) * force * 8;
          p.vy += (my / dist) * force * 8;
        }

        // 阻尼
        p.vx *= 0.88;
        p.vy *= 0.88;

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    };
    const handleLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-4xl h-[180px]"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
```

### 性能

- 桌面端：3000-5000 粒子，60fps
- 移动端：降低采样精度（step 6-8）或禁用
- 必须 `prefers-reduced-motion` 降级为静态文字

---

## 5. Layer 2: SVG Displacement 空间波动

### 原理

使用 SVG filter:
- `feTurbulence` 生成 Perlin noise
- `feDisplacementMap` 用 noise 去位移文字像素
- 鼠标位置控制 `baseFrequency` 或 `seed`，产生实时波动

### 效果

- 静止时：文字边缘有轻微"热浪"扭曲
- 鼠标 hover 时：扭曲加剧，像水面涟漪
- 配合黑色背景，有"空间被撕开"的错觉

### 参考资源

- Codrops: "SVG Filter Effects: Creating Texture with feTurbulence"
- Henry From Online: "How to distort text with SVG filters"
- CodePen: "Distortion [SVG Filter + GSAP]" (`jonaslieder/MWWzrzB`)

### 代码骨架

```tsx
function DisplacementTitle({ children }: { children: React.ReactNode }) {
  const [hover, setHover] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        filter: hover ? "url(#hero-displacement)" : "none",
        transition: "filter 0.3s ease",
      }}
    >
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="hero-displacement">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.01 0.05"
              numOctaves="2"
              result="turbulence"
            >
              <animate
                attributeName="baseFrequency"
                dur="3s"
                values="0.01 0.05;0.02 0.08;0.01 0.05"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="12"
              xChannelSelector="R"
              yChannelSelector="G"
            >
              <animate
                attributeName="scale"
                dur="0.4s"
                values="12;18;12"
                repeatCount="indefinite"
              />
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>
      {children}
    </span>
  );
}
```

### 性能

- SVG filter 在现代浏览器上 GPU 加速
- 动画时使用 `baseFrequency` 重绘，低端设备可能吃力
- 移动端建议降级为 `transform: skewX()` 模拟扭曲

---

## 6. Layer 3: CSS Clip-Path Glitch 马赛克扰乱

### 原理

把文字复制成多个层，每层用 clip-path 只显示一部分，然后给不同层不同的 `transform: translateX()`，产生横向错位撕裂。

### 效果

- hover 时：文字像数字信号故障一样，出现几条横向撕裂带
- 撕裂带颜色可以稍微不同（彩虹色或 RGB 分离）
- 300-500ms 短促动画

### 代码骨架

```tsx
function GlitchTitle({ text }: { text: string }) {
  return (
    <span className="group relative inline-block">
      <span className="relative z-10">{text}</span>
      {/* 撕裂层 1 - 青色 */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          color: "#5EEAD4",
          clipPath: "polygon(0 20%, 100% 20%, 100% 35%, 0 35%)",
          transform: "translateX(-3px)",
        }}
      >
        {text}
      </span>
      {/* 撕裂层 2 - 洋红 */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75"
        style={{
          color: "#FB7185",
          clipPath: "polygon(0 55%, 100% 55%, 100% 70%, 0 70%)",
          transform: "translateX(3px)",
        }}
      >
        {text}
      </span>
      {/* 撕裂层 3 - 紫色 */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-150"
        style={{
          color: "#C084FC",
          clipPath: "polygon(0 80%, 100% 80%, 100% 90%, 0 90%)",
          transform: "translateX(-2px)",
        }}
      >
        {text}
      </span>
    </span>
  );
}
```

---

## 7. 推荐组合

**最终推荐：Layer 1 + Layer 3 组合**

理由：
1. Layer 1（Canvas 粒子文字）最能体现"抽离感"和"炫彩"
2. Layer 3（CSS Glitch）最能体现"马赛克扰乱"
3. 两者都不需要 SVG filter 的实时重绘，性能更稳
4. Layer 2（SVG displacement）可以作为第二阶段的增强

**实现顺序**：
1. Phase 1: Canvas 粒子文字 + 鼠标排斥（核心效果）
2. Phase 2: CSS clip-path glitch（hover 时触发）
3. Phase 3: SVG displacement（可选增强）

---

## 8. 与现有代码的接入

`components/landing/velorix-hero.tsx` 中的 h1:

```tsx
<h1 className="...">
  {t("hero.title")}
</h1>
```

改为：

```tsx
<ParticleHeroTitle text={t("hero.title")} />
```

或保留 h1 语义：

```tsx
<h1 className="...">
  <ParticleHeroTitle text={t("hero.title")} />
</h1>
```

---

## 9. 决策点

| # | 问题 | 推荐 |
|---|---|---|
| 1 | 粒子数量？ | 桌面 3000-5000，移动端 0（回退静态文字） |
| 2 | 粒子形状？ | 小方块（square pixel），符合"马赛克"感 |
| 3 | 颜色方案？ | HSL 彩虹映射 x 坐标，或品牌五色渐变 |
| 4 | 是否加 glitch？ | 是，hover 时 300ms CSS clip-path 撕裂 |
| 5 | 是否加 SVG displacement？ | Phase 2 再加，先做 Layer 1+3 |
| 6 | 移动端策略？ | 禁用粒子，显示普通文字 + 轻微 text-shadow |
| 7 | reduced motion？ | 完全禁用粒子和 glitch，显示纯文字 |

---

## 10. 参考资源汇总

- CodePen mouse particles: `codepen.io/ndrpssdnt/pen/XWBxbwm`
- SVG distortion: `tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/`
- Text distortion: `henry.codes/writing/how-to-distort-text-with-svg/`
- GSAP + SVG distortion: `codepen.io/jonaslieder/pen/MWWzrzB`
- GSAP particles on mouse: `gsap.com/community/forums/topic/44639-animate-particles-on-mouse-move/`

---

*Report generated by Claude Code on 2026-06-10.*
