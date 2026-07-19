---
name: project-init
description: Use when starting a new project, taking over a repo, initializing rules/asset directories on an existing business project, or the user asks to initialize/set up a repository. Covers Cursor MDC rules (Windows path/shell discipline), asset skeleton, external asset migration, humanizer-output-style voice setup, README Polish with Preview/Showcase, and PRD gate. Do NOT use for single-line fixes or already-init'd repos that already have rules+assets and are only doing business features.
sync:
  global_skill: "%USERPROFILE%\\.agents\\skills\\project-init\\SKILL.md"
  tool_copies:
    - "%USERPROFILE%\\.claude\\skills\\  (整目录 junction → .agents\\skills，勿对本路径做删除)"
    - "%USERPROFILE%\\.cursor\\skills\\project-init\\"
    - "%USERPROFILE%\\.opencode\\skills\\project-init\\"
    - "%USERPROFILE%\\.config\\opencode\\skills\\project-init\\"
    - "%USERPROFILE%\\.grok\\skills\\project-init\\"
    - "%USERPROFILE%\\.zcode\\skills\\project-init\\"
  direction: "仓库 docs/knowledge/project-init.md ↔ 全局 .agents skill；改完后同步到上表各工具"
  readme_polish_md: "docs/knowledge/readme-polish/"
  synced_to_tools: "2026-07-19"
---

# Project Init

> **同步说明（review 用）**：本文从全局 Cursor skill `project-init`（`%USERPROFILE%\.agents\skills\project-init\SKILL.md`）同步而来。你在仓库里改完后，再说一声，再写回全局 skill。  
> Phase B 配图细节的 **MD 规范**见 [`readme-polish/`](./readme-polish/)（本次 review 以 MD 为准；标杆 PNG 在全局 skill `references/`）。

系统化初始化仓库：Cursor MDC rules → 资产骨架 → README Polish → Gate。基于本文件 `docs/knowledge/project-init.md`（完整规范）；全局 `project-init` skill 是 Agent 执行面镜像。

## When to Use

| 场景 | 是否跑 |
|------|--------|
| 新接单、仓库尚无 Agent 资产 | **必须** |
| 自己从零开项目 | **必须** |
| 已有业务仓，补规则 / 资产目录骨架 | **必须**（至少跑 Cursor MDC rules 落盘 + 缺的 docs/assets 骨架） |
| 已规范仓库（rules + 骨架齐全）上开业务功能 | 跳过，只跑业务 PRD/handoff |
| 仅改一行文案 | 跳过 |

---

## Phase A — 资产初始化 · 融合 · 需求对齐

### Step 0: Cursor MDC Rules（强制，新项目与存量补骨架都要做）

> 全局用户规则是**真相源**；每个项目必须在仓库内落盘一份，保证本仓 Agent 始终加载，不依赖「碰巧开着全局 rules」。

**真相源（用户级，只读拷贝，勿改内容语义）：**

| 文件 | 作用 |
|------|------|
| `%USERPROFILE%\.cursor\rules\windows-path-discipline.mdc` | Windows 路径：反斜杠、MINGW 转换、ENOENT 处理 |
| `%USERPROFILE%\.cursor\rules\windows-shell-discipline.mdc` | Windows Shell：路径 quoting、`nul` 重定向 |

**项目落盘目标（必须写入当前仓库）：**

```
.cursor/
└── rules/
    ├── windows-path-discipline.mdc   # alwaysApply: true
    └── windows-shell-discipline.mdc  # alwaysApply: true
```

**执行要求：**

1. 解析用户目录：PowerShell 用 `$env:USERPROFILE`；写 `file_path` 时用已解析的绝对 Windows 路径（反斜杠），禁止把 `%USERPROFILE%` / `$HOME` 原样塞进工具参数。
2. 若项目 `.cursor\rules\` 不存在 → 创建。
3. 从用户级目录**复制**上述两个 `.mdc` 到项目 `.cursor\rules\`（已存在且内容一致可跳过；缺失或过旧则覆盖同步）。
4. 保持 frontmatter：`alwaysApply: true`；不要删改纪律正文。
5. 在 `AGENTS.md` / `CLAUDE.md`（若本 Phase 会写）中声明项目规则资产，例如：

   ```markdown
   > **Windows Rules**: 项目级 Cursor rules（`alwaysApply`）—
   > `.cursor/rules/windows-path-discipline.mdc`、
   > `.cursor/rules/windows-shell-discipline.mdc`
   > （从用户级 `%USERPROFILE%\.cursor\rules\` 同步；路径操作与 Shell 必须遵守）。
   ```

