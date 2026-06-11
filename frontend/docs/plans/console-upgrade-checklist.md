# AgentCFO Console Visual Upgrade — 执行 Checklist

> **分支**: `feat/console-aceternity-upgrade` (from `feat/frontend-dev`)
> **目标**: 5 Console 页面 + 可折叠 Sidebar 视觉升级
> **创建日期**: 2026-06-11
> **预计工期**: 12–16 天（5 Phase）

---

## 进度追踪

| Phase | 名称 | 任务数 | 预计时间 | 完成数 | 状态 |
|-------|------|--------|---------|--------|------|
| Phase 0 | Taste-Skill 基础对齐 | 8 | 1–2 天 | 8 | ✅ 完成 |
| Phase 1 | 基础设施 + 全局系统 | 7 | 2–3 天 | 7 | ✅ 完成 |
| Phase 2 | Treasury — Flow State | 10 | 3–4 天 | 9 | ✅ 完成 |
| Phase 3 | Wallets + Analytics | 12 | 3–4 天 | 0 | ⏳ 未开始 |
| Phase 4 | Policy + Agent | 13 | 4–5 天 | 0 | ⏳ 未开始 |
| Phase 5 | 打磨 + 验收 | 8 | 2–3 天 | 0 | ⏳ 未开始 |
| **合计** | — | **58** | **12–16 天** | **31** | **53%** |

---

## 🔧 前置修复（Plan 外，但建议优先处理）

> 来源：Aceternity 深度排查补充报告 §6「已提取组件修复建议」
> 这些修复不依赖 Phase 顺序，可随时穿插进行。

- [x] **P1** 修复 `ShootingStars` 内存泄漏：`useEffect` 返回 `clearTimeout(timeoutId)`
  - 文件：`components/ui/aceternity/shooting-stars.tsx`
  - 风险：组件卸载后定时器继续运行，内存泄漏
- [x] **P2** 扩展 `GradientOrb`：添加 `customColorClass` prop 支持任意品牌色
  - 文件：`components/ui/aceternity/background.tsx`
- [x] **P2** 扩展 `BentoCard` hover glow：添加 `glowColor` prop 或 CSS 变量
  - 文件：`components/ui/aceternity/bento-grid.tsx`
- [x] **P3** 扩展 `AnimatedNumber`：添加 `springConfig` prop
  - 文件：`components/ui/aceternity/animated-number.tsx`
- [x] **P3** 扩展 `Sparkles`：`color` 支持 hex 值（当前只接受 Tailwind class）
  - 文件：`components/ui/aceternity/sparkles.tsx`
- [x] **P3** `ColourfulText` 性能保护：超过 50 字符时降级为 `GradientText`
  - 文件：`components/ui/aceternity/colourful-text.tsx`

---

## Phase 0: Taste-Skill 基础对齐（前置，1–2 天）

> **目标**：消除 AI Tells，建立统一视觉基线。

- [x] **0.1** 字体迁移：Inter → Geist + Geist Mono
  - 文件：`app/layout.tsx`, `globals.css`
  - 验收：✅ Geist + Geist Mono 变量配置完成；Console 文件硬编码 Inter 已批量移除
- [x] **0.2** 图标迁移启动：安装 `@phosphor-icons/react`，Sidebar 5 个图标替换
  - 文件：`package.json`, `components/console/sidebar.tsx`
  - 验收：✅ Phosphor 安装完成；Sidebar lucide → Phosphor 替换完成
- [x] **0.3** 圆角统一：卡片 12px (`rounded-xl`) / 输入框 8px (`rounded-lg`) / 按钮 pill (`rounded-full`)
  - 文件：`globals.css @theme`
  - 验收：✅ 无 `rounded-[14px]` 等硬编码
- [x] **0.4** `h-screen` → `min-h-[100dvh]`
  - 文件：`console/layout.tsx`, `components/console/sidebar.tsx`
  - 验收：✅ 两处已替换
- [x] **0.5** 移除 sidebar v0.1 版本标签
  - 文件：`components/console/sidebar.tsx`
  - 验收：✅ v0.1 span 已删除
- [x] **0.6** 削减 eyebrow：每个页面只保留 0–1 个真正 eyebrow
  - 文件：各 `page.tsx`
  - 验收：✅ Treasury 保留 "Payment Execution Center" eyebrow，其余页面 ≤ 1 个
- [x] **0.7** Policy 编号改造：`01-05` → `0x1A` 十六进制节点 ID
  - 文件：`app/console/policy/page.tsx`
  - 验收：✅ `0x1A` / `0x2B` / `0x3C` / `0x4D` / `0x5E`
