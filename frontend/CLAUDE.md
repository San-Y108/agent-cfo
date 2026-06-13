# AgentCFO Frontend — CLAUDE.md

@README.md

> **frontend 总纲 · Agent 工作宪法**  
> 在 `agent-cfo/frontend` 内开发时，**先读本文件**，再读 `HANDOFF.md`（索引）→ 最新 phase handoff → `checklist.md`（任务态）。  
> 本文件只描述 **frontend** 范围；后端契约真相在仓库根 `app/`（见第 8 节）。  
> **Claude Code 可执行 checklist**：`.claude/skills/frontend-agent-workflow/SKILL.md`（根目录 canonical；`paths: frontend/**`）

---

## 0. Context 加载披露（Agent 必读）

| 类型 | 加载方式 | 本目录 |
|---|---|---|
| **宪法** | Session / 触达 `frontend/**` 时载入 `frontend/CLAUDE.md` | 本文件 |
| **README** | 经上方 `@README.md` 随宪法 import | `README.md` |
| **HANDOFF** | **不自动 inject** — Agent 冷启动必须 **Read** `HANDOFF.md` | `HANDOFF.md` |
| **Skills** | **description 常驻**（知道有哪些）；**正文动态**（invoke 或任务匹配） | `/frontend-agent-workflow` |
| **Path rules** | 触达 `frontend/**` 时载入 | 根 `.claude/rules/frontend.md` |

完整说明：`docs/agent-context-loading.md`

**冷启动 Read 链**：本文件 → `HANDOFF.md` → 最新 `docs/handoff/*` → 当前 `docs/plans/*-checklist.md`

---

## 1. 使用者身份 & 协作模型

| 项 | 说明 |
|---|---|
| **主开发者** | threetwoa — 前端负责人，日常使用 **Claude Code**，工作目录以 `frontend/` 为主 |
| **协作方式** | 用户常开 **多个 Agent 分模块并行**；每个 Agent 只负责自己的任务域，产出 **分类 commit**，避免跨域混杂 |
| **你的角色** | 当前 Session 的 Agent：读完本节后确认自己的 **任务域**，不越界改其他模块（除非用户明确授权） |

### 1.1 任务域 ↔ 目录 ↔ commit scope

开工前先对照下表，确认本 Session 负责哪一块：

| 任务域 | 主要路径 | commit scope 示例 |
|---|---|---|
| **Console / Treasury** | `components/console/modules/treasury.tsx` · `stages/treasury-*` · `app/console/treasury/` | `feat(console/treasury): …` |
| **Console / Wallets & CAW** | `components/console/modules/wallets.tsx` · `components/caw/` | `feat(console/wallets): …` |
| **Console / Analytics** | `components/console/modules/analytics.tsx` · `components/console/charts/` | `feat(console/analytics): …` |
| **Console / Policy** | `components/console/modules/policy.tsx` · `app/console/policy/` | `feat(console/policy): …` |
| **Console / Shell** | `agent-hub.tsx` · `edge-capsule.tsx` · `navbar.tsx` · `layout.tsx` · `command-deck/` | `feat(console/shell): …` |
| **Landing** | `app/page.tsx` · `components/landing/*` | `feat(landing): …`（**默认锁定**，需用户授权） |
| **API / Real mode** | `lib/api/*` · `lib/workflow/*` · `backend-integration.md` | `feat(api): …` / `fix(api): …` |
| **i18n** | `lib/i18n/dict.ts` | `chore(i18n): …` |
| **文档 / 交接** | `docs/handoff/*` · `HANDOFF.md` · `checklist.md` | `docs(handoff): …` / `docs: …` |

**Commit 纪律**

- **一 commit 一意图**：同一 scope 内的一次逻辑变更；不要把 Treasury 和 Landing 混进同一个 commit
- **格式**：`<type>(<scope>): <简短说明>` — type 用 `feat` / `fix` / `refactor` / `docs` / `chore` / `style`
- **仅当用户明确要求时**才执行 `git commit`；commit 前跑过本域相关验证（见第 9 节）
- 多 Agent 并行时：改前先 `git pull`，避免同一文件冲突；冲突域交给用户或负责 Shell 的 Agent 协调
- **push 前必须检查远端**：先执行 `git fetch origin main`，再 `git log HEAD..origin/main --oneline`；若远端有领先提交，必须先 `git pull` 合并后再 push；出现冲突时停止并交给用户决策

