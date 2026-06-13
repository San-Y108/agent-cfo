# README 合并规划（README Merge Plan）

> **状态**：✅ 已执行（2026-06-13）  
> **归档草案**：[`docs/backup/README.preview-archived.md`](../backup/README.preview-archived.md)  
> **规范**：按全局 [`readme-polish`](../../.claude/skills/readme-polish/SKILL.md) 技能 13 段结构打磨  
> **最后更新**：2026-06-13

---

## 1. 目标

将 [`README.preview.md`](../../README.preview.md)（polish 后的项目首页）合并进根目录 [`README.md`](../../README.md)，同时：

- **不丢失**原 README 中的技术事实、安全边界与联调细节
- **不整页覆盖**——原完整版备份到 `docs/backup/`，超长技术块下沉到 `docs/backend/`
- **保持**根目录 `README.md` 为 GitHub 唯一首页入口

---

## 2. 目录与命名约定

```text
agent-cfo/
├── README.md                      ← 合并后的正式首页（GitHub 入口）
├── README.preview.md              ← 合并草案；确认后可删或归档到 docs/backup/
├── docs/
│   ├── backup/                    ← 仅放备份，不放业务文档
│   │   ├── README.md              ← 本目录说明
│   │   └── README-YYYYMMDD-pre-polish.md
│   ├── backend/                   ← 从原 README 拆出的技术深文档（合并时创建）
│   │   ├── README.md
│   │   ├── CAW_ADAPTER.md
│   │   ├── DEPLOYMENT.md
│   │   ├── ENV_VARS.md
│   │   ├── P2_APIS.md
│   │   ├── REQUEST_FINANCE.md
│   │   └── TESTING.md
│   └── plans/
│       └── README-merge-plan.md   ← 本文件
└── assets/images/readme/          ← README 用图（banner、showcase、团队头像）
    ├── banner.png
    ├── landing-*.png
    ├── console-*.png
    └── team/*-role.jpg
```

| 规则 | 说明 |
| --- | --- |
| 备份只进 `docs/backup/` | 禁止把备份放在 `docs/backend/` 或根目录 `README.legacy.md` |
| `README.md` 留在根目录 | 平台约定；`docs/` 不放替代首页 |
| 技术深文档进 `docs/backend/` | CAW、P2、env、部署等；首页只保留摘要 + 链接 |
| README 图片进 `assets/images/readme/` | 从 `inbox/` 归类后引用；`inbox/` 不留正式引用 |

---

## 3. 合并原则

```text
新 README.md = README.preview 的结构与视觉（Hero / Showcase 网格 / 团队 / 赛事）
             + 原 README 中 preview 未覆盖的精华（表格 / details 摘要）
             + 链到 docs/backend/* 与 docs/backup/*
```

| 层级 | 处理方式 | 示例 |
| --- | --- | --- |
| **A** preview 已有 | 直接入主 README | Hero、双 Showcase、Quick Start、P0 API、团队、赛事 |
| **B** 原 README 有、preview 弱 | 补入首页（压缩） | 队友阅读顺序、Demo smoke、安全纪律、验收要点 |
| **C** 原 README 超长 | 下沉 `docs/backend/` + 首页链接 | CAW 全文、P2 全表、env 全表、Render 磁盘 |

---

## 4. 原 README 精华审计（合并时必须处理）

| 原 README 区块 | preview 现状 | 合并策略 |
| --- | --- | --- |
| How To Work In This Repo | 无 | 压缩为「新队友阅读顺序」表 |
| Repository Status | 无 | 并入架构 / Roadmap 旁状态句 |
| Teammate Handoff | Quick Start 简化 | `<details>`「队友交接」 |
| CAW Adapter + Phase 4C | 仅边缘说明 | 首页 3–5 条原则 + 链 `CAW_ADAPTER.md` |
| CAW Read-Only Observer | 无 | 摘要 + 链子文档 |
| Environment Variables 全表 | details 片段 | 链 `ENV_VARS.md` |
| Render + Persistent Disk | details 一句 | 链 `DEPLOYMENT.md` |
| Payment Planner Mode | 无 | 一行 + 链 DEPLOYMENT |
| Persistence | details 一句 | 链 DEPLOYMENT |
| Demo Smoke Test | 无 | 并入 Quick Start 验证段 |
| Testing And Acceptance | 无 | bullet 摘要 + 链 `TESTING.md` |
| P2 Extension APIs 全表 | details 一句 | 链 `P2_APIS.md` |
| P2F Request Finance | 生态表一句 | 链 `REQUEST_FINANCE.md` |
| Documentation Rules | 无 | 契约真相源一句 |
| Project Management | 文档索引已有 | 保持 |

---

## 5. 执行阶段（Phase 0–4）

### Phase 0 — 备份（合并前第一步）

```bash
# 在仓库根执行
mkdir -p docs/backup
cp README.md docs/backup/README-$(date +%Y%m%d)-pre-polish.md
```

- 备份文件**只读**，合并冲突时以备份为准核对事实
- 在新区 README「文档」表增加备份链接

