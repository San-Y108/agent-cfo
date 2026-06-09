# Session Handoff — 批次 C：业务工作台 `/console` 创新迁移规划

## 文档定位

本文档是**给下一个 Agent / 模型**的完整交接材料。下一会话进入时，**必读此文件 + `frontend/CLAUDE.md` + `frontend/checklist.md` 的 Section H**，即可恢复全部上下文并立即开始执行。

---

## 0. 当前坐标

- **日期**：2026-06-09
- **分支**：`feat/frontend-bootstrap`
- **HEAD commit**：`feat(console): phase 4`（Policy 已落地，珊瑚红主色 + 5 规则大编号 + lime 阈值滑块）
- **已完成 Phase**：0（基础设施）+ 1（Dashboard 壳）+ 2（Wallets）+ 3（Analytics）+ 4（Policy）
- **剩余 Phase**：5（Treasury GSAP 水平滚动）+ 6（清理旧 DemoFlow）
- **关键已知问题**：Phase 2 的 HolographicCard 3D 倾斜 + Web3NodeCloud 拓扑图 创新点尚未实现（context 限制，留作后续增强）
- **远端**：`origin/feat/frontend-bootstrap`（已同步）
- **工作目录**：`D:\OneDrive\Desktop\threetwoa\my-competition\agent-cfo\frontend`
- **dev server 注意**：`PORT=3100 pnpm dev`（`:3001` 有陈旧 Service Worker 会白屏；`:3000` 经常被占用，请用 `:3100`）
- **最新变更**：亮色模式修复 — console 所有组件（layout/sidebar/topbar/drawer/4 pages）已替换硬编码 `bg-[#0D0D0D]`/`text-white` 为 `bg-surface`/`text-fg` + `dark:` 变体

---

## 1. 项目协作宪法（来自用户全局 CLAUDE.md）

```
用户 threetwoa     → 决策 / 真实需求 / 风险接受度 / 最终拍板
GPT / 外部 LLM    → 方向讨论 / spec / prompt
Claude Code（你）  → 读取仓库 / 执行文件 / 实现代码 / 生成报告
Codex             → 基于 git diff 审查 / 找漏洞 / 反过度工程
```

执行范式：**Explore → Plan → Execute → Verify → Summarize**。
非平凡改动先 `pnpm typecheck` + `pnpm build` + smoke test，**不伪造验证结果**。

---

## 2. 本会话已完成内容（背景）

本会话**之前**已经完成的工作（已 commit + push）：

| commit | 内容 |
|---|---|
| `ea5b8ee7` | chore(frontend): rename /demo route to /console business layer |
| `e07715e8` | feat(landing): complete redesign — showcase blocks + GSAP pipeline + footer |
| `7307c77c` | docs(handoff): add session handoff documents for landing redesign |

**landing 已完全锁定**，包含：
- `velorix-hero.tsx`：视频 hero + GSAP scroll-out
- `transaction-marquee.tsx`：6 色调多状态滚动条
- `holographic-card.tsx`：3D 鼠标倾斜（useMotionValue + useSpring 物理阻尼）
- `web3-node-cloud.tsx`：拖拽节点 + SVG 连线实时跟随
- `card-splitter.tsx`：滚动炸裂动画
- `pipeline-showcase.tsx`：GSAP 水平 pin scroll，5 stage 配色（cyan / coral / lime / blue / violet）
- `faq-section.tsx` / `hsm-monitor.tsx`：FAQ + 监控面板
- `guardrails-cta.tsx`：红色 blocked 拦截卡 CTA
- `landing-footer.tsx`：SVG 巨型 wordmark + 4 列链接

**首页主题切换已经移除**（`variant="hero"` 仅保留语言切换）；**业务层 `/console` 完整保留**（`variant="app"`）。

---

## 3. 本次任务：批次 C —— 业务工作台创新迁移

### 3.1 目标一句话

