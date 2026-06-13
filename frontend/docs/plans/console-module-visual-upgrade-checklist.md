# Console 五模块视觉升级 + 联调 — Checklist

> **Plan**：[`console-module-visual-upgrade-plan.md`](./console-module-visual-upgrade-plan.md)  
> **规则**：一个模块 **用户 review 通过** 后，才勾选「模块封板」并进入下一模块。  
> **标记**：`[x]` 完成 · `[~]` 进行中 · `[ ]` 未开始 · `[—]` 不适用

**最后更新**：2026-06-13

---

## Phase 0 · 跨模块基础

| # | 项 | 状态 |
|---|---|---|
| 0.1 | 删除旧 `module-mascot-integration-plan` 及贴纸方案文档 | [x] |
| 0.2 | 回滚 `ModuleMascot` 五路由接入 | [x] |
| 0.3 | Wallets / Analytics / Policy `text-white/*` → 语义 token | [x] |
| 0.4 | Agent / Treasury / command-deck 剩余 dark-only 文字清扫 | [ ] |
| 0.5 | 新增 `ModuleHeroSlot`（grid 英雄区，非 absolute 贴纸） | [x] |
| 0.6 | 参考图资产索引确认（`assets/images/console/references/`） | [x] |

---

## M1 · Agent `/console`

**参考**：`ref-console-overview-light` · `ref-agent-treasury-hub`（左栏）  
**Review 门**：⬜ 用户未签 off

### 视觉

| # | 项 | 状态 |
|---|---|---|
| 1.1 | Agent Card 布局：Hero Slot + 身份 + telemetry | [x] |
| 1.2 | Chat 区层级与参考稿对齐（气泡 / Activity 片段） | [x] |
| 1.3 | Quick Actions：Generate Plan / Check Risk / View Audit pill | [x] |
| 1.4 | 吉祥物：`agent-module.png` 在 Hero Slot 内嵌 | [x] |
| 1.5 | 亮/暗色可读性验收 | [~] |

### 联调 & API

| # | 项 | 状态 |
|---|---|---|
| 1.6 | `POST /api/agent/chat` 本地冒烟（有 MINIMAX_API_KEY） | [ ] |
| 1.7 | 无 API key / 网络错误时的 UI 错误态 | [ ] |
| 1.8 | Quick Actions → 跳转 Treasury + 触发 console-state | [x] |
| 1.9 | Navbar Mock/Real 徽章与 Agent 聊天独立行为确认 | [ ] |

### 验证

| # | 项 | 状态 |
|---|---|---|
| 1.10 | `pnpm typecheck` | [x] |
| 1.11 | `pnpm build` | [x] |
| 1.12 | 浏览器：EN/中 · 亮/暗 · `/console` | [ ] |
| 1.13 | **模块封板 — 用户 review 通过** | [ ] |

---

## M2 · Treasury `/console/treasury`

**参考**：`ref-treasury-focus-split` · `ref-agent-treasury-hub`（Treasury 卡）  
**Review 门**：⬜ 用户未签 off  
**前置**：M1 封板（或用户明确并行授权）

### 视觉

| # | 项 | 状态 |
|---|---|---|
| 2.1 | Stage：Workflow 圆形 stepper + 步骤卡片 | [ ] |
| 2.2 | Records 左栏卡片化 | [ ] |
| 2.3 | Metrics 右栏 KPI 排版升级 | [ ] |
| 2.4 | Done 态 Audit / CAW 快照区 | [ ] |
| 2.5 | Bob blocked 视觉（coral 语义） | [ ] |
| 2.6 | 亮/暗色可读性验收 | [ ] |

### 联调 & API（P0 全链路）

| # | 项 | 状态 |
|---|---|---|
| 2.7 | mock mode：完整 happy path（不调后端） | [ ] |
| 2.8 | real mode：`payment-plan → risk-check → execute-payment → audit-report` | [ ] |
| 2.9 | `flowError` / loading 态可见 | [ ] |
| 2.10 | `GET /api/caw-status/{id}` 展示 | [ ] |
| 2.11 | `GET /api/caw-status/{id}/refresh`（mock 404 友好提示） | [ ] |
| 2.12 | Audit Report 只读，不篡改快照 | [ ] |

### 验证

| # | 项 | 状态 |
|---|---|---|
| 2.13 | 仓库根 `pytest` | [ ] |
| 2.14 | 本地 real 冒烟（见 plan §3.5） | [ ] |
| 2.15 | `pnpm typecheck` · `pnpm build` | [ ] |
| 2.16 | **模块封板 — 用户 review 通过** | [ ] |

---

## M3 · Wallets `/console/wallets`