---

## 2. Agent 执行流程（每个 Session）

```
冷启动读取 → 确认任务域 → Explore → Plan → Execute → Verify → 维护联想 → Summarize
                                                              ↓
                                    （phase 完成 / 用户指令 / 上下文将满时）→ HANDOFF
```

| 阶段 | 动作 |
|---|---|
| **冷启动** | 读本文件 → `HANDOFF.md` → 最新 `docs/handoff/*` → 相关 `docs/plans/*-checklist.md` |
| **确认任务域** | 从用户 prompt 或 handoff §「Suggested next steps」确定 scope；越界先问 |
| **Explore → Plan** | 读相关代码与受影响 README；大改先出计划，等用户确认 |
| **Execute → Verify** | 只改 `frontend/`；`pnpm typecheck` + 必要时 `pnpm build`；**不伪造验证结果** |
| **维护联想** | 完成改动后走 **§2.2 维护清单**（必做联想，不必每项都改） |
| **Summarize** | 简短说明改了什么、验证结果、下一建议；**不要**每个小任务都写 HANDOFF |

### 2.1 Phase 交接（HANDOFF）节奏

> 目的：Session 上下文过载或 API Error 时，下一 Agent 能无损接力；**避免每个小任务都写 HANDOFF**（浪费 token）。

| 时机 | 是否写 HANDOFF |
|---|---|
| 完成一个 **phase**（`docs/plans/*` 中定义的阶段性目标） | ✅ **必须** — 新建 `docs/handoff/` 文档并更新 `HANDOFF.md` 索引 |
| 之后又完成 **每 2 个 phase** | ✅ **必须** — 合并更新 handoff + 刷新 `HANDOFF.md` · `CLAUDE.md` §7 当前状态 |
| 单个小 fix / 单组件微调 / 一次 typecheck 通过 | ❌ 不写；写入 commit message 即可 |
| 用户明确说「写交接 / handoff / 压缩上下文」 | ✅ 立即写 |
| 上下文已很长、多次 retry、或预感 Session 将断 | ✅ 主动提议写 HANDOFF，经用户确认后执行 |

**HANDOFF 产出物**

1. 新建或更新：`docs/handoff/<YYYY-MM-DD>-phase-<N>-<简述>-handoff.md`（模板见 `docs/handoff/TEMPLATE.md`）
2. 更新索引：`HANDOFF.md` §1 当前阶段 + §2 最新 handoff 链接
3. 同步快照：`CLAUDE.md` §7 当前状态（日期 + ✅/⚠️/❌）
4. 勾选进度：相关 `docs/plans/*-checklist.md` 与 `checklist.md`

### 2.2 改动后维护联想清单

完成代码改动后，**联想**下表「是否需要更新」——有关则改，无关则跳过并在 Summarize 里一句带过。

| 你改了… | 检查 / 更新这些文件 |
|---|---|
| 路由增删 | `app/README.md` · `lib/constants/routes.ts` · 根 `README.md` Live URLs（如有） |
| `components/` 结构变动 | `components/README.md` · 对应子目录 README |
| `lib/` 模块 / 数据流 | `lib/README.md` · `lib/api/README.md`（若动 API 层） |
| API adapter / 类型 | `lib/api/README.md` · `backend-integration.md` · 对照 `app/models.py` |
| 设计 token / 动效约定 | 本文件 §10 设计规范 · `docs/plans/*visual*`（如有） |
| env / 部署 / URL | 本文件 §11 关键资产 · 根 `README.md` · `HANDOFF.md` §4 踩坑 |
| 完成 phase / 里程碑 | `HANDOFF.md` · `docs/handoff/*` · 本文件 §7 · `checklist.md` |
| 新增可复用约定 | 沉淀到 **本文件**或对应目录 README，避免规范只存在于聊天里 |