把 AI Studio 设计稿（`D:\OneDrive\Desktop\agentcfo.zip`，已解压至 `D:\OneDrive\Desktop\agentcfo-extracted`）中完整的"DAO AI 财务官工作台"，**创新性地**迁移到本项目 `/console` 业务层路由，把 landing 已验证的视觉精髓融入业务页面。

### 3.2 三大用户决策（已拍板）

| 编号 | 问题 | 决策 |
|---|---|---|
| Q1 | PaymentFlow 怎么处理 | **B：用 landing PipelineShowcase 的 GSAP 水平滚动 + 5 stage 主色重写** |
| Q2 | Sandbox + 实时规则 panel 放哪 | **B：做成 Dashboard 全局右侧 Drawer，所有 tab 都能调出** |
| Q3 | 推进节奏 | **A：直接开 Phase 0 + 1，stop 在 Phase 2 之前等用户验证** |

### 3.3 关键观察（看了 zip 实际源码后修订）

- AI Studio Dashboard 实际只有 **4 个 tab**：treasury / wallets / analytics / policy
- 之前以为的"#22 Sandbox + #23 实时规则调整"是独立模块 —— **错的**。它们已经内嵌在 64KB 的 PaymentFlow 里
- AI Studio 源用 `motion/react` v12 + props 传 theme/lang —— 需要适配为 `framer-motion` v11 + `useApp()` context
- Vite SPA state-driven → Next.js App Router 子路由

---

## 4. 素材来源（绝对路径）

### 4.1 AI Studio 源压缩包

- **zip 路径**：`D:\OneDrive\Desktop\agentcfo.zip`（408KB，2026-06-09 18:41:53 打包）
- **解压路径**：`D:\OneDrive\Desktop\agentcfo-extracted`
- **解压命令**（已执行）：
  ```powershell
  Expand-Archive -Path "D:\OneDrive\Desktop\agentcfo.zip" -DestinationPath "D:\OneDrive\Desktop\agentcfo-extracted" -Force
  ```

### 4.2 解压后目录结构

```
D:\OneDrive\Desktop\agentcfo-extracted\
├── src\
│   ├── App.tsx                     # 54 行，state-driven SPA 入口（不迁，仅参考）
│   ├── main.tsx                    # Vite 入口（不迁）
│   ├── index.css                   # Tailwind v4 配置（参考 token 命名）
│   ├── data.ts                     # mock 数据（MOCK_RECORDS）—— Phase 0 迁移
│   ├── locales.ts                  # ~30KB 双语字典 —— Phase 0 合并到 dict.ts
│   ├── types.ts                    # ContributorRecord / PaymentPlanItem —— Phase 0 迁移
│   └── components\
│       ├── Marketing.tsx           # AI Studio 的 landing，**不迁**（本项目用 velorix-hero 替代）
│       ├── Dashboard.tsx           # ~11KB，Sidebar + Topbar 框架 —— Phase 1 拆 layout
│       ├── PaymentFlow.tsx         # ~64KB，最复杂 —— Phase 5 用 GSAP 重写
│       ├── CawWallets.tsx          # ~32KB，多钱包管理 —— Phase 2
│       ├── AnalyticsView.tsx       # ~18KB，recharts 图表 —— Phase 3
│       └── RulesPolicy.tsx         # ~25KB，规则引擎 —— Phase 4
├── assets\                         # 空（无外部图片素材）
├── package.json                    # 依赖清单参考（recharts^3.8.1, motion^12.23.24）
└── README.md
```

### 4.3 依赖差异表

| 依赖 | AI Studio 版本 | 本项目版本 | 处理 |
|---|---|---|---|
| `motion` / `framer-motion` | `motion@12` | `framer-motion@11` | 全文 import 路径替换 |
| `recharts` | `recharts@3.8.1` | **未装** | **Phase 0 必装**：`pnpm add recharts` |
| `lucide-react` | `0.546.0` | 同源（已装） | 直接复用 |
| `react` | `19.0.1` | 同源（已装） | 直接复用 |

---

## 5. 当前项目结构（你要改的地方）

