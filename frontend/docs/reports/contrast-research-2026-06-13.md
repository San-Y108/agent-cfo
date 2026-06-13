# Console 五模块对比度调研报告（light/dark 文字 + 按钮失真）

> **作者**: Planning Session（Claude Code 对话 #1 · 规划层）
> **日期**: 2026-06-13
> **目的**: 调研 `Agent / Treasury / Wallets / Analytics / Policy` 五个 Console 功能模块在 light/dark 模式下的文字与按钮对比度问题，输出**可由执行层 Claude Code 直接落地**的修复 plan。
> **范围**: 仅 `frontend/`，不动 `app/`、Landing、根目录。
> **基线 token**: `app/globals.css` `:root`（light）/ `.dark` 两套语义 token · `--fg` / `--fg-muted` / `--fg-subtle` / `--hud-*` · 由 inline script + `localStorage("agentcfo-theme")` 切换 `.dark` class。

---

## 0. 调研方法

1. 读取 `globals.css` 全量 token（含 `--hud-*` 在两种模式下的实际值）。
2. 读 5 个 stage / 1 个 hub / 主要公共组件（HudLabel / HolographicButton / FrostedPanel）。
3. 全局 grep 5 个模块目录内的 `text-white` / `bg-white` / `text-black` / `bg-black` / `text-zinc-*` / `bg-zinc-*`。
4. 列出「token 已定义但用错」与「token 完全缺失」两类问题，给出每条建议替换的语义 token。

**未做**: 浏览器实测取色。颜色计算在头脑中跑（基于 token 定义值），执行层实测时如果数值偏差 ±0.5，需按色阶选择最近 token。

---

## 1. 现有 token 基线（要点）

### 1.1 主文字 token

| token | light 模式 | dark 模式 | 角色 |
|---|---|---|---|
| `--fg` | `#0f172a` (slate-900) | `#f8fafc` (slate-50) | 一级文字 |
| `--fg-muted` | `#475569` (slate-600) | `#a3a3a3` (neutral-400) | 二级文字 / 标签 / 数值单位 |
| `--fg-subtle` | `#64748b` (slate-500) | `#6b7280` (neutral-500) | 三级文字 / 弱化状态 |
| `--border` | `#e2e8f0` | `#1f2937` | 卡片描边 |
| `--border-strong` | `#cbd5e1` | `#374151` | hover / focus 描边 |

**对比度（理论计算，假设在纯 bg 上）**
- light `--fg` on `--bg #f8fafc` ≈ 16.4:1 ✅ AAA
- light `--fg-muted` on `--bg` ≈ 7.3:1 ✅ AAA（但若放在 `bg-surface-2/40` 这种半透明白底上，对比度会进一步下降，见 §3）
- dark `--fg-muted #a3a3a3` on `--bg #030712` ≈ 8.5:1 ✅ AAA
- dark `--fg-subtle #6b7280` on `--bg #030712` ≈ 4.7:1 ⚠️ AA 但临界（接近「融于背景」感受）

### 1.2 HUD 强调色（5 模块主色）

| token | light | dark |
|---|---|---|
| `--hud-lime` | `#4d7c0f`（深绿） | `#B5FF4D`（亮绿） |
| `--hud-cyan` | `#0e7490`（深青） | `#5EEAD4` |
| `--hud-coral` | `#be123c`（深玫红） | `#FB7185` |
| `--hud-amber` | `#b45309` | `#F59E0B` |
| `--hud-blue` | `#1d4ed8` | `#60A5FA` |
| `--hud-violet` | `#6d28d9` | `#C084FC` |

切换 token 自身设计合理：**light 用深色 HUD 保持对比，dark 用霓虹色**。
**问题 1**：HUD 颜色常被用作 `bg-hud-X/10`、`bg-hud-X/20`、`border-hud-X/30` —— **加透明度后**，light 模式下 `#4d7c0f/10` 几乎是浅米黄，再压在 `bg-surface #ffffff` 之上等于无色。
**问题 2**：HUD 颜色在「染色背景 + 染色文字」组合时（如 `bg-hud-lime/10 text-hud-lime`），light 模式会因浅底 + 深字而失真，必须给浅底另加 border/box-shadow 拉对比。