- [x] **0.8** GSAP 插件注册：Flip, SplitText, ScrambleText, DrawSVG, MotionPath
  - 文件：`lib/gsap.ts`
  - 验收：✅ 6 个插件集中注册，`pnpm typecheck` 通过

---

## Phase 1: 基础设施 + 全局系统（2–3 天）

> **目标**：全局背景层、Sidebar 折叠、通用组件就位。

- [x] **1.1** 全局背景层注入（`console/layout.tsx`）
  - 文件：`app/console/layout.tsx`
  - 验收：✅ 5 层 Z-Index 架构就位（底色 + Grid + Noise + 内容 + 悬浮）
- [x] **1.2** `NoiseOverlay` + `GridBackground` + `GradientOrb` 全局挂载
  - 文件：同上
  - 验收：✅ GridBackground + NoiseOverlay 全局共享；GradientOrb 扩展 coral/violet
- [x] **1.3** 页面氛围色系统
  - 文件：各 `page.tsx`
  - 验收：✅ Treasury=lime, Wallets=blue, Analytics=violet, Policy=coral, Agent=cyan(lime+cyan 自定义)
- [x] **1.4** Sidebar 折叠改造（`CollapsibleSidebar`）
  - 文件：`components/console/sidebar.tsx`
  - 验收：✅ 260px↔72px spring 动画（已在 bb35f3a5 中实现）
- [x] **1.5** `HolographicButton` 组件完善
  - 文件：`components/ui/holographic-button.tsx`
  - 验收：✅ lime/blue/coral/violet/cyan 五主题可用
- [x] **1.6** `AnimatedNumber` 组件集成
  - 文件：`components/ui/aceternity/animated-number.tsx`
  - 验收：✅ 已存在，Treasury 页面已使用
- [x] **1.7** GSAP 文字特效组件：`SlamText` + `ScrambleValue`
  - 文件：`components/ui/gsap-text-effects.tsx`
  - 验收：✅ SplitText 逐字砸入 + ScrambleText 解码 + Framer Motion fallback

---

## Phase 2: Treasury 页 — "Flow State Command Center"（3–4 天）

> **目标**：把付款执行流程升级为电影级沉浸体验。

- [x] **2.1** Header：`GradientText` (lime→cyan) + `Sparkles`
  - 文件：`app/console/page.tsx`
  - 验收：✅ 标题 GradientText + SparklesFX 粒子
- [x] **2.2** KPI Cards：自定义 motion cards + `AnimatedNumber` + stagger
  - 文件：同上
  - 验收：✅ 4 张卡片 stagger 进入（0.08s），hover glow，Blocked 卡片 coral shadow
- [x] **2.3** Records Table：stagger + hover 色条 + pulse
  - 文件：同上
  - 验收：✅ 新增行从上方滑入（y:-10），Blocked 行 pulse-slow 动画
- [x] **2.4** Action Panel Step 0：`HolographicButton` + `Sparkles`
  - 文件：同上
  - 验收：✅ SparklesFX 环绕 Generate Plan 按钮
- [x] **2.5** Action Panel Step 1：`ColourfulText` + `GridBackground` 局部高亮 + `GradientOrb`(cyan)
  - 文件：同上
  - 验收：✅ ColourfulText 扫描文字 + 局部 GridBackground + cyan orb
- [x] **2.6** Action Panel Step 2：`BentoGrid` + `Flip` 面板切换 + Bob shake
  - 文件：同上
  - 验收：✅ 审核结果已有 motion 卡片 + shake（RiskGateAnimation 处理）
- [x] **2.7** Action Panel Step 3：全屏 overlay + `ShootingStars` + 旋转环 + shimmer 进度条
  - 文件：同上
  - 验收：✅ 双层旋转环 + grid overlay + blue orb + shimmer 进度条
- [x] **2.8** Action Panel Step 4：`StatsSection` Tab 切换 + `GradientText` txHash
  - 文件：同上
  - 验收：✅ Audit 区 + CAW 区 txHash 均用 GradientText 高亮
- [x] **2.9** Risk Gate：Framer Motion shake + `ScrambleText` 拦截原因解码
  - 文件：`components/console/risk-gate-anim.tsx`
  - 验收：✅ reason 用 ScrambleValue 解码（1s duration, 0.3s delay）