```
frontend/
├── app/
│   ├── page.tsx                       # landing，🔒 锁定不改
│   ├── globals.css                    # 全局 CSS，含 marquee 动画 + ::selection
│   ├── layout.tsx                     # 根 layout
│   └── console/                       # 业务层（你的主战场）
│       └── page.tsx                   # 当前仍是 <DemoFlow data={demoData} />（要替换）
├── components/
│   ├── landing/                       # 🔒 全部锁定，但可"借用"组件给 console
│   │   ├── velorix-hero.tsx
│   │   ├── transaction-marquee.tsx    # 6 色调系统
│   │   ├── holographic-card.tsx       # 3D 倾斜，可移植到 Wallets
│   │   ├── web3-node-cloud.tsx        # 拖拽节点，可移植到 Wallets 拓扑图
│   │   ├── card-splitter.tsx          # 炸裂动画，可移植到 Policy/Treasury
│   │   ├── pipeline-showcase.tsx      # GSAP 水平滚动，Phase 5 镜像复用
│   │   ├── faq-section.tsx
│   │   ├── hsm-monitor.tsx
│   │   ├── guardrails-cta.tsx
│   │   └── landing-footer.tsx         # SVG wordmark，可借鉴
│   ├── demo/                          # 旧 DemoFlow，Phase 6 评估清理
│   ├── payment/                       # 旧组件，Phase 5 可能吸收
│   ├── risk/                          # 旧组件，Phase 5 可能吸收
│   ├── approval/                      # 旧组件，Phase 5 可能吸收
│   ├── execution/                     # 旧组件，Phase 5 可能吸收
│   ├── audit/                         # 旧组件，Phase 5 可能吸收
│   ├── workflow/                      # 旧组件
│   └── ui/
│       ├── theme-language-toggle.tsx  # variant="hero"|"app"（已就绪）
│       └── ...
├── lib/
│   ├── api/                           # 后端 4 端点 adapter（不动）
│   ├── i18n/
│   │   ├── context.tsx                # useApp() / useT() —— 你要用这个
│   │   └── dict.ts                    # Phase 0 合并 locales.ts 到这里
│   ├── demo/
│   │   └── demo-data.ts               # 旧 mock，Phase 0 不动 / Phase 6 清理
│   ├── gsap.ts                        # GSAP 已配置，Phase 5 直接用
│   ├── workflow/                      # 旧业务逻辑，Phase 5 吸收
│   └── constants/
│       └── routes.ts                  # /console 路由常量
├── checklist.md                       # ✅ Section H 已添加（本次任务清单）
├── CLAUDE.md                          # 项目宪法
└── docs/
    └── handoff/
        └── 2026-06-09-batch-c-plan.md # 本文件
```

---

## 6. Phase 拆解（7 个阶段，按风险递增）

> 完整任务列表见 `checklist.md` Section H。下面是关键执行细节。

### Phase 0：基础设施迁移（先做，无创意）

**目标**：把 AI Studio 的类型 / mock / i18n 字典搬过来，安装 recharts，让后续 Phase 有依赖可用。

**执行**：
1. `pnpm add recharts`
2. 拷贝 `D:\OneDrive\Desktop\agentcfo-extracted\src\types.ts` → `frontend/lib/types/console.ts`（保持接口名）
3. 拷贝 `D:\OneDrive\Desktop\agentcfo-extracted\src\data.ts` → `frontend/lib/demo/console-mock.ts`（保持数据形）
4. **合并 i18n 字典**：
   - 读 `D:\OneDrive\Desktop\agentcfo-extracted\src\locales.ts`（30KB）
   - 加 `console_` 前缀，合并到 `frontend/lib/i18n/dict.ts`
   - 保留现有 dict key 不变（landing 用的）
5. `pnpm typecheck` 验证

**验证标准**：
- [ ] `pnpm typecheck` 零错误
- [ ] `recharts` 出现在 `package.json` dependencies
- [ ] 新 i18n key 在 zh/en 两边都存在