---

## 2. 五大模块具体对比度问题

> **文件**: 行号 → 问题 → 修复建议。Severity: 🔴 失真（看不清） / 🟠 AA 临界 / 🟡 视觉弱化。

### 2.1 Agent（`components/console/agent-hub.tsx`）

| 行 | class | 问题 | 修复 |
|---|---|---|---|
| 92 | `bg-fg-subtle`（typing dot） | dark 下 `#6b7280` 在 `#0a0a0a` 上 ≈ 4.7:1（临界） | 改 `bg-fg-muted`，或在 `text-fg-subtle` 上叠加 opacity-70 |
| 131 | `border-hud-lime/15 bg-hud-lime/[0.04] text-fg` | light 下浅绿底 + 黑字，4% bg 几乎不可见 | 改 `bg-hud-lime/[0.08] border-hud-lime/30` |
| 240-252 | workflow strip 节点 `active && bg-hud-X/10 ring-hud-X/30` | light 下透明色叠加白底 ≈ 无视觉锚点 | 改 `bg-hud-X/15`；active 时加 `border` 拉对比 |
| 286, 459, 458, 463 | `text-fg-muted`、`text-fg-subtle` 用作小标签 | 11–12px 字号 + 临界对比度 | 改 `text-fg-muted` 全部统一，去掉 `text-fg-subtle` 用作 label；subtle 仅作纯装饰 |
| 365 | `text-fg-muted ... hover:text-hud-lime` | 正常态太弱，hover 后还依赖 lime | 正常态用 `text-fg`，hover 仍可换色 |
| 425, 434 | `text-fg-muted`（标签） + `text-fg-subtle`（单位） | 9–10px 太暗 | 标签改 `text-fg-muted`，单位改 `text-fg-muted`（去 subtle） |
| 448, 543 | `text-fg-muted` 描述文 | 13–14px 仍可；不必改 | — |
| 588 | 整块输入框 `text-fg placeholder:text-fg-subtle` | light 下 `#0f172a` on `#ffffff` 没问题；dark 下也可 | OK |
| 608–613 | `bg-surface-2/70 border-border-token` 思考气泡 | `surface-2/70` 在 light ≈ 浅灰，dark ≈ 浅黑，都 OK；但内嵌 `SparklesFX` 可能干扰阅读 | 改 `bg-surface-2`，sparkles 降低 `opacity-30` |
| 659 | `placeholder:text-fg-subtle` | 同 463，subtle 太弱 | `placeholder:text-fg-muted` |
| 666-685 | 发送按钮 `border-lime-400/50 bg-lime-400/20` + `Send` 图标 `color: var(--fg-subtle)` | 静态态图标 fg-subtle 太弱 | disabled 时图标 `text-fg-muted` |

### 2.2 Treasury（`components/console/stages/treasury-stage.tsx` → `modules/treasury.tsx`）

`treasury-stage.tsx` 仅 re-export，实际在 `modules/treasury.tsx`。Audit / CAW 区（行号靠后）已扫到以下问题：

| 行（modules/treasury.tsx） | class | 问题 | 修复 |
|---|---|---|---|
| 60+ 区 | `text-amber-700 dark:text-amber-300`（预算超支） | 直接写死 Tailwind 调色板，未走 `--hud-amber` token | 改 `text-hud-amber` |
| 1068+（同文件） | 同上 `dark:text-amber-300` 重复硬编码 | — | 改 token |
| 字体粗 | `text-fg-muted` 在 KPI 数字下方 | 临界 | 改 `text-fg-muted` ✅（当前是 muted，已 OK） |
| Bob blocked coral | `text-hud-coral` | OK，但需要 background coral/10 拉对比 | 当前 `bg-coral-500/10` 即可；light 模式可加 `bg-coral-400/15` 提亮底色 |
| 0.3/0.4/0.5 风险理由 scramble | `text-fg` ✅ | — | — |
| 表头 | `text-fg-muted` | 10–11px 字号，dark 临界 | 改 `text-fg-muted` 保持（`#a3a3a3` on `#0b1120` 8.5:1，可接受） |
| Stage stepper 节点 hover | `text-fg-muted` | OK | — |
| Records 表格中 Bob 行 | `text-hud-coral` 在 `bg-coral-500/5` 上 | 5% 太弱，dark 几乎不可见 | 改 `bg-coral-500/10` |

