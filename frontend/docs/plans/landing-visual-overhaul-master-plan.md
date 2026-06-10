# AgentCFO Landing Page 视觉 overhaul — 总规划

> **Scope**: Landing Page 所有视觉/动效改造
> **Branch**: `feat/console-aceternity-upgrade`
> **Date**: 2026-06-10
> **Status**: 部分已完成，部分待决策/实现

---

## 1. 需求总览

用户提出的 5 个核心需求：

| # | 需求 | 状态 | 说明 |
|---|---|---|---|
| 1 | 胶卷 Timeline 效果 | ✅ 已完成 | BuildTimeline 已改造为 GSAP ScrollTrigger 驱动的垂直胶卷 |
| 2 | Team + Timeline 合并 | ✅ 已完成 | 两个 section 已合并为一个模块，删除冗余 heading |
| 3 | Hero 文字粒子效果 | ⏳ 待实现 | 5 个关键字需要粒子环绕/特效 |
| 4 | 背景纹理模仿 Trae | ⏳ 待实现 | 首页流场粒子网格背景 |
| 5 | Footer 空间扰乱效果 | ⏳ 待实现 | 鼠标驱动的位移扭曲大字 |

---

## 2. 已完成项详情

### 2.1 胶卷 Timeline（需求 #1）

**实现文件**: `components/landing/build-timeline.tsx`

**效果**:
- 垂直胶卷条，两侧有胶片孔洞（CSS repeating-linear-gradient）
- 4 个 phase 各自是一个 frame，带图标
- GSAP ScrollTrigger pin：滚动时 frame 之间切换高亮
- 左侧文字同步切换
- snap 吸附到每个 phase

**Commit**: `feat(landing): film-strip BuildTimeline with GSAP ScrollTrigger`

### 2.2 Team + Timeline 合并（需求 #2）

**改动**:
- `landing-sections.tsx`: Team 和 Timeline 合并为同一个 `<section id="team">`
- `team-showcase.tsx`: 减少底部 padding（`py-24 lg:py-32` → `py-16 lg:py-20`）
- `build-timeline.tsx`: 删除顶部 "Build Timeline" heading，避免冗余

**Commit**: `feat(landing): merge Team + Timeline into single module`

---

## 3. 待实现项详情

### 3.1 Hero 文字粒子效果（需求 #3）

**目标**: 标题 "Where DAO treasury decisions become executable payment flows" 中的 5 个关键字添加粒子特效。

**关键字**:
- DAO
- treasury
- decisions
- executable
- payment flows

**推荐方案**（来自 `hero-particle-effect-exploration.md`）:
- **首选**: Canvas 2D 粒子环绕关键字
- 每个关键字上方覆盖一个小 canvas
- 12-16 个 lime 发光粒子随机漂移 + 向上漂浮
- 生命周期淡入淡出，边界重生
- 不引入新依赖

**决策点**:
1. 是否只在桌面端启用？（推荐：是，移动端回退 text-shadow）
2. 是否保留现有 GSAP 呼吸脉冲？（推荐：替换为粒子发光）
3. 是否叠加霓虹闪烁？（推荐：粒子 + 霓虹闪烁组合）

**实现文件**: `components/landing/hero-keyword-particles.tsx`
**接入点**: `components/landing/velorix-hero.tsx` 的 `HighlightedTitle`

---

### 3.2 背景纹理模仿 Trae（需求 #4）

**目标**: 在 Landing Page 添加 Trae 首页风格的流场粒子网格背景，打破纯黑色的单调。

**视觉参考**（来自 Trae.ai 截图）:
- 黑色背景上布满 tiny squares/dots（2-4px）
- 颜色： mostly white/grey，夹杂 brand-green
- 运动：成群流动、聚散、形成有机波浪纹理
- 整体感：数字沙尘、程序化流动纹理

**专业术语**:
- Flow-field particle system
- Perlin-noise driven particle grid

