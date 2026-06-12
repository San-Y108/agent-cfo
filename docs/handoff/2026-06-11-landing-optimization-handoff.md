# Handoff — AgentCFO Landing Page 区域优化

> **From**: 调研/规划层 Claude Code Session  
> **To**: 执行层 Claude Code Session  
> **Date**: 2026-06-11 22:24  
> **Branch**: `feat/console-aceternity-upgrade`  
> **Scope**: 落地页首页 `/` 的 5 个区域优化（不含 Console 路由页）  

---

## 1. Handoff 摘要

本 Session 完成了 Landing Page 优化需求的深入调研，并将结果整理为：

1. **调研报告**: `docs/reports/2026-06-11-2224-landing-optimization-research.md`
2. **执行 Checklist**: `frontend/docs/plans/landing-optimization-checklist.md`

执行层 Claude 可直接基于本 Handoff 和上述两份文档进入代码实现阶段。当前页面结构、问题根因、优先级、验收标准均已明确。

---

## 2. 任务背景

AgentCFO 是一个面向 Web3 DAO 的 AI CFO 产品官网。当前落地页已具备较完整的结构和动效（Hero 视频、GSAP scroll、Framer Motion 3D tilt、Canvas 粒子、胶片 Timeline 等），但用户希望针对以下 5 个区域进行视觉和交互优化：

- **TransactionMarquee**（交易滚动条）：占位太厚，缺乏链式语义
- **Web3NodeCloud**（节点云星座图）：发灰偏暗，且与 Team 星座创意冲突
- **PipelineEditorial**（五阶段流程）：布局单调，需要错落排布和过渡动效
- **FAQ**：静态平淡，需要重点优化动效和排版
- **其他**：视频区预留；Team 与 Timeline 保持独立

---

## 3. 当前状态

### 3.1 已完成的调研

- 已读取首页入口 `frontend/app/page.tsx` 及所有 landing 组件
- 已定位各区域问题根因
- 已梳理历史资产（未使用组件 `pipeline-showcase.tsx`、`pretext-repel-text.tsx` 等）
- 已确认技术栈：Next.js 16 + React 19 + Tailwind CSS v4 + Framer Motion + GSAP + lucide-react

### 3.2 已创建的文档

| 文档 | 路径 | 用途 |
|---|---|---|
| 调研报告 | `docs/reports/2026-06-11-2224-landing-optimization-research.md` | 详细问题分析、根因、建议方向 |
| 执行 Checklist | `frontend/docs/plans/landing-optimization-checklist.md` | 可勾选的任务清单、优先级、验收标准 |
| 本 Handoff | `docs/handoff/2026-06-11-landing-optimization-handoff.md` | 交接上下文与执行指南 |

### 3.3 尚未确定的前置事项

执行前需向用户确认：

1. **R1 TransactionMarquee 方向**：链环水平流 vs 命令行 Ticker
2. **R2 Web3NodeCloud 截图**：用户承诺提供实际渲染截图
3. **R2 星云重构方向**：协议栈 / 护盾环 / 数据流 / 抽象网格
4. **R4 FAQ 风格**：终端手风琴 vs 其他方案
5. **Demo 视频 URL**：GuardrailsCTA 右侧是否已有最终视频

---

## 4. 已确认的优化需求

### R1 — TransactionMarquee 创新设计

**问题**：当前是全宽横向矩形卡片滚动，占位厚、语义弱、像"灰带子"。

**目标**：
- 改成链环/纽带环环相扣的形态
- 更细长、占位更小
- 保留无限滚动和信息密度

**推荐方向**：
- **方案 A（推荐）**：链环水平流 — 每个交易是圆角 pill，之间用短线/链节连接
- **方案 B**：单行命令行 Ticker — 像 `tail -f` 系统日志

**关键文件**：
- `frontend/components/landing/transaction-marquee.tsx`
- `frontend/app/globals.css`

---

### R2 — Web3NodeCloud 色彩修复 + 星云重构

**问题**：
- 背景使用 `rgba(255,255,255,0.12) → transparent` 渐变 + `backdrop-blur-md`，在 `#0D0D0D` 上发灰
- 与右侧 `CardSplitter`（`bg-neutral-900/80`）的深色实底不协调
- 与下方 `TeamShowcase` 的星座/节点/连线创意撞型

**目标**：
- 修复发灰偏暗
- 重构星云视觉，避免与 Team 星座重复
- 与左侧 HolographicCard、右侧 CardSplitter 质感统一

