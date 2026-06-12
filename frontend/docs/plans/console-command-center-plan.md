# Console Command Center Redesign — Implementation Plan

> **日期**: 2026-06-12
> **目标**: 把 Console 从传统侧边栏面板升级为"AI Agent 常驻指挥中心"
> **核心概念**: Agent-first Hub-and-Spoke，边缘胶囊导航，常驻分屏面板，电影级进入动画

---

## 一、设计目标

1. **Agent 是默认首页和视觉中心**
   - 用户从 Landing 进入 Console 后首先看到 AgentCFO 界面
   - Agent 始终可见，功能模块以面板形式环绕

2. **边缘胶囊导航**
   - 左侧边缘：Treasury、Policy
   - 右侧边缘：Wallets、Analytics
   - 平时贴边隐藏，hover 时浮出
   - 点击后在对应侧展开常驻分屏面板

3. **电影级进入动画（2.5s）**
   - 从 Landing 进入 Console 时播放"AI 觉醒 + 全息扫描"过渡
   - 突出 Agent CFO 的极客/科幻气质

4. **模块切换微动画**
   - Console 内部切换模块：300-500ms 丝滑过渡
   - 每个模块有独特的进入 signature

---

## 二、架构变更

### 2.1 路由与页面结构

```
/console              → Agent hub（默认首页）
/console?panel=left   → 左侧面板打开（treasury/policy）
/console?panel=right  → 右侧面板打开（wallets/analytics）
```

> 说明：由于 Agent 需要常驻中心，4 个功能模块改为在同一 `/console` 路由下通过 query state 控制左右面板，而不是独立路由。这样切换模块时 Agent 不会卸载。

### 2.2 组件拆分

| 组件 | 职责 | 文件 |
|------|------|------|
| `ConsoleFrame` | 整体框架：背景、顶栏、Agent、左右面板槽 | `app/console/layout.tsx` |
| `AgentHub` | 中心 Agent 角色 + 对话区 | `app/console/page.tsx` / 拆出组件 |
| `EdgeCapsuleGroup` | 左右边缘胶囊触发区 | `components/console/edge-capsule.tsx` |
| `ModulePanel` | 可滑出的常驻分屏面板 | `components/console/module-panel.tsx` |
| `ConsoleBoot` | Landing → Console 2.5s 过渡动画 | `app/console/template.tsx`（增强） |
| `TreasuryModule` | Treasury 面板内容 | `components/console/modules/treasury.tsx` |
| `WalletsModule` | Wallets 面板内容 | `components/console/modules/wallets.tsx` |
| `AnalyticsModule` | Analytics 面板内容 | `components/console/modules/analytics.tsx` |
| `PolicyModule` | Policy 面板内容 | `components/console/modules/policy.tsx` |

---

## 三、Phase 拆分

### Phase 1: Layout Refactor — Persistent Split-Screen

**目标**: 搭建常驻分屏框架

- [ ] 把 `/console` 默认改为 Agent hub
- [ ] 创建 `EdgeCapsuleGroup` 组件：左右各 2 个胶囊
  - 平时贴边隐藏（只露 4-6px 色条 + 图标）
  - hover 边缘区域时胶囊浮出
  - 点击后切换对应侧面板
- [ ] 创建 `ModulePanel` 组件
  - 从左侧/右侧滑出
  - 可调整宽度（默认 360-420px）
  - 可关闭
  - 内部可滚动
- [ ] 改造 `app/console/layout.tsx`
  - 移除之前的 `ConsoleNavDock`
  - 添加左右面板槽
  - Agent 居中自适应
- [ ] 把现有 4 个功能页内容抽成模块组件
  - 保持现有 Command Deck 设计不变
  - 适配面板容器内的 padding/height
- [ ] 响应式
  - 桌面：左右面板常驻
  - 平板：面板变窄
  - 移动端：底部 sheet 或全屏覆盖

**验收**:
- Agent 默认可见
- 点击左/右胶囊可展开对应面板
- 可同时打开左右面板
- 关闭面板后回到纯 Agent 视图
- `pnpm typecheck` + `pnpm build` 通过

---

### Phase 2: Cinematic Entry Animation (2.5s)

**目标**: Landing → Console 的惊艳过渡

**分镜**:

| 时间 | 画面 | 技术实现 |
|------|------|----------|
| 0.0s - 0.4s | 黑屏，中心暗 lime 光点呼吸 | `motion.div` scale + opacity pulse |
| 0.4s - 1.0s | 光点扩展成 Agent 球体 | scale 1→180px + backdrop blur + radial gradient |
| 1.0s - 1.6s | 扫描光束从上至下横扫 | `motion.div` y 轴移动 + 拖尾渐变 |
| 1.6s - 2.0s | HUD 网格、标签、扫描线依次凝结 | opacity + blur 动画 stagger |
| 2.0s - 2.5s | 左右胶囊滑入，Agent 亮起 | x 轴 slide + glow pulse + 文字解码 |