**参考**：`ref-command-center-grid`（CAW Wallets）  
**Review 门**：⬜ 用户未签 off  
**前置**：M2 封板（Treasury real 可产出 tx 数据）

### 视觉

| # | 项 | 状态 |
|---|---|---|
| 3.1 | Vault 列表 + Portfolio donut 布局 | [ ] |
| 3.2 | Signers / Transfer 流程视觉 | [ ] |
| 3.3 | Topology 区收束（不抢主舞台） | [ ] |
| 3.4 | Hero Slot：`wallets-module.png` 正确嵌入 | [ ] |
| 3.5 | 亮/暗色可读性验收 | [ ] |

### 联调

| # | 项 | 状态 |
|---|---|---|
| 3.6 | 展示 Treasury 执行后的 tx / cawRequestId（无新端点） | [ ] |
| 3.7 | mock mode 标注 Simulated / MOCK | [ ] |
| 3.8 | real tx hash 使用 `CopyableHash`，不伪造 | [ ] |

### 验证

| # | 项 | 状态 |
|---|---|---|
| 3.9 | Treasury Done → Wallets 数据联动手动测 | [ ] |
| 3.10 | `pnpm typecheck` · `pnpm build` | [ ] |
| 3.11 | **模块封板 — 用户 review 通过** | [ ] |

---

## M4 · Analytics `/console/analytics`

**参考**：`ref-command-center-grid`（Analytics）  
**Review 门**：⬜ 用户未签 off

### 视觉

| # | 项 | 状态 |
|---|---|---|
| 4.1 | KPI 四宫格顶栏 | [ ] |
| 4.2 | Area Chart 主舞台 + 时间 pill | [ ] |
| 4.3 | Top Categories / Compare 条形区 | [ ] |
| 4.4 | Hero Slot：`analytics-module.png` 与图表并列 | [ ] |
| 4.5 | 亮/暗色可读性验收 | [ ] |

### 联调

| # | 项 | 状态 |
|---|---|---|
| 4.6 | `hasExecuted`：Treasury 完成后 LIVE 标注 | [ ] |
| 4.7 | 未执行时 Demo 曲线 +  honest 文案 | [ ] |

### 验证

| # | 项 | 状态 |
|---|---|---|
| 4.8 | `pnpm typecheck` · `pnpm build` | [ ] |
| 4.9 | **模块封板 — 用户 review 通过** | [ ] |

---

## M5 · Policy `/console/policy`

**参考**：`ref-command-center-grid`（Policy）  
**Review 门**：⬜ 用户未签 off

### 视觉

| # | 项 | 状态 |
|---|---|---|
| 5.1 | Guard Topology 横向 Tier 流 | [ ] |
| 5.2 | Threshold sliders + Preflight 行 | [ ] |
| 5.3 | Whitelist 列表卡片化 | [ ] |
| 5.4 | Hero Slot：`policy-module.png` | [ ] |
| 5.5 | 亮/暗色可读性验收 | [ ] |

### 联调

| # | 项 | 状态 |
|---|---|---|
| 5.6 | `budgetRule` 字段与 `app/models.py` 一致 | [ ] |
| 5.7 | 改 whitelist → Treasury risk-check Bob blocked 联动 | [ ] |
| 5.8 | （可选）`GET /api/p2/policy-guardrails` 只读展示 — 需提案 | [—] |

### 验证

| # | 项 | 状态 |
|---|---|---|
| 5.9 | `pytest`（risk / whitelist 相关） | [ ] |
| 5.10 | `pnpm typecheck` · `pnpm build` | [ ] |
| 5.11 | **模块封板 — 用户 review 通过** | [ ] |

---

## Phase 8 收尾 · 部署与全链路

| # | 项 | 状态 |
|---|---|---|
| 8.1 | Render health OK | [ ] |
| 8.2 | Vercel env：real + Render URL | [ ] |
| 8.3 | 生产 smoke：Agent chat + Treasury loop | [ ] |
| 8.4 | 更新 `HANDOFF.md` · `CLAUDE.md` §7 · 写 phase handoff | [ ] |
| 8.5 | `checklist.md` 摘要同步 | [ ] |

---

## Review 记录（用户填写）

| 模块 | Review 日期 | 结论 | 备注 |
|---|---|---|---|
| M1 Agent | | ⬜ 通过 / ⬜ 返工 | |
| M2 Treasury | | ⬜ 通过 / ⬜ 返工 | |
| M3 Wallets | | ⬜ 通过 / ⬜ 返工 | |
| M4 Analytics | | ⬜ 通过 / ⬜ 返工 | |
| M5 Policy | | ⬜ 通过 / ⬜ 返工 | |
