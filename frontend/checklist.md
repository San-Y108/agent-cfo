# AgentCFO Frontend — Checklist

> 来源：项目规划文档（第六/七/九节前端范围）+ 当前 `frontend/` 实现状态。
> 状态标记：`[x]` 已完成 · `[~]` 部分完成 / 进行中 · `[ ]` 未完成。
> 本清单只覆盖 **frontend** 范围。

## A. 核心 demo loop 页面 / 模块

- [x] **Landing Page** — `app/page.tsx`（`components/landing/velorix-hero.tsx`：Velorix IIC 风格纯 CSS Hero）
- [x] **Demo Console** — `app/demo/page.tsx`（`components/demo/command-center-shell` + KPI strip + workflow timeline）
- [~] **Contribution records 展示 / 输入** — mock 贡献记录已驱动付款计划展示；**缺独立的输入 / 上传 UI**（规划文档要求「贡献记录输入区」，当前未做表单/CSV/JSON 输入）
- [x] **Payment plan 展示** — `components/payment/payment-plan.tsx`（按 risk 状态拆分 approved / blocked，显示金额、原因、钱包）
- [x] **Risk check 展示** — `components/risk/risk-gate.tsx`（budget / whitelist / limit / token / duplicate 五类，blocked 醒目标红）
- [x] **Human approval** — `components/approval/human-approval.tsx` 展示 approved / blocked 队列与策略说明；含 checkbox 选择 + Approve & Execute 模态框交互（`onApprove` 触发执行）
- [x] **CAW execution result（mock）** — `components/execution/execution-result.tsx`（Agent Wallet / network / cawRequestId / 状态；标注 Simulated）
- [x] **tx hash / audit report** — Audit Report 已展示（`components/audit/audit-report.tsx`：approved/blocked 计数、风险摘要、结算）；含 `CopyableHash` 组件支持点击复制 tx hash / cawRequestId

## B. Mode & 后端集成

- [x] **Mock mode fallback** — 后端 / CAW 不稳定时可独立跑完整 happy path（`lib/demo/demo-data.ts` 静态数据 + `isMockMode()`；`request()` 在 mock 模式直接抛错以防误打后端）
- [~] **Real mode backend integration** — adapter（`lib/api/*`）+ `runDemoFlow()` real HTTP 调用链已对齐并验证（本地 uvicorn 跑通 4 端点）；**`/demo` 页面尚未切到 real mode**（未调用 `runDemoFlow`，无 loading / error 态、无 UI 层 mock/real 切换）

## C. 部署

- [x] **Vercel deployment** — 生产可公开访问 **https://agentcfo-frontend.vercel.app**（mock mode；Framework=Next.js，已过 401/404 修复）

## D. 支撑材料（README / screenshots / demo video）

- [x] **README** — 已更新为新 URL、契约对齐状态、Velorix Hero 说明
- [ ] **Screenshots** — `public/screenshots/` 仅占位 README，无实际截图素材
- [ ] **Demo video（3–5 分钟）** — 未录制（规划文档为 P0 提交物，主要由物料同学负责，前端配合提供可演示界面）

## E. UI 重设计

### E1. Landing `/` Hero → Velorix IIC 风格
> 边界：只动 `frontend/`，不改 `/demo` / API / mock / backend，不新增依赖，不删除旧资源。
- [x] 分析 Velorix 提示词原文 + 解压 demo（结构 / 动效值 / 资源 / 字体）
- [x] 移植 Velorix Hero → `components/landing/velorix-hero.tsx`（client，纯 CSS 动效，无新增 Framer Motion；复用已有 lucide-react）
- [x] `app/page.tsx` 切换为 Velorix Hero（旧 landing-hero / bento / mini-command-preview 保留在磁盘，不删除）
- [x] 文案替换：velorix→AgentCFO；nav→Problem / Workflow / Risk Guardrails / Wallet Execution / Audit Trail；CTA→Open Demo / Run the payout flow；hero title / subtitle 按指定文案
- [x] CTA 跳转：Open Demo & Run the payout flow → `/demo`
- [x] 保留：背景视频(robot+hand) / 黑色电影感 / Inter+Courier / pill navbar / mobile menu 动效 / CTA 样式
- [x] 验证：`pnpm typecheck` / `pnpm build` / `/` 正常 / `/demo` 未破坏