**技术要求**:
- 使用 Framer Motion
- 支持 `prefers-reduced-motion`
- 每会话只播放一次（保留 sessionStorage 标记）
- 总时长 2.5s

**验收**:
- 从 landing 进入 Console 可看到完整动画
- 动画不卡顿
- 动画结束后 Console 正常交互

---

### Phase 3: Module Switch Micro-Animations

**目标**: Console 内部模块切换的丝滑微动效

| 模块 | 动画 |
|------|------|
| Treasury | 左面板从 x:-100% 滑入，内部 KPI 卡片 stagger 出现 |
| Policy | 左面板滑入，神经网络节点逐个亮起 |
| Wallets | 右面板从 x:100% 滑入，金库节点数据包飞入 |
| Analytics | 右面板滑入，Area chart 线条从左侧绘制 |
| Agent | 面板关闭，Agent orb 脉冲一次 |

**技术要求**:
- 时长 300-500ms
- 使用 Framer Motion `AnimatePresence` + spring
- 保持 Agent 不动

**验收**:
- 切换模块时无闪烁
- 动画流畅 60fps
- 快速连续切换不崩溃

---

### Phase 4: Visual Polish & Acceptance

**目标**: 整体质感打磨与验收

- [ ] 胶囊 hover/active 状态视觉统一
- [ ] 面板边框、glow、scanline 风格统一
- [ ] Agent 与面板之间的空间关系调优
- [ ] 移动端适配
- [ ] `pnpm typecheck` + `pnpm build`
- [ ] 桌面/移动端截图
- [ ] Lighthouse 性能检查
- [ ] 更新 checklist 与 handoff

---

## 四、风险与取舍

| 风险 | 说明 | 应对 |
|------|------|------|
| 4 个功能页改为面板后代码重构量大 | 现有 4 个 page.tsx 需要抽成组件 | 分步迁移，先保留原有 UI 再适配容器 |
| 常驻分屏在移动端体验差 | 小屏幕无法同时显示 3 列 | 移动端改用底部 sheet 或全屏覆盖 |
| 2.5s 动画影响首次加载体验 | 用户可能觉得等待久 | 仅在首次进入播放，且动画期间预加载内容 |
| 模块内 Recharts/Canvas 在面板中渲染异常 | 容器尺寸变化可能导致 resize warning | 使用 client-only dynamic import + ResizeObserver |
| Z-index 管理复杂 | Agent、面板、胶囊、抽屉、Boot overlay 层级 | 制定 z-index 规范 |

---

## 五、文件变更清单

### 新增
- `components/console/edge-capsule.tsx`
- `components/console/module-panel.tsx`
- `components/console/modules/treasury.tsx`
- `components/console/modules/wallets.tsx`
- `components/console/modules/analytics.tsx`
- `components/console/modules/policy.tsx`

### 修改
- `app/console/layout.tsx`
- `app/console/page.tsx`
- `app/console/template.tsx`
- `components/console/nav-dock.tsx`（可删除）
- `components/console/sidebar.tsx`（可删除或保留 mobile）
- `components/console/topbar.tsx`（可能需要调整）
- `frontend/docs/plans/console-upgrade-checklist.md`

### 删除/归档
- `components/console/nav-dock.tsx`（如果不再需要）

---

## 六、验收标准

### 功能验收
- [ ] `/console` 默认显示 Agent hub
- [ ] 左边缘胶囊可展开 Treasury / Policy 面板
- [ ] 右边缘胶囊可展开 Wallets / Analytics 面板
- [ ] 左右面板可同时打开
- [ ] 关闭面板后回到 Agent 视图
- [ ] 移动端有替代导航方案

### 动画验收
- [ ] Landing → Console 有过渡动画，时长 2.5s
- [ ] 动画包含 Agent 觉醒 + 全息扫描
- [ ] 模块切换有 300-500ms 微动画
- [ ] 支持 `prefers-reduced-motion`

### 代码验收
- [ ] `pnpm typecheck` 零错误
- [ ] `pnpm build` 成功
- [ ] 无 console error/warning
- [ ] 新增组件有注释

### 视觉验收
- [ ] 桌面/移动端截图存档
- [ ] 面板与 Agent 视觉层级清晰
- [ ] 胶囊隐藏/浮现自然
- [ ] 整体符合 Command Deck 设计语言

---

*Plan created: 2026-06-12*
