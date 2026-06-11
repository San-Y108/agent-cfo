# AgentCFO Landing Page 视觉 overhaul — 总规划

> **Scope**: Landing Page 所有视觉/动效改造
> **Branch**: `feat/console-aceternity-upgrade`
> **Date**: 2026-06-10
> **Status**: 部分已完成，部分待实现
> **核心视觉翻译**: **不要做可爱化 timeline，也不要做普通粒子背景。我要的是 cinematic dark interface：黑色电影级版面、像素化点云、金融绿色能量、轻微 WebGL/SVG displacement 形变、胶片齿孔和烟熏玻璃质感。整体应该像高级技术发布页，不像儿童玩具组件。**

---

## 1. 需求总览

用户提出的 5 个核心需求：

| # | 需求 | 状态 | 说明 |
|---|---|---|---|
| 1 | 电影胶片 Timeline | ✅ 已完成初版，需升级气质 | 当前版本太小、太玩具，需重做为 cinematic editorial section |
| 2 | Team + Timeline 合并 | ✅ 已完成 | 两个 section 已合并为一个模块，删除冗余 heading |
| 3 | Hero 文字粒子/扰乱效果 | ⏳ 待实现 | 极客风格：鼠标抽离、马赛克扰乱、空间波动、炫彩颜色 |
| 4 | 背景纹理模仿 TRAE | ⏳ 待实现 | pixelated particle field / point-cloud background |
| 5 | Footer 空间扰乱效果 | ⏳ 待实现 | displacement distortion / digital tearing on brand text |

---

## 2. 已完成项详情

### 2.1 Team + Timeline 合并（需求 #2）

**改动**:
- `landing-sections.tsx`: Team 和 Timeline 合并为同一个 `<section id="team">`
- `team-showcase.tsx`: 减少底部 padding
- `build-timeline.tsx`: 删除顶部 "Build Timeline" heading，避免冗余

**Commit**: `feat(landing): merge Team + Timeline into single module`

### 2.2 胶片 Timeline 初版（需求 #1，待升级）

**当前状态**:
- `components/landing/build-timeline.tsx`
- 垂直胶卷条 + 胶片齿孔（sprocket holes）
- GSAP ScrollTrigger pin + snap
- 4 个 phase frame

**问题**: 当前版本太小、太玩具、不够 cinematic。需要按 GPT 反馈升级为 **cinematic dark interface** 气质。

---

## 3. 专业术语对照表

来自 GPT 对 TRAE 效果的精确描述：

| 你看到的感觉 | 专业叫法 | 给 Claude Code 的描述 |
|---|---|---|
| 像很多小方块/点组成的空间纹理 | **pixelated particle field / point-cloud background** | 像素化粒子场、点云式背景，不是星空粒子 |
| 鼠标/区域扰动时像空间被撕开 | **displacement distortion / displacement map** | 用位移贴图或噪声扰动元素像素位置 |
| 有水波纹、空气折射感 | **ripple distortion / fluid distortion** | 基于噪声或鼠标位置做波纹形变 |
| 有轻微故障撕裂 | **glitch displacement / digital tearing** | 局部横向错位、scanline、block glitch |
| 背景不是平面，有深度 | **volumetric particle texture / depth field** | 前后层粒子密度不同，带远近虚实 |

**视觉主题定位**:
> **AgentCFO: dark financial command center with emerald particle ledger field, subtle Web3 transaction ripples, and audit-trail distortion.**

---

## 4. 待实现项详情

### 4.1 Hero 文字粒子/扰乱效果（需求 #3）

**目标**: 标题 "Where DAO treasury decisions become executable payment flows" 做极客风格交互效果。

**用户明确要求**:
- 去掉之前的淡黄色荧光效果（✅ 已删除）
- 鼠标滑动到上面有"抽离感"
- "马赛克扰乱"的感觉
- "空间波动"的感觉
- 颜色炫彩，不要单一颜色

