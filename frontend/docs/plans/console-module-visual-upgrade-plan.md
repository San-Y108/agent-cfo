# Console 五模块视觉升级 + 全链路联调计划（Phase 8）

> **创建日期**：2026-06-13  
> **状态**：进行中 · **逐模块审查**（一个模块打磨通过后再进下一个）  
> **关联 Checklist**：[`console-module-visual-upgrade-checklist.md`](./console-module-visual-upgrade-checklist.md)  
> **替代文档**：已删除的 `module-mascot-integration-plan.md`（贴纸式吉祥物方案废弃）  
> **延续文档**：[`console-stage-layout-plan.md`](./console-stage-layout-plan.md) Phase 7.3–7.4（Stage Shell + Command Deck 已完成）  
> **设计参考**：`assets/images/console/references/ref-*.png` · [`console-design-report-2026-06-13.md`](../reports/console-design-report-2026-06-13.md)  
> **边界**：前端实现 **只改 `frontend/`**；API 字段/端点以 backend 代码为准；合约/CAW 行为以后端 adapter 为准，前端只展示、不发明

---

## 0. 计划目标（一句话）

按 GPT 聚合参考页的 **卡片布局与信息层级** 重构 Console 五模块 UI，并在每个模块交付时同步完成 **P0 联调 + CAW 展示 + 测试验收**；**用户 review 通过** 后才进入下一模块。

---

## 1. 团队边界与契约真相

| 角色 | 目录 | 前端可依赖 | 前端禁止 |
|---|---|---|---|
| **后端** | `app/` · `tests/` | `app/models.py` · `app/routers/payments.py` · `app/routers/agent.py` · `tests/test_mvp_flow.py` | 自行发明 endpoint / field / wrapper |
| **合约 / CAW** | 后端 adapter + `docs/backend/CAW_ADAPTER.md` | `POST /api/execute-payment` 返回 · `GET /api/caw-status/{id}` · `/refresh` | 伪造 tx hash / CAW 状态；把 mock 当真实链上 |
| **PM / Demo** | `docs/pm/` · `docs/backend/P2_APIS.md` | P2 **展示层** metadata / simulation（可选） | 把 P2 simulation 写成 live execution |
| **前端（我们）** | `frontend/` | `lib/api/*` adapter · `lib/console/console-state.tsx` · UI | 改 `app/` · 未授权改 Landing |

**联调文档入口**

- 前端侧：[`frontend/backend-integration.md`](../../backend-integration.md)
- 后端深文档：[`docs/backend/README.md`](../../../docs/backend/README.md) · [`TESTING.md`](../../../docs/backend/TESTING.md) · [`CAW_ADAPTER.md`](../../../docs/backend/CAW_ADAPTER.md) · [`DEPLOYMENT.md`](../../../docs/backend/DEPLOYMENT.md)
- P2 展示边界：[`docs/pm/P2_DEMO_HANDOFF.md`](../../../docs/pm/P2_DEMO_HANDOFF.md)
- 全仓库纪律：根目录 `CLAUDE.md` · `AGENTS.md`

---

## 2. 设计原则（吸收参考稿，拒绝贴纸方案）

### 2.1 参考稿 → 实现翻译

| 参考 ID | 文件 | 主要借鉴 |
|---|---|---|
| `console-overview-light` | `assets/images/console/references/ref-console-overview-light.png` | Agent 左栏卡片：Hero 吉祥物区 + Chat + Quick Actions + 底部输入 |
| `agent-treasury-hub` | `…/ref-agent-treasury-hub.png` | Agent+Treasury 主舞台 Workflow stepper；右栏四模块卡片密度 |
| `treasury-focus-split` | `…/ref-treasury-focus-split.png` | Treasury 余额 Hero + 面积图 + Risk gauge |
| `command-center-grid` | `…/ref-command-center-grid.png` | Wallets / Analytics / Policy 单模块卡片内部结构 |

**不做**：把 `module-mascots/*.png` 缩小后 `absolute` 贴在 stage 角落。

**要做**：为每模块定义 **Card Hero Slot**（grid 区域，约占卡片高度 30–45%），吉祥物与 chart / stepper / chat **同构排版**。

### 2.2 亮暗色

