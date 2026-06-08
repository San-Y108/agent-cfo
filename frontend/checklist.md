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

- [ ] **UI redesign / Velorix Hero Section adaptation** — 当前 UI 功能完整但偏基础；视觉深度优化（含 Velorix hero 风格适配）待做。属下一阶段，本轮文档化阶段不动代码。

---

### 备注（非 frontend 范围，仅供参考，不在本清单负责内）
- Demo 视频 / PPT / README 头图 / 路演稿：物料 & 交付同学。
- 后端 payment-plan / risk-check / execute-payment / audit-report API：已实现（`app/`，12 tests passed）。
- CAW 真实测试网付款 / Agent Wallet 地址 / tx hash：合约同学（前端 UI 已预留展示位）。