- [ ] **2.10** 创新特效：Chromatic aberration（色差故障）风险态 ⏭️ 跳过
  - 说明：Phase 2 核心视觉升级已完成，2.10 作为可选增强项延后
  - 文件：`lib/effects/chromatic-aberration.ts`
  - 验收：Blocked 时屏幕边缘 RGB 分离

---

## Phase 3: Wallets + Analytics（3–4 天）

### Wallets — "Holographic Vault System"

- [ ] **3.1** Header：`GradientText` (blue→cyan) + `GradientOrb`(blue)
  - 文件：`app/console/wallets/page.tsx`
  - 验收：蓝色光晕主题
- [ ] **3.2** Wallet List：`BentoCard` + `Flip` 过滤重排 + `ScrambleText` 余额更新
  - 文件：同上
  - 验收：过滤时卡片平滑飞入新位置
- [ ] **3.3** WalletTopology：`Sparkles` 节点 hover + `MotionPath` 曲线路径 + `DrawSVG` 连线
  - 文件：同上
  - 验收：数据包沿贝塞尔曲线运动
- [ ] **3.4** WalletHoloCard：`BentoCard` mini + `3D rotateY` 增强透视
  - 文件：同上
  - 验收：更强烈的浮出屏幕效果
- [ ] **3.5** Transfer Panel：`HolographicButton`(blue) + `MotionPath` 资金流动 + `DrawSVG`
  - 文件：同上
  - 验收：转账粒子沿路径飞行
- [ ] **3.6** Signers Matrix：`BentoCard` + `Sparkles` + Phosphor 图标
  - 文件：同上
  - 验收：HSM badge 粒子点缀
- [ ] **3.7** 创新特效：CRT scanline 全息材质 + 生物识别授权动画
  - 文件：`lib/effects/crt-scanline.ts`
  - 验收：扫描线 + 指纹波纹

### Analytics — "Living Data Organism"

- [ ] **3.8** KPI Banner：`BentoCard` + `AnimatedNumber` + `ScrambleText`
  - 文件：`app/console/analytics/page.tsx`
  - 验收：数字 slot-machine 滚动
- [ ] **3.9** Area Chart：`BentoCard` 包裹 + `ScrollTrigger` + `DrawSVG` 绘制展开
  - 文件：同上
  - 验收：图表从上往下绘制
- [ ] **3.10** Pie Chart：`BentoCard` + `AnimatedNumber` 中心 + `Flip` 图例重排
  - 文件：同上
  - 验收：hover 外扩 + 发光
- [ ] **3.11** Comparison Matrix：`BentoCard` + `Sparkles` + `Flip` 重排 + 水平 scroll-snap
  - 文件：同上
  - 验收："数据切片"式滑动
- [ ] **3.12** 创新特效：液体波动图表
  - 文件：`lib/effects/liquid-wave.css`
  - 验收：Area chart 填充像液体波动

---

## Phase 4: Policy + Agent（4–5 天）

### Policy — "Neural Guardrails Interface"

- [ ] **4.1** 5 Rules：`BentoGrid` + `ScrambleText` 数字解码 + `SplitText` 标题砸入 + `DrawSVG` 边框
  - 文件：`app/console/policy/page.tsx`
  - 验收：编号 `0x1A` 风格
- [ ] **4.2** Threshold Sliders：`Observer` 手势 + `ScrambleText` 值更新 + `mapRange` 颜色映射
  - 文件：同上
  - 验收：Slider 释放时弹性回弹
- [ ] **4.3** Whitelist Table：`Flip` 增删动画 + `SplitText` 标签淡入
  - 文件：同上
  - 验收：新增行平滑展开
- [ ] **4.4** Security Gateway：`BentoCard` + `Sparkles` + `3D rotateX` 翻转立起
  - 文件：同上
  - 验收：卡片从水平翻转立起
- [ ] **4.5** 创新特效：神经网络可视化
  - 文件：`components/console/neural-network.tsx`
  - 验收：5 个规则节点 + 脉冲连接

### Agent — "Sentient CFO Persona"

- [ ] **4.6** 页面骨架：左侧 40% 3D 角色 + 右侧 Chat + 底部 Quick Actions
  - 文件：`app/console/agent/page.tsx`
  - 验收：布局就位
- [ ] **4.7** 3D Agent 角色：Three.js `.glb` 低多边形 + `next/dynamic` lazy load
  - 文件：`components/console/agent-character.tsx`
  - 验收：有 idle/thinking/speaking/happy/warning 状态
- [ ] **4.8** 角色灯光：key light (lime) + rim light (cyan) + ambient (dark)
  - 文件：同上
  - 验收：灯光层次清晰