**修复要点**：
- 背景改为 `neutral-900/80` 或 `#141414` 实色/深渐变
- 降低/移除 `backdrop-blur-md`
- border 从 `white/25` 降至 `white/12` 或 `white/15`
- 星云形态可选：协议栈、护盾环、数据流、抽象网格

**关键文件**：
- `frontend/components/landing/web3-node-cloud.tsx`
- `frontend/components/landing/landing-sections.tsx`

---

### R3 — PipelineEditorial 错落布局 + 平滑过渡

**问题**：当前 `max-w-4xl mx-auto` 居中垂直堆叠，右侧导航 `fixed right-5` 贴边，布局单调。

**目标**：
- 文字整体往左放
- Stage 错落排布：1、3 偏左，2、4 偏右
- 右侧导航栏偏左，绑定内容容器右边缘
- 相邻 stage 滑动时有平滑渐变过渡

**实现要点**：
- 容器从 `mx-auto` 改为左侧偏移（如 `lg:ml-[8vw]`）
- 奇数 stage `pl-0`，偶数 stage `pl-12` 或 `ml-16`
- 导航改为 `right-auto left-[calc(50%+420px)]`
- 过渡：垂直渐变进度线 或 背景色从青到紫的缓慢过渡 或 GSAP cross-fade

**关键文件**：
- `frontend/components/landing/pipeline-editorial.tsx`
- `frontend/components/landing/pipeline-stage-data.ts`
- `frontend/components/landing/pipeline-data-snippets.tsx`
- `frontend/components/landing/pipeline-showcase.tsx`（旧版参考：水平 pin + 奇偶布局）

---

### R4 — FAQ 重点优化

**问题**：当前是 3 个静态卡片，无展开/收起、无序号、无图标、无动效、无分类色彩。

**目标**：
- 重点优化，与上方元素形成区分度
- 利用 Framer Motion / GSAP 等动效资产
- 创新设计和排版

**推荐方向**：
- **终端风格手风琴**（推荐）：`> question` / `$ answer`，点击展开，与 `DataSnippet`、GuardrailsCTA 视频区统一

**实现要点**：
- 使用 `AnimatePresence` 做高度展开动画
- 添加 01/02/03 编号和分类图标
- pill 标签彩色化
- hover 时左侧 accent 竖线 + border 高亮
- 入场 stagger 动画

**关键文件**：
- `frontend/components/landing/faq-section.tsx`
- `frontend/components/landing/hsm-monitor.tsx`
- `frontend/lib/i18n/dict.ts`

---

### R5 — 其他调整

- **R5.1 GuardrailsCTA 右侧视频区**：`DEMO_VIDEO_SRC = ""` 已预留，替换 URL 即可
- **R5.2 TeamShowcase 与 BuildTimeline**：当前已是独立 section，保持分开，无需改动

**关键文件**：
- `frontend/components/landing/guardrails-cta.tsx`
- `frontend/components/landing/team-showcase.tsx`
- `frontend/components/landing/build-timeline.tsx`

---

## 5. 执行优先级

| 优先级 | 任务 | 理由 |
|---|---|---|
| **P0** | R2 Web3NodeCloud 底色修复 | 改动小，立竿见影，解决明显视觉 bug |
| **P1** | R4 FAQ 手风琴重构 | 视觉提升最大，统一 terminal/cyber 语言 |
| **P1** | R1 TransactionMarquee 链环化 | 改善 Hero→Platform 过渡，强化主题语义 |
| **P2** | R3 Pipeline 错落布局 | 纯样式调整，改善阅读节奏 |
| **P2** | R3 Pipeline 相邻渐变过渡 | 需要动效设计，提升高级感 |
| **P3** | R5.1 视频替换 | 只需替换 URL |
| **P3** | R5.2 保持 Team/Timeline 独立 | 无需改动 |

---

## 6. 技术约束与规范

### 6.1 技术栈

- Next.js 16 (App Router)
- React 19
- TypeScript strict
- Tailwind CSS v4
- Framer Motion
- GSAP (@gsap/react + ScrollTrigger)
- lucide-react（页面主要图标库）

### 6.2 代码规范

- 所有新增客户端动效组件必须 `"use client"`
- 优先使用 Tailwind className + 组件内 style，不要把所有 CSS 堆进 `globals.css`
- 颜色优先使用 theme token，减少硬编码
- 所有动效必须实现 `prefers-reduced-motion` 降级
- 移动端需做响应式适配
- 每次改动后必须 `pnpm typecheck` 和 `pnpm build`

### 6.3 安全边界

- 不要修改 `frontend/` 以外的文件
- 不要修改后端 `app/`
- 不要修改 `.claude/` 或 workflow 配置
- 不要引入重量级新依赖（如 Three.js/PixiJS）除非用户明确授权
- 不要删除/覆盖未确认的文件

