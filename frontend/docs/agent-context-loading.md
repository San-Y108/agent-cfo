# Agent Context 加载披露（Claude Code）

> 说明：**什么会强制进上下文** vs **什么按需动态加载**。  
> 面向 threetwoa 与所有在 `frontend/` 工作的 Agent。

---

## 三层加载模型

| 层级 | 机制 | 何时进入上下文 | 本仓库示例 |
|---|---|---|---|
| **① 宪法** | `CLAUDE.md` · `.claude/rules/` | Session 启动时（向上 walk cwd）；子目录 `CLAUDE.md` 在**读到该目录下文件时**按需加载 | 根 `CLAUDE.md` · `frontend/CLAUDE.md` |
| **② 引导阅读** | 宪法内的 `@import` · 阅读顺序 · path-scoped rules | 随 ① 加载，或匹配 `frontend/**` 时注入 | `@README.md` · `.claude/rules/frontend.md` |
| **③ Skill** | `.claude/skills/*/SKILL.md` | **description 常驻列表**（知道有哪些 skill）；**正文按需**（模型 invoke 或 `/skill-name`） | `frontend-agent-workflow` · `agent-cfo-monorepo-workflow` |

**结论**

- ✅ **宪法（CLAUDE.md）**：设计为 Session 必载（根目录；`frontend/` 在触达 frontend 文件或 cwd 在 `frontend/` 时载入）。
- ✅ **README**：不是全局强制；通过 `frontend/CLAUDE.md` 的 `@README.md` **随 frontend 宪法一起载入**。
- ✅ **Skill 列表（name + description）**：Session 内可见，Agent **知道自己有哪些 skill**。
- ⚠️ **Skill 正文**：动态加载，**不是**默认全文强制；匹配任务时或你输入 `/frontend-agent-workflow` 时载入。
- ⚠️ **HANDOFF.md**：不全局强制；宪法 / rules 要求冷启动 **Read**，Agent 应主动读，而非系统自动注入全文。

官方文档：[Memory / CLAUDE.md](https://code.claude.com/docs/en/memory) · [Skills](https://code.claude.com/docs/en/skills)

---

## Frontend 工作时的预期行为

### 情况 A：在仓库根启动 Claude Code（`agent-cfo/`）

| 自动载入 | 需触达 frontend 后 |
|---|---|
| 根 `CLAUDE.md` | `frontend/CLAUDE.md`（读 `frontend/**` 文件时） |
| 根 `.claude/skills/*` 的 **description** | `.claude/rules/frontend.md`（读 `frontend/**` 时） |
| `agent-cfo-monorepo-workflow` 描述 | `frontend-agent-workflow` 正文（invoke 或相关 prompt） |

**推荐**：前端 Session 用 `cd frontend && claude`，或在第一条 prompt 写「读 `frontend/HANDOFF.md` 后开始」。

### 情况 B：在 `frontend/` 目录启动 Claude Code

| 自动载入 |
|---|
| 根 `CLAUDE.md` + `frontend/CLAUDE.md`（含 `@README.md` import） |
| 根目录所有 skill 的 **description** |
| 首次读 `frontend/**` 文件 → `.claude/rules/frontend.md` |

### 情况 C：Cursor Agent（本 IDE）

| 机制 | 说明 |
|---|---|
| `always_applied_workspace_rules` | 根 `CLAUDE.md` · `AGENTS.md` 等规则注入 |
| `available_skills` | skill **description** 列表；正文 Read 后 follow |
| 子目录 skill | 依赖 Cursor 是否索引 `frontend/.claude/`；**canonical 副本在根** `.claude/skills/frontend-agent-workflow/` |

---

## Frontend 冷启动阅读链（Agent 必须执行）

即使部分文件非系统注入，Agent **仍应按顺序 Read**：

```
1. frontend/CLAUDE.md          ← 宪法
2. frontend/HANDOFF.md         ← 最新 phase 指针
3. frontend/docs/handoff/*     ← HANDOFF §2 链接的最新文档
4. frontend/docs/plans/*-checklist.md
5. （按需）frontend-agent-workflow/SKILL.md 正文
6. （联调）frontend/backend-integration.md
```

## 本仓库已注册的 Workflow Skills

| Skill | 路径 | 作用 |
|---|---|---|
| `agent-cfo-monorepo-workflow` | `.claude/skills/agent-cfo-monorepo-workflow/` | 全仓库角色边界 · 跨目录 · phase 交接 |
| `frontend-agent-workflow` | `.claude/skills/frontend-agent-workflow/` | frontend 多 Agent · scope commit · HANDOFF |

手动调用：`/frontend-agent-workflow` · `/agent-cfo-monorepo-workflow`（Claude Code）

---

## 已知限制

1. **nested `frontend/.claude/skills/`** — 官方支持按需发现，社区反馈偶发不生效；**canonical skill 放在根** `.claude/skills/`。
2. **Skill undertrigger** — 简单 prompt 可能不读 skill 正文；依赖 `CLAUDE.md` + `.claude/rules/frontend.md` 约束。
3. **HANDOFF 非 inject** — 必须 Agent 主动 Read，或由用户在 prompt 中要求。