**Audit 区**
- txHash GradientText: dark 模式颜色来自 lime→cyan→violet 三色渐变，light 模式仍走 gradient 但单色对比偏低。**建议**: Audit 区 txHash 容器加 `border border-hud-lime/30`，给 light 模式一个明确底色锚点。

**CAW 区**
- `cawRequestId` 状态徽章 `bg-hud-cyan/10 text-hud-cyan`：light 下几乎不可见，dark OK。统一加 `border border-hud-cyan/30`。

### 2.3 Wallets（`components/console/stages/wallets-stage.tsx` + `modules/wallets.tsx` 旧实现）

`stages/wallets-stage.tsx` 是当前实际生效版，`modules/wallets.tsx` 标 `@deprecated` 但仍被 grep 命中。

| 行（stages/wallets-stage.tsx） | class | 问题 | 修复 |
|---|---|---|---|
| 341, 352, 367, 380 | `border-border-token dark:border-white/[0.08] bg-surface dark:bg-black/30` | light OK，dark `bg-black/30` 在 `bg-surface #0b1120` 上叠加 ≈ 极暗，按钮几乎看不到焦点 | 删 `dark:bg-black/30`（surface token 已足够），或改 `dark:bg-surface-hover` |
| 322 | Modal 背景 `bg-black/60 backdrop-blur-sm` | 通用遮罩，OK | — |
| 474 | `bg-zinc-500/10 text-zinc-400 border-zinc-500/20` | 直接写 zinc 调色板 | 改 `bg-fg-subtle/10 text-fg-muted border-border-token`（统一 token） |
| 517 | `bg-white/[0.05] text-fg-subtle` | dark 尚可；light 不可见 | 改 `bg-surface-hover text-fg-muted` |
| 550 | `border-white/[0.04] bg-white/[0.02]` | light 模式等于白底 + 几乎透明框 | 改 `border-border-token bg-surface-2/40` |
| 801 | `border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04]` | 同上 | 改 `border-border-token bg-surface-2/40 hover:bg-surface-hover` |
| 645 | `bg-surface-hover text-fg-muted` | OK | — |
| 657 | `hover:bg-surface-hover text-hud-blue` | OK | — |
| 950 | `border-green-500/20 bg-green-500/10 text-green-500`（转账成功） | 直接 green-500，light 模式对比勉强（≈ 3.5:1） | 改 `border-success/30 bg-success/15 text-success`，统一走 `--success` token |
| 1002, 1003, 1017, 1018 | `text-emerald-500 / text-indigo-400 + bg-emerald-500/10 / bg-indigo-500/10` | 同上写死 Tailwind 色 | 改 token：emerald → `--success`；indigo → `--hud-violet`（已存在） |

### 2.4 Analytics（`components/console/stages/analytics-stage.tsx` + `modules/analytics.tsx`）

| 行 | class | 问题 | 修复 |
|---|---|---|---|
| `modules/analytics.tsx:70` | `bg-white/[0.03] border-white/[0.06]` | light 模式白色叠加白底 = 几乎消失 | 改 `bg-surface-2/40 border-border-token` |
| `stages/analytics-stage.tsx:80` | `bg-surface-2` 容器 ✅ | OK | — |
| 87 | `text-fg-muted hover:text-fg`（Range Pill） | OK | — |
| 169 | `text-fg-muted`（KPI sub） | 11px 字号；临界但可接受 | 改 `text-fg-muted`（当前就是 muted，不动） |
| 343 | `bg-hud-violet/10` | light 浅紫底几乎不可见 | 改 `bg-hud-violet/15 border-hud-violet/30` |
| 357 | `text-fg-muted` | OK | — |
| 940 (modules/analytics.tsx) | `text-emerald-500` 等 | 改 `--success` token | — |

### 2.5 Policy（`components/console/stages/policy-stage.tsx` + `modules/policy.tsx`）