### E2. `/demo` Redesign → 分步揭示的 Agent 工作流演示
> 方向：静态看板 → 分步揭示 Agent 工作流（Run 触发，motion 依次揭示，Bob 标红被拦，真交互按钮，路演讲故事）
> 资产：HeroUI v3（组件骨架）+ Aceternity（视觉动效）+ GSAP（滚动/分步动效）+ Framer Motion（已装）
- [x] GSAP 安装配置 — `gsap` + `@gsap/react` + `lib/gsap.ts` 基础配置
- [x] 信息架构 + 分步动线方案（用户确认后实现）
- [x] `Generate Plan` 交互按钮 + 触发逻辑
- [x] Plan → Risk → Approval → Execution → Audit 分步揭示动画
- [x] Bob blocked 标红戏剧化处理
- [x] `Approve & Execute` 真实交互
- [x] 7 步 timeline 与推进状态联动
- [x] 视觉统一：黑色高级感，与 `/` Hero 不脱节
- [x] mock 痕迹优化（不再像 debug 面板）
- [x] 验证：`pnpm typecheck` / `pnpm build` / smoke test

### E3. Landing `/` Scroll Sections
> Hero 下方补 `Problem / Workflow / Risk Guardrails / Wallet Execution / Audit Trail` 锚点板块
- [x] Problem 板块
- [x] Workflow 板块
- [x] Risk Guardrails 板块
- [x] Wallet Execution 板块
- [x] Audit Trail 板块
- [x] Navbar 平滑滚动锚点

## G. 主题切换 + 双语支持

- [x] **亮暗模式切换** — `next-themes` + Tailwind CSS v4 `dark:` 变体；Hero 区域恒暗（不受全局主题影响）
- [x] **中英文切换** — `next-intl`（`messages/en.json` + `messages/zh.json`）；全站文案 i18n 化
- [x] **语言切换器** — Navbar 右上角语言按钮（EN / 中）
- [x] **主题切换器** — Navbar 右上角主题按钮（sun / moon）

## F. 工具 / 资产安装

- [x] **HeroUI v3** — 已通过 MCP / 项目配置可用
- [x] **Aceternity** — 按需移植组件（不整包引入）
- [x] **Framer Motion** — 已装（v12）
- [x] **GSAP** — 已装（v3.15）+ `@gsap/react` + `lib/gsap.ts`
- [x] **UI-UX Pro Max** — 已备份到项目 `.claude/skills/`
- [x] **baoyu-article-illustrator** — 已备份到项目 `.claude/skills/`
- [x] **ppt-master** — 已备份到项目 `.claude/skills/`

---

## H. 批次 C — 业务工作台 `/console` 创新迁移（重点 / 进行中）

> 目标：将 AI Studio 设计稿 (`D:\OneDrive\Desktop\agentcfo.zip`) 中完整的"DAO AI 财务官工作台"迁移到本项目的业务层 `/console` 路由下，**不要 1:1 移植**，要把 landing 已经验证好的视觉精髓融入。
> 起点 commit：`7307c77c`（landing 完整重设计 + footer 已落地 + push 到远端）。
> 决策记录：Q1=B（PaymentFlow 用 GSAP 水平滚动重写）/ Q2=B（Sandbox + Live Rules 做成全局右侧 Drawer）/ Q3=A（Phase 0+1 完成后 stop 等用户验证再继续）。
> 详细交接文档：`docs/handoff/2026-06-09-batch-c-plan.md`（含素材来源、规范、视觉融合策略、命令清单）。

### H0. 素材来源（必读）