**原则**：规范跟着代码走；chat 里口头约定不算数，必须写入文档。

---

## 3. 项目定位

- **AgentCFO ｜ DAO AI 财务官**：面向 Web3 小团队 / DAO 的 AI 财务官。读取贡献记录 + 预算规则，生成付款计划，执行风险检查，人工确认后通过 **Cobo Agentic Wallet (CAW)** 在受控边界内执行测试网付款，最后输出可审计结算报告。
- 赛道：**Cobo / Agentic Commerce**。核心命题：AI Agent 可以参与真实经济活动，且资金操作必须经过 CAW。
- Slogan：*Give every DAO an AI CFO with a controlled wallet.*

---

## 4. 核心 demo loop

```
contribution records   贡献记录 / 订阅账单
   ↓
payment plan           AI 生成付款计划（含付款原因）
   ↓
risk check             预算 / 白名单 / 单笔限额 / 重复付款 / token 检查
   ↓
human approval         人工确认（blocked 项不可执行）
   ↓
CAW execution          Cobo Agentic Wallet 受控执行（测试网）
   ↓
audit report           tx hash / Agent Wallet / 付款状态 / 剩余预算
```

Demo 场景（与 mock 数据一致）：Alice 20 / Bob 15 / Charlie 10 / Data API 5 USDC；月预算 50、单笔限额 25。**Bob 钱包不在白名单 → blocked**，其余 3 笔通过检查并在人工确认后执行。

---

## 5. frontend 负责范围

- **Landing Page** — `/`，营销叙事 + Hero + scroll sections
- **Console Command Center** — `/console`，Agent-first 工作台（Treasury / Wallets / Analytics / Policy）
- **workflow 展示** — 让评委看见 Agent「思考 → 检查 → 执行」
- **mock / real mode 切换** — env 驱动（见第 8 节、`backend-integration.md`）
- **API adapter** — `lib/api/*`，对接后端端点
- **Vercel deployment**
- **demo presentation clarity** — 评委可理解性是前端核心职责

> **团队边界**：本仓库分 PM / 前端 / 后端 / 合约。我们**只改 `frontend/`**；碰 `app/`、根目录、部署配置须先申请。

---

## 6. 技术栈 & 目录