**可能方向**:
1. **Mouse-repulsive particle text**: 文字由粒子组成，鼠标靠近粒子被推开
2. **Glitch displacement**: 文字出现数字故障、RGB 分离、局部错位
3. **Pixel sorting / mosaic**: 像素级扰乱和重组
4. **Liquid distortion**: 文字像水面一样波动

**调研报告**: `frontend/docs/plans/hero-geek-particle-research.md`（Agent 正在生成）

---

### 4.2 背景纹理模仿 TRAE（需求 #4）

**目标**: 把当前纯黑首页升级为「高级黑色金融控制台 + 绿色链上粒子场 + 轻微空间撕裂/水波扰动」风格。

**不要做的事**:
- ❌ 不要直接复制 TRAE 的 Logo、文案、品牌图形
- ❌ 不要做成星空粒子、连线网格、圆形泡泡
- ❌ 不要花哨渐变官网
- ❌ 不要变成炫技粒子秀

**要做的事**:
- ✅ 深黑/近黑背景（保持 #0D0D0D 基调）
- ✅ **pixelated particle field / point-cloud texture**: 大量低透明度小方块/点组成不规则流动区域
- ✅ 粒子主要分布在 Hero 中右侧、顶部、底部边缘，**中心保留内容可读性**
- ✅ 主色：灰白粒子为基础，少量 emerald / green finance 粒子作为能量核心
- ✅ **volumetric depth**: 多层 particle layer，远处更暗更小更慢，近处稍亮
- ✅ **displacement distortion**: 鼠标移动时局部粒子产生 ripple / 噪声扰动
- ✅ 可用 SVG `feTurbulence + feDisplacementMap` 或 Canvas 噪声扰动
- ✅ 加 radial mask / vignette，让文字区域保持清晰

**五层结构**:
```
第一层：dark radial-gradient + vignette
第二层：CSS/Canvas pixel particle texture
第三层：emerald energy cluster
第四层：低透明 scanline/noise overlay
第五层：hover 时 SVG displacement / clip-path glitch
```

**实现文件**: `components/landing/AgentCFOBackgroundTexture.tsx`
**接入点**: `components/landing/velorix-hero.tsx`

---

### 4.3 Footer 空间扰乱效果（需求 #5）

**目标**: Landing Footer 的品牌文字 hover 时出现克制的数字撕裂感。

**要求**:
- 不使用 TRAE 字样，使用 AgentCFO / DAO AI CFO 品牌文本
- hover 时 300-500ms 数字撕裂感：
  - horizontal tearing
  - scanline offset
  - slight chromatic/green glow
  - SVG turbulence displacement 或 CSS clip-path 分层错位
- 效果高级、短促、克制
- 不要 cyberpunk 闪屏，不要卡通

**实现路径**:
- SVG filter (`feTurbulence + feDisplacementMap`)
- 或 CSS clip-path + transform 分层错位
- 或轻量 WebGL shader

**实现文件**: `components/landing/distortion-footer-text.tsx`
**接入点**: `components/landing/landing-footer.tsx`

---

### 4.4 Timeline 胶片区块重做（需求 #1 升级）

**当前问题**: "电影胶卷播放风格太小、太玩具、卡通"。

**目标**: 重构为高级电影胶片/影像档案风格，参考 LEGIONS 页面气质：
- cinematic filmstrip timeline
- vertical film reel
- sprocket holes
- editorial dark layout
- glass panel / smoked glass
- large scale, not toy-like
- premium black, subtle grey, emerald accent

**视觉结构**:
1. Timeline 区块整体高度至少接近 **70vh-100vh**，不要小组件化
2. 左侧是大字号 editorial copy：
   - 日期/阶段用小号等宽字体
   - 当前阶段标题大而稳重
   - 描述文字低透明度，像电影海报文案
3. 右侧是大型竖向胶片容器：
   - 宽度大约 34vw - 42vw，移动端改为横向或堆叠
   - 高度大约 60vh - 72vh
   - 两侧有 sprocket holes（胶片齿孔）
   - 容器是黑色半透明、轻微边框、内阴影、vignette（烟熏玻璃质感）
