# AgentCFO Frontend — HANDOFF（交接索引）

> 冷启动时读本文，再按链接进入**最新阶段 handoff**。详细任务历史见 `docs/handoff/` 与 `docs/plans/`。
> 总纲：`CLAUDE.md` · 任务态：`checklist.md` · 联调：`backend-integration.md`

**最后更新：2026-06-13**

---

## 1. 当前阶段

| 项 | 值 |
|---|---|
| 分支 | `main` |
| 产品入口 | `/console`（Agent Hub 默认首页） |
| 已完成 | Landing ✅ · Phase 7 Console **66/66** ✅ · Treasury **real mode API 接入** ✅ |
| 进行中 | Render 部署 + Vercel real env |
| 阻塞项 | Render backend URL（线上） |

---

## 2. 最新 handoff（必读）

**Phase 7.3–7.4 Console Stage + 视觉统一** — `docs/plans/console-stage-layout-plan.md`

要点：
- 四模块共用 `ModuleStageLayout`（左轨 | 舞台 | 右轨 | DetailDeck）
- Command Deck primitive：`ConsoleTelemetryGrid` · `ConsolePanelHeader` · `ConsoleGhostButton`
- 组装逻辑：`components/console/stages/*-stage.tsx`；`app/console/*/page.tsx` 仅 wiring
- 对齐报告：`docs/reports/console-module-alignment-audit-2026-06-13.md`

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

1. 读 `docs/handoff/phase-7-1-console-handoff.md`
2. 读 `docs/plans/console-upgrade-checklist.md` 末尾
3. 从 handoff §2「Suggested next steps」选任务开工
