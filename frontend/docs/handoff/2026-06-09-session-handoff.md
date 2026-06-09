# Session Handoff — AI Studio 迁移 & Landing 优化

## 日期
2026-06-09

## 当前分支
`feat/frontend-bootstrap`

## Build 状态
✅ `pnpm build` 通过，零错误

---

## 已完成工作总览

### 批次 A（4/4 完成）— Landing Hero 增强

| # | 任务 | 文件 |
|---|------|------|
| 13 | 路由重命名 /demo → /console | `app/console/page.tsx`, `lib/constants/routes.ts`, 6 个组件, `lib/i18n/dict.ts` |
| 14 | Hero 文字 ::selection 高亮（非永久背景） | `globals.css` ::selection, `components/landing/velorix-hero.tsx` |
| 15 | 3D 透视全息卡片 | `components/landing/holographic-card.tsx`（新增） |
| 16 | Card Splitter 炸裂动画 | `components/landing/card-splitter.tsx`（新增） |

### 批次 B（4/4 完成）— Landing 其他 Section

| # | 任务 | 文件 |
|---|------|------|
| 17 | Web3 集成节点云（可拖拽节点 + 鼠标视差 + SVG 连接线） | `components/landing/web3-node-cloud.tsx`（新增） |
| 18 | FAQ 手风琴 + 状态 pill | `components/landing/faq-section.tsx`（新增） |
| 19 | 交易 Marquee 流水 | `components/landing/transaction-marquee.tsx`（新增） |
| 20 | HSM 硬件监控面板 | `components/landing/hsm-monitor.tsx`（新增） |

### Bug 修复

| 问题 | 修复方式 |
|------|----------|
| Hydration mismatch (HolographicCard 时间戳) | `useState` + `useEffect`，SSR 显示 `--:--:--` |
| Hero 永久 lime 背景误解 | 去掉 `bg-[#B5FF4D]`，改用全局 `::selection` |
| Web3NodeCloud 边框不一致 | 统一为 `border-white/10 bg-neutral-900/60 backdrop-blur-xl` |
| Web3NodeCloud 节点越界 + tooltip 截断 | 缩小节点/图标/tooltip，增大容器到 340px |
| Web3NodeCloud 节点可拖拽 | framer-motion `drag` + `dragConstraints` + `whileDrag` |

---

## 当前页面结构（`/` Landing）

```
page.tsx
├── VelorixHero
├── TransactionMarquee（交易流水滚动条）
└── LandingSections
    ├── 左列（flex-col gap-8）
    │   ├── HolographicCard（3D 全息卡片，鼠标跟随倾斜）
    │   └── Web3NodeCloud（Web3 节点云，可拖拽节点，8 节点 + Cobo Core）
    ├── 右列
    │   └── CardSplitter（滚动触发炸裂动画，Master → 3 张卡片）
    ├── OperatorStartCard
    ├── SystemFeatureGrid
    ├── RuntimeArchitecture
    ├── ToolkitShowcase
    ├── GuardrailsCTA
    └── FAQ + HSM（grid grid-cols-1 md:grid-cols-5）
```

---

## 新增/修改文件清单

### 新增组件（8 个）
1. `components/landing/holographic-card.tsx` — 3D 全息卡片
2. `components/landing/card-splitter.tsx` — 滚动炸裂动画
3. `components/landing/web3-node-cloud.tsx` — Web3 节点云（可拖拽）
4. `components/landing/transaction-marquee.tsx` — 交易流水
5. `components/landing/faq-section.tsx` — FAQ 手风琴
6. `components/landing/hsm-monitor.tsx` — HSM 监控面板

### 修改文件
1. `app/page.tsx` — 插入 TransactionMarquee 在 Hero 后
2. `app/console/page.tsx` — 原 `app/demo/page.tsx` 移动
3. `app/globals.css` — marquee 动画 + `::selection` 样式
4. `components/landing/landing-sections.tsx` — 整合新组件，grid 布局
5. `components/landing/velorix-hero.tsx` — 去掉永久 lime 背景
6. `lib/constants/routes.ts` — `demo: "/demo"` → `console: "/console"`
7. `lib/i18n/dict.ts` — 新增 heroCard / cardSplitter / web3Cloud / faq / hsm 双语 key
8. `components/landing/landing-hero.tsx` — `/demo` → `/console`
9. `components/landing/guardrails-cta.tsx` — `/demo` → `/console`
10. `components/landing/landing-bento.tsx` — `/demo` → `/console`
11. `components/landing/operator-start-card.tsx` — `/demo` → `/console`

---

## i18n 新增 Key