**推荐方案**:
- Canvas 2D 全屏背景层
- 2000-5000 个小方块粒子
- Perlin/Simplex noise 生成流场向量
- 颜色映射：低速=暗灰，中速=white，高速=AgentCFO lime (#B5FF4D)

**决策点**:
1. 只在 Hero 区域还是全页背景？（推荐：Hero only，避免与下方 section 冲突）
2. 是否保留现有 Hero 视频背景？（推荐：保留视频，粒子叠加在上方低透明度）
3. 粒子数量：轻量 1500 还是震撼 5000？（推荐：桌面 4000，移动端降级 0）
4. 绿色粒子用 Trae 绿 #00D084 还是 AgentCFO lime #B5FF4D？（推荐：#B5FF4D 保持品牌一致）

**实现文件**: `components/landing/flow-field-background.tsx`
**接入点**: `components/landing/velorix-hero.tsx`

---

### 3.3 Footer 空间扰乱效果（需求 #5）

**目标**: 在 Landing Footer 实现 Trae 底部风格的巨大品牌字 + 鼠标扰动扭曲效果。

**视觉参考**:
- 滚动到底部，出现巨大 "AgentCFO" 字样
- 鼠标移入时，文字像水面一样被扰动
- 波纹、撕裂、像素偏移、空间撕开又复原的错觉

**专业术语**:
- Mouse-driven displacement distortion
- WebGL displacement map
- Liquid distortion on text

**推荐方案**:
- WebGL Canvas + Fragment Shader
- 将 "AgentCFO" 渲染为纹理
- Shader 根据鼠标位置计算 UV 位移
- 添加轻微 chromatic aberration（RGB 分离）增强撕裂感
- 不引入 Three.js 依赖（直接用 WebGL API）

**决策点**:
1. Footer 大字内容是什么？（推荐：AgentCFO）
2. 文字颜色？（推荐：lime #B5FF4D 或 white）
3. 扭曲强度？（推荐：中等，鼠标越近扭曲越强）
4. 是否带色差效果？（推荐：轻微 RGB split）
5. 移动端如何降级？（推荐：静态大字，无 shader）

**实现文件**: `components/landing/distortion-footer-text.tsx`
**接入点**: `components/landing/landing-footer.tsx`

---

## 4. 任务清单

| ID | 任务 | 优先级 | 依赖 | 状态 |
|---|---|---|---|---|
| 1 | Hero 关键字粒子效果实现 | High | 用户确认方案 | ⏳ |
| 2 | Trae 流场粒子背景（Hero） | High | 用户确认位置和数量 | ⏳ |
| 3 | Footer 位移扭曲大字 | Medium | 用户确认内容和强度 | ⏳ |
| 4 | Landing Issue 3: Arc 跳过 Workflow | Medium | 无 | ⏳ |
| 5 | Console FlowTimeline 集成 | Low | 无 | ⏳ |
| 6 | Console RiskGateAnimation 集成 | Low | 无 | ⏳ |

---

## 5. 决策矩阵（等用户/GPT 确认）

### Hero 粒子效果
- [ ] 仅桌面端启用？（推荐：是）
- [ ] 替换 GSAP 脉冲还是叠加？（推荐：替换）
- [ ] 是否加霓虹闪烁？（推荐：加）

### Trae 背景纹理
- [ ] Hero only 还是全页？（推荐：Hero only）
- [ ] 是否保留视频背景？（推荐：保留 + 粒子叠加）
- [ ] 粒子数量 1500 / 3000 / 5000？（推荐：桌面 4000）
- [ ] 品牌色用 #B5FF4D 还是 #00D084？（推荐：#B5FF4D）

### Footer 扭曲
- [ ] 文字内容：AgentCFO / AGENTCFO / 其他？
- [ ] 文字颜色：lime / white / black？
- [ ] 扭曲强度：弱 / 中 / 强？（推荐：中）
- [ ] 是否带 RGB 色差？（推荐：轻微）

---

## 6. 相关文件

- `frontend/docs/plans/hero-particle-effect-exploration.md` — Hero 粒子方案详细调研
- `frontend/docs/plans/trae-effects-integration-plan.md` — Trae 效果融入方案
- `frontend/docs/plans/landing-page-issues-analysis.md` — Landing Page 4 个 Issue 分析
- `frontend/components/landing/velorix-hero.tsx` — Hero 组件（需要改）
- `frontend/components/landing/landing-footer.tsx` — Footer 组件（需要改）
- `frontend/components/landing/build-timeline.tsx` — 胶卷 timeline（已完成）
- `frontend/components/landing/team-showcase.tsx` — Team 展示（已完成）

---

## 7. 技术约束

- 不引入 Three.js（除非用户明确要求）
- 所有 Canvas/shader 组件必须 `"use client"`
- 必须做 `prefers-reduced-motion` 降级
- 移动端需要性能降级或回退
- 每次改动后必须 `pnpm build` 通过

---

## 8. 下一步

1. 用户与 GPT 讨论上述决策点
2. 确认方案后，按优先级从高到低实现：
   - Task 1: Hero 关键字粒子
   - Task 2: Trae 流场背景
   - Task 3: Footer 扭曲大字
   - Task 4: Arc 跳过 Workflow bug
   - Task 5-6: Console 动效集成
