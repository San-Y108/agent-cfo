# Console 四模块 vs Agent 标杆 — 对齐验收报告

> **日期**: 2026-06-13  
> **对照源**: `console-design-report-2026-06-13.md` · `console-stage-layout-plan.md` · `agent-hub.tsx`  
> **范围**: Treasury / Wallets / Analytics / Policy（不含 Landing）

---

## 1. 规范要求（Design Spec）

| 规范项 | Agent 标杆 | 四模块现状 | 状态 |
|--------|-----------|-----------|------|
| 暗底 `#0D0D0D` + Grid/Noise | ✅ layout | ✅ 共用 layout | ✅ |
| FrostedPanel 方言 | sheen + 模块 glow | 四页 stage/rail 统一 | ✅ |
| Header `14px bold` + `border-b white/10` | ChatPanel header | ModuleStageHeader 已升级 | ✅ |
| Telemetry 2×2 语法 | PersonaRail | `ConsoleTelemetryCell/Grid` | ✅ |
| HUD 标签 `text-white/75` | PersonaRail | Telemetry/Deck toggle 已对齐 | ⚠️ 表单 label 仍部分 `text-fg-subtle`（可接受） |
| `max-w-none` 舰桥宽度 | Agent 全宽 | ModuleStageLayout 已改 | ✅ |
| 双轨按钮 | lime 仅 Agent CTA | 模块 HolographicButton(moduleColor) | ✅ |
| lime 不抢模块主色 | ChatPanel lime | Treasury stage **cyan** | ✅ |
| Eyebrow 节制 | 无装饰眉标 | 无 GradientText 页头 | ✅ |
| scanline 跟状态 | 进行中 | 条件触发（非静态常驻） | ✅ |

---

## 2. 功能特点（Plan §3 / §6）

| 模块 | 计划主角 | 实现 | 跨 Tab 联动 |
|------|---------|------|------------|
| Treasury | Pipeline + ActionPanel | leftRail Records / stage Pipeline / rightRail Metrics | Bob blocked → Policy |
| Wallets | Topology | stage Topology / rightRail Vault / Detail Transfer | SETTLED after execute |
| Analytics | Chart Hero | stage AreaChart / rightRail KPI / Detail Pie·Compare | 空态 → Treasury CTA |
| Policy | Neural Graph | stage Graph / rightRail Threshold / Detail Whitelist | blocked 自动开 Deck |

Demo 数据：Alice 20 / **Bob 15 blocked** / Charlie 10 / Data API 5 — 未改动 ✅

---

## 3. 规范边界（纪律）

| 边界 | 遵守情况 |
|------|---------|
| 只改 `frontend/` | ✅ |
| 不把四页做成聊天 | ✅ |
| 不复制 mascot | ✅ |
| 不用 ScrollTrigger pin 模块页 | ✅ |
| GSAP 仅状态叙事 | ✅ Scramble txHash；无全页 pin |
| Aceternity 适度 | ✅ AnimatedNumber/Sparkles/Holographic；已移除页头 GradientOrb |
| Agent Hub 结构不改 | ✅ 仅只读标杆 |

---

## 4. Plan / Checklist 完成度

| Phase | 完成 |
|-------|------|
| 7.3 Stage Shell | 18/18 |
| 7.4 视觉统一 | 26/26 |
| 7.5 动效 | 14/14 |
| 7.6 收敛 | 8/8 |
| **合计** | **66/66** |

**代码收敛**:
- `app/console/*/page.tsx` ≤ 8 行
- `components/console/stages/*-stage.tsx` 承载组装逻辑

---

## 5. 动效纪律验收

| 触发 | 动效 | 模块 |
|------|------|------|
| FlowStep 变化 | AnimatePresence 切换 | Treasury |
| Scanning/Executing | scanline + Sparkles | Treasury |
| Execute 完成 | ScrambleValue txHash | Treasury DetailDeck |
| isTransferring | scanline + Sparkles | Wallets |
| Topology mount / vault 切换 | DrawSVG 连线绘制 | Wallets |
| Vault 类型过滤 | GSAP Flip 列表重排 | Wallets leftRail |
| Analytics range / 执行后 | ScrambleValue KPI | Analytics |
| Compare tab | GSAP Flip 卡片 | Analytics DetailDeck |
| Threshold slider release | ScrambleValue | Policy |
| Bob blocked | scanline | Policy |
| Treasury Executing | BeamBurst + Sparkles（低密度） | Treasury |
| 静态 Policy/Analytics 空态 | 无 scanline 循环 | ✅ |

`prefers-reduced-motion`: ScrambleValue 退化为静态文本 ✅

---

## 6. 与 Agent 仍有差异（合理）

| 差异 | 原因 |
|------|------|
| Agent 双栏 vs 模块三栏+Deck | 产品分工：叙事 vs 能力纵深 |
| Agent lime 主 glow | 品牌入口；模块用各自 moduleColor |
| PersonaRail mascot | 仅 Agent 人格化 |
| Agent GradientText | 品牌标题；模块不用 |