Next.js 16 (App Router / Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion · GSAP · recharts · lucide-react · @phosphor-icons/react · pnpm

```
app/
  page.tsx                    Landing `/`
  console/
    layout.tsx                Console 壳（navbar + drawer + 背景）
    page.tsx                  Agent Hub `/console`（默认首页）
    treasury/page.tsx         Treasury 全页路由
    wallets/page.tsx          Wallets 全页路由
    analytics/page.tsx        Analytics 全页路由
    policy/page.tsx           Policy 全页路由
    agent/page.tsx            Agent 别名路由

components/
  landing/                    Landing 区（锁定；console 可借用组件，勿随意改）
  console/                    ★ 主业务域
    modules/                  treasury · wallets · analytics · policy
    stages/                   ModuleStageLayout 组装层
    command-deck/             HUD primitives（HudLabel · Scanline · …）
    agent-hub.tsx             中心 Agent + 聊天
    edge-capsule.tsx          边缘胶囊导航（分屏面板入口）
    module-panel.tsx          常驻分屏面板壳
    navbar.tsx · drawer.tsx · …
  ui/                         通用 UI + aceternity 移植

lib/
  api/                        端点 adapter（契约镜像）
  mock/                       后端形状 mock
  workflow/                   runDemoFlow · derive · state-machine
  demo/console-mock.ts        Console 统一 mock 数据
  console/console-state.tsx   Console 全局状态（面板开合等）
  i18n/                       自定义双语 context + dict.ts
  types/console.ts            Console 业务类型
  constants/                  路由 / 项目常量
  gsap.ts                     GSAP ScrollTrigger 配置

docs/
  handoff/                    Phase 交接文档（按 TEMPLATE.md）
  plans/                      阶段计划与 checklist
  reports/                    审计 / 对齐报告
```

---

## 7. 当前状态（2026-06-13）

- ✅ frontend 在团队仓库 `agent-cfo/frontend`，当前分支 **`main`**
- ✅ Vercel 生产：**https://agentcfo-frontend.vercel.app**（mock mode）
- ✅ API types / adapter / mock shape 已对齐后端 contract
- ✅ Landing `/`：Velorix Hero + scroll sections 完成
- ✅ Console `/console`：Phase 7.3 Stage Shell + Phase 7.4 Command Deck 视觉统一
  - `ModuleStageLayout` 三栏 + DetailDeck；`components/console/stages/*`
  - 对齐报告：`docs/reports/console-module-alignment-audit-2026-06-13.md`
- ⚠️ **线上 mock mode**（`NEXT_PUBLIC_DEMO_MODE=mock`）
- ❌ **real mode 线上** — Treasury 已接 API（`console-state`）；Vercel 仍为 mock；Render URL 待填
- 🔜 **下一主任务**：本地 real 冒烟 → Render URL → Vercel env 切换

> 进度细节以 `docs/plans/console-stage-layout-checklist.md` 为准。Phase 完成后由 Agent 更新本节并写 HANDOFF。

---

## 8. API contract 规则（重要）

- **代码级真相（最高优先）**：`app/models.py`、`app/routers/payments.py`、`tests/test_mvp_flow.py`
- **产品级来源**：规划文档「建议 API」与 Demo 故事
- 后端是唯一 contract source of truth
- **禁止自行发明 endpoint / field / response wrapper**
- 如需新增 / 修改 API：**先输出提案，等确认后再写代码**

---

## 9. 工作边界

- 正式前端开发**只在 `frontend/` 内**进行
- 如需修改 `frontend/` 外文件，**先停止并向用户申请**
- **Landing 锁定**：不随意改 `app/page.tsx`、`components/landing/*`（除非明确授权）
- 执行范式：见 **§2 Agent 执行流程**
- 验证：`pnpm typecheck` / `pnpm build`；**不伪造验证结果**

---

## 10. 设计规范（Console + Landing 共用）

| 项 | 值 |
|---|---|
| 主背景 | `#0D0D0D` |
| 品牌色 lime | `#B5FF4D` |
| Stage 五色 | cyan `#5EEAD4` / coral `#FB7185` / lime `#B5FF4D` / blue `#60A5FA` / violet `#C084FC` |
| 字体 | Inter（正文）+ Courier New（mono / hash） |
| 动效优先级 | GSAP ScrollTrigger（Treasury 水平滚动）> framer-motion > CSS |

---

## 11. 关键资产

| 项 | 值 |
|---|---|
| 仓库 | `github.com/San-Y108/agent-cfo` |
| 分支 | `main` |
| Vercel URL | **https://agentcfo-frontend.vercel.app** |
| Vercel project | `agentcfo-frontend` / Framework = **Next.js** |
| 生产 env | `NEXT_PUBLIC_DEMO_MODE=mock`、`NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` |
| 后端 | FastAPI；**Render URL = TODO**；CORS 未配 |
| 本地 dev | `PORT=3100 pnpm dev`（⚠️ `:3001` 有陈旧 SW 会白屏） |
| Demo 数据 | Alice 20 / Bob 15(blocked) / Charlie 10 / Data API 5 USDC |

---

## 12. 新会话阅读顺序

1. 启用 skill **`frontend-agent-workflow`**（根 `.claude/skills/frontend-agent-workflow/`）
2. 本文件 `CLAUDE.md`（尤其 **§1 任务域** + **§2 执行流程**）
3. `HANDOFF.md` → 跟随 §2 链接读**最新** `docs/handoff/*`
4. 当前 phase 的 `docs/plans/*-checklist.md`
5. `backend-integration.md`（联调 / API Agent 必读）
6. `checklist.md`（任务勾选）

---

## 13. 代码图谱（GitNexus）

仓库已索引 GitNexus（`npx gitnexus analyze`）。探索代码时可用：

- 仓库根 `AGENTS.md` — GitNexus 工具说明
- `npx gitnexus status` — 检查索引是否过期
- MCP 工具（若已配置）：`query` / `context` / `impact`

索引过期时：在仓库根运行 `npx gitnexus analyze`。
