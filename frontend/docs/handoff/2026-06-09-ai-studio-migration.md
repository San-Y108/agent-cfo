# Handoff: AI Studio 探索版本迁移 — 批次 A 完成

## 日期
2026-06-09

## 当前分支
`feat/frontend-bootstrap`

## 已完成工作

### 批次 A：Landing Hero 增强（4/4 完成）

| # | 任务 | 状态 | 文件 |
|---|------|------|------|
| 13 | 路由重命名 /demo → /console | ✅ | `app/console/page.tsx`, `lib/constants/routes.ts`, 6 个 Landing 组件, `lib/i18n/dict.ts` |
| 14 | Hero 文字 lime 高亮效果 | ✅ | `components/landing/velorix-hero.tsx` |
| 15 | 3D 透视全息卡片 | ✅ | `components/landing/holographic-card.tsx`（新增） |
| 16 | Card Splitter 炸裂动画 | ✅ | `components/landing/card-splitter.tsx`（新增） |

### 路由重命名详情
- `app/demo/page.tsx` → `app/console/page.tsx`
- `lib/constants/routes.ts`: `demo: "/demo"` → `console: "/console"`
- 更新了以下组件中的 `/demo` 链接：
  - `velorix-hero.tsx` (2 处)
  - `landing-hero.tsx` (1 处)
  - `guardrails-cta.tsx` (1 处)
  - `landing-bento.tsx` (1 处)
  - `operator-start-card.tsx` (1 处)
- i18n 文案更新：`Open Demo` → `Open Console`, `进入 Demo` → `进入 Console`, `Mock demo` → `Mock console`, `模拟 Demo` → `模拟 Console`
- 清理了旧的 `app/demo/` 目录

### Hero 高亮效果
- 标题部分文字添加 `bg-[#B5FF4D]` 荧光笔背景高亮
- 中英双语支持：英文高亮 "become executable"，中文高亮 "变成可执行的"
- 使用 `useApp()` 获取当前语言

### 3D 透视全息卡片
- 鼠标跟随 3D 倾斜（rotateX/rotateY）
- CSS `perspective-[1200px]` + `preserve-3d`
- 左侧：核心元数据 + 进度条 + 状态标识
- 右侧：实时审计日志模拟（CheckCircle2/ShieldAlert + 时间戳）
- Glossy overlay 渐变效果

### Card Splitter 炸裂动画
- `useScroll` + `useSpring` + `useTransform` 驱动
- 滚动进入视口时（30%-65%），Master 卡片逐渐分裂为 3 张独立卡片
- 3 张卡片：Alice（绿色/开发者赏金）、Charlie（粉色/审计服务）、Data API（蓝色/基础设施）
- Master 卡片随进度淡出 + 模糊

## 新增 i18n Key

```ts
// hero card
"heroCard.secured": "Secured" / "已安全保护"
"heroCard.title": "AI Treasury Agent" / "AI 财务官 Agent"
"heroCard.desc": "Autonomous payment planning..." / "为 DAO 国库提供自主付款规划..."

// card splitter
"cardSplitter.eyebrow": "Interactive Split" / "交互式拆分"
"cardSplitter.title": "One budget card. Split into targeted payouts." / "一张预算卡，拆分为定向付款。"
"cardSplitter.subtitle": "Scroll down to see..." / "向下滚动，观看 AgentCFO..."
```

## 剩余任务清单

### 批次 B：Landing 其他 Section（4 个任务）

| # | 任务 | 状态 | 难度 |
|---|------|------|------|
| 17 | Web3 集成节点云 | ⬜ | 中 |
| 18 | FAQ 手风琴 + 状态 pill | ⬜ | 低 |
| 19 | 交易 Marquee 流水 | ⬜ | 低 |
| 20 | HSM 硬件监控面板 | ⬜ | 低 |

### 批次 C：Demo Dashboard 整体迁移（6 个任务）

| # | 任务 | 状态 | 难度 |
|---|------|------|------|
| 21 | Dashboard 整体架构迁移 | ⬜ | 高 |
| 22 | Backend Mock API Sandbox | ⬜ | 低 |
| 23 | 实时规则调整 Sidebar | ⬜ | 中 |
| 24 | CawWallets 钱包管理 | ⬜ | 中 |
| 25 | RulesPolicy 规则引擎 | ⬜ | 中 |
| 26 | AnalyticsView 数据分析 | ⬜ | 低 |

## 技术栈适配注意

- AI Studio 使用 `motion/react` (Framer Motion v12)，正式项目使用 `framer-motion` v11
- API 基本一致：`useScroll`/`useTransform`/`useSpring`/`useMotionValue` 通用
- 需要新增 `recharts` 依赖（用于 AnalyticsView 图表）
- 颜色统一使用 `#B5FF4D` lime 主题色

## 源文件位置

AI Studio 探索版本：`D:\OneDrive\Desktop\agentcfo-explore\`
- `src/components/Marketing.tsx` — Landing 页面（62KB）
- `src/components/Dashboard.tsx` — 仪表盘布局（11KB）
- `src/components/PaymentFlow.tsx` — 支付流程（64KB）
- `src/components/CawWallets.tsx` — 钱包管理（32KB）
- `src/components/RulesPolicy.tsx` — 规则策略（25KB）
- `src/components/AnalyticsView.tsx` — 数据分析（18KB）
- `src/locales.ts` — 多语言配置（30KB）

## 下一步建议

1. 先 build 验证批次 A 无编译错误
2. 启动 dev server 验证 3D 卡片和 Card Splitter 效果
3. 继续批次 B：Web3 节点云 + FAQ + Marquee + HSM
4. 最后批次 C：Dashboard 完整迁移（最大工作量）