```ts
// hero card
"heroCard.secured": "Secured" / "已安全保护"
"heroCard.title": "AI Treasury Agent" / "AI 财务官 Agent"
"heroCard.desc": "Autonomous payment planning..." / "为 DAO 国库提供自主付款规划..."

// card splitter
"cardSplitter.eyebrow": "Interactive Split" / "交互式拆分"
"cardSplitter.title": "One budget card. Split into targeted payouts." / "一张预算卡，拆分为定向付款。"
"cardSplitter.subtitle": "Scroll down to see..." / "向下滚动，观看 AgentCFO..."

// web3 node cloud
"web3Cloud.eyebrow": "Web3 Trust Stack" / "Web3 信任集成栈"
"web3Cloud.title": "Web3 Trusted Infrastructure Integration Map" / "Web3 可信基础设施集成图谱"
"web3Cloud.desc": "AgentCFO weaves multi-sig..." / "AgentCFO 将领衔的多签套件..."
"web3Cloud.hint": "Hover or move mouse..." / "鼠标悬停或移动了解底层..."

// faq
"faq.title": "Frequently Queried Specifications" / "安全策略与执行解答 FAQ"
"faq.subtitle": "Understand the core mechanics..." / "了解受密码学硬件保护的..."
"faq.q1" / "faq.a1" / "faq.q2" / "faq.a2" / "faq.q3" / "faq.a3"

// hsm monitor
"hsm.header": "HSM-CAW Node Monitor" / "HSM-CAW 节点监视器"
"hsm.latency": "HSM SIGNER LATENCY" / "HSM 签名响应时延"
"hsm.quorum": "MULTI-SIG QUORUM" / "多签仲裁门限"
"hsm.encryption": "VAULT ENCRYPTION" / "财库密钥加密算法"
"hsm.policies": "ACTIVE SAFE BOUNDS" / "已配置的安全规则数量"
"hsm.load": "CAW Hardware signing load:" / "CAW 硬件签名负载："
"hsm.enter": "Enter Console" / "进入 Console"
```

---

## 剩余任务：批次 C（Demo Dashboard 迁移）

| # | 任务 | 状态 | 难度 | 说明 |
|---|------|------|------|------|
| 21 | Dashboard 整体架构迁移 | ⬜ | 高 | Sidebar + Main Content 布局框架 |
| 22 | Backend Mock API Sandbox | ⬜ | 低 | 4 端点卡片 + 延迟滑块 + 终端日志 |
| 23 | 实时规则调整 Sidebar | ⬜ | 中 | 滑块 + toggle + 即时反馈 |
| 24 | CawWallets 钱包管理 | ⬜ | 中 | 多钱包、余额、转账、签名者 |
| 25 | RulesPolicy 规则引擎 | ⬜ | 中 | 白名单 CRUD、阈值配置 |
| 26 | AnalyticsView 数据分析 | ⬜ | 低 | Recharts 面积图 + 饼图 + KPI 对比 |

### 批次 C 前置依赖
- **需安装 `recharts`**：`pnpm add recharts`（用于 AnalyticsView 图表）

### AI Studio 源文件位置
`D:\OneDrive\Desktop\agentcfo-explore\src\components/`
- `Dashboard.tsx` — 仪表盘布局（11KB）
- `PaymentFlow.tsx` — 支付流程（64KB）
- `CawWallets.tsx` — 钱包管理（32KB）
- `RulesPolicy.tsx` — 规则策略（25KB）
- `AnalyticsView.tsx` — 数据分析（18KB）
- `locales.ts` — 多语言配置（30KB）

### 技术栈适配注意
- AI Studio 使用 `motion/react` (Framer Motion v12)，正式项目使用 `framer-motion` v11
- API 基本一致：`useScroll`/`useTransform`/`useSpring`/`useMotionValue` 通用
- 颜色统一使用 `#B5FF4D` lime 主题色

---

## 关键设计决策

### 1. `::selection` 而非永久背景高亮
用户要求的是**鼠标框选文字时的颜色**，不是文字永久背景色。已在 `globals.css` 中设置：
```css
::selection { background-color: #B5FF4D; color: #0D0D0D; }
```

### 2. 布局结构
- TransactionMarquee 放在 Hero 正下方（`page.tsx` 层级）
- HolographicCard + Web3NodeCloud 左右排列的左列（flex-col）
- CardSplitter 在右列
- Web3NodeCloud 内部标题 + 节点图垂直堆叠（单列布局）

### 3. Web3NodeCloud 可拖拽实现
使用 framer-motion `drag` prop：
```tsx
<motion.div
  drag
  dragConstraints={{ left: -40, right: 40, top: -40, bottom: 40 }}
  dragElastic={0.15}
  whileDrag={{ scale: 1.15, zIndex: 50 }}
/>
```
拖拽时浮动动画暂停，释放后恢复。

---

## 已知问题 / 待优化

1. **Web3NodeCloud 比例**：节点图容器为 `aspect-square max-w-[340px]`，在宽屏幕上可能显得太小。如需增大，可调大 `max-w` 和节点坐标范围。
2. **CardSplitter 在右列**：scroll-driven animation 的 `useScroll` 使用 `target: scrollContainerRef`，在 grid 右列中应正常工作。
3. **Marquee 动画**：CSS `@keyframes marquee` 在 `globals.css` 中定义，30s 线性无限循环。

---

## 下一步建议

1. **启动 dev server 验证当前 Landing 效果**（`pnpm dev`）
2. **安装 recharts**：`pnpm add recharts`
3. **开始批次 C**：Dashboard 整体架构迁移（最大工作量，建议拆分子任务）
4. **可选**：为 Web3NodeCloud 节点添加连接线随拖拽动态更新（当前 SVG 线条基于原始坐标，不随拖拽更新）

---

## Handoff 文档路径

- 本文件：`frontend/docs/handoff/2026-06-09-session-handoff.md`
- 批次 A：`frontend/docs/handoff/2026-06-09-ai-studio-migration.md`
- 批次 B：`frontend/docs/handoff/2026-06-09-batch-b-complete.md`
