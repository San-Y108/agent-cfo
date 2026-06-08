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

### 备注（非 frontend 范围，仅供参考，不在本清单负责内）
- Demo 视频 / PPT / README 头图 / 路演稿：物料 & 交付同学。
- 后端 payment-plan / risk-check / execute-payment / audit-report API：已实现（`app/`，12 tests passed）。
- CAW 真实测试网付款 / Agent Wallet 地址 / tx hash：合约同学（前端 UI 已预留展示位）。
- Render backend URL / CORS：后端配置（前端已准备就绪）。
