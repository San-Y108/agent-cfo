# app/

Next.js App Router 路由入口。

## 页面

| 路由 | 文件 | 说明 |
|---|---|---|
| `/` | `page.tsx` | Landing 首页 |
| `/console` | `console/page.tsx` | Console 默认首页 — Agent Hub |
| `/console/agent` | `console/agent/page.tsx` | Agent 别名（navbar 高亮同 `/console`） |
| `/console/treasury` | `console/treasury/page.tsx` | Treasury 全页 — 付款执行流水线 |
| `/console/wallets` | `console/wallets/page.tsx` | CAW 钱包管理 |
| `/console/analytics` | `console/analytics/page.tsx` | 资金分析图表 |
| `/console/policy` | `console/policy/page.tsx` | 规则 / 白名单 / 阈值 |

## Console 布局

`console/layout.tsx` 提供：
- 全局暗色背景（Grid + Noise）
- `ConsoleNavbar` — 顶部 pill 导航（5 tab）
- `ConsoleDrawer` — Sandbox + Live Rules 全局抽屉
- `ConsoleStateProvider` — 面板开合等状态

## 架构说明

- **双入口**：`/console` 同时支持 Agent Hub（分屏面板模式）与各子路由全页模式
- Phase 7.2 计划：子路由可能重定向到 `/console?panel=…` 或保留并存
- 旧 `/demo` 路由已移除，功能由 `/console/treasury` 承接

## 后续计划（未实现）

- `/audit` — 独立审计报告页（`lib/constants/routes.ts` 已预留）
- `/settings` — 配置页（预留）
