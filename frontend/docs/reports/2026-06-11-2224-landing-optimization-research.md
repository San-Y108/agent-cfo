# AgentCFO 落地页优化需求调研报告

> 调研范围：frontend `app/page.tsx` 及其引用的所有 landing 组件  
> 调研时间：2026-06-11 22:24  
> 调研方式：源码静态分析 + 组件依赖梳理 + 历史资产排查  

---

## 摘要

本次调研围绕用户提出的 5 项优化需求展开，重点排查了交易滚动条、节点云星座图、Pipeline 五阶段流程区、FAQ 区域等模块的当前实现与问题根因。结论如下：

1. **TransactionMarquee**：当前为全宽横向矩形卡片滚动，占位厚、语义弱；可改造为链环/纽带形态，与区块链交易主题更契合。
2. **Web3NodeCloud**：发灰根因已定位——背景使用白色半透明渐变 + `backdrop-blur-md`，在深色底上混合出中灰色；且与右侧 CardSplitter 的深色实底不统一。需要重构底色与星云视觉语言。
3. **PipelineEditorial**：当前为居中垂直堆叠；实现错落排布（1/3 左、2/4 右）和侧边导航左移均为低复杂度样式调整，相邻 stage 的平滑过渡可用 GSAP/Framer Motion 实现。
4. **FAQ**：当前为静态卡片列表，无交互、无动效、无层次；建议改造为终端风格手风琴，与页面其他 terminal/cyber 元素统一。
5. **其他**：右侧视频区已预留占位（`DEMO_VIDEO_SRC = ""`）；Team 与 Timeline 保持独立符合当前代码结构。

---

## 1. 首页结构确认

入口文件：`frontend/app/page.tsx`

```tsx
<div className="dark bg-black relative">
  <GlobalParticleBackground />   // 全局固定 Canvas 粒子背景
  <VelorixHero />                // Hero + Navbar
  <TransactionMarquee />         // 交易滚动条
  <LandingSections />            // 下方所有 section
</div>
```

`LandingSections` 内部顺序：

| 顺序 | Section | 组件 | 锚点 |
|---|---|---|---|
| 1 | Platform 展示 | HolographicCard + Web3NodeCloud + CardSplitter | `#platform` |
| 2 | Pipeline 流程 | PipelineEditorial | `#workflow` |
| 3 | Guardrails CTA | GuardrailsCTA | `#guardrails` |
| 4 | 团队展示 | TeamShowcase | `#team` |
| 5 | 构建时间线 | BuildTimeline | `#timeline` |
| 6 | FAQ + HSM | FAQSection + HSMMonitor | `#faq` |
| 7 | 页脚 | LandingFooter | - |

页面整体为暗色 Ramp/Velorix 风格，品牌色 `#B5FF4D`（酸橙绿），主字体 Inter/Geist，等宽字体 Geist Mono/'Courier New'。

---

## 2. 用户需求汇总

| 编号 | 区域 | 需求 | 约束/备注 |
|---|---|---|---|
| R1 | TransactionMarquee | 创新设计方案，不要用原宽幅横向曲面卡片滚动 | 倾向于纽带/链条环环相扣；更细长、占位更小 |
| R2 | Web3NodeCloud | 解决排版和色彩渲染问题（发灰、偏暗） | 与下方 TeamShowcase 的星座/节点创意冲突，需重构星云 |
| R3 | PipelineEditorial | 新方案错落排布：1/3 偏左，2/4 偏右 | 相邻 stage 滑动时有平滑渐变过渡；右侧导航栏偏左 |
| R4 | FAQ | 重点优化，利用 Framer Motion / GSAP 等动效资产 | 创新设计和排版，与上方元素形成区分度 |
| R5 | 其他 | 右侧视频区预留位置；Demo Showcase 与 Timeline 保持分开 | - |

---

## 3. 逐个问题排查

### 3.1 TransactionMarquee（交易滚动条）

#### 当前实现

- 文件：`frontend/components/landing/transaction-marquee.tsx`
- 结构：全宽容器 + 复制一份 item 数组 + CSS `translateX(-50%)` 无限滚动
- 样式：`border-y py-4 bg-white/[0.05] border-white/12`，两侧 `#0D0D0D` 渐变遮罩
- 动画：`animate-marquee` 25s linear infinite
- 每条 item：横向 inline-flex 矩形信息条，包含 sender / action / status badge / amount / time / dot