6. **存量业务项目**只做「规则 / 资产目录初始化」时：本 Step 仍**不可跳过**；其余 Phase A 步骤按缺什么补什么。

### Step 1: 与用户对齐（写盘前必做，逐项确认）

| # | 确认项 | 说明 |
|---|--------|------|
| 1 | Issue tracker | GitHub Issues / 本地 `.scratch/` markdown |
| 2 | Triage 标签词汇 | 五种 canonical 角色映射 |
| 3 | 单/多 CONTEXT | 是否需要 `CONTEXT-MAP` + `docs/contexts/*` |
| 4 | 外部资产清单 | zip、旧 docs/images、原型图…从哪来、迁到哪 |
| 5 | 产品层根 | `src/` / `frontend/` / monorepo 边界 |
| 6 | 首个业务 theme 名 | 未定则 Phase A 只做骨架 |
| 7 | 项目预期 | 规模/受众/核心产物 |
| 8 | Handoff 形式 | 启用 A–E 哪些场景，默认只 A |
| 9 | 输出语气 | 是否建 `docs/agents/voice.md`；默认建 |
| 10 | Cursor MDC rules | 是否从用户级同步 Windows path/shell discipline 到 `.cursor/rules/`；**默认必须同步** |

### Step 2: 执行顺序

1. **Cursor MDC rules（Step 0）** — 从用户级同步 `windows-path-discipline.mdc` + `windows-shell-discipline.mdc` 到项目 `.cursor\rules\`
2. **`setup-matt-pocock-skills`** — 探查仓库，写 `issue-tracker.md`、`triage-labels.md`、`domain.md`
3. **对齐 `docs/agents/`** — 仅 workflow/deliver/archive/domain/issue-tracker/triage-labels
4. **写入根入口** — `AGENTS.md`、`CLAUDE.md`、`CONTEXT.md`、`LANGUAGES.md`、`README.md` 初稿
5. **引用 `humanizer-output-style`** — 在 AGENTS.md / CLAUDE.md 顶部写入输出语气引用：

   ```markdown
   > **Output Style**: `humanizer-output-style` skill — 统一语气与去 AI 味。详见 `skills/humanizer-output-style/SKILL.md`
   ```

   若项目用 opencode 且选方案 B，复制全局 SKILL.md 到 `.opencode/skills/humanizer-output-style/`。
6. **声明 Windows MDC rules** — 在 AGENTS.md / CLAUDE.md 写入 Step 0 的 Rules 引用（与 humanizer 并列）
7. **骨架目录** — `docs/`（见下树）、`assets/`（backup/images/{readme,avatar,icon}/video/theme/{ppt,script}）、`.cursor/rules/`（MDC 已落盘）
8. **外部资产融合** — 按规范归位，迁移清单给用户确认
9. （可选）**`to-issues`** / **`to-prd`** / **`triage`** — 业务 theme 已定时再用

### Step 3: 目标目录树

```
.cursor/
└── rules/
    ├── windows-path-discipline.mdc
    └── windows-shell-discipline.mdc

docs/
├── agents/              # workflow · deliver · archive · domain
│                        # · issue-tracker · triage-labels · voice
│                        # （不要 language.md / context.md）
├── adr/                 # 000N-kebab-title.md
├── knowledge/           # 可迁移知识
├── glossary/            # 术语库
├── commit-history/      # commit 攒批
└── output/
    ├── report/{theme}/  # 调研分析
    ├── prd/{theme}/     # PRD
    └── handoff/{theme}/ # 交付与交接