- **AI Studio 源压缩包**：`D:\OneDrive\Desktop\agentcfo.zip`（408KB，408 KB，2026-06-09 18:41 打包）
- **解压目录**：`D:\OneDrive\Desktop\agentcfo-extracted`
- **源代码文件**（绝对路径）：
  - `D:\OneDrive\Desktop\agentcfo-extracted\src\App.tsx`（54 行，state-driven SPA 入口）
  - `D:\OneDrive\Desktop\agentcfo-extracted\src\components\Dashboard.tsx`（~11KB，Sidebar + Topbar + 4-tab outlet）
  - `D:\OneDrive\Desktop\agentcfo-extracted\src\components\PaymentFlow.tsx`（~64KB，5-step wizard + 内嵌 Sandbox + 实时规则）
  - `D:\OneDrive\Desktop\agentcfo-extracted\src\components\CawWallets.tsx`（~32KB，多钱包 / 余额 / Transfer / 签名者）
  - `D:\OneDrive\Desktop\agentcfo-extracted\src\components\AnalyticsView.tsx`（~18KB，recharts 面积图 + 饼图 + KPI）
  - `D:\OneDrive\Desktop\agentcfo-extracted\src\components\RulesPolicy.tsx`（~25KB，白名单 CRUD + 阈值配置）
  - `D:\OneDrive\Desktop\agentcfo-extracted\src\components\Marketing.tsx`（landing 部分，**不迁，仅参考**）
  - `D:\OneDrive\Desktop\agentcfo-extracted\src\locales.ts`（~30KB 双语字典 zh/en）
  - `D:\OneDrive\Desktop\agentcfo-extracted\src\data.ts`（mock 数据：MOCK_RECORDS 等）
  - `D:\OneDrive\Desktop\agentcfo-extracted\src\types.ts`（`ContributorRecord` / `PaymentPlanItem` / `BudgetRules`）

### H1. 三大技术适配（每个组件都要做）

| 源 | 目标 | 改造 |
|---|---|---|
| Vite SPA + state-driven `view` 切换 | Next.js App Router 子路由 | 把 Dashboard.tsx 拆为 `app/console/layout.tsx`（壳）+ 4 个 `app/console/[tab]/page.tsx`（叶子） |
| `import { motion } from "motion/react"` (v12) | `import { motion } from "framer-motion"` (v11) | 全文 import 路径替换。`AnimatePresence` 等 API 完全兼容 |
| `theme/lang` 通过 props 层层传 | `useApp()` context | 移除组件 props 中的 `theme/lang/setTheme/setLang`，直接 `const { theme, lang } = useApp()` |
| `translations[lang][key]` 函数 | 现有 `useT()` hook + `lib/i18n/dict.ts` | 合并 locales.ts 30KB 字典到 dict.ts，统一 key 命名风格 |

### H2. Phase 拆解（7 个阶段，按风险递增）

#### H2.0 Phase 0：基础设施迁移（无创意，**先做**）
- [x] 安装 `recharts`（`pnpm add recharts`）— AnalyticsView 必需
- [x] 迁移 `types.ts` → `frontend/lib/types/console.ts`
- [x] 迁移 `data.ts` → `frontend/lib/demo/console-mock.ts`（mock 数据，与 backend contract 同形）
- [x] 合并 `locales.ts` 双语字典到 `frontend/lib/i18n/dict.ts`（`console.*` 命名空间）
- [x] 验证：`pnpm typecheck` 通过，无新增 build error

#### H2.1 Phase 1：Dashboard 主壳（**定调**）
- [x] 新建 `app/console/layout.tsx`：Sidebar (260px) + Topbar + content outlet
- [x] 子路由：`app/console/page.tsx`（Treasury 主页占位）+ `app/console/wallets/page.tsx` + `app/console/analytics/page.tsx` + `app/console/policy/page.tsx`
- [x] Sidebar 4 nav item 各自带主色 dot：Treasury=lime `#B5FF4D` / Wallets=blue `#60A5FA` / Analytics=violet `#C084FC` / Policy=coral `#FB7185`
- [x] 集成 `ThemeLanguageToggle variant="app"`（业务层完整保留主题 + 语言）
- [x] 集成 Sandbox + Live Rules **全局右侧 Drawer**（按 Q2=B 决策）—— 浮动按钮 + 滑出面板，所有 tab 都能调出
- [x] **创新点**：Sidebar 顶部 wordmark "AGENTCFO"；空状态用 PipelineShowcase 大编号风格的"01 Treasury / 02 Wallets / ..."
- [x] 验证：`pnpm typecheck` + `pnpm build` + 4 路由可达 + 主题切换 + 语言切换不破坏布局
- [x] **STOP 节点**：用户验证通过，亮色模式 bug 已修复

