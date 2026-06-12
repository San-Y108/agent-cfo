# Handoff — Phase 6: Command Deck 设计语言落地

> **日期**: 2026-06-12
> **分支**: `main`
> **上一阶段**: Phase 5 Console Visual Upgrade 验收完成（实质 52/58，90%）
> **下一阶段**: Phase 6 — Command Deck 设计语言落地
> **目标**: 把 Console 从「等距网格仪表盘」升级为「电影级 Command Deck 指挥中心」

---

## 一、上一阶段已交付

- 5 个 Console 页面视觉升级完成（Treasury / Wallets / Analytics / Policy / Agent）
- 响应式检查通过（Desktop 1280×832 + Mobile 390×844）
- Lighthouse 审计完成（Desktop/Mobile 各 5 页）
- Performance trace 完成（5 页 p95 帧时间 5.6–6.9ms，远低于 16.67ms 阈值）
- 3 个关键动效 GIF 产出
- `pnpm typecheck` + `pnpm build` 通过

交付物目录：`docs/screenshots/console-v2/`

---

## 二、Phase 6 目标

打破当前「等距 Bento 网格」布局，为每个 Console 页面建立 **1 个主角模块 + N 个卫星卡** 的 Command Deck 构图。

核心设计语言：
- **HUD 数据标签**：等宽字体数据前缀（`TVL://` `CAW.STATUS` `0x1A` `BUDGET::`）
- **扫描线 + 状态脉冲**：1px 扫描线、呼吸状态点、脉冲边框
- **右上角光晕**：每页主角模块右上角大氛围光球
- **Agent 磨砂质感**：Agent 角色/面板从「全息球体」升级为「磨砂玻璃 + 内发光」
- **非对称布局**：打破当前 4 列 KPI + 3 列图表的对称网格

---

## 三、建议任务拆分

### 3.1 全局设计语言系统

- [ ] **6.1** 新建 `components/console/command-deck/` 目录，沉淀 Command Deck  primitives
  - `HudLabel` — 等宽前缀 + 值
  - `StatusPulse` — 呼吸圆点（lime/coral/amber）
  - `Scanline` — 1px 水平扫描线动画
  - `CornerGlow` — 右上角光晕装饰
  - `FrostedPanel` — 磨砂玻璃面板
- [ ] **6.2** 扩展 `globals.css` token：新增 `--glow-*` / `--hud-*` / `--pulse-*`
- [ ] **6.3** 创建 `CommandDeckLayout` wrapper（可选）：为主角模块提供默认右上光晕 + 扫描线底座

### 3.2 每页主角模块改造

| 页面 | 当前主角 | 建议新主角 | 卫星卡 |
|------|---------|-----------|--------|
| Treasury | 4 列 KPI + Records + Actions | 大型 **Payment Execution Pipeline** 可视化 | KPI 卫星卡、Risk Gate 卫星卡、Audit 卫星卡 |
| Wallets | Wallet List + Topology + Transfer | 大型 **Holographic Vault Topology** | Balance 卫星卡、Signers 卫星卡、Transfer 卫星卡 |
| Analytics | KPI + Area/Pie + Comparison | 大型 **Living Area Chart** | KPI 卫星卡、Pie 卫星卡、Comparison 卫星卡 |
| Policy | 5 Rules BentoGrid + Thresholds + Whitelist | 大型 **Neural Guardrails Graph** | Rules 卫星卡、Threshold 卫星卡、Whitelist 卫星卡 |
| Agent | Agent 球体 + Chat + Quick Actions | 大型 **Sentient CFO Persona** 中心 | Chat 卫星卡、Quick Actions 卫星卡、Voice Waveform 卫星卡 |

### 3.3 Aceternity 草稿池提取（穿插）

优先级：
1. **A-0** `BeamCollision` — Treasury 执行区 / Agent 思考态
2. **A-1** `SvgGradientLines` — 卡片边框 / Header 背景
3. **A-4** `SkewedRectangles` — Agent 3D 角色底座
4. **A-3** `MobileMockup` — Treasury 扫描态 / Agent 预览
5. **A-5** `PathDrawIcon` — SVG 图标自绘动画（Tx 状态图标）

