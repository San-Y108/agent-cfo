# Trae 风格动效融入 AgentCFO Landing Page — 规划

> **Source**: https://www.trae.ai/ 首页粒子背景 + Footer 位移扭曲大字
> **Target**: AgentCFO Landing Page (`frontend/app/page.tsx` & related)
> **Date**: 2026-06-10
> **Status**: 规划阶段，等待决策

---

## 1. 需求拆解

用户从 Trae 官网看到两种效果，希望融入 AgentCFO 落地页：

### 效果 A：首页流场粒子网格背景

**视觉描述**：
- 黑色背景上铺满 tiny square/dots（看起来像 2-4px 的小方块）
- 颜色： mostly white/grey，夹杂着 brand-green（类似 #00D084）的粒子
- 运动：不是随机飘动，而是成群结队地流动、聚散、形成有机的波浪纹理
- 整体感：像数字沙尘、矩阵雨滴的优雅版、或风吹沙砾

**专业术语**：
- Flow-field particle system（流场粒子系统）
- Perlin-noise driven particle grid（柏林噪声驱动粒子网格）
- Procedural flowing texture（程序化流动纹理）

**实现路径**：
1. **Canvas 2D（推荐）**：
   - 全屏 canvas 背景层
   - 粒子数量为 2000-5000 个小方块
   - 使用 Perlin noise / Simplex noise 生成流场向量
   - 粒子颜色按速度/位置映射：低速=暗灰，中速=white，高速/聚集=brand-green
   - 帧率控制：每帧只更新部分粒子或降低更新频率

2. **WebGL / Three.js Points（备选）**：
   - 可承载 10,000+ 粒子
   - 用 shader 控制颜色和流动
   - 效果好但依赖重（three.js ~600KB）

3. **CSS 背景动画（降级）**：
   - 用少量 div + CSS animation 模拟
   - 粒子数受限，效果弱

**推荐**：方案 1（Canvas 2D + Perlin noise），不引入新依赖，效果足够震撼。

---

### 效果 B：Footer 鼠标驱动位移扭曲大字

**视觉描述**：
- 滚动到底部，出现巨大的品牌文字（如 "TRAE"）
- 文字本身是一个大色块背景 + 镂空/反色字
- 鼠标移入时，文字像水面一样被扰动，产生波纹、撕裂、像素偏移
- 有一种"空间被鼠标撕开又复原"的错觉

**专业术语**：
- Mouse-driven displacement distortion
- Water ripple / liquid distortion on text
- WebGL displacement map
- Post-processing refraction
- Chromatic aberration（可能带轻微色差）

**实现路径**：
1. **WebGL Shader + Canvas（推荐）**：
   - 用 canvas 渲染品牌文字 "AgentCFO"
   - Fragment shader 中根据鼠标位置计算 displacement
   - 使用 uv 坐标偏移产生波纹效果
   - 可以加上轻微的 RGB split（色差）增强"撕裂感"

2. **CSS filter + transform（简化版）**：
   - 用多个文字层 + `transform: skew/scale` + `filter: blur`
   - 鼠标位置映射到局部扭曲
   - 效果 weaker，但无 WebGL 依赖

3. **Three.js + Plane（备选）**：
   - 文字渲染为纹理贴在 plane 上
   - shader 做 displacement
   - 效果最强但最重

**推荐**：方案 1（Canvas + WebGL shader），因为 AgentCFO 目前无 Three.js，且 footer 出现一次，不值得加重大依赖。

---

## 2. 融入 AgentCFO 的具体位置

| 效果 | 建议位置 | 说明 |
|---|---|---|
| 流场粒子背景 | Hero section 背景层 | 替代现有纯黑 `#0D0D0D`，或叠加在视频背景之上（低透明度） |
| 流场粒子背景 | 可选：全页背景 | 随滚动持续存在，但注意性能 |
| 位移扭曲大字 | Landing Footer | 替换现有 footer 大字/标识，滚动到底部触发 |

---

## 3. 技术可行性

| 维度 | 评估 |
|---|---|
| 现有技术栈匹配 | ✅ 已有 Canvas 经验、GSAP、React refs |
| 新依赖 | 0 个（如果用 Canvas 2D + 自带 shader） |
| 性能风险 | 中。5000 粒子在桌面端无压力，移动端需降级 |
| SSR 兼容 | 需注意。Canvas/shader 组件必须 `"use client"` 并用 `useEffect` 初始化 |
| 暗色主题适配 | ✅ 黑色背景上的 white/green 粒子非常契合现有暗色主题 |
| 品牌色适配 | 绿色粒子可映射为 AgentCFO 的 `#B5FF4D`（lime） |

---

## 4. 需要确认的问题

| # | 问题 | 为什么重要 |
|---|---|---|
| 1 | 粒子背景是只在 **Hero 区域** 还是 **全页背景**？ | Hero 区域性能压力小；全页背景需考虑与下方 section 的 z-index 和可读性 |
| 2 | 是否保留现有 **Hero 视频背景**？还是用它替换视频？ | 视频 + 粒子叠加可能太重；替换则失去手指切片视频 |
| 3 | 粒子数量预期：轻量（~1500）还是震撼（~5000）？ | 直接影响性能和移动端策略 |
| 4 | Footer 扭曲大字的内容是什么？**AgentCFO** / **AGENTCFO** / 其他 slogan？ | 影响文字设计和 shader 中的 UV 采样 |
| 5 | 是否需要 **移动端降级**？（例如：移动端只用静态渐变背景） | 移动 GPU 弱，5000 粒子可能掉帧 |
| 6 | 品牌色映射：绿色粒子用 Trae 的绿（#00D084）还是 AgentCFO 的 lime（#B5FF4D）？ | 保持品牌一致性 |
| 7 |  Footer 扭曲效果是 **滚动到底部自动触发一次** 还是 **常驻+鼠标交互**？ | 影响实现复杂度和用户交互预期 |

---

## 5. 推荐实现顺序

### Phase 1：流场粒子背景（Hero 区域）
1. 新建 `components/landing/flow-field-background.tsx`
2. 使用 offscreen canvas + Perlin noise
3. 粒子颜色映射：暗灰 → 白 → lime
4. 叠加在 Hero section 中，设置低透明度（不抢夺标题焦点）
5. 移动端降级为 CSS 渐变/静态网格

### Phase 2：Footer 位移扭曲大字
1. 新建 `components/landing/distortion-word.tsx`
2. 用 WebGL canvas 渲染 "AgentCFO" 文字纹理
3. 编写 fragment shader 实现 mouse-driven displacement
4. 添加轻微 chromatic aberration
5. 集成到 `LandingFooter`

---

## 6. 参考资源

- Trae: https://www.trae.ai/
- Perlin noise JS: https://github.com/josephg/noisejs (或自己实现 simplex noise)
- WebGL displacement shader pattern: https://thebookofshaders.com/13/
- CSS `mix-blend-mode: screen` 可让亮色粒子自然叠加

---

## 7. 下一步

等待用户回答 7 个确认问题后，进入实现阶段。
