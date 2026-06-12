# Handoff — Console Command Center 重构

> **日期**: 2026-06-12
> **分支**: `main`
> **上一阶段**: Phase 6.2 Command Deck 主角模块改造完成
> **下一阶段**: Phase 7 Console Command Center 重构
> **目标**: 把 Console 从传统导航面板升级为"AI Agent 常驻指挥中心"

---

## 一、背景与决策

经过与用户讨论，确认以下设计方向：

1. **AI Agent 是默认首页和视觉中心**
   - 用户从 Landing 进入 Console 后首先看到 AgentCFO 界面
   - Agent 始终可见，功能模块以面板形式环绕

2. **去侧边栏，改用边缘胶囊导航**
   - 左侧边缘：Treasury、Policy
   - 右侧边缘：Wallets、Analytics
   - 平时贴边隐藏，hover 时浮出
   - 点击后在对应侧展开常驻分屏面板

3. **Landing → Console 电影级进入动画**
   - 时长 2.5s
   - 主题：AI 觉醒 + 全息扫描
   - 突出 Agent CFO 的极客/科幻气质

4. **模块切换微动画**
   - Console 内部切换模块：300-500ms 丝滑过渡
   - 每个模块有独特的进入 signature

---

## 二、架构变更

### 2.1 路由策略

`/console` 将成为统一的 Console 入口，4 个功能模块通过 query state 或内部 state 控制左右面板展开，而不是独立路由。

原因：
- Agent 需要常驻中心，切换模块时不应卸载
- 常驻分屏布局需要同时渲染 Agent + 1-2 个功能面板
- 独立路由会导致页面切换时 Agent 重新 mount

### 2.2 组件结构

```
app/console/
├── layout.tsx          # ConsoleFrame：背景、顶栏、Agent、左右槽
├── page.tsx            # AgentHub + ModulePanel 容器
├── template.tsx        # Boot overlay：2.5s AI 觉醒动画
└── page.tsx (old)      # 将改为 components/console/modules/treasury.tsx

components/console/
├── edge-capsule.tsx    # 左右边缘胶囊触发区
├── module-panel.tsx    # 可滑出的常驻分屏面板
├── modules/
│   ├── treasury.tsx    # Treasury 模块内容
│   ├── wallets.tsx     # Wallets 模块内容
│   ├── analytics.tsx   # Analytics 模块内容
│   └── policy.tsx      # Policy 模块内容
├── agent-persona.tsx   # 中心 Agent 角色（从 agent/page.tsx 提取）
└── sidebar.tsx         # 可删除或保留为 mobile bottom sheet
```

---

## 三、实现计划

详见 `frontend/docs/plans/console-command-center-plan.md`。

**Phase 顺序**：

1. **Phase 7.1**: 布局重构 — 常驻分屏 + 边缘胶囊导航
2. **Phase 7.2**: Landing → Console 2.5s 进入动画
3. **Phase 7.3**: 模块切换微动画
4. **Phase 7.4**: 视觉打磨与验收

---

## 四、关键文件索引

| 文件 | 路径 | 说明 |
|------|------|------|
| 实施计划 | `frontend/docs/plans/console-command-center-plan.md` | 完整 Phase 拆分 |
| 执行 Checklist | `frontend/docs/plans/console-upgrade-checklist.md` | Phase 7 清单 |
| Plan 主文件 | `frontend/docs/plans/console-visual-upgrade-plan.md` | 原始设计规范 |
| Phase 6 Handoff | `docs/handoff/2026-06-12-phase6-command-deck-handoff.md` | 上一阶段交接 |

---

## 五、验收标准

### 功能
- [ ] `/console` 默认显示 Agent hub
- [ ] 左右胶囊可展开对应功能面板
- [ ] 左右面板可同时打开
- [ ] 关闭面板后回到 Agent 视图

### 动画
- [ ] Landing → Console 有 2.5s AI 觉醒 + 全息扫描动画
- [ ] 模块切换有 300-500ms 微动画
- [ ] 支持 `prefers-reduced-motion`

### 代码
- [ ] `pnpm typecheck` 通过
- [ ] `pnpm build` 通过
- [ ] 无 console error/warning

### 视觉
- [ ] 桌面/移动端截图存档
- [ ] 整体符合 Command Deck 设计语言

---

## 六、风险提醒

- **重构量大**：4 个功能页需要抽成模块组件，建议分 Phase 提交
- **移动端适配**：常驻分屏在小屏幕上需要替代方案
- **动画性能**：2.5s 进入动画包含多个同时运行的动效，注意 GPU 占用
- **状态管理**：面板展开状态需要在 layout/page 之间正确传递

---

*Handoff created: 2026-06-12*