assets/
├── backup/              # 上游只读备份
├── images/{readme,avatar,icon}/
├── video/
├── theme/
│   ├── ppt/               # 演示文稿
│   └── script/            # 逐字稿 / 项目介绍稿
```

**禁止**：`docs/images/`、`docs/agents/language.md`、`docs/agents/context.md`  
**禁止**：初始化时漏掉项目级 Windows MDC rules（不可只依赖用户级全局 rules）

### Step 4: Phase A 验收

- [ ] 十项确认已对齐（含 #10 Cursor MDC rules）
- [ ] `.cursor/rules/windows-path-discipline.mdc` 已落盘且 `alwaysApply: true`
- [ ] `.cursor/rules/windows-shell-discipline.mdc` 已落盘且 `alwaysApply: true`
- [ ] AGENTS.md / CLAUDE.md 已声明上述 Windows Rules 引用
- [ ] setup-matt-pocock-skills 完成
- [ ] 根入口就位；AGENTS/CLAUDE 已引用 humanizer-output-style
- [ ] docs/agents 无 language.md/context.md
- [ ] docs + assets 骨架就位
- [ ] 若 #9 启用：voice.md 已产出
- [ ] 无密钥入库

---

## Phase B — README Polish

> **执行细节以 skill `readme-polish` 为准**（标杆图 + 反推 Prompt + scripts）。  
> - 全局：`%USERPROFILE%\.agents\skills\readme-polish\`  
> - 本仓 MD review：[`docs/knowledge/readme-polish/`](./readme-polish/)（standards / prompts / catalog；**本次只 review MD**）

### Step 1: 结构草稿 → brief（契约层）

列出 README 章节 + 配图节点 → `docs/output/prd/readme-diagrams/readme-diagram-brief.md`

内容：章节地图 + 资产清单 + **Architecture 标杆选型** + 设计语言 + 验收  

先 Read（MD）：

- [`readme-polish/references/visual-standards.md`](./readme-polish/references/visual-standards.md)
- [`readme-polish/references/prompt-feed-catalog.md`](./readme-polish/references/prompt-feed-catalog.md)

### Step 2: 出图规范 MD（执行层，关键产物）

Agent **必须**加载 Prompt 模板后再写（本仓路径）：

| 类型 | Prompt MD |
|------|-----------|
| Banner | [`prompts/banner.md`](./readme-polish/references/prompts/banner.md) |
| Features | [`prompts/features.md`](./readme-polish/references/prompts/features.md) |
| Architecture | [`prompts/architecture.md`](./readme-polish/references/prompts/architecture.md) |
| Tech-stack | [`prompts/tech-stack.md`](./readme-polish/references/prompts/tech-stack.md) |
| Workflow | [`prompts/workflow.md`](./readme-polish/references/prompts/workflow.md) |
| Structure | [`prompts/structure.md`](./readme-polish/references/prompts/structure.md) |
| Preview / Showcase | [`prompts/preview-showcase.md`](./readme-polish/references/prompts/preview-showcase.md) |

产出 → `docs/output/prd/readme-diagrams/readme-image-prompts.md`

结构：

- §0 全局规范：链到 visual-standards · 项目色板 · 命名契约 · **生图系统指令**
- 每张说明图：`asset` · `reference_image`（标杆路径）· 布局拆解 · **已填本项目节点的英文 Prompt** · Avoid
- Showcase / Preview：`method: screenshot`，禁止用说明图 Prompt 冒充 UI

**硬约束（摘要）**：颜色 4–6；线条/圆角/间距统一；层级 标题>模块>细节；Banner 宁简勿繁；Showcase 必须真机截图。

主借鉴：**Banner 极简品牌** + **Architecture/Tech-stack**。  
Structure **优先 Markdown 树**；Showcase **只截真机**。

可选脚手架（会拷贝标杆图；review 阶段可跳过）：

```powershell
powershell -File "$env:USERPROFILE\.agents\skills\readme-polish\scripts\scaffold-readme-diagram-prompts.ps1" -ProjectRoot "<项目绝对路径>"
```

**Agent 默认不直接生图**；负责标杆选型、反推 Prompt、路径契约。支持 image-to-image 时附上标杆 PNG。

### Step 3: 出图（用户执行）

- 说明图：`readme-image-prompts.md` + 标杆图 → GPT Image / 同类（优先 img2img）或 Excalidraw/Figma  
- Showcase / Preview：Playwright / 实机  
- 落盘 `assets/images/readme/`（禁止把第三方标杆原样当本项目图）

### Step 4: 标准配图清单

| 文件 | 用途 | 标杆 / 方式 |
|------|------|-------------|
| `banner.png` | 页首横幅（3:1） | `prompts/banner.md` |
| `features.png` | 核心功能一览 | `prompts/features.md` |
| `architecture.png` | 系统架构 | **必选** architecture 标杆 + `prompts/architecture.md` |
| `tech-stack.png` | 技术栈 | `prompts/tech-stack.md`；与 architecture 分工 |
| `workflow.png` | 用户/业务主链路 | `prompts/workflow.md` |
| `structure.png` | 仓库目录结构 | 优先代码块树；`prompts/structure.md` |
| `preview-shell.png` | Preview 站总览 | 真实截图（`preview-showcase.md`） |
| `showcase-*.png` | 产品主链路实机截图 | Playwright |

### Step 5: README 本地预览壳（`preview-readme.{html,css,js}`）

> 每主题/根一套纯静态壳，本地 HTTP 打开即把 `README.md` 按 GFM 渲染。边写边看，改完点「重新加载」，**不必 commit / 推远端才看效果**。走 README Polish 的仓库默认生成。

| 文件 | 职责 |
|------|------|
| `preview-readme.html` | 结构 + 内联 `window.__PREVIEW_README__`（语言/标题/提示/端口错误文案/页脚）；引 CDN `github-markdown-css` + `marked` |
| `preview-readme.js` | `fetch('./README.md')` → `marked.parse` → 注入；`file://` 保护 + 「重新加载」+ 加载状态 |
| `preview-readme.css` | 工具栏 / 页宽 / 状态条样式 |