详见 `frontend/docs/plans/console-upgrade-checklist.md` §Aceternity 草稿池提取任务。

### 3.4 具体页面改造点

#### Treasury
- [ ] Pipeline 主角模块：Step 0→4 水平进度条，当前步骤高亮 + 扫描线
- [ ] Records 改为右侧卫星卡，只显示 Top 3 + View All
- [ ] KPI 改为左侧垂直卫星卡列
- [ ] Risk Gate 弹窗改为右下角悬浮卫星卡

#### Wallets
- [ ] Vault Topology 放大到 60% 宽度作为主角
- [ ] Wallet List 改为左侧可折叠卫星卡
- [ ] Transfer 面板改为右下角浮动卫星卡
- [ ] Signers Matrix 改为底部横向卫星卡条

#### Analytics
- [ ] Area Chart 放大为主角（占 60% 宽度）
- [ ] KPI 改为左侧 HUD 数字列
- [ ] Pie Chart 改为右上角卫星卡
- [ ] Comparison Matrix 改为底部卫星卡条

#### Policy
- [ ] 用 Canvas/SVG 实现 Neural Guardrails Graph（5 规则节点 + 脉冲连接）作为主角
- [ ] 5 Rules 改为左侧卫星卡列表
- [ ] Threshold Sliders 改为右侧卫星卡
- [ ] Whitelist 改为底部卫星卡

#### Agent
- [ ] Agent 角色放大为主角（占 50% 宽度）
- [ ] 磨砂玻璃质感 + 内发光 + 状态脉冲
- [ ] Chat 改为右侧垂直卫星卡
- [ ] Quick Actions 改为底部横向卫星卡条
- [ ] 可选：语音波形可视化（4.13 延后项）

---

## 四、关键文件索引

### 新增目录（建议）
```
frontend/components/console/command-deck/    # Command Deck primitives
frontend/components/console/neural-network/  # Policy 神经网络图
```

### 修改重点
```
frontend/app/console/page.tsx           # Treasury 主角模块
frontend/app/console/wallets/page.tsx   # Wallets 主角模块
frontend/app/console/analytics/page.tsx # Analytics 主角模块
frontend/app/console/policy/page.tsx    # Policy 神经网络图
frontend/app/console/agent/page.tsx     # Agent 磨砂质感角色
frontend/app/globals.css                # 新增 HUD/glow/pulse token
frontend/components/console/sidebar.tsx # 保持现状，必要时收窄
```

### 参考文档
```
frontend/docs/plans/console-upgrade-checklist.md      # Phase 5 完成 + Phase 6 待做
frontend/docs/plans/console-visual-upgrade-plan.md    # 原始设计规范
frontend/docs/handoff/2026-06-12-phase5-final-handoff.md # Phase 5 验收报告
frontend/docs/handoff/2026-06-12-next-prompt-guide.md    # 下一实例 Prompt 引导词
```

---

## 五、验收标准（Phase 6）

- [ ] 每页有 1 个明显的主角模块（占视口 40% 以上）
- [ ] 卫星卡与主角模块有清晰视觉层级
- [ ] HUD 数据标签至少覆盖 KPI 和关键状态
- [ ] 扫描线/状态脉冲至少出现在 3 个页面
- [ ] Agent 角色有磨砂玻璃质感
- [ ] 不再使用大面积等距 Bento 网格
- [ ] `pnpm typecheck` + `pnpm build` 通过
- [ ] 新增组件有适当注释和 Storybook/Demo（如项目已有）

---

## 六、风险与建议

- **范围控制**：Phase 6 是「大改」，建议分 2–3 个子阶段，每页单独 commit，避免一次改动过多。
- **性能**：神经网络图/大量 SVG 光晕注意 GPU 占用；优先 CSS/Canvas，慎用大量 DOM 粒子。
- **响应式**：主角模块在移动端应堆叠到顶部，卫星卡垂直排列。
- **Taste-Skill**：保持 Phase 5 已统一的 spacing/typography/color token，不要重新发明颜色。

---

*下一阶段入口：阅读 `frontend/docs/handoff/2026-06-12-next-prompt-guide.md`*