- 全 Console 使用 `globals.css` 语义 token（`--fg` / `--fg-muted` / `--hud-*`），**禁止** `text-white/55` 等 dark-only 硬编码
- 参考稿偏浅色卡片；实现策略：**在现有 light/dark 切换上「翻译」参考稿层级**（不强制全站浅色），但两种模式均需 WCAG 可读

### 2.3 动效

- 状态驱动（BUSY / blocked / Done），禁止常驻 float + sparkle「玩具感」
- GSAP 仍只用于 Treasury 等特殊段落，不用 ScrollTrigger 驱动模块页主布局

### 2.4 吉祥物资产

| 模块 | 运行时路径 | 参考场景 |
|---|---|---|
| Agent | `public/console/mascots/modules/agent-module.png` | 聊天气泡 · Workflow 侧栏 |
| Treasury | `…/treasury-module.png` | 审计卷轴 · 付款闭环 |
| Wallets | `…/wallets-module.png` | 金库验证 · 资产 donut 旁 |
| Analytics | `…/analytics-module.png` | KPI + 图表并列 |
| Policy | `…/policy-module.png` | Guard topology 旁 |

产品级 Agent 全身像：`public/console/mascots/agent-cfo-mascot.png`（Agent Hub 主角色，与模块场景图分工）

---

## 3. 联调总线（贯穿五模块）

### 3.1 P0 API（Demo 主链路）

```text
contributions + budgetRule
  → POST /api/payment-plan
  → POST /api/risk-check
  → POST /api/execute-payment  (humanApproval.approved=true)
  → GET  /api/audit-report/{auditReportId}
  → GET  /api/caw-status/{cawRequestId}  (+ /refresh 可选)
```

| 端点 | 前端 adapter | 主要消费模块 |
|---|---|---|
| `POST /api/payment-plan` | `lib/api/payment.ts` | **Treasury** |
| `POST /api/risk-check` | `lib/api/risk.ts` | **Treasury** · Policy（规则展示对齐） |
| `POST /api/execute-payment` | `lib/api/caw.ts` | **Treasury** · **Wallets**（结果/tx 展示） |
| `GET /api/audit-report/{id}` | `lib/api/audit.ts` | **Treasury** Done 态 |
| `GET /api/caw-status/{id}` | `lib/api/caw.ts` | **Treasury** · **Wallets** |
| `POST /api/agent/chat` | `lib/api/agent.ts` | **Agent**（独立于 mock/real） |

编排参考：`lib/workflow/run-demo-flow.ts` · 运行时：`lib/console/console-state.tsx`（Treasury 已接 real）

### 3.2 CAW / 合约（展示纪律）

- 来源：`docs/backend/CAW_ADAPTER.md` · 后端 `CawAdapter` contract
- **Mock mode**：UI 必须标注 MOCK / Simulated；`txHash` 可为 null
- **Real mode**（后端 opt-in）：展示 provider 返回的 `txHash` / `cawRequestId`；**不**改写 Audit Report 快照
- Render mock 环境：`/api/caw-status/{mockId}/refresh` 返回 404 是 **安全预期**（见 `docs/backend/TESTING.md`）— UI 需友好提示，不能当 bug

### 3.3 Agent 聊天（后端 MiniMax 代理）

- Key 仅在后端 `MINIMAX_API_KEY`；前端只调 `/api/agent/chat`
- 本地/Render 均需后端配置；与 Treasury mock/real **解耦**

### 3.4 环境矩阵

| 环境 | frontend | backend | 说明 |
|---|---|---|---|
| 本地 mock | `NEXT_PUBLIC_DEMO_MODE=mock` | `uvicorn :8000` | 路演默认；不调 P0 API |
| 本地 real | `NEXT_PUBLIC_DEMO_MODE=real` + `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` | 同上 | **每模块 real 验收必跑** |
| Vercel 生产 | 待切换 real + Render URL | `https://agentcfo-backend.onrender.com` | CORS 需含 Vercel 域 + `:3100` |

### 3.5 测试命令（每模块 PR 前）

```bash
# 仓库根 — 后端契约
pytest

# frontend
pnpm typecheck
pnpm build

# 本地 real 冒烟（Treasury 模块必做）
uvicorn app.main:app --reload --port 8000
# 另开终端
cd frontend
$env:NEXT_PUBLIC_DEMO_MODE="real"
$env:NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8000"
$env:PORT="3100"; pnpm dev
# → http://127.0.0.1:3100/console/treasury 完整走通 Generate → Execute → Audit
```

