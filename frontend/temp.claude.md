# AgentCFO Frontend — Temp.claude.md（临时补充规则）

> ⚠️ 本文件为**临时补充规则**，不覆盖原 `CLAUDE.md`。两者冲突时以本文件为准；本文件未覆盖的条目仍遵循原 `CLAUDE.md`。
> 生效范围：当前会话及后续同主题会话，直至用户明确废止或合并回原 `CLAUDE.md`。

---

## 1. 协作拓扑调整（临时）

原拓扑（四层）：用户 → GPT/LLM → Claude Code（执行）→ Codex（审查）

**调整为（三层）**：

| 层级 | 角色 | 职责 |
|---|---|---|
| **决策层** | 用户 threetwoa + GPT/外部 LLM | 最终拍板、需求确认、方向讨论、spec 设计、风险接受 |
| **执行层** | Claude Code（我） | 读取仓库、实现代码、运行验证、生成报告、准备审查材料 |
| ~~审查层~~ | ~~Codex~~ | **暂停使用**（效率考量） |

**关键变更**：
- **Claude Code 兼任执行层 + 审查层**。每轮代码产出后，我自行执行 `git diff` 审查，不等待外部 Codex 审查。
- **审查产出物**：代码自查报告（含 checklist、风险点、改进建议），随提交一起呈现给用户。
- **Codex 仍保留为可选工具**：如用户后续要求 "请 Codex 再看一遍"，可重新激活。

---

## 2. 新增审查职责（自查流程）

每轮非平凡代码改动（多文件、架构、UI、动效）完成后，我必须执行以下自查，**不可跳过**：

### 2.1 代码层面
- `git diff` 逐文件审查：是否有遗漏 debug、console.log、未使用 import、类型错误、硬编码魔数
- 是否符合项目既有代码风格（命名、注释密度、文件组织）
- 是否引入未声明的依赖或修改了 `package.json`

### 2.2 功能层面
- `pnpm typecheck` 是否通过
- `pnpm build` 是否通过（无 build error）
- 改动范围是否超出任务边界（顺手重构 → 需确认或回滚）

### 2.3 产品层面
- UI 改动是否与 DESIGN.md / 用户确认的方向一致
- mock 数据是否保持与后端契约对齐
- 是否有破坏现有页面（`/` Hero、`/demo`、其他路由）

### 2.4 审查报告模板

每次自查后输出简要报告：

```
【自查报告】
- 改动范围：改了 N 个文件，主要涉及...
- typecheck：✅通过 / ❌失败（原因）
- build：✅通过 / ❌失败（原因）
- git diff 审查发现：
  - [ ] 无问题
  - [ ] 发现 X，已修复 / 待确认
- 风险点：...
- 建议用户确认：...
```

---

## 3. 任务规划职责

接到任务后，我负责：
1. 将任务拆分为可执行的子任务清单（checklist）
2. 标注优先级、依赖关系、验证方式
3. 每完成一项勾选，未完成项说明阻塞原因
4. 范围膨胀时停下报告，不自扩边界

---

## 4. 安全边界（不变）

以下操作仍需停下确认，不擅自推进：
- 删除/覆盖/大规模移动文件
- `git push --force`、`git reset --hard`
- 新增依赖（`package.json` 变更）
- 修改 `.claude/`、workflow、settings.json
- 涉及 secrets/tokens/API keys
- 生产环境变更、数据迁移
- 超出 `frontend/` 范围的文件改动

**停机报告机制仍然生效**：遇不确定性 → 停 → 生成 `~/.claude/Docs/reports/YYYY-MM-DD-HHMM-decision-needed-<topic>.md` → 终端只输出摘要 → 等用户决策。

---

## 5. 验证规范（不变）

- 本地 dev：`PORT=3100 pnpm dev`（⚠️ `:3001` 有陈旧 SW 白屏；`:3000` 被占）
- 必跑命令：`pnpm typecheck`、`pnpm build`
- 未运行即未验证，不伪造结果
- 截图/视觉验证：无浏览器工具时靠 `curl` + 请用户肉眼看

---

## 6. 提交规范（不变）

- 用户习惯先 review 再 commit，代码改动先呈现给用户确认
- 确认后 commit → push 到 `feat/frontend-bootstrap`（自动进 PR #1）
- 提交信息遵循 conventional commit：`feat(frontend): ...`、`fix(demo): ...`