### Phase 1 — 抽取技术子文档

从 `docs/backup/README-*-pre-polish.md` 按章节拆出：

| 目标文件 | 来源章节（原 README） |
| --- | --- |
| `docs/backend/CAW_ADAPTER.md` | CAW Adapter Contract、Phase 4C、Read-Only Observer |
| `docs/backend/DEPLOYMENT.md` | Render、Persistent Disk、Payment Planner、Persistence |
| `docs/backend/ENV_VARS.md` | Environment Variables 全表 |
| `docs/backend/P2_APIS.md` | P2 Demo-safe Extension APIs |
| `docs/backend/REQUEST_FINANCE.md` | P2F Request Finance Live Spike |
| `docs/backend/TESTING.md` | Testing And Acceptance、Curl 完整示例（可选） |

创建 `docs/backend/README.md` 作为索引。

### Phase 2 — 内容合并（核心）

1. 以 `README.preview.md` 为骨架复制到 `README.md`
2. 按 §4 审计表补入 **B 类**精华（表格 / `<details>`）
3. 文档索引扩展：

   | 文档 | 说明 |
   | --- | --- |
   | `docs/backup/README-*-pre-polish.md` | 合并前完整备份 |
   | `docs/backend/*.md` | 后端技术深文档 |
   | `docs/plans/README-merge-plan.md` | 本规划 |

4. 全局替换 preview 内「详见当前 README.md」→ 指向具体 `docs/backend/` 文件

### Phase 3 — 交叉检查

- [ ] `AGENTS.md` · `CLAUDE.md` · `docs/README.md` · `assets/README.md` 与新区结构一致
- [ ] `docs/pm/SUBMISSION_CHECKLIST.md` 勾选项仍可满足
- [ ] `assets/images/readme/` 已入库（Git 跟踪）
- [ ] 根目录补 `LICENSE`（MIT）
- [ ] 内部链接、锚点、图片路径在 GitHub 预览可点开

### Phase 4 — 收尾

- 用户审阅 `git diff README.md`
- 确认后：删除或移动 `README.preview.md` → `docs/backup/README.preview-archived.md`
- 更新 `docs/pm/SUBMISSION_CHECKLIST.md` § README 为 ☑（若验收通过）
- 清理 `inbox/` 中已归类到 `assets/images/readme/` 的重复文件

---

## 6. 合并后 README 目标结构（~450–550 行）

```text
[Hero] 居中标题 · 简介 · Banner(3:1) · 徽章 · 导航
[为什么需要 AgentCFO]
[功能表 + Cobo 赛道匹配]
[演示] Demo 场景
[Showcase — Landing Page]     3×3 网格
[Showcase — Command Center]   3×1 网格（Console 占位可后补）
[Demo Video]
[快速开始] TL;DR + details(Windows/macOS/边缘/队友交接)
[架构 + CAW 证据摘要 + 安全边界]
[API 参考] P0 表 + curl/P2 details
[Roadmap]
[文档索引] backup + backend + pm + frontend
[团队 + 赛事 + 技术生态]
[Star History + License]
```

---

## 7. 合并前待补项（TODO）

| # | 项 | 负责人 | 阻塞合并？ |
| --- | --- | --- | --- |
| 1 | Console 截图（Treasury / Policy） | 前端 / 物料 | 否（可占位） |
| 2 | Demo 视频链接 | 物料 | 提交前必补 |
| 3 | `LICENSE` 文件 | 总控 | 建议合并时一并加 |
| 4 | 成员 GitHub 链接 | 团队 | 否 |
| 5 | 赞助方信息 | 总控 | 否 |

流程分步截图包（贡献→审计 6 步）优先级 **低**；有 Landing + Console Showcase 即可。

---

## 8. 角色分工

| 角色 | 合并阶段职责 |
| --- | --- |
| **总控 / PM** | 批准 Phase 0 备份、审阅新区 README、更新 SUBMISSION_CHECKLIST |
| **物料** | 补 Console 截图、Demo 视频、Banner 素材 |
| **前端** | 确认 Showcase 文案与 Live Demo 链接 |
| **后端** | 核对 `docs/backend/` 拆分无事实丢失 |
| **AI Agent** | 执行 Phase 1–2 草稿；改 API 时同步 backend 子文档 |

---

## 9. 回滚

若合并后需恢复：

```text
cp docs/backup/README-YYYYMMDD-pre-polish.md README.md
```

勿在未备份情况下直接覆盖 `README.md`。

---

## 10. 相关入口（维护同步）

合并或改文档结构时，**同步更新**：

- [`AGENTS.md`](../../AGENTS.md)
- [`CLAUDE.md`](../../CLAUDE.md)
- [`docs/README.md`](../README.md)
- [`assets/README.md`](../../assets/README.md)
- [`assets/images/README.md`](../../assets/images/README.md)
- [`inbox/README.md`](../../inbox/README.md)

契约真相源不变：`app/models.py` · `app/routers/payments.py` · `tests/test_mvp_flow.py`
