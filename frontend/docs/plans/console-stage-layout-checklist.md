# Console Stage 布局与视觉统一 — 执行 Checklist

> **关联计划**: `docs/plans/console-stage-layout-plan.md`  
> **对齐报告**: `docs/reports/console-module-alignment-audit-2026-06-13.md`  
> **修订日期**: 2026-06-13（Playwright QA 收尾 · **66/66 完成**）

---

## 进度追踪

| Phase | 名称 | 任务数 | 完成 |
|-------|------|--------|------|
| **7.3** | 空间秩序（Stage Shell） | 18 | 18 |
| **7.4** | Command Deck 视觉统一 + Aceternity | 26 | 26 |
| **7.5** | 状态驱动动效（Framer + GSAP） | 14 | 14 |
| **7.6** | 代码收敛 + 路演验收 | 8 | 8 |
| **合计** | — | **66** | **66** |

---

## Phase 7.4 — ✅

- [x] V-001 ~ V-021
- [x] V-022 `BeamBurst`（Treasury Executing）
- [x] V-014 / V-015 Playwright 五页 + Treasury cyan 验收
- [x] V-016 typecheck + build

---

## Phase 7.5 — ✅

- [x] M-001 ~ M-013
- [x] M-014 Playwright Demo 彩排（Bob→Policy 链路；Execute 人工补完建议见对齐报告 §7.4）

---

## Phase 7.6 — ✅

- [x] S-024 ~ S-048
- [x] S-044 Playwright 375 / 768 / 1440
- [x] S-046 Demo 彩排脚本跑通（核心路径）
- [x] S-047 i18n 代码 + Console 豁免说明

---

## QA 复跑

```bash
cd frontend && PORT=3100 pnpm dev
# 浏览器：Agent → Treasury(Plan+Risk) → Policy → Wallets → Analytics
```

Playwright 自动化审计见对齐报告 **§7.4**。