#### H2.2 Phase 2：Wallets `/console/wallets`（蓝色主色 / 试水模板）
- [x] 迁移 `CawWallets.tsx` 业务逻辑（3 钱包卡 + token 余额 + Transfer 模态框 + Copy 按钮）
- [~] **创新点 1**：钱包卡用 HolographicCard 3D 鼠标倾斜 —— 后续增强（context 限制，已记录）
- [~] **创新点 2**：Web3NodeCloud 拓扑图 —— 后续增强
- [x] **创新点 3**：危险操作（Transfer 超额 >25 USDC）触发 GuardrailsCTA 同款红色拦截卡
- [x] 主色：blue `#60A5FA`，配 stage 04 配色系
- [x] 验证标准：3 钱包可切换、Transfer mock 可走通、Copy hash 可点

#### H2.3 Phase 3：Analytics `/console/analytics`（紫色主色）✅
- [x] 迁移 `AnalyticsView.tsx`（recharts AreaChart + PieChart + 4 个 KPI 卡）
- [x] 适配 recharts 主题（深色/浅色 token 切换，XAxis/YAxis/Tooltip 全部用 token）
- [x] **创新点 1**：KPI 大数字用 PipelineShowcase 同款大字号 + violet→violet-light 渐变描边
- [x] **创新点 2**：饼图配色用 5 stage 主色（cyan / coral / lime / blue / violet）
- [x] **创新点 3**：时间范围切换器（30d / 90d / 1y）用 landing pill 风格 + framer-motion layoutId
- [x] 主色：violet `#C084FC`，配 stage 05 配色系

#### H2.4 Phase 4：Policy `/console/policy`（珊瑚红主色）✅
- [x] 迁移 `RulesPolicy.tsx`（白名单 CRUD + 阈值滑块 + Slack webhook）
- [x] **创新点 1**：5 类规则用 PipelineShowcase 大编号 01-05 排版，每条规则一行，hover 高亮
- [x] **创新点 2**：白名单 CRUD 表单用 AnimatePresence 炸裂动画（新增/删除带 scale 动效）
- [x] **创新点 3**：阈值滑块用 lime 主色 + 实时数值闪烁反馈（useFlashingValue hook）
- [x] 主色：coral `#FB7185`，配 stage 02 配色系

#### H2.5 Phase 5：Treasury (Live Run) `/console`（最难，**最后做**）✅
> 这是 64KB 巨型组件，**用 landing PipelineShowcase 的 GSAP 水平滚动重写**（按 Q1=B 决策）。
- [x] 把原 5-step wizard 改为 5 stage GSAP horizontal pin scroll（与 landing 镜像呼应）
- [x] 5 stage 主色：Records=cyan / Risk=coral / Approval=lime / Execution=blue / Audit=violet（与 landing 完全一致）
- [x] **创新点 1**：Generate Plan 带扫描动画（Records → Risk 过渡）
- [x] **创新点 2**：Blocked 项红色高亮 + 警告提示（Bob 自动被标红）
- [x] **创新点 3**：tx hash 用 stage 色 pill（Execution 面板蓝色 pill）
- [x] **创新点 4**：完成 audit 后用 violet→fuchsia 渐变文字 "Settlement Sealed"
- [x] 业务逻辑保留：5-step 流程 / 实时规则评估 / mock tx hash 生成 / 新增记录 / 重置循环
- [x] **配合 Q2=B**：原本内嵌的 Sandbox / Live Rules 已经移到 Phase 1 的全局 Drawer，本 Phase 不再重复实现