4. 胶片内部展示 4 个阶段卡片
5. 当前 active phase 居中、更亮、更大
6. 上下 phase 在远处变暗、轻微 blur、scale 变小，制造胶片滚动深度
7. 不要使用大号可爱图标。图标只允许极简线性或小型 symbol
8. 不要彩色卡通边框，不要 toy card，不要过圆，不要过亮
9. 动画克制：
   - active phase 切换使用 translateY + opacity + blur + scale
   - 不要弹跳，不要 overshoot，不要 cute easing
   - 使用 `easeOut` / `cubic-bezier` 稳重曲线

**实现文件**: `components/landing/build-timeline.tsx`（重构）

---

## 5. 任务清单

| ID | 任务 | 优先级 | 状态 |
|---|---|---|---|
| 1 | Hero 极客粒子/扰乱效果 | High | ⏳ 等待 Agent 调研报告 |
| 2 | TRAE 风格背景纹理（Hero） | High | ⏳ 待实现 |
| 3 | Timeline 胶片区块重做（cinematic 版） | High | ⏳ 待实现 |
| 4 | Footer displacement / glitch 效果 | Medium | ⏳ 待实现 |
| 5 | Landing Issue 3: Arc 跳过 Workflow | Medium | ⏳ 待修 |
| 6 | Console FlowTimeline 集成 | Low | ⏳ 待集成 |
| 7 | Console RiskGateAnimation 集成 | Low | ⏳ 待集成 |

---

## 6. 技术约束

- 不引入重量级依赖（Three.js/PixiJS 除非项目已存在且必要）
- 优先 SVG filter (`feTurbulence + feDisplacementMap`) 和 CSS
- 所有 Canvas/shader 组件必须 `"use client"`
- 必须做 `prefers-reduced-motion` 降级
- 移动端降低粒子数量或关闭实时扰动
- 每次改动后必须 `pnpm build` 通过
- 不要把所有 CSS 堆进全局文件；优先组件内 className + Tailwind

---

## 7. 验收标准

1. 首屏不再是纯黑，有明显但克制的深色粒子纹理
2. 背景呈现 **pixelated point-cloud / digital finance field**，不是星空、泡泡、网格
3. Logo/Footer hover 有轻微 displacement / glitch tearing / ripple 感
4. Timeline 从"小玩具卡片"升级为"大尺寸电影胶片叙事区块"
5. 整体气质更像高级产品官网/黑色金融控制台，而不是卡通 demo
6. 没有复制 TRAE 的品牌图形或文字
7. 移动端不炸版
8. `prefers-reduced-motion` 可用
9. `pnpm build` 通过

---

## 8. 相关文件

- `frontend/docs/plans/hero-geek-particle-research.md` — Hero 极客粒子方案调研（Agent 生成中）
- `frontend/docs/plans/hero-particle-effect-exploration.md` — Hero 粒子前期调研
- `frontend/docs/plans/trae-effects-integration-plan.md` — TRAE 效果融入方案
- `frontend/docs/plans/landing-page-issues-analysis.md` — Landing Page 4 个 Issue 分析
- `frontend/components/landing/velorix-hero.tsx` — Hero 组件
- `frontend/components/landing/landing-footer.tsx` — Footer 组件
- `frontend/components/landing/build-timeline.tsx` — Timeline 组件（需重构）

---

## 9. 下一步

1. 等待 Hero 极客粒子 Agent 完成调研报告
2. 确认 Timeline 重做的具体视觉方向（是否需要参考图？）
3. 按优先级实现：
   - Task 1: Hero 极客粒子
   - Task 2: TRAE 背景纹理
   - Task 3: Timeline cinematic 重做
   - Task 4: Footer displacement
   - Task 5: Arc 跳过 Workflow bug
   - Task 6-7: Console 动效集成