#### 问题根因

1. **形态语义弱**：当前是"信息云/标签条"，没有体现出区块链交易、审计日志的"链式"语义。
2. **占位过厚**：`mb-24` + 全宽 + `py-4` + 上下 border，在 Hero 和 Platform 之间形成了一条很宽的"灰带子"，打断了页面节奏。
3. **视觉重量不均**：两侧大渐变遮罩 + 半透明背景，让整段显得"浮"而"灰"。

#### 可行方案

| 方案 | 核心思路 | 复杂度 | 与主题契合度 |
|---|---|---|---|
| A. 链环水平流 | 每个交易块变成圆角 pill，之间用短线/链节连接，整体像一条细链条横向滚动 | 低 | 高 |
| B. 命令行 Ticker | 极细单行 terminal 状态条，类似系统日志 tail -f | 低 | 高 |
| C. 3D 圆柱 Carousel | item 贴在虚拟圆柱面上，滚动产生透视景深 | 中 | 中 |
| D. DNA 双螺旋 | 两行状态流反向滚动，形成螺旋 | 中 | 中 |
| E. 扁平轨道 Orbit | 交易沿椭圆轨道缓慢移动，近大远小 | 中高 | 中 |

**推荐**：方案 A（链环）或方案 B（命令行 Ticker）。方案 A 最能满足"纽带/链条环环相扣"的设想；方案 B 能把占位压到最小，与整体 cyber/terminal 风格高度统一。也可两者结合：链环外形 + terminal 内容。

---

### 3.2 Web3NodeCloud（节点云星座图）

#### 当前实现

- 文件：`frontend/components/landing/web3-node-cloud.tsx`
- 结构：左侧文案（300-340px）+ 右侧星座图（400×340）
- 背景样式（第 364-370 行）：

```tsx
className="relative w-full overflow-hidden rounded-2xl border border-white/25 p-6 lg:p-8 backdrop-blur-md shadow-2xl"
style={{
  background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.02) 100%)",
}}
```

- 内部：SVG 连线 + 中心 Cobo 核心 + 8 个外围节点 + nebula particles + 鼠标 parallax

#### 问题根因

1. **白色半透明渐变导致发灰**
   - 顶部 `rgba(255,255,255,0.12)` 与 `#0D0D0D` 背景混合后，产生明显的中灰色。
   - 这就是用户感知到的"上半部分发灰"的直接原因。

2. **`backdrop-blur-md` 柔化背景粒子**
   - 后方 `GlobalParticleBackground` 是白/绿小粒子，经 blur 后变成朦胧灰雾，进一步加重"灰蒙蒙"感。

3. **与右侧 CardSplitter 色彩语言不统一**
   - CardSplitter 使用 `bg-neutral-900/80`（深灰偏蓝黑），视觉上是"实"的。
   - Web3NodeCloud 使用 white/12 渐变 + blur，视觉上是"雾"的。
   - 两者并置时，一个深、一个灰，边缘和重量完全不相称。

4. **创意与 TeamShowcase 冲突**
   - TeamShowcase 也使用了"节点/星座/连线/光环"的视觉语言（中心导师 + 5 个成员节点 + SVG 连线）。
   - Web3NodeCloud 在页面上方先出现了"协议节点云"，下方 Team 又出现"人脉节点云"，两者概念不同但视觉形态相似，造成重复和混淆。

#### 修复方向

1. **重构底色**：将背景从 white 渐变改为 `neutral-900/80` 或 `#141414` 实色/深渐变，移除或减弱 blur。
2. **统一边缘语言**：将 border 从 `white/25` 降至 `white/12` 或 `white/15`，与 HolographicCard/CardSplitter 对齐。
3. **重构星云视觉**：
   - 若保留"网络/协议栈"概念，可改为更抽象的"数据流/拓扑图"或"轨道环"，避免与 Team 的星座图撞型。
   - 或改为"安全信任层"的可视化：同心圆、护盾环、HSM 层叠等，与 CAW/安全主题更相关。
   - 或改为纯信息图表（icon grid + 连线），减少装饰性粒子。
4. **提升亮度**：节点本身颜色（蓝/绿/橙/紫）没问题，需要深色实底来衬托其发光效果。

---

### 3.3 PipelineEditorial（五阶段流程区）