#### H2.6 Phase 6：清理旧 DemoFlow ✅
- [x] 评估 `components/demo/` 下哪些组件 Phase 5 不再用
- [x] 删除孤儿组件（`demo-flow.tsx` / `command-center-shell.tsx` / `treasury-kpi-strip.tsx` / `bento-grid.tsx` / `demo-sidebar.tsx` / `stats-strip.tsx` / `demo-shell.tsx` + 5 steps）
- [x] 删除 `components/payment/` / `components/risk/` / `components/approval/` / `components/execution/` / `components/audit/` / `components/workflow/`（全部未被 app 引用）
- [x] 删除 `lib/demo/demo-data.ts` 旧 mock（用 Phase 0 迁过来的 `console-mock.ts` 取代）
- [x] 最终 `pnpm build` 零错误（recharts 静态渲染警告为已知，非 build error）

### H3. 设计规范（融合 landing + AI Studio）

**色彩系统（必须严格遵守）**：
- 主背景：`#0D0D0D`（Ramp near-black，全站统一）
- 主色 lime：`#B5FF4D`（品牌色 + Treasury tab）
- Stage 配色：cyan `#5EEAD4` / coral `#FB7185` / lime `#B5FF4D` / blue `#60A5FA` / violet `#C084FC`
- 文字层级：`text-white`（标题）/ `text-white/85`（正文）/ `text-white/55`（次要）/ `text-white/35`（极次要）
- 边框：`border-white/10`（弱）/ `border-white/[0.06]`（极弱）

**字体系统**：
- Sans：`Inter, sans-serif`（标题 + 主文案）
- Mono：`'Courier New', Courier, monospace`（labels / hash / 数据）
- 字号 clamp 风格：`clamp(min, vw, max)`

**动效层（按优先级使用）**：
1. **GSAP ScrollTrigger** —— 仅用于 Treasury Phase 5 的水平滚动（已在 `lib/gsap.ts` 配置）
2. **framer-motion** —— 默认动效层（reveal / hover / drag）
3. **CSS transition** —— 简单色彩/透明度变化

**已验证可复用组件（landing 已落地）**：
- `HolographicCard`（`components/landing/holographic-card.tsx`）—— 3D 鼠标倾斜，可移植到 Wallets 主卡
- `Web3NodeCloud`（`components/landing/web3-node-cloud.tsx`）—— 拖拽节点 + SVG 连线，可移植到 Wallets 拓扑图
- `CardSplitter`（`components/landing/card-splitter.tsx`）—— 滚动炸裂，可移植到 Policy/Treasury
- `TransactionMarquee`（`components/landing/transaction-marquee.tsx`）—— 6 色调 pill 系统
- `PipelineShowcase` 排版风格（大编号 + 副色）—— 可移植到 Treasury / Policy

### H4. 验证标准（每个 Phase 完成都要过）

- [ ] `pnpm typecheck` 零错误
- [ ] `pnpm build` 零错误零 warning
- [ ] 浏览器实测 4 个路由可达：`/console`, `/console/wallets`, `/console/analytics`, `/console/policy`
- [ ] 主题切换（暗 ↔ 亮）不破坏布局
- [ ] 语言切换（zh ↔ en）不破坏布局
- [ ] 响应式：≥1024px 桌面 / 640-1024px 平板 / <640px 移动
- [ ] 至少在 Treasury / Wallets 看到与 landing 的视觉呼应（色调 + 动效）

### H5. 严禁事项

- 严禁 `1:1 抄 AI Studio`（这是创新失败标志）
- 严禁动 `app/page.tsx`（landing 区已锁定）
- 严禁动 `components/landing/` 已有组件（除非"借用"组件给 console）
- 严禁动 backend `app/`（前端边界外）
- 严禁发明 API endpoint / response wrapper（按 `app/models.py` contract）
- 严禁删 `components/landing/holographic-card.tsx` 等 5 个 landing 视觉资产

---

### 备注（非 frontend 范围，仅供参考，不在本清单负责内）
- Demo 视频 / PPT / README 头图 / 路演稿：物料 & 交付同学。
- 后端 payment-plan / risk-check / execute-payment / audit-report API：已实现（`app/`，12 tests passed）。
- CAW 真实测试网付款 / Agent Wallet 地址 / tx hash：合约同学（前端 UI 已预留展示位）。
- Render backend URL / CORS：后端配置（前端已准备就绪）。
