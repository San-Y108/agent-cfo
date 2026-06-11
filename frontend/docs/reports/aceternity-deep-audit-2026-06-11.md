# Aceternity 深度排查报告

> 分析日期：2026-06-11
> 分析范围：`_drafts/` 15 个文件 + 已提取的 `components/ui/aceternity/` 组件
> 目标：快速识别最有价值的 3-5 个发现，供 `/demo` redesign 使用

---

## 草稿池关键发现

| 文件 | 核心效果 | 一句话说明 |
|------|---------|-----------|
| `hero-1.tsx` | **Beam Collision + Grid Background + Explosion** | 4 条光束射入容器碰撞产生粒子爆炸，Aceternity 标志性特效，适合 Demo 执行区 |
| `hero-2.tsx` | **Avatar Stack + Marquee Logo Cloud + Images Grid** | 头像堆叠 hover tooltip + 无限滚动 logo 云 + 错落图片网格，适合 Landing 社交证明区 |
| `hero-4.tsx` | **Scroll-Driven Testimonial Scatter** | 滚动时 6 张 testimonial 卡片向左右飞散，电影感叙事动效，适合 Landing 信任背书 |
| `hero-6.tsx` | **Rough Notation + Mobile Mockup + Stagger Animation** | 手绘风格高亮/下划线 + SVG 手机骨架屏 + 图片依次弹入，适合产品功能展示 |
| `hero-7.tsx` | **SVG Gradient Lines + Radial Glow + Dark Mode** | 纯 SVG 渐变线条边框 + 径向发光球体，零依赖高级感背景，适合任意暗色区块 |
| `4.tsx` | **Sticky Scroll + Color Transition + Parallax** | 滚动吸附 + 背景色渐变切换 + 双栏视差，适合 Workflow 步骤展示 |

## 模板包意外宝藏

| 来源 | 组件/特效 | 适用页面 |
|------|----------|---------|
| `ai-saas-template` | `noise.webp` + bento grid + dark SaaS 骨架 | `/demo` 全局背景 + 功能卡片 |
| `proactiv-marketing-template` | `dashboard-x.png` + stats section + sparkles | `/demo` Dashboard 预览 + KPI 数据条 |
| `devpro-portfolio-template` | **Timeline + Code Window** | `/demo` 7 步 workflow 时间线 + API 调用展示 |
| `component-packs/sidebars` | Sidebar 导航组件 | `/demo` 命令中心式侧边栏 |

## 新发现特效

| 特效 | 来源 | 一句话说明 |
|------|------|-----------|
| **Beam Collision** | `hero-1.tsx` | 光束碰撞检测 + 粒子爆炸，Aceternity 最独特的物理动效 |
| **Rough Notation** | `hero-6.tsx` | 手绘风格文字高亮/圈注，依赖 `react-rough-notation`，趣味性强 |
| **Scroll Scatter** | `hero-4.tsx` | GSAP ScrollTrigger 级别的 testimonial 飞散效果，纯 Framer Motion 实现 |
| **SVG Line Grid** | `hero-7.tsx` | 纯 SVG 渐变线条构成的网格边框，无图片零依赖 |
| **Sticky Color Shift** | `4.tsx` | 滚动吸附时背景色平滑过渡，适合分步骤流程展示 |

## 已提取组件清单（`components/ui/aceternity/`）

| 组件 | 状态 | 用途 |
|------|------|------|
| `background.tsx` | 已提取 | Noise / Grid / Dot / GradientOrb / DemoBackdrop |
| `bento-grid.tsx` | 已提取 | 不对称卡片网格 + hover glow |
| `stats-section.tsx` | 已提取 | Tab 切换数据面板 + 移动端堆叠 |
| `shooting-stars.tsx` | 已提取 | SVG 流星背景动画 |
| `sparkles.tsx` | 已提取 | 随机闪烁粒子点缀 |
| `animated-number.tsx` | 已提取 | 数字滚动动效 |
| `card.tsx` | 已提取 | 暗色主题卡片 + 骨架容器 |
| `colourful-text.tsx` | 已提取 | 彩色逐字动画 + 渐变文字 |

## 建议引入的新组件（优先级）

| 组件 | 优先级 | 来源文件 | 适用场景 |
|------|--------|---------|---------|
| **BeamCollision** | P0 | `hero-1.tsx` | Demo Execution 区域光束特效 |
| **AvatarStack** | P1 | `hero-2.tsx` | Landing 团队/贡献者展示 |
| **ScrollScatter** | P1 | `hero-4.tsx` | Landing Testimonial 区域 |
| **RoughNotationHero** | P2 | `hero-6.tsx` | 趣味性功能介绍（需评估依赖） |
| **StickyScroll** | P1 | `4.tsx` | Workflow 步骤滚动展示 |

## 快速决策

- **立即提取**：`hero-1.tsx` 的 Beam Collision（最独特）
- **评估后提取**：`hero-4.tsx` 的 Scroll Scatter（需确认与现有 GSAP 冲突）
- **跳过**：`hero-3/5/8`（常规布局，无独特动效）、`1/2/3.tsx`（导航/功能列表，已有替代）
