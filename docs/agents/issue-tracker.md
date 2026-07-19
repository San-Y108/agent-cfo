# Issue tracker

## 选择

AgentCFO 使用 GitHub Issues：

`https://github.com/San-Y108/agent-cfo/issues`

本地 `.scratch/` 不作为正式任务来源。

## Issue 最小结构

```markdown
## 问题描述
## 根因或背景
## 复现 / 证据
## 关键代码位置
## 修复方向
## 接手 Agent 引导
## 验收条件
```

## Bug 流程

```text
发现
→ 独立诊断
→ Issue
→ 修复
→ 自动化或手动复现验证
→ 用户 Review
→ commit（Closes #N）
```

## Theme 关联

属于业务 theme 的 Issue 必须链接：

- `docs/output/prd/<theme>/prd.md`
- 对应 `docs/output/handoff/<theme>/<task>.md`

首个 theme：`treasury-payout`。
