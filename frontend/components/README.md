# components/

业务组件，按域拆分。

## 目录

| 目录 | 业务域 |
|---|---|
| `console/` | **主业务域** — Command Center 工作台 |
| `landing/` | Landing 首页（**锁定**；console 可借用，勿随意改） |
| `ui/` | 通用 UI、aceternity 移植、主题切换 |
| `shared/` | 跨域共享（预留） |
| `agent/` | Agent 相关（遗留 README，实际逻辑在 `console/agent-*.tsx`） |
| `caw/` | CAW 展示（遗留 README，实际逻辑在 `console/modules/wallets.tsx`） |

## console/ 结构

```
console/
  agent-hub.tsx           Agent 中心 + 聊天
  agent-character.tsx     Agent 角色视觉
  edge-capsule.tsx        左右边缘胶囊导航
  module-panel.tsx        分屏面板壳
  navbar.tsx              顶部 pill 导航
  drawer.tsx              Sandbox + Live Rules 抽屉
  modules/
    treasury.tsx          付款流水线（GSAP 水平滚动）
    wallets.tsx           钱包 / 转账
    analytics.tsx         图表 / KPI
    policy.tsx            规则 / 白名单
  command-deck/           HUD 设计 primitives
  charts/                 recharts 封装
```

## landing/ 可复用资产

以下组件已被 console 借用或可参考，**禁止删除**：
- `holographic-card.tsx` · `web3-node-cloud.tsx` · `card-splitter.tsx`
- `transaction-marquee.tsx` · `pipeline-showcase.tsx` · `velorix-hero.tsx`

## 已移除（历史）

`/demo` 时代的 `demo/`、`payment/`、`risk/`、`approval/`、`execution/`、`audit/`、`workflow/` 已在 Phase H2.6 清理。