---

## 7. 风险与注意事项

### 7.1 Web3NodeCloud

- 修改底色时注意不要破坏节点 hover 发光效果（深色实底反而能衬托发光）
- 重构星云时避免与 `TeamShowcase` 的星座/节点/连线形态重复
- 用户承诺提供截图，建议拿到截图后再最终定稿

### 7.2 PipelineEditorial

- 错落布局时要注意不要和右侧固定的 `StageSideNav` 重叠
- 导航左移后，要确保在常见屏幕宽度（1440px、1920px）下不遮挡内容
- `StageSideNav` 的 `IntersectionObserver` 逻辑可能需要随布局调整而微调

### 7.3 FAQ

- `FAQSection` 与 `HSMMonitor` 并排放置在 `md:grid-cols-5` 布局中（FAQ 占 3 列，HSM 占 2 列）
- 改造时不要破坏这个 grid 比例
- 如果使用手风琴，要确保展开后不会把 HSM 推得太远

### 7.4 TransactionMarquee

- 无限滚动动画要注意性能，避免大量 DOM 节点
- 链环/纽带设计不要过度复杂，保持信息可读
- hover 暂停是可选功能，视实现复杂度决定是否保留

---

## 8. 验收标准

### 功能验收

- [ ] 首页所有 section 正常渲染，无报错
- [ ] 导航锚点跳转正常
- [ ] FAQ 手风琴可展开/收起
- [ ] TransactionMarquee 无限滚动正常
- [ ] Pipeline StageSideNav 点击可跳转对应 stage
- [ ] `prefers-reduced-motion` 下动画正确降级

### 视觉验收

- [ ] Web3NodeCloud 不发灰、不偏暗，与右侧 CardSplitter 协调
- [ ] Web3NodeCloud 与 TeamShowcase 视觉形态有明显区分
- [ ] FAQ 区域与上方元素有区分度
- [ ] TransactionMarquee 占位更细长，有链环/纽带感
- [ ] Pipeline 错落排布在桌面端阅读流畅，移动端不炸版

### 代码验收

- [ ] `pnpm typecheck` 零错误
- [ ] `pnpm build` 成功
- [ ] 无 console error/warning
- [ ] 新增动效组件实现 `prefers-reduced-motion` 降级
- [ ] 不引入重量级新依赖
- [ ] 颜色值优先使用 theme token

---

## 9. 下一步行动

1. **确认前置事项**：向用户确认 R1/R2/R4 方向和 R2 截图
2. **按优先级执行**：建议从 P0（R2 Web3NodeCloud）开始
3. **每完成一个区域**：运行 `pnpm typecheck` + `pnpm build`，更新 Checklist 勾选状态
4. **最终验收**：全部完成后截图对比，更新 `landing-optimization-checklist.md` 执行日志

---

## 10. 相关文件索引

| 类型 | 路径 | 说明 |
|---|---|---|
| 调研报告 | `docs/reports/2026-06-11-2224-landing-optimization-research.md` | 详细调研 |
| 执行 Checklist | `frontend/docs/plans/landing-optimization-checklist.md` | 任务清单 |
| 本 Handoff | `docs/handoff/2026-06-11-landing-optimization-handoff.md` | 交接文档 |
| 首页入口 | `frontend/app/page.tsx` | 页面结构 |
| 交易滚动条 | `frontend/components/landing/transaction-marquee.tsx` | R1 |
| 节点云 | `frontend/components/landing/web3-node-cloud.tsx` | R2 |
| Pipeline | `frontend/components/landing/pipeline-editorial.tsx` | R3 |
| Pipeline 数据 | `frontend/components/landing/pipeline-stage-data.ts` | R3 |
| Pipeline Snippet | `frontend/components/landing/pipeline-data-snippets.tsx` | R3 |
| 旧版 Pipeline | `frontend/components/landing/pipeline-showcase.tsx` | R3 参考 |
| FAQ | `frontend/components/landing/faq-section.tsx` | R4 |
| HSM | `frontend/components/landing/hsm-monitor.tsx` | R4 并置 |
| GuardrailsCTA | `frontend/components/landing/guardrails-cta.tsx` | R5.1 |
| Team | `frontend/components/landing/team-showcase.tsx` | R5.2 |
| Timeline | `frontend/components/landing/build-timeline.tsx` | R5.2 |
| 全局样式 | `frontend/app/globals.css` | token / marquee animation |

---

*Handoff 完成。执行层 Claude 可基于本文档和 Checklist 直接进入实现阶段。*