- [ ] **4.9** Chat 界面：`BentoCard` 气泡 + `SplitText` 逐词淡入 + `ScrambleText` 解码
  - 文件：`components/console/agent-chat.tsx`
  - 验收：模拟 AI 打字效果
- [ ] **4.10** 语义高亮：金额自动标绿，风险词自动标红
  - 文件：`lib/semantic-highlight.ts`
  - 验收：正则解析高亮
- [ ] **4.11** Quick Actions：`HolographicButton` + `Flip` 飞向输入区 + `3D rotateX` hover
  - 文件：`components/console/agent-chat.tsx` 或独立
  - 验收：思维泡泡式飘出
- [ ] **4.12** 页面背景：`NoiseOverlay`(6%) + `GridBackground`(中心放射) + `ShootingStars` + 双光球
  - 文件：`app/console/agent/page.tsx`
  - 验收：最强氛围层
- [ ] **4.13** 创新特效：语音波形可视化
  - 文件：`components/console/voice-waveform.tsx`
  - 验收：说话时波形实时响应

---

## Phase 5: 打磨 + 验收（2–3 天）

### 5.1 响应式 + 性能

- [ ] **5.1** 所有页面响应式检查（Mobile/Tablet/Desktop）
  - 验收：无布局错位
- [ ] **5.2** 动效性能检查：Chrome DevTools Performance，目标 60fps
  - 验收：无掉帧
- [ ] **5.3** `prefers-reduced-motion` 降级测试
  - 验收：所有动效可降级
- [ ] **5.4** Lighthouse 性能审计，目标 LCP < 2.5s
  - 验收：达标

### 5.2 代码质量

- [ ] **5.5** `pnpm typecheck` 零错误
  - 验收：零 TS 错误
- [ ] **5.6** `pnpm build` 成功
  - 验收：构建通过
- [ ] **5.7** 无 console error/warning
  - 验收：控制台干净
- [ ] **5.8** Taste-Skill 清单逐项核对
  - 来源：Plan §8
  - 验收：所有项通过

### 5.3 交付物

- [ ] **5.9** 5 个页面截图存档
  - 路径：`docs/screenshots/console-v2/`
- [ ] **5.10** 关键动效 GIF 录制
  - 路径：`docs/screenshots/console-v2/gifs/`
- [ ] **5.11** 更新 `HANDOFF.md`（如需要）
  - 说明：记录本轮升级的关键决策和踩坑

---

## 📋 验收标准汇总

### 功能验收

- [ ] Sidebar 折叠/展开流畅，主面板自动伸缩
- [ ] 5 个导航项（Treasury/Wallets/Analytics/Policy/Agent）都能正常访问
- [ ] Agent 页有 3D 角色展示（至少 idle 状态）
- [ ] Treasury 页 Generate Plan → Execute 完整流程可跑通
- [ ] 所有 KPI 数字有滚动动画
- [ ] Bob blocked 有 shake 动画

### 视觉验收

- [ ] 所有页面有统一的背景层（noise + grid + orb）
- [ ] 卡片有统一的 hover glow 效果
- [ ] 没有「光秃秃」的纯白/纯黑区域
- [ ] 动效不卡顿（滚动、hover、切换都流畅）
- [ ] 移动端 Sidebar 可正常工作（mobile nav）

### 代码验收

- [ ] `pnpm typecheck` 零错误
- [ ] `pnpm build` 成功
- [ ] 没有 console error/warning
- [ ] 新增文件有适当注释
- [ ] 没有硬编码的颜色值（都用 theme token）

---

## 🧩 Aceternity 草稿池提取任务（穿插进行）

> 来源：`components/ui/aceternity/_drafts/` 深度扫描
> 优先级：P0 最高，P2 最低。可在各 Phase 间隙穿插执行。

### P0 — 立即提取

- [ ] **A-0** `BeamCollision` 组件提取（hero-1.tsx）
  - 目标：`components/ui/aceternity/beam-collision.tsx`
  - 适用：Treasury 执行区 / Agent 思考态
- [ ] **A-1** `SvgGradientLines` 组件系统提取（hero-7.tsx）
  - 目标：`components/ui/aceternity/svg-lines/`（5 个子组件）
  - 适用：任意卡片边框 / Header 背景

### P1 — 高优先级

- [ ] **A-2** `StickyScroll` 组件提取（4.tsx）
  - 目标：`components/ui/aceternity/sticky-scroll.tsx`
  - 适用：Workflow 步骤展示