### Phase 1：Dashboard 主壳 + 子路由架构（定调）

**目标**：搭起 `/console` 4 路由 + Sidebar/Topbar 壳 + 全局右侧 Drawer，定下整个业务层的设计语言。

**执行**：

1. **拆分 Dashboard.tsx**：
   - `app/console/layout.tsx`（Server Component 或 'use client'）：Sidebar (260px) + Topbar + `{children}` outlet
   - `app/console/page.tsx`：Treasury 占位（Phase 5 才实现）
   - `app/console/wallets/page.tsx`：Wallets 占位
   - `app/console/analytics/page.tsx`：Analytics 占位
   - `app/console/policy/page.tsx`：Policy 占位

2. **Sidebar 设计**（融合 landing 精髓）：
   - 顶部用 landing footer 同款 SVG `<text textLength="..." lengthAdjust="spacingAndGlyphs">` 自适应 wordmark（避免被截断）
   - 4 nav item 各自带主色 dot + 主色 hover bg：
     - Treasury (`/console`) → lime `#B5FF4D`
     - Wallets (`/console/wallets`) → blue `#60A5FA`
     - Analytics (`/console/analytics`) → violet `#C084FC`
     - Policy (`/console/policy`) → coral `#FB7185`
   - 底部：`<ThemeLanguageToggle variant="app" />` + Exit 按钮

3. **Topbar 设计**：
   - 左：当前 tab 标题 + 副标题
   - 右：Sandbox + Live Rules 触发按钮（打开右侧 Drawer）+ 全局活动指示器（来自 transaction-marquee 同款 pill）

4. **全局右侧 Drawer**（Q2=B 决策）：
   - 浮动按钮（右下角，lime 主色 + 脉冲）触发
   - Drawer 宽度 380px，从右侧滑入
   - 内部含两个 tab：
     - **Sandbox**：mock API latency 滑块 + simulateError toggle + 终端日志（参考 PaymentFlow.tsx 内嵌的 `sandboxLogs` 状态）
     - **Live Rules**：monthlyBudget 滑块 / singlePaymentLimit 滑块 / Whitelist 快速 CRUD（参考 PaymentFlow.tsx 内嵌的 `monthlyBudget` 等状态）
   - 任何 tab 都能调出，调整后状态全局生效（用 Zustand 或 Context）

5. **空状态创新**：
   - 4 个子路由暂未实现时，用 PipelineShowcase 大编号风格的占位：
     ```
     01    Treasury — coming next phase
     02    Wallets  — coming Phase 2
     ...
     ```

**验证标准**：
- [ ] `pnpm typecheck` + `pnpm build` 零错误
- [ ] 4 路由可达且 Sidebar 高亮当前路由
- [ ] 主题切换不破坏布局
- [ ] 语言切换不破坏布局
- [ ] Drawer 可打开 / 关闭
- [ ] Sidebar wordmark 不被截断
- [ ] **STOP 节点**：交付用户验证 Phase 0+1 整体效果

### Phase 2：Wallets（蓝色主色 / 试水模板）

迁移 `CawWallets.tsx` + 融入 3 个创新点：
1. 钱包卡用 HolographicCard 3D 倾斜（移植 useMotionValue + useSpring 模式）
2. 新增"多钱包关系图"区域（Web3NodeCloud 拖拽节点：中心 Agent Vault，周围 Multi-sig / Cold Storage，连线显示资金流向）
3. 危险操作（Transfer 超额）触发 GuardrailsCTA 同款红色拦截卡

### Phase 3：Analytics（紫色主色）

迁移 `AnalyticsView.tsx` + recharts 适配 + 3 个创新点：
1. KPI 大数字用 PipelineShowcase 同款大字号 + 渐变描边
2. 饼图配色用 5 stage 主色
3. 时间范围切换器（30d / 90d / 1y）用 landing pill 风格

### Phase 4：Policy（珊瑚红主色）

