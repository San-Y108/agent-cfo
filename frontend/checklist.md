# AgentCFO Frontend — Checklist

> 来源：项目规划文档（第六/七/九节前端范围）+ 当前 `frontend/` 实现状态。
> 状态标记：`[x]` 已完成 · `[~]` 部分完成 / 进行中 · `[ ]` 未完成。
> 本清单只覆盖 **frontend** 范围。

## A. 核心 demo loop 页面 / 模块

- [x] **Landing Page** — `app/page.tsx`（`components/landing/*`：hero / bento / mini command preview）
- [x] **Demo Console** — `app/demo/page.tsx`（`components/demo/command-center-shell` + KPI strip + workflow timeline）
- [~] **Contribution records 展示 / 输入** — mock 贡献记录已驱动付款计划展示；**缺独立的输入 / 上传 UI**（规划文档要求「贡献记录输入区」，当前未做表单/CSV/JSON 输入）
- [x] **Payment plan 展示** — `components/payment/payment-plan.tsx`（按 risk 状态拆分 approved / blocked，显示金额、原因、钱包）
- [x] **Risk check 展示** — `components/risk/risk-gate.tsx`（budget / whitelist / limit / token / duplicate 五类，blocked 醒目标红）
- [~] **Human approval** — `components/approval/human-approval.tsx` 展示 approved / blocked 队列与策略说明；**缺真正的「Approve & Execute」交互按钮**（mock 下为静态展示，未触发执行）
- [x] **CAW execution result（mock）** — `components/execution/execution-result.tsx`（Agent Wallet / network / cawRequestId / 状态；标注 Simulated）
- [~] **tx hash / audit report** — Audit Report 已展示（`components/audit/audit-report.tsx`：approved/blocked 计数、风险摘要、结算）；**tx hash 在 mock 下为 `null`（改显示 cawRequestId），缺真实 tx hash 与点击 / 复制交互**

## B. Mode & 后端集成

- [x] **Mock mode fallback** — 后端 / CAW 不稳定时可独立跑完整 happy path（`lib/demo/demo-data.ts` 静态数据 + `isMockMode()`；`request()` 在 mock 模式直接抛错以防误打后端）
- [~] **Real mode backend integration** — adapter（`lib/api/*`）+ `runDemoFlow()` real HTTP 调用链已对齐并验证（本地 uvicorn 跑通 4 端点）；**`/demo` 页面尚未切到 real mode**（未调用 `runDemoFlow`，无 loading / error 态、无 UI 层 mock/real 开关）

## C. 部署

- [x] **Vercel deployment** — 生产可公开访问 **https://agentcfo-frontend.vercel.app**（mock mode；Framework=Next.js，已过 401/404 修复）

## D. 支撑材料（README / screenshots / demo video）

- [~] **README** — `frontend/README.md` 存在，但**内容已过期**：仍写 `lib/api/*` 为 placeholder、引用旧 URL `hackathon-frontend-sigma`，需更新为新 URL 与「契约已对齐」状态
- [ ] **Screenshots** — `public/screenshots/` 仅占位 README，无实际截图素材
- [ ] **Demo video（3–5 分钟）** — 未录制（规划文档为 P0 提交物，主要由物料同学负责，前端配合提供可演示界面）

## E. UI 重设计

- [~] **UI redesign / Velorix Hero Section adaptation** — Landing `/` Hero 改造为 Velorix IIC 风格（见 E1）；更广的视觉优化（Demo Console 等）仍待做。

### E1. 当前阶段：Landing `/` Hero → Velorix IIC 风格（只改文案与跳转，保留视觉/动效）
> 边界：只动 `frontend/`，不改 `/demo` / API / mock / backend，不新增依赖，不删除旧资源。
- [x] 分析 Velorix 提示词原文 + 解压 demo（结构 / 动效值 / 资源 / 字体）
- [x] 移植 Velorix Hero → `components/landing/velorix-hero.tsx`（client，纯 CSS 动效，无新增 Framer Motion；复用已有 lucide-react）
- [x] `app/page.tsx` 切换为 Velorix Hero（旧 landing-hero / bento / mini-command-preview 保留在磁盘，不删除）
- [x] 文案替换：velorix→AgentCFO；nav→Problem / Workflow / Risk Guardrails / Wallet Execution / Audit Trail；CTA→Open Demo / Run the payout flow；hero title / subtitle 按指定文案
- [x] CTA 跳转：Open Demo & Run the payout flow → `/demo`
- [x] 保留：背景视频(robot+hand) / 黑色电影感 / Inter+Courier / pill navbar / mobile menu 动效 / CTA 样式
- [x] 验证：`pnpm typecheck` / `pnpm build` / `/` 正常 / `/demo` 未破坏

---

### 备注（非 frontend 范围，仅供参考，不在本清单负责内）
- Demo 视频 / PPT / README 头图 / 路演稿：物料 & 交付同学。
- 后端 payment-plan / risk-check / execute-payment / audit-report API：已实现（`app/`，12 tests passed）。
- CAW 真实测试网付款 / Agent Wallet 地址 / tx hash：合约同学（前端 UI 已预留展示位）。