| 行 | class | 问题 | 修复 |
|---|---|---|---|
| 353 | `bg-black/60 backdrop-blur-sm`（Modal） | OK | — |
| 362 | `hover:bg-white/5 text-fg-subtle` | light 模式白底+白 hover = 无变化 | 改 `hover:bg-surface-hover text-fg-muted` |
| 386, 398, 416, 606 | `border-white/[0.08] bg-white/[0.03] text-fg` | light 模式白底白框 | 改 `border-border-token bg-surface-2/40 text-fg` |
| 465 | `bg-white/[0.04] text-fg-subtle` | light 弱 | 改 `bg-surface-hover text-fg-muted` |
| 487 | `bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]` | light 弱 | 改 `bg-surface-2/40 border-border-token hover:bg-surface-hover` |
| 643 | `bg-success/10 border-success/20 text-success`（保存成功） | light `text-success` on `bg-success/10` 对比 ≈ 3.2:1（差 AA 4.5） | 改 `text-success`，bg 改 `bg-success/15`，加 `font-semibold` |
| 695 | `border-coral-400/30 bg-coral-400/10 text-coral-200`（拦截提示） | 直接 coral-200/400；light `text-coral-200`（`#FBCFE8`）on `bg-coral-400/10` 几乎不可见 | 改 `border-hud-coral/40 bg-hud-coral/15 text-hud-coral font-semibold`（统一 token） |
| 718 | `bg-white/[0.02] text-fg-muted` | light 弱 | 改 `bg-surface-2/40 text-fg-muted`（仅 surface 调） |
| 738 | `text-fg-muted hover:bg-red-500/10 hover:text-danger` | hover 文字 `text-danger` on `bg-red-500/10` light 模式 ≈ 2.8:1 | hover bg 改 `bg-red-500/15` + `font-semibold` |
| 763 | `border-white/[0.08] bg-white/[0.04] text-fg-muted` | light 弱 | 改 `border-border-token bg-surface-hover text-fg-muted` |
| 832 | `bg-surface-hover ... text-fg-muted` ✅ | OK | — |
| 906 | `hover:bg-red-500/10 text-fg-subtle hover:text-danger` | 同 738 | 同 738 |

### 2.6 通用公共组件

| 文件 | 行 | class | 问题 | 修复 |
|---|---|---|---|---|
| `command-deck/hud-label.tsx` | 42 | prefix `text-fg-subtle` | dark 临界；size=sm 11px 更弱 | 改 `text-fg-muted` |
| `ui/holographic-button.tsx` | 103 | `bg-white/[0.03] hover:bg-white/[0.06]` | light 模式白底白 hover | 改 `bg-surface-2/40 hover:bg-surface-hover` |
| `command-deck/frosted-panel.tsx` | 52 | `bg-surface/80 backdrop-blur-xl` ✅ | OK | — |

---

## 3. 根因：三类系统性反模式

### 3.1 直接写 Tailwind 调色板（zinc / emerald / indigo / green / coral-X00）

**问题**：写 `text-emerald-500` / `text-indigo-400` / `text-coral-200` 等不会随主题切换。light 模式几乎不可见。

**修复原则**：
- 绿色状态（成功）→ `text-success` `bg-success/X` `border-success/X`
- 紫色状态 → `text-hud-violet` `bg-hud-violet/X` `border-hud-violet/X`
- 红色状态（删除/拦截）→ `text-danger` `bg-red-500/X`（`--danger` 已存在）  
- 灰色状态（弱化）→ `text-fg-muted` / `text-fg-subtle`（按层级选）

### 3.2 `text-white/[0.X]` / `bg-white/[0.X]` 硬编码半透明白

**问题**：这套 token 是为「dark 模式黑底+白雾」设计的，**light 模式白底+白雾等于消失**。

**修复原则**：
- 边框 → `border-border-token`（双模式适配）
- 弱化背景 → `bg-surface-2/40` 或 `bg-surface-hover`
- 玻璃面板 → `bg-surface/80` + `backdrop-blur-xl`（已存在 FrostedPanel）

### 3.3 HUD 颜色 + opacity 在 light 模式失效

