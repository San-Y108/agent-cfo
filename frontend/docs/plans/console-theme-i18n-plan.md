# Console 亮色模式 + 全站 i18n 术语规划（2026-06-13）

> **取代**旧文档中的「Console Page Theme Lock / dark-only」结论。  
> **关联审计**：亮色分析 · i18n 术语审计（2026-06-13 会话）

---

## 1. 产品决策（当前有效）

| 范围 | 主题 | 语言 |
|------|------|------|
| **Landing `/`** | **恒暗**（Hero 视频区暗色，不做亮色） | EN / ZH 切换（`ThemeLanguageToggle variant="hero"`） |
| **Console `/console` + 五页** | **亮暗双主题**（跟随 `localStorage agentcfo-theme`） | EN / ZH 切换（Navbar `variant="app"`） |

五页：Agent · Treasury · Wallets · Analytics · Policy

---

## 2. 亮色模式 — 技术路线

1. **去掉** `app/console/layout.tsx` 根节点 forced `dark` + `bg-[#0D0D0D]`
2. **`<html class="dark">`** 为唯一主题开关（已有 `lib/i18n/context.tsx`）
3. **Landing** 保持 `app/page.tsx` 局部 `className="dark"`，不受全局亮色影响
4. 硬编码 `text-white/*` → `text-fg` / `text-fg-muted`；玻璃态 → `--glass-*` token
5. 亮色下提高 `--glow-*` alpha；`.hud-range` 轨道用 `--range-track`

### 分期

| Phase | 内容 |
|-------|------|
| **P0** | layout 解锁 · globals token · navbar/drawer · command-deck 基元 |
| **P1** | agent-hub · treasury · 四 stage · charts |
| **P2** | 动效组件 · dead code · 文档 · 视觉回归 |

---

## 3. i18n — 术语 Glossary（强制执行）

| English | 禁用中文 | 推荐中文 |
|---------|----------|----------|
| Treasury | 国库、财库 | **金库** / Treasury |
| CAW | CWD、协同钱包 | **Cobo Agentic Wallet（CAW）** |
| Wallets | — | **钱包** / CAW 钱包 |
| Vault | 财库钱包 | **Vault 金库** |
| Policy | 智能规则与策略防护 | **策略中心** |
| Guardrails | — | **风控护栏** |
| Agent | AI 助手（Tab） | **智能体** |
| Whitelist | — | **白名单** |
| Human Approval | — | **人工审批** |
| Settlement Report | — | **结算报告** |
| Sandbox | — | **沙盒** |

### 文案源收敛目标

- 唯一词典：`lib/i18n/dict.ts`
- 消灭并行：`treasury.tsx` inline `_()` 逐步迁入 dict
- Landing pipeline：`pipeline-stage-data.ts` 待 P1 补 `*Zh` 字段

---

## 4. 验收（P0）

- [x] Console 主题切换可见且持久化（Navbar `ThemeLanguageToggle variant="app"`）
- [x] Landing 切换全局主题后仍保持暗色（`app/page.tsx` 局部 `dark`）
- [x] Navbar 五 Tab 中英文（`console.tab.*`）
- [x] Treasury / 四 stage / charts / records-import 亮色 token（P1 主体完成）
- [x] Landing pipeline 中文（P2）
- [x] guardrails-cta / landing-footer / web3-node-cloud 双语（P2）