**Demo 数据（全团队一致）**：Alice 20 · **Bob 15 blocked（非白名单）** · Charlie 10 · Data API 5 · 月预算 50 · 单笔 25

### 3.6 P2（可选，仅展示层）

P2 端点 **不进入 P0 执行路径**。若某模块需要增强展示（如 Policy 预检、Evidence 时间线），只读 `docs/backend/P2_APIS.md` + `docs/pm/P2_DEMO_HANDOFF.md`，**先提案再 adapter**，默认 Phase 8 不阻塞。

---

## 4. 执行节奏：逐模块审查门

```text
选定模块 → 视觉方案（对照参考图）→ 实现 UI + 联调 → 自测清单 → 用户 Review
                                                              ↓
                                                    ✅ 通过 → 更新 checklist + HANDOFF → 下一模块
                                                    ❌ 返工 → 同模块迭代，不并行开下一模块
```

**每个模块 Definition of Done**

1. 布局对齐参考稿 **信息层级**（非像素级复刻）
2. 亮/暗色切换可读（无白-on-white）
3. 该模块涉及的 API **mock + real** 行为正确，错误态可见
4. `pnpm typecheck` + `pnpm build` 通过
5. 相关后端测试仍 pass（若动 adapter 类型则 `pytest`）
6. **用户口头/截图 review 通过**

Phase 完成（5 模块全过）后：写 `docs/handoff/` + 更新 `HANDOFF.md` §7。

---

## 5. 模块路线图

> 顺序：**Agent → Treasury → Wallets → Analytics → Policy**  
> 理由：Agent 是叙事入口；Treasury 承载 P0 全链路；后三者消费 Treasury 执行结果。

---

### M1 · Agent `/console`

**视觉参考**：`ref-console-overview-light` 左栏 · `ref-agent-treasury-hub` 左主舞台

| 维度 | 内容 |
|---|---|
| **UI 重构** | PersonaRail → **Agent Card**：Hero Slot（`agent-module.png` 或 `agent-cfo-mascot.png`）+ 身份区；Chat 区气泡层级；底部 Quick Actions 对齐参考 pill（Generate Plan / Check Risk / View Audit） |
| **API** | `POST /api/agent/chat`（已接）；Quick Actions **导航/触发** Treasury 流程（P1：`router.push` + console-state 动作，不重复发明 API） |
| **联调** | 本地 backend + `MINIMAX_API_KEY` 冒烟聊天；无 key 时 graceful 错误 UI |
| **测试** | typecheck · build · 手动：中/EN 切换 · mock/real 徽章 · 聊天发送 |

**Review 焦点**：吉祥物是否在 Card 构图内；Quick Actions 是否可演示；聊天错误是否可读。

---

### M2 · Treasury `/console/treasury`

**视觉参考**：`ref-treasury-focus-split` · `ref-agent-treasury-hub` Treasury 卡

| 维度 | 内容 |
|---|---|
| **UI 重构** | Stage：**Workflow 圆形 stepper** + 步骤说明；可选余额/预算 Hero；Records 左栏卡片化；Metrics 右栏参考 KPI 排版；Done 态 Audit 快照区 |
| **API（P0 全链路）** | `console-state.generatePlan` / `executePlan` / `refreshCawStatus` — **real mode 必验** |
| **CAW** | 展示 `cawRequestId` · `txHash` · refresh 按钮；mock 标注 · real 404 refresh 友好文案 |
| **联调** | 本地 real 完整 demo loop；Bob blocked 标红；Audit Report 只读展示 |
| **测试** | `pytest` · 本地 real 冒烟 · typecheck · build |

**Review 焦点**：评委能否 30s 看懂 pipeline；real/mock 切换；blocked 戏剧化但不造假。

---

### M3 · Wallets `/console/wallets`

**视觉参考**：`ref-command-center-grid` CAW Wallets 卡