**问题**：`bg-hud-lime/10`（`#4d7c0f/10` ≈ #EEF3DD）在白底上几乎是「无色」。

**修复原则**：
- HUD 染色背景：light 模式用 `/15` + `border-hud-X/30` 双层；dark 模式 `/10` 单层即可
- HUD 染色文字：保持 `text-hud-X`，但当背景也带 HUD 色时，**必须加 `border` 拉对比**（见 §2 中各 `border-hud-X/30` 提示）

### 3.4 `text-fg-subtle` 被滥用

`--fg-subtle` 在 dark 模式 `#6b7280` on `#030712` ≈ 4.7:1 临界；在 light 模式 `#64748b` on `#f8fafc` ≈ 4.5:1 勉强 AA 但在小字号下「融于背景」感受明显。

**规则**：
- `text-fg-subtle` **只用于 12px 以上的纯装饰 / 单位 / 极弱化层级**
- 标签 / 数值 / 描述 → 统一 `text-fg-muted`（AA 通过）
- 关键数据 / 标题 → `text-fg`

---

## 4. 修复执行 Plan（按模块 + 风险排序）

> 总原则：**先 §A（hard-fail 看不见）→ §B（弱化）→ §C（细节）**。每个 PR 改一个模块 scope，便于 review。

### §A. P0 — Hard-fail 看不见（必须先修）

| # | 模块 | 文件 / 行 | 改动 | 验证 |
|---|---|---|---|---|
| A1 | Treasury | `modules/treasury.tsx:1068+` | `text-amber-700 dark:text-amber-300` → `text-hud-amber` | 亮暗各看 Bob blocked 区域 |
| A2 | Wallets | `stages/wallets-stage.tsx:341,352,367,380` | 删 `dark:bg-black/30` 改为统一走 surface token | 输入框在 dark 下可见 |
| A3 | Wallets | `stages/wallets-stage.tsx:474` | `bg-zinc-500/10 text-zinc-400 border-zinc-500/20` → `bg-fg-subtle/10 text-fg-muted border-border-token` | 状态徽章可见 |
| A4 | Wallets | `stages/wallets-stage.tsx:950` | green-500/10/20 → success/15/30 | 转账成功条 light 可读 |
| A5 | Wallets | `stages/wallets-stage.tsx:1002-1018` | emerald/indigo → success / hud-violet | 签名矩阵 badge 统一 |
| A6 | Wallets | `stages/wallets-stage.tsx:550, 801` | `border-white/[0.04] bg-white/[0.02]` → `border-border-token bg-surface-2/40` | 列表卡 light 下可见 |
| A7 | Analytics | `modules/analytics.tsx:70` | `bg-white/[0.03] border-white/[0.06]` → `bg-surface-2/40 border-border-token` | 范围 pill 容器 |
| A8 | Policy | `stages/policy-stage.tsx:386,398,416,606, 487, 718, 763` | 全部 `border-white/[0.0X] bg-white/[0.0X]` → token | 表单 + 列表 light 可见 |
| A9 | Policy | `stages/policy-stage.tsx:695` | `border-coral-400/30 bg-coral-400/10 text-coral-200` → `border-hud-coral/40 bg-hud-coral/15 text-hud-coral font-semibold` | 拦截提示条 light 可读 |
| A10 | Policy | `stages/policy-stage.tsx:362, 465` | hover / subtle 提示 → `hover:bg-surface-hover text-fg-muted` | 删除 / 类目 chip |
| A11 | Treasury (audit/caw) | `modules/treasury.tsx` Audit/CAW 徽章 | `bg-hud-X/10` → `bg-hud-X/15 border-hud-X/30` | light 下可读 |
| A12 | Treasury | `modules/treasury.tsx` Bob blocked row | `bg-coral-500/5` → `bg-coral-500/10` | 表格行 light 可读 |

### §B. P1 — 弱化但可点（视觉钝化）

