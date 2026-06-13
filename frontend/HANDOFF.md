# AgentCFO Frontend — HANDOFF（交接索引）

> 冷启动时读本文，再按链接进入**最新阶段 handoff**。详细任务历史见 `docs/handoff/` 与 `docs/plans/`。
> 总纲：`CLAUDE.md`（§1 任务域 · §2 执行流程）· 任务态：`checklist.md` · 联调：`backend-integration.md`

**最后更新：2026-06-13**

---

## 0. 交接节奏（Agent 必读）

完整规则见 **`CLAUDE.md` §2.1**。摘要：

| 时机 | 动作 |
|---|---|
| 完成 **1 个 phase** | 按 `docs/handoff/TEMPLATE.md` 新建 handoff，更新本文 §1–§2 |
| 每再完成 **2 个 phase** | 合并更新 handoff + 刷新 `CLAUDE.md` §7 |
| 小 fix / 单组件微调 | 不写 handoff；scope commit 即可 |
| 用户指令或 Session 将断 | 立即写 handoff |

---

## 1. 当前阶段

| 项 | 值 |
|---|---|
| 分支 | `main` |
| 产品入口 | `/console`（Agent Hub 默认首页） |
| 已完成 | Landing ✅ · Phase 7 Console **66/66** ✅ · Treasury **real mode API 接入** ✅ · Console 精修 polish pass ✅ |
| 进行中 | **Phase 8** — Console 五模块视觉升级 + 全链路联调（逐模块 review） |
| 阻塞项 | Render backend URL 线上 env（Treasury real 收尾）；M1 Agent 待开工 |

---

## 2. 最新 handoff / 当前计划（必读）

**Phase 8 — 五模块视觉升级 + 联调**（逐模块审查，一个打磨好再进下一个）

| 文档 | 路径 |
|---|---|
| **Plan** | `docs/plans/console-module-visual-upgrade-plan.md` |
| **Checklist** | `docs/plans/console-module-visual-upgrade-checklist.md` |
| **联调** | `backend-integration.md` · `docs/backend/TESTING.md` · `docs/backend/CAW_ADAPTER.md` |
| **参考图** | `assets/images/console/references/ref-*.png` |

**模块顺序**：Agent → Treasury → Wallets → Analytics → Policy  
**Review 门**：每模块用户 sign-off 后才进入下一模块。

**Phase 0 已完成**：旧吉祥物 plan 删除 · 贴纸方案回滚 · 部分亮色对比度修复。

**Console Stage 历史（Phase 7.3–7.4）** — `docs/plans/console-stage-layout-plan.md` · `docs/reports/console-module-alignment-audit-2026-06-13.md`

**设计思想源** — `docs/reports/console-design-report-2026-06-13.md`

**执行清单** — `docs/plans/console-stage-layout-checklist.md`

---

## 3. 历史 handoff 索引

| 日期 | 文件 | 内容 |
|---|---|---|
| 2026-06-12 | `docs/handoff/phase-7-1-console-handoff.md` | **当前** Phase 7.1 |
| 2026-06-12 | `docs/handoff/2026-06-12-console-command-center-handoff.md` | Phase 7 规划 |
| 2026-06-12 | `docs/handoff/2026-06-12-phase6-command-deck-handoff.md` | Phase 6 Command Deck |
| 2026-06-12 | `docs/handoff/2026-06-12-phase5-final-handoff.md` | Phase 5 验收 |
| 2026-06-11 | `docs/handoff/2026-06-11-session-handoff-phase1-2-3.md` | Console 批次 C 早期 |
| 2026-06-09 | `docs/handoff/2026-06-09-batch-c-plan.md` | AI Studio 迁移计划 |
| 2026-06-08 | 本文件旧版内容 | 已归档至 `docs/handoff/`；**/demo 时代已结束** |

---

## 4. 踩坑清单（保留）

1. **Windows + Git Bash**，工作目录 `d:\OneDrive\Desktop\threetwoa\my-competition\agent-cfo`
2. **`localhost:3001` 陈旧 Service Worker** → 用 `PORT=3100 pnpm dev`
3. **Vercel Framework Preset 必须是 Next.js**；设置变更后需 `vercel --prod`
4. **后端 contract 真相**：`app/models.py` / `app/routers/payments.py` / `tests/test_mvp_flow.py`
5. **只改 `frontend/`**；Landing 区锁定；不删 landing 视觉资产
6. **Hero 纯 CSS**（`velorix-hero.tsx`）；Console 用 framer-motion / GSAP

---

## 5. 4 个后端端点 ↔ 前端 adapter

| 方法 | 路径 | adapter | 入参 → 出参 |
|---|---|---|---|
| POST | `/api/payment-plan` | `lib/api/payment.ts` | `PaymentPlanRequest` → `PaymentPlan` |
| POST | `/api/risk-check` | `lib/api/risk.ts` | `RiskCheckRequest` → `RiskCheckResult` |
| POST | `/api/execute-payment` | `lib/api/caw.ts` | `ExecutePaymentRequest` → `PaymentExecutionResult` |
| GET | `/api/audit-report/{id}` | `lib/api/audit.ts` | → `AuditReport` |

real 调用链：`lib/workflow/run-demo-flow.ts` → `runDemoFlow()`

---

## 6. 如何恢复工作

```bash
cd frontend
pnpm typecheck
pnpm build
PORT=3100 pnpm dev
# 打开 http://127.0.0.1:3100/console
```

1. 读 `CLAUDE.md` §1 确认任务域 · §2 执行流程
2. 读本文 §2 最新 handoff（或 `docs/handoff/phase-7-1-console-handoff.md`）
3. 读 `docs/plans/console-stage-layout-checklist.md`（或当前 phase checklist）
4. 从 handoff §2「Suggested next steps」选任务开工
5. Phase 完成时：用 `docs/handoff/TEMPLATE.md` 写交接，回写本文 §1–§2