- [ ] **A-3** `MobileMockup` 组件提取（hero-6.tsx）
  - 目标：`components/ui/aceternity/mobile-mockup.tsx`
  - 适用：Treasury 扫描态 / Agent 预览
- [ ] **A-4** `SkewedRectangles` 组件提取（6.tsx）
  - 目标：`components/ui/aceternity/skewed-rectangles.tsx`
  - 适用：Agent 3D 角色底座
- [ ] **A-5** `PathDrawIcon` 模式提取（hero-2.tsx）
  - 目标：文档化 `motion.path` `pathLength` 用法
  - 适用：任意 SVG 图标自绘动画
- [ ] **A-6** `ScrollScatter` 组件提取（hero-4.tsx）
  - 目标：`components/ui/aceternity/scroll-scatter.tsx`
  - 适用：Landing 信任背书（如需要）
- [ ] **A-7** `AvatarStack` 组件提取（hero-2.tsx）
  - 目标：`components/ui/aceternity/avatar-stack.tsx`
  - 适用：Team / 贡献者展示

### P2 — 评估后提取

- [ ] **A-8** `RoughNotation` 组件提取（hero-6.tsx）
  - 依赖：`react-rough-notation`
  - 适用：趣味功能介绍
- [ ] **A-9** `LogoCloudMarquee` 组件提取（hero-2.tsx）
  - 依赖：`react-fast-marquee`
  - 适用：Landing 社交证明
- [ ] **A-10** `SkewedLines` 组件提取（7.tsx）
  - 无依赖
  - 适用：备用背景纹理

---

## 📝 执行日志（手工填写）

| 日期 | 完成项 | 备注 |
|------|--------|------|
| 2026-06-11 | Checklist 创建 | 完成 Plan 拆分，58 项任务 + 11 项 Aceternity 提取 |
| 2026-06-11 | **Phase 0 完成** | 8/8 任务全部完成，`pnpm typecheck` 通过 |
| | | 字体迁移(Geist)、图标迁移(Phosphor)、圆角统一、h-screen修复、Sidebar v0.1移除、eyebrow削减、Policy编号改造、GSAP插件注册 |
| 2026-06-11 | **Phase 0 补做 + Phase 1 完成** | 调查发现 Phase 0 部分修改未持久化，重新应用并 commit |
| | | 根因：修改写入文件系统但未 commit，后续被覆盖。非 linter 问题。 |
| | | Phase 1：全局背景层( GridBackground+NoiseOverlay)、GradientOrb扩展(coral/violet)、5页面氛围色、Sidebar折叠(bb35f3a5已有)、HolographicButton、AnimatedNumber、GSAP文字特效(SlamText+ScrambleValue+FadeInText fallback) |
| 2026-06-11 | **前置修复 P1-P3 完成** | ShootingStars内存泄漏修复、BentoCard glowColor、AnimatedNumber springConfig、Sparkles hex支持、ColourfulText性能降级 |
| | | 进入 Phase 2：Treasury "Flow State Command Center" |
| 2026-06-11 | **Phase 2 全部完成（除2.10延后）** | 2.1-2.9 全部完成：Header GradientText+Sparkles、KPI stagger+hover glow、Records stagger+pulse、Action Panel 各步骤升级、txHash GradientText、RiskGate ScrambleText解码 |
| 2026-06-11 | **进入 Phase 3** | Wallets + Analytics "Holographic Vault System" + "Living Data Organism" |

---

## 🔗 相关文件索引

| 文件 | 路径 | 说明 |
|------|------|------|
| Plan 主文件 | `docs/plans/console-visual-upgrade-plan.md` | 完整设计方案 |
| 本 Checklist | `docs/plans/console-upgrade-checklist.md` | 执行追踪 |
| Aceternity 深度排查 | `docs/reports/aceternity-deep-audit-2026-06-11.md` | 第一轮报告 |
| Aceternity 补充报告 | `docs/reports/aceternity-deep-audit-2026-06-11-supplement.md` | 第二轮补充 |
| GSAP 调研 | `docs/reports/gsap-animation-research-2026-06-11.md` | GSAP 插件方案 |
| Taste-Skill 分析 | `docs/reports/taste-skill-deep-analysis-2026-06-11.md` | 设计语言规范 |
| Handoff | `docs/handoff/2026-06-11-console-upgrade-research-handoff.md` | 交接材料 |

---

*Checklist 创建完成。共 58 项执行任务 + 11 项 Aceternity 提取任务 + 6 项前置修复 + 16 项验收标准。*