#### 当前实现

- 文件：`frontend/components/landing/pipeline-editorial.tsx`
- 结构：PipelineIntro + 5 个 PipelineStage 垂直堆叠 + StageSideNav 固定右侧
- 内容容器（第 554 行）：`max-w-4xl mx-auto px-6 py-12`
- 侧边导航（第 250 行）：`fixed right-5 top-1/2 z-40`
- 动效：每个 stage 进入视口时 GSAP fade-in + translateY

#### 用户需求拆解

| 需求 | 当前状态 | 实现方式 |
|---|---|---|
| 错落排布：1/3 左，2/4 右 | 所有 stage 居中对齐 | 给奇数/偶数 stage 加不同 `margin-left`/`padding-left`，如奇数 `ml-0`、偶数 `ml-16` |
| 文字整体往左 | `mx-auto` 居中 | 容器改为 `ml-[8vw]` 或 `mx-0 lg:ml-[12%]` |
| 右侧导航栏偏左 | `right-5` 贴边 | 改为绑定内容容器右边缘，如 `right-auto left-[calc(50%+420px)]` |
| 相邻 stage 平滑渐变过渡 | 当前是离散 fade-in | 可在 stage 之间加入共享的渐变背景带/进度线，或用 GSAP 做 cross-fade/横向滑动 |

#### 需要注意的问题

1. **避免与 StageSideNav 重叠**：内容左移后，右侧空间变大，导航应同步左移至内容容器右侧附近，而不是继续贴边。
2. **错落不要破坏阅读流**：1/3 左、2/4 右形成锯齿状，但要保证移动端回退为单列居中。
3. **平滑过渡的实现**：
   - 简单方案：stage 进入/离开时做 opacity + y 的交叉淡化。
   - 进阶方案：在两 stage 之间加一条垂直的渐变 progress line，颜色随当前 stage 变化。
   - 高阶方案：整个 Pipeline 区域做一个 long scroll，背景色/渐变缓慢从 stage 1 的青色过渡到 stage 5 的紫色。

#### 历史资产参考

仓库中存在一个旧版 `pipeline-showcase.tsx`（当前未使用），它实现了：
- GSAP ScrollTrigger pin + 水平横向滚动
- 5 个 stage 面板占满视口
- progress bar + stage counter + dots indicator
- 奇偶 panel 左右交替布局（`isEven` 判断）

该组件虽然被废弃，但其"奇偶交替"布局和"stage 计数器"设计可作为 PipelineEditorial 错落排布的参考。

---

### 3.4 FAQ 区域

#### 当前实现

- 文件：`frontend/components/landing/faq-section.tsx`
- 结构：标题 + 副标题 + 3 个静态卡片垂直堆叠
- 样式：

```tsx
className="p-5 border rounded-xl transition-colors relative group border-white/12 bg-white/[0.04] hover:bg-white/[0.07]"
```

- 每个卡片：question（标题行）+ pill（右侧标签）+ answer（正文）
- 无展开/收起、无图标、无序号、无分类、无入场动效

#### 问题根因

1. **零交互**：用户只能阅读，无法操作，信息密度固定。
2. **零动效**：页面其他区域大量使用 GSAP/Framer Motion，FAQ 完全没有动画，显得"死"。
3. **视觉层次弱**：pill 和标题同处一行但没有颜色变化；3 个卡片外观完全一致。
4. **与 HSMMonitor 并置失衡**：HSM 有 grid、load bar、pulse dot、border 层次，FAQ 只是一段文字卡片。

#### 优化方向

| 方向 | 做法 | 效果 |
|---|---|---|
| 手风琴 Accordion | 点击展开答案，其他收起 | 降低默认信息密度，增加交互 |
| 终端日志风格 | 把 Q/A 做成 `> question` / `$ answer` 终端行 | 与 DataSnippet、GuardrailsCTA 视频区统一 |
| 编号 + 图标 | 加 01/02/03 编号和分类图标 | 增加扫描感 |
| Hover 高亮 | 悬停时左侧 accent 竖线 + border 高亮 | 增加 micro-motion |
| 分类标签彩色化 | SECURED / POLICY ENFORCED / CROSS-CHAIN READY 用不同颜色 badge | 增加色彩层次 |
| 展开动效 | Framer Motion `AnimatePresence` + height auto | 流畅的展开/收起 |