| 维度 | 内容 |
|---|---|
| **UI 重构** | Vault 列表 + **Portfolio donut** + Recent tx 风格列表；Signers/Transfer 流程图；Topology 保留但视觉收束 |
| **API** | **不新增端点**；读取 Treasury 执行结果 / `cawStatuses` / audit 中的 tx 信息（`console-state` 或 props） |
| **CAW** | HSM SECURED / Cobo Integrity 为 **展示 badge**；真实 tx 来自 P0 执行结果，mock 时标注 |
| **联调** | 先跑通 Treasury real → 再验 Wallets 是否展示一致 tx / 地址 |
| **测试** | typecheck · build · 亮暗色 · Treasury 执行后 Wallets 数据联动 |

**Review 焦点**：是否像「金库控制台」而非表单堆叠；tx 展示是否与后端一致。

---

### M4 · Analytics `/console/analytics`

**视觉参考**：`ref-command-center-grid` Analytics 卡

| 维度 | 内容 |
|---|---|
| **UI 重构** | 顶部 KPI 四宫格 + 主 Area Chart + Top Categories 条形；时间范围 pill |
| **API** | Phase 8 **以 derived/mock 为主**（从 `console-state` 聚合）；若 Treasury 已 real，图表标注 LIVE vs DEMO |
| **联调** | Treasury Done 后 KPI/曲线切换逻辑；无执行时 Demo 曲线 + 引导文案 |
| **测试** | typecheck · build · 亮暗色 · hasExecuted 状态切换 |

**Review 焦点**：图表是否主角；Demo/Live 标签是否诚实。

---

### M5 · Policy `/console/policy`

**视觉参考**：`ref-command-center-grid` Policy 卡

| 维度 | 内容 |
|---|---|
| **UI 重构** | Guard Topology 横向 Tier 流 + Threshold sliders + Preflight 状态行；Whitelist 列表卡片化 |
| **API** | `budgetRule` 与 `RiskCheckRequest.budgetRule` **字段对齐**（`app/models.py`）；规则变更同步 `console-state`（影响 risk-check） |
| **可选 P2** | `GET /api/p2/policy-guardrails` 只读展示 guardrail 清单（**提案后做**） |
| **联调** | 改 whitelist → Treasury Generate Plan → Bob blocked 行为一致 |
| **测试** | typecheck · build · pytest risk 相关 · 规则编辑 + Treasury 联动 |

**Review 焦点**：Topology 是否可读；规则变更是否真正影响 risk-check。

---

## 6. 跨模块基础任务（Phase 0，部分已完成）

| 项 | 状态 | 说明 |
|---|---|---|
| 删除贴纸式 `ModuleMascot` | ✅ | 已回滚；待 M1 起用 Hero Slot 重做 |
| `text-white/*` → 语义 token | 🔄 | Wallets/Analytics/Policy 已改；Agent/Treasury/command-deck 待扫 |
| 新增 `ModuleHeroSlot` 组件 | ⬜ | M1 开始时引入 |
| Navbar Mock/Real + i18n | ✅ | 已有 |
| Render URL 写入 Vercel | ⬜ | 五模块完成后统一部署 |

---

## 7. 部署与线上联调（Phase 8 收尾）

1. 确认 Render：`https://agentcfo-backend.onrender.com/health`
2. Vercel env：`NEXT_PUBLIC_DEMO_MODE=real` · `NEXT_PUBLIC_API_BASE_URL=<Render>`
3. Render：`MINIMAX_API_KEY`（Agent 聊天）
4. 后端 CORS 含 `https://agentcfo-frontend.vercel.app`
5. 生产 smoke：Agent chat + Treasury real loop

---

## 8. 风险与明确不做

- ❌ 不并行开两个模块的 UI 大改（避免 review 失焦）
- ❌ 不像素级复刻 GPT 参考图（版权/实现成本）
- ❌ 不在前端实现 CAW 签名/链上逻辑
- ❌ 不把 P2 simulation 标为 live
- ❌ 不未 review 就 push 五模块大杂烩 commit（按模块 scope commit）

---

## 9. 文档维护

| 改动类型 | 更新 |
|---|---|
| 完成一个模块 review | `console-module-visual-upgrade-checklist.md` · `HANDOFF.md` §1 |
| 完成 Phase 8 全部 | 新建 `docs/handoff/` · `CLAUDE.md` §7 |
| API adapter 变更 | `lib/api/README.md` · `backend-integration.md` |
| 新增 Hero 组件 | `components/README.md` |
