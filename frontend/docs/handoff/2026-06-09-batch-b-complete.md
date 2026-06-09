# Handoff: AI Studio 探索版本迁移 — 批次 B 完成

## 日期
2026-06-09

## 当前分支
`feat/frontend-bootstrap`

## 批次 B 完成情况（4/4）

| # | 任务 | 状态 | 文件 |
|---|------|------|------|
| 17 | Web3 集成节点云 | ✅ | `components/landing/web3-node-cloud.tsx`（新增） |
| 18 | FAQ 手风琴 + 状态 pill | ✅ | `components/landing/faq-section.tsx`（新增） |
| 19 | 交易 Marquee 流水 | ✅ | `components/landing/transaction-marquee.tsx`（新增） |
| 20 | HSM 硬件监控面板 | ✅ | `components/landing/hsm-monitor.tsx`（新增） |

### Web3 集成节点云
- 8 个浮动节点围绕中心 Cobo Core 排列
- 鼠标视差效果（每个节点独立 parallax 系数）
- SVG 动态虚线连接线（从中心到每个节点）
- Hover tooltip 显示集成名称和描述
- 有机浮动动画（`animate` + `transition` 无限循环）

### FAQ 手风琴 + 状态 pill
- 3 个 FAQ 条目：资金安全 / Cobo 拦截 / 主网部署
- 每个条目右上角带状态 pill（SECURED / POLICY ENFORCED / CROSS-CHAIN READY）
- 响应式网格布局（FAQ 占 3/5，HSM 占 2/5）

### 交易 Marquee 流水
- 6 条模拟交易记录循环滚动（SIGNED / POLICY_HOLD / SAFE_LIMIT）
- 30s 线性无限滚动，hover 暂停
- 左右渐变遮罩，淡入淡出边缘
- 替换了原有的 `MarqueeTrust`（logo 文字滚动）

### HSM 硬件监控面板
- 4 格状态矩阵：签名延迟 / 多签门限 / 加密算法 / 活跃策略
- 实时负载进度条（14%）
- TLS V1.3 SECURE 标签
- 底部 "Enter Console" CTA 链接到 `/console`

## 修改的文件汇总

### 新增组件
- `components/landing/web3-node-cloud.tsx`
- `components/landing/transaction-marquee.tsx`
- `components/landing/faq-section.tsx`
- `components/landing/hsm-monitor.tsx`

### 修改文件
- `components/landing/landing-sections.tsx` — 导入新组件，调整 section 顺序
- `lib/i18n/dict.ts` — 新增 web3Cloud / faq / hsm 双语 key
- `app/globals.css` — 新增 `@keyframes marquee` 和 `.animate-marquee` 动画

### 移除引用
- `MarqueeTrust` 不再被导入（但文件保留在仓库中）

## 剩余任务：批次 C（Demo Dashboard 迁移）

| # | 任务 | 状态 | 难度 |
|---|------|------|------|
| 21 | Dashboard 整体架构迁移 | ⬜ | 高 |
| 22 | Backend Mock API Sandbox | ⬜ | 低 |
| 23 | 实时规则调整 Sidebar | ⬜ | 中 |
| 24 | CawWallets 钱包管理 | ⬜ | 中 |
| 25 | RulesPolicy 规则引擎 | ⬜ | 中 |
| 26 | AnalyticsView 数据分析 | ⬜ | 低 |

## 技术栈适配注意

- 需要新增 `recharts` 依赖（用于 AnalyticsView 图表）
- Dashboard 迁移涉及大量组件，建议拆分为子任务或 worktree 隔离开发
- AI Studio 源文件位置：`D:\OneDrive\Desktop\agentcfo-explore\src\components/`
  - `Dashboard.tsx` — 仪表盘布局（11KB）
  - `PaymentFlow.tsx` — 支付流程（64KB）
  - `CawWallets.tsx` — 钱包管理（32KB）
  - `RulesPolicy.tsx` — 规则策略（25KB）
  - `AnalyticsView.tsx` — 数据分析（18KB）

## Build 状态
✅ `pnpm build` 通过，零错误