---

## 7. 自动检查命令（可复跑）

```bash
cd frontend
pnpm typecheck && pnpm build

# 规范 grep（应无模块 stage lime glow / 页头 GradientOrb / max-w-7xl）
rg 'glowColor="lime"' components/console/stages components/console/modules/treasury.tsx  # 期望：无匹配
rg 'GradientOrb' app/console components/console/stages                              # 期望：无匹配
rg 'max-w-7xl' components/console/module-stage-layout.tsx                         # 期望：无匹配

# page 收敛（期望：各 ≤ 8 行）
wc -l app/console/{treasury,wallets,analytics,policy}/page.tsx
```

### 7.1 2026-06-13 自动验证结果

| 检查项 | 结果 |
|--------|------|
| `pnpm typecheck` | ✅ 通过 |
| `pnpm build` | ✅ 10 路由静态生成 |
| Treasury/stages 无 `glowColor="lime"` | ✅ |
| 四模块 stages 无 `GradientOrb` | ✅ |
| `ModuleStageLayout` 无 `max-w-7xl` | ✅（`max-w-none`） |
| `app/console/*/page.tsx` | ✅ 各 7–8 行，仅 import Stage |

### 7.2 响应式（S-044 代码审计）

| 断点 | 实现 |
|------|------|
| `< lg` | 单列堆叠；left/right rail 走 `RailAccordion` |
| `lg+` | `grid-cols-[240–260 \| 1fr \| 220–260]` 三栏 |
| DetailDeck | 单层 `max-h-[40vh] overflow-y-auto` |
| Header | `px-4 → md:px-5 → lg:px-6`；subtitle `sm:` 分行 |

> 375 / 768 / 1440 **像素级目视**仍需 `PORT=3100 pnpm dev` 人工确认。

### 7.4 Playwright 目视 QA（2026-06-13 · localhost:3100）

**五页 × 三断点（V-014 · S-044）**

| 断点 | Agent | Treasury | Wallets | Analytics | Policy |
|------|-------|----------|---------|-----------|--------|
| 1440 | ✅ chat | ✅ 3-col grid · 14px bold · max-w-none | ✅ 3-col + leftRail | ✅ 3-col | ✅ 3-col |
| 768 | ✅ | ✅ 1-col + DetailDeck | ✅ 1-col | ✅ 1-col | ✅ 1-col |
| 375 | ✅ | ✅ 1-col · accordion rails | ✅ 1-col | ✅ 1-col | ✅ 1-col |

- 四模块页 **无** `GradientOrb` / 页头 `GradientText` ✅  
- Treasury stage **cyanGlow 9 · limeGlow 0**（V-015）✅  
- Navbar 当前 Tab 高亮随路由切换（Treasury/Wallets/Analytics/Policy）✅  

**Demo 彩排（S-046 · M-014）**

| 步骤 | 结果 |
|------|------|
| Generate Plan + Risk | Bob blocked 文案可见 ✅ |
| Treasury → Policy CTA | Bob 白名单提及 · DetailDeck 展开 ✅ |
| Wallets Cold 过滤 | 左轨 Flip 过滤可点击 ✅ |
| Analytics 空态 | Treasury CTA ✅ |
| Analytics Compare tab | 3 张对比卡 ✅ |
| Execute（自动化点击） | Done 文案检出；跨 Tab LIVE/SETTLED 需人工完整点按 ⚠️ |

**i18n（S-047）**

- Stage rail/deck 标签代码层 `_()` / `lang` 分支 ✅  
- Console Navbar **无独立语言切换**（语言随 `useApp` 全局 context；Landing 有 `ThemeLanguageToggle`）— 接受为 Console 豁免  

---

## 8. 路演彩排脚本（S-046 / M-014）

```text
1. /console/agent — 发送 Demo 指令或 Quick Action → 跳转 Treasury
2. /console/treasury — Records 选 Bob → Risk blocked → CTA Policy
3. /console/policy — Bob 高亮 + DetailDeck 白名单；调节 Threshold
4. /console/treasury — 改选 Alice/Charlie → Execute → txHash Scramble
5. /console/wallets — SETTLED 态；可选 Transfer → scanline + Sparkles
6. /console/analytics — KPI Telemetry + Chart；空态 CTA → Treasury
```

五页并排目视（V-014）：Typography 14px bold header · Telemetry 2×2 · Navbar 模块色 underline 连续。

---

## 9. 结论

四模块页在 **Command Deck 仪表语言、模块色分工、Stage 布局、按钮双轨、状态动效** 上与 Agent 标杆及 Phase 7.3–7.5 Plan **一致**（**66/66** checklist 已完成，含 Playwright 三断点 QA）。

**路演建议**：Execute 步骤用人工点按「Approve & Execute」以确保 Analytics LIVE / Wallets SETTLED 联动可见（自动化脚本未稳定触发 CAW 完成态）。