约定：

- **端口**取 `port-registry` 的「README preview shell」段（每主题唯一），写进主题 `CLAUDE.md` + `port-registry`
- **必须 HTTP 打开**：主题根 `python -m http.server <port>` → `http://127.0.0.1:<port>/preview-readme.html`；`file://` 无法 fetch README
- 别混：README 壳（渲染 README）≠ Preview 站 `src/website-preview/`（资产 Gallery）≠ `preview-shell.png`（Gallery 截图）
- 纯后端 / 无 README 展示需求可省

### Step 6: 组装 + 验收

1. 组装 README：结构 + 样式 + 图引用 + Preview 模块 + Showcase
2. `preview-readme.{html,css,js}` 已生成并绑定 port-registry 端口（或声明省略）
3. 用户 Review

---

## Gate

- 用户 Review init 产物
- 允许开启第一个业务 theme
- 此 Gate 前不写业务功能代码

---

## 日常业务流（init 后）

```
Issue → report/{theme}/ (调研，可选)
  → prd/{theme}/prd.md (draft)
  → approved
  → handoff/{theme}/{task}.md
  → 实施 → awaiting-review【停】
  → 通过 → commit / commit-history / archive

Bug 发现 → OpenCode 诊断（根因 + 复现脚本）
  → GitHub Issue（完整模板）
  → Claude Code 修复 → 复现脚本验证
  → Review → commit（Closes #N）
```

PRD 未批准不写功能代码；一任务一 handoff；Review 先于 commit。

---

## Bug Issue 管理范式

> 发现的 Bug 统一走 GitHub Issue，包含根因分析、复现步骤与修复 Agent 接手引导。

### 角色分工（诊断 → 修复 分离）

| 阶段 | 模型 | 产出 |
|------|------|------|
| 发现 | 用户 / 自查 | 问题描述 |
| 诊断 | OpenCode · DeepSeek | 根因定位 + Playwright 复现脚本 + Issue 撰写 |
| 修复 | Claude Code · GLM | 代码修复 + 复现验证 + commit |
| Review | 用户 | 验收关闭 |

### Issue 模板（8 段标准结构）

```markdown
## 问题描述
<!-- 用户视角，1-3 句 -->

## 根因
<!-- 技术视角：文件、行号、机制 -->

## 复现
### 自动化复现（如有脚本）
### 手动复现

## 关键代码位置
| 文件 | 行号 | 问题 |

## 修复方向（供修复 Agent 参考）

## 接手 Agent 引导
<!-- 1. 怎么复现  2. 怎么修  3. 怎么验证  4. 提交流程 -->
```

### 相关路径

- 复现脚本：`scripts/repro-*.mjs`（可反复运行验证）
- Issue 编号写入 commit body（`Closes #N`）
- 修复完成后 Issue 补充实际方案与验证结果

### 反模式

- ❌ Bug 修完不写 Issue（丢失根因与决策链）
- ❌ Issue 只有标题 + 一句话
- ❌ 同一模型既诊断又修复（缺乏交叉验证）
