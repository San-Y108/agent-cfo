# Next-Phase Prompt Guide — Console Command Deck

> 本文件供下一任 Claude Code 实例在会话开始时阅读。> 把它作为 System/Context Prompt 的锚点，按顺序读取下面列出的文件，再继续执行 Phase 6。

---

## 一、强制阅读顺序

新会话启动后，**严格按以下顺序读取**，不要跳过：

1. `frontend/CLAUDE.md` — 项目总纲、技术栈、工作边界、API 契约规则
2. `frontend/docs/handoff/2026-06-12-phase5-final-handoff.md` — Phase 5 验收完成报告
3. `frontend/docs/handoff/2026-06-12-phase6-command-deck-handoff.md` — 下一阶段目标与任务拆分
4. `frontend/docs/plans/console-upgrade-checklist.md` — 当前进度追踪（翻到末尾看 Phase 6 新增项）
5. `frontend/docs/plans/console-visual-upgrade-plan.md` — 原始设计规范 §8 Taste-Skill

读取完成后，在终端输出：
- 当前分支：`main`
- Phase 5 完成度：52/58 (90%)
- Phase 6 目标：Command Deck 设计语言落地
- 你将要做的第一件事（按 Phase 6 handoff 的 3.1 / 3.2 顺序）

---

## 二、上下文摘要（已确认事实）

### 项目
- **AgentCFO** | DAO AI 财务官 | Next.js 16 + React 19 + TypeScript strict + Tailwind CSS v4 + Framer Motion
- 前端目录：`frontend/`
- 当前分支：`main`
- Dev server：`PORT=3100 pnpm dev`
- Build：`cd frontend && pnpm build`
- Typecheck：`cd frontend && pnpm typecheck`

### Phase 5 已交付
- 5 Console 页面视觉升级完成
- 响应式、Lighthouse、Performance trace、GIF 全部完成
- `analytics/page.tsx` 已改为 client-only dynamic charts
- `sidebar.tsx` logo 已修复 aspect ratio
- `typecheck` + `build` 通过

### Phase 6 方向
- Command Deck 设计语言：1 主角模块 + N 卫星卡
- HUD 数据标签、扫描线、状态脉冲、右上角光晕、Agent 磨砂质感
- 5 页分别改造主角模块
- Aceternity 草稿池提取（BeamCollision、SvgGradientLines、SkewedRectangles 等）

---

## 三、推荐起手动作

阅读完上下文后，按以下顺序开始：

1. **全局基建设施**
   - 创建 `frontend/components/console/command-deck/`
   - 实现 primitives：`HudLabel`、`StatusPulse`、`Scanline`、`CornerGlow`、`FrostedPanel`
   - 在 `frontend/app/globals.css` 添加必要 token（如需）
   - 跑 `pnpm typecheck` + `pnpm build` 验证

2. **第一页试点：Treasury**
   - 把 Payment Execution Pipeline 放大为主角模块
   - KPI / Records / Actions 改为卫星卡
   - 使用新 primitives（HudLabel、StatusPulse、Scanline）
   - 截图验证 + commit

3. **逐页推进**
   - Wallets → Analytics → Policy → Agent
   - 每页单独 commit

4. **Aceternity 提取穿插**
   - 在页面改造间隙提取 A-0 / A-1 / A-4

---

## 四、执行纪律

- **不要修改 `frontend/` 之外的文件**（后端、根目录配置），除非得到明确授权。
- **不要修改 landing 文件**（`components/landing/*`），这些属于另一个并行实例。
- 每页改造后必须：
  1. `pnpm typecheck` 通过
  2. `pnpm build` 通过
  3. Dev server 浏览器验证无 console error
  4. 截图存档到 `docs/screenshots/console-v3/`
- 新增组件必须带注释说明用途和 props。
- 保持 Phase 5 已统一的 spacing/typography/color token。

---

## 五、常见问题速查

**Q: Phase 5 已经改了 analytics/page.tsx，我还能大幅改它吗？**
A: 可以。Phase 6 目标就是打破现有布局。保留 chart card 组件（`components/console/charts/`），只改页面布局。

**Q: Agent 角色现在是 CSS/FM 球体，Phase 6 要 Three.js 吗？**
A: 优先用 CSS/Framer Motion 实现磨砂玻璃质感 + 状态脉冲。Three.js 是真 3D，但资源未准备，作为可选延后。

**Q: Policy 神经网络图用 Canvas 还是 SVG？**
A: 推荐 SVG + Framer Motion（已注册 GSAP 插件但 Club 插件有风险）。Canvas 2D 力导向图也可行，但开发量更大。

**Q: 我可以安装新依赖吗？**
A: 可以，但必须先说明理由和影响面，得到确认后再安装。目前 Aceternity 草稿池 A-8/A-9 依赖 `react-rough-notation` / `react-fast-marquee`，如需安装先报告。

---

## 六、需要用户决策的事项

以下问题在 Phase 6 推进前建议先确认：

1. **Agent 角色**：优先 CSS/Framer Motion 磨砂质感，还是引入 Three.js / glb 模型？
2. **Policy 神经网络图**：用 SVG + FM 静态/简单脉冲，还是 Canvas 2D 力导向图？
3. **Aceternity 提取**：是否安装 `react-rough-notation` / `react-fast-marquee`？
4. **命名**：`command-deck/` 目录名是否可接受？

如果用户没有明确回答，**默认走最小可行方案**（CSS/FM、SVG、不安装新依赖）。

---

*本 Prompt Guide 与 Phase 6 Handoff 配套使用。会话开始时先读 Handoff，再读本 Guide。*