迁移 `RulesPolicy.tsx` + 3 个创新点：
1. 5 类规则用 PipelineShowcase 大编号 01-05 排版
2. 白名单 CRUD 表单用 CardSplitter 同款动画
3. 阈值滑块用 lime 主色 + 实时数值闪烁

### Phase 5：Treasury（最难，最后做）

64KB 巨型组件用 landing PipelineShowcase 的 GSAP 水平滚动重写：
- 5 stage：Records → Risk → Approval → Execution → Audit
- 各自主色：cyan / coral / lime / blue / violet（与 landing 完全镜像）
- 4 个创新点：CardSplitter 炸裂 plan / Bob 戏剧化标红 / tx hash marquee pill / 完成后 "Settlement Sealed" 渐变文字

### Phase 6：清理旧 DemoFlow

评估并删除 `components/demo/` `components/payment/` 等下的孤儿组件。

---

## 7. 设计规范（必读）

### 7.1 色彩

```
Background:    #0D0D0D  (Ramp near-black, 全站统一)
Brand lime:    #B5FF4D  (Treasury tab + 品牌强调)
Stage colors:
  cyan         #5EEAD4  (Records / Sandbox)
  coral        #FB7185  (Risk / Policy / Blocked)
  lime         #B5FF4D  (Approval / Treasury)
  blue         #60A5FA  (Execution / Wallets)
  violet       #C084FC  (Audit / Analytics)
Text levels:
  text-white          (标题)
  text-white/85       (正文)
  text-white/55       (次要)
  text-white/35       (极次要)
Borders:
  border-white/10     (弱)
  border-white/[0.06] (极弱)
```

### 7.2 字体

```
Sans:  Inter, sans-serif      (标题 + 主文案)
Mono:  'Courier New', Courier, monospace  (labels / hash / 数据)
Size:  clamp(min, vw, max)   (响应式字号)
```

### 7.3 动效优先级

1. **GSAP ScrollTrigger** —— 仅 Phase 5 Treasury 水平滚动（`lib/gsap.ts` 已配置）
2. **framer-motion** —— 默认动效（reveal / hover / drag）
3. **CSS transition** —— 简单色彩 / 透明度

### 7.4 可借用的 landing 视觉资产

| 资产 | 文件 | 复用场景 |
|---|---|---|
| 3D 鼠标倾斜模式 | `holographic-card.tsx` | Wallets 主卡 |
| 拖拽节点 + SVG 连线 | `web3-node-cloud.tsx` | Wallets 拓扑图 |
| 滚动炸裂动画 | `card-splitter.tsx` | Policy 新增 / Treasury plan 出现 |
| 大编号 + 副色排版 | `pipeline-showcase.tsx` | 空状态 / Policy 规则列表 |
| 6 色调 pill 系统 | `transaction-marquee.tsx` | Topbar 活动流 / Analytics 标签 |
| SVG 自适应 wordmark | `landing-footer.tsx` | Sidebar 顶部 / 空状态 |
| 红色 blocked 卡 | `guardrails-cta.tsx` | Wallets 危险操作 / Treasury Bob blocked |

---

## 8. 严禁事项

- ❌ 1:1 抄 AI Studio（这是创新失败标志）
- ❌ 动 `app/page.tsx`（landing 区已锁定）
- ❌ 动 `components/landing/` 已有组件（除非"借用"组件给 console）
- ❌ 动 backend `app/`（前端边界外）
- ❌ 发明 API endpoint / response wrapper（按 `app/models.py` contract）
- ❌ 删 `components/landing/holographic-card.tsx` 等 5 个 landing 视觉资产
- ❌ 跳过 typecheck / build 验证
- ❌ 大改后不停下来等用户验证（特别是 Phase 1 完成后必须 stop）

---

## 9. 命令清单

### 9.1 开发