**推荐**：采用"终端风格手风琴"，配合 `AnimatePresence` 展开动效。这样既能解决"没亮点"的问题，又能与 Pipeline 里的 `DataSnippet`、Guardrails 里的 terminal video card 形成统一的 cyber-terminal 视觉语言。

---

### 3.5 其他调整

#### 右侧视频区

- 文件：`frontend/components/landing/guardrails-cta.tsx`
- 当前状态：已预留视频位置，`DEMO_VIDEO_SRC = ""`
- 当前显示：终端窗口风格的占位界面，含 grid 背景、扫描线、播放按钮、浮动 audit chips
- 结论：视频位置已预留，只需用户提供最终视频 URL 替换常量即可。

#### Demo Showcase 与 Timeline 保持分开

- 当前代码中两者是独立 section，无合并逻辑。
- TeamShowcase 使用星座/节点/连线视觉。
- BuildTimeline 使用电影胶片/ScrollTrigger pin 视觉。
- 结论：保持分开符合当前代码结构，无需额外改动。

---

## 4. 历史资产与可复用组件

仓库 `frontend/components/landing/` 中存在若干未使用组件，可作为优化参考：

| 组件 | 文件 | 内容 | 可复用性 |
|---|---|---|---|
| PipelineShowcase | `pipeline-showcase.tsx` | GSAP 水平 pin scroll，5 个全屏 stage，奇偶左右交替 | 可参考其奇偶布局和 stage counter/dot indicator |
| PretextRepelText | `pretext-repel-text.tsx` | 使用 `@chenglou/pretext` 实现文字粒子采样 + 鼠标排斥 | 可作为 hero 标题或 FAQ 标题的动效参考；注意 Pretext 依赖已安装 |
| AgentCFOBackgroundTexture | `agentcfo-background-texture.tsx` | 另一版全局 Canvas 粒子背景 | 当前被 GlobalParticleBackground 替代，可忽略 |

---

## 5. 优化优先级建议

按"视觉影响 / 实施难度"排序：

| 优先级 | 区域 | 理由 | 大致工作量 |
|---|---|---|---|
| P0 | Web3NodeCloud 底色修复 | 改底色即可立竿见影，解决发灰问题 | 小 |
| P1 | FAQ 手风琴重构 | 视觉提升最大，能与整体 cyber 风格统一 | 中 |
| P2 | TransactionMarquee 链环化 | 需要新视觉设计，但能显著改善 Hero→Platform 的过渡 | 中 |
| P3 | PipelineEditorial 错落布局 | 纯样式调整，能改善阅读节奏 | 小 |
| P4 | Pipeline 相邻 stage 渐变过渡 | 需要 GSAP/Framer 动效设计 | 中 |
| P5 | 右侧视频替换 | 只需替换 `DEMO_VIDEO_SRC` | 极小 |

---

## 6. 下一步建议

1. **等待用户截图**：针对 Web3NodeCloud 的发灰问题，虽然根因已定位，但实际渲染效果（特别是不同屏幕/浏览器下的表现）需要截图确认。
2. **确定 TransactionMarquee 方向**：在"链环水平流"和"命令行 Ticker"之间选择，或提供两者草图对比。
3. **FAQ 设计稿**：先输出 terminal accordion 的低保真结构，确认后再实现。
4. **Pipeline 错落方案**：先做一个纯 CSS 的 rapid prototype，验证 1/3 左、2/4 右的阅读体验。
5. **视频素材**：向物料团队确认 demo 视频 URL 和 poster 帧。

---

## 附录：关键文件清单

- `frontend/app/page.tsx` — 首页入口
- `frontend/components/landing/transaction-marquee.tsx` — 交易滚动条
- `frontend/components/landing/web3-node-cloud.tsx` — 节点云星座图
- `frontend/components/landing/pipeline-editorial.tsx` — 五阶段流程区
- `frontend/components/landing/pipeline-stage-data.ts` — 五阶段数据
- `frontend/components/landing/faq-section.tsx` — FAQ
- `frontend/components/landing/guardrails-cta.tsx` — 右侧视频区
- `frontend/components/landing/pipeline-showcase.tsx` — 旧版 Pipeline（未使用）
- `frontend/components/landing/pretext-repel-text.tsx` — 旧版文字排斥（未使用）
- `frontend/app/globals.css` — 全局样式与 token
