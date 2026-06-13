# Handoff: <Phase N — 简述>

**Date:** YYYY-MM-DD  
**Session ended by:** threetwoa（或 Agent 标识）  
**Next owner:** next Claude Code instance  
**Task domain / scope:** `<例：console/treasury · api>`  
**Current branch:** `main`  
**Latest commits:**（列出本 phase 相关 commit，含 scope）

- `<hash>` `<type>(<scope>): <message>`

---

## 0. 阅读指针（下一 Session 冷启动）

下一 Agent **按顺序**读取：

1. `frontend/CLAUDE.md` — §1 任务域 · §2 执行流程
2. `frontend/HANDOFF.md` — 本文件已在索引中置顶
3. `<本 phase 对应的 docs/plans/*-checklist.md>`
4. （若联调）`frontend/backend-integration.md`

---

## 1. What was done（本 phase 交付）

### Phase N — <名称>

- 变更摘要（bullet，附关键文件路径）
- …

**Verification:**

- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] 手动冒烟（路由 / 交互说明）

---

## 2. Remaining / next work

### Known issues

1. …

### Suggested next steps（下一 Agent 从这里 pick）

1. …
2. …

---

## 3. Key files / paths

| 用途 | 路径 |
|---|---|
| … | … |

---

## 4. 维护文件同步记录

本 phase 已更新：（勾选实际改过的）

- [ ] `frontend/HANDOFF.md`
- [ ] `frontend/CLAUDE.md` §7 当前状态
- [ ] `frontend/checklist.md` / `docs/plans/*-checklist.md`
- [ ] 相关子目录 `README.md`（列出：`…`）
- [ ] `frontend/backend-integration.md`（若动 API）

---

## 5. 踩坑 / 决策（可选）

- …

---

## 6. 不要重复的内容

以下内容已有独立 artifact，**只引用路径，不要复制全文**：

- Plan：`docs/plans/…`
- Report：`docs/reports/…`
- Contract：`app/models.py` · `tests/test_mvp_flow.py`