```bash
# 当前工作目录
cd D:\OneDrive\Desktop\threetwoa\my-competition\agent-cfo\frontend

# 安装 Phase 0 必需依赖
pnpm add recharts

# 类型检查（每次大改后必跑）
pnpm typecheck

# Build 验证（Phase 完成时必跑）
pnpm build

# Dev server（用户验证时启动；注意端口）
PORT=3100 pnpm dev
# 然后访问 http://localhost:3100/console
```

### 9.2 git 操作

```bash
# 每个 Phase 完成后 commit
git add <files>
git commit -m "feat(console): phase N — <topic>"

# Phase 1 完成后必须 push（用户要验证）
git push origin feat/frontend-bootstrap
```

### 9.3 验证 AI Studio 源（可选）

```bash
# 解压（如果还没解压）
powershell -Command "Expand-Archive -Path 'D:\OneDrive\Desktop\agentcfo.zip' -DestinationPath 'D:\OneDrive\Desktop\agentcfo-extracted' -Force"

# 验证解压成功
ls D:\OneDrive\Desktop\agentcfo-extracted\src\components\
```

---

## 10. 推进节奏（Q3=A 决策）

| 节点 | 动作 | 谁 |
|---|---|---|
| Phase 0 完成 | typecheck 通过即可继续 | Agent 自驱 |
| **Phase 1 完成** | **STOP，commit + push，启动 dev，让用户实测 Sidebar / Drawer / 4 路由** | **用户验证** |
| Phase 1 验证通过 | 继续 Phase 2 | Agent |
| Phase 2 完成 | commit，建议让用户验证（可选） | 看 Agent 判断 |
| Phase 3-4 | 连做，每个 commit 一次 | Agent |
| Phase 5 完成 | STOP，让用户验证（这是最大改动） | 用户验证 |
| Phase 6 完成 | commit + push + 更新 checklist Section H 状态 | Agent |

---

## 11. 给下一个 Agent 的 Quick Start

1. **读 3 个文件**：
   - 本文件（完整上下文）
   - `frontend/CLAUDE.md`（项目宪法）
   - `frontend/checklist.md` Section H（任务清单）

2. **确认环境**：
   ```bash
   cd D:\OneDrive\Desktop\threetwoa\my-competition\agent-cfo\frontend
   git log --oneline -5    # 确认 HEAD = 7307c77c
   git status              # 确认 working tree clean
   ls D:\OneDrive\Desktop\agentcfo-extracted\src\components\  # 确认源文件
   ```

3. **开始 Phase 0**：
   ```bash
   pnpm add recharts
   # 然后迁移 types.ts / data.ts / locales.ts
   ```

4. **Phase 1 完成时必须停下**等用户验证 —— 这是 Q3=A 决策定下的硬性节点。

5. **每个 Phase commit 一次**，commit message 用 `feat(console): phase N — <topic>` 格式。

---

## 12. 已有的 task 队列

当前 TaskCreate 维护的任务（来自上下文，可直接 TaskUpdate 推进）：

| ID | 任务 | 状态 |
|---|---|---|
| 15 | Phase 0: 基础设施迁移 | pending |
| 16 | Phase 1: Dashboard 主壳 + 子路由架构 | pending |
| 17 | Phase 2: Wallets — 多钱包管理 + 创新拓扑图 | pending |
| 18 | Phase 3: Analytics — 数据可视化 | pending |
| 19 | Phase 4: Policy — 规则引擎 | pending |
| 20 | Phase 5: Treasury (Live Run) — 重写 PaymentFlow | pending |
| 21 | Phase 6: 清理旧 DemoFlow 代码 | pending |

---

## 13. Handoff 文档索引

- `docs/handoff/2026-06-09-batch-c-plan.md` —— **本文件**（批次 C 完整规划）
- `docs/handoff/2026-06-09-session-handoff.md` —— 上一会话总 Handoff
- `docs/handoff/2026-06-09-ai-studio-migration.md` —— 批次 A
- `docs/handoff/2026-06-09-batch-b-complete.md` —— 批次 B

---

**结束。下一会话进入时，从 Phase 0 开始。Phase 1 完成后必须停下等验证。**