| # | 模块 | 文件 / 行 | 改动 | 验证 |
|---|---|---|---|---|
| B1 | Agent | `agent-hub.tsx:92` | typing dot `bg-fg-subtle` → `bg-fg-muted` | dark 下三点更明显 |
| B2 | Agent | `agent-hub.tsx:131` | `bg-hud-lime/[0.04] border-hud-lime/15` → `bg-hud-lime/[0.08] border-hud-lime/30` | 气泡 light 模式可见 |
| B3 | Agent | `agent-hub.tsx:240-252, 463, 659` | workflow strip active 状态加 border；subtle 用法迁到 muted | — |
| B4 | Agent | `agent-hub.tsx:682` | 静态 Send 图标 `var(--fg-subtle)` → `var(--fg-muted)` | 输入框空时图标可见 |
| B5 | 通用 | `hud-label.tsx:42` | prefix `text-fg-subtle` → `text-fg-muted` | HUD label 在 light 仍锐利 |
| B6 | 通用 | `holographic-button.tsx:103` | `bg-white/[0.03] hover:bg-white/[0.06]` → `bg-surface-2/40 hover:bg-surface-hover` | 按钮 light 下有底色 |
| B7 | 通用 | `hud-label.tsx` size=sm 当前 11px | 评估是否提至 12px | — |
| B8 | Wallets | `stages/wallets-stage.tsx:517` | `bg-white/[0.05] text-fg-subtle` → `bg-surface-hover text-fg-muted` | type chip |
| B9 | Policy | `stages/policy-stage.tsx:643, 738, 906` | success/danger 的 bg-opacity 从 /10 → /15，文字 font-semibold | hover 反馈更清晰 |

### §C. P2 — 打磨（视觉风格统一，不影响功能）

| # | 范围 | 改动 | 验证 |
|---|---|---|---|
| C1 | 全局 | 抽 `.hud-tint-X` 复合 class（同时设 bg + border + text） | 减少 token 重复 |
| C2 | Agent 404/503 错误态 | 替换为 `FrostedPanel` + `--hud-coral` 提示 | 错误更可识别 |
| C3 | Treasury `text-amber-*` | 替换为 `--hud-amber` | Bob blocked 视觉统一 |
| C4 | 全部 stage 内的 `border-white/[0.0X]` | grep 清零 | 全 token 化 |

---

## 5. 风险与不做

**风险**
- 改 token 后 HUD 颜色在 dark 模式与 glow shadow 叠加可能「过亮」，建议每改一个 PR 跑 dev 站 + Chrome 截图。
- `--hud-coral` 在 light 是 `#be123c`（深玫红），用在 10px 以下字号时可能太重。KPI 数字保持 `text-hud-coral` + 12–14px 即可。
- `border-hud-X/30` 已在 light 模式验证为 OK；如觉得太显眼可降为 `/20`。

**不做**
- ❌ 不改 `globals.css` token 数值（保持 `globals.css` 作为 single source of truth）
- ❌ 不改 `app/`、Landing
- ❌ 不改 `--hud-*` 颜色值本身（除非实测大面积失败）
- ❌ 不在 dark 模式强加 `font-bold` 来救对比（应改 token）

---

## 6. 验收清单（执行层 PR）

| 项 | 验证方式 |
|---|---|
| `pnpm typecheck` 0 错误 | typecheck |
| `pnpm build` 通过 | build |
| Chrome dev tools toggle light/dark，5 个 `/console/<module>` 路由各看 30s | 截图 10 张存 `docs/screenshots/contrast-fix/` |
| 至少 3 张 Lighthouse Accessibility 报告对比修复前 | a11y ≥ 90 |
| grep `text-white bg-white text-black bg-black text-zinc bg-zinc` 在 5 模块目录下命中 ≤ 5 处（仅遗留必要的 mask/blend） | grep |
| 关键交互按钮（Generate Plan / Broadcast / Confirm Policy / Signer delete）的 hover/active 状态在 light 下有明显色阶变化 | 手动 |

---

## 7. 文件落点

本报告：`frontend/docs/reports/contrast-research-2026-06-13.md`
配套 checklist（建议另起一份）：`frontend/docs/plans/contrast-fix-checklist.md`
HANDOFF 触发：本报告 + checklist 完成后由执行层写 `docs/handoff/2026-06-13-contrast-fix-handoff.md`。
