# AgentCFO 提交材料清单

> 最后更新：2026年6月13日 · README polish 已合并至根目录  
> 截止时间：13 号中午 12:00 前全部就绪  
> 规则：打勾 = 已完成并验证通过，不是"觉得差不多了"  
> README 合并记录：见 [`docs/plans/README-merge-plan.md`](../plans/README-merge-plan.md) · 备份 [`docs/backup/README-20260613-pre-polish.md`](../backup/README-20260613-pre-polish.md)

---

## 一、必须提交项

| # | 材料 | 负责人 | 说明 | 状态 |
|---|------|--------|------|------|
| 1 | GitHub 仓库公开访问 | 总控 | repo 必须 public，所有 collaborator 已加 | ☑ |
| 2 | README.md 完整版 | 总控 + 物料 | 含项目介绍、架构、运行方式、CAW 说明、Demo 截图、tx hash、团队信息；已从 preview 合并（2026-06-13） | ☑ |
| 3 | 项目说明文档 | 总控 | 问题背景、解决方案、赛道匹配、风险边界说明 | ☑ |
| 4 | Demo 视频 3–5 分钟 | 物料 | 文件放 `assets/video/`，公开链接写入 README Demo Video 章节 | ☐ |
| 5 | CAW 关键代码或配置说明 | 合约/CAW | 配置说明 + opt-in testnet RealCawAdapter skeleton + 1 笔 testnet evidence 已就绪；默认 mock/fail-closed | ☑ |
| 6 | Agent Wallet 地址 | 合约/CAW | README 已记录 masked source；如比赛要求完整公开地址需单独确认 | ☐ |
| 7 | Transaction Hash 列表 | 合约/CAW | 已有 2 笔：`0x85a5...0ed4d98`（demo payment）+ `0x6bd7...bae8a`（internal transfer）；若赛方要求 3 笔商业付款 tx 需再补 | ☐ |
| 8 | 风险边界说明 | 总控 | README 已覆盖 mock、审批、风控、fail-closed、refresh 不转账、audit immutable | ☑ |

---

## 二、强烈建议提交项

| # | 材料 | 负责人 | 说明 | 状态 |
|---|------|--------|------|------|
| 9 | 前端演示链接 | 前端 | Vercel 部署链接已就绪 | ☑ |
| 10 | 后端 API 地址 | 后端 | Render API 地址 + curl 示例已就绪 | ☑ |
| 11 | 流程截图包 | 物料 | 贡献输入 → 计划 → 风险 → 确认 → 执行 → 审计；**低优先级**（有 Landing + Console Showcase 可降级） | ☐ |
| 12 | 操作记录 | 总控 | 证明我们实际操作过的证据：终端截图、API 调用截图、钱包余额变化截图 | ☐ |
| 13 | README 头图 | 物料 | 16:9 海报，放在 assets/poster.png | ☐ |
| 14 | 项目 Logo | 物料 | 放在 assets/logo.png | ☐ |

---

## 三、路演必须项

| # | 材料 | 负责人 | 说明 | 状态 |
|---|------|--------|------|------|
| 15 | PPT | 物料 | ppt-master：`assets/theme/ppt/agentcfo-pitch.pptx`；物料同学 PDF：`assets/theme/ppt/material/agentcfo-pitch-material-team-v1.pdf` | ☑ |
| 16 | 5 分钟路演稿 | 总控 | 逐段逐句稿，含时间标注 | ☐ |
| 17 | 路演彩排 ×2 | 总控 | 至少彩排两次，录像回看，记录问题 | ☐ |
| 18 | 备用方案 | 总控 + 物料 | 本地录屏版本 + 全流程截图包 + 备用浏览器 + 离线 PPT | ☐ |

---

## 四、README 必须章节检查

| # | 章节 | 状态 |
|---|------|------|
| 1 | 项目名称 + 一句话介绍 | ☑ |
| 2 | 问题背景 | ☑ |
| 3 | 解决方案 | ☑ |
| 4 | 为什么适合 Cobo Agentic Commerce | ☑ |
| 5 | 产品流程图 | ☑ |
| 6 | 架构图 | ☑ |
| 7 | Demo 截图（至少 4 张） | ☐ |
| 8 | CAW 使用说明 | ☑ |
| 9 | Agent Wallet 地址 | ☐ masked source 已记录；完整地址是否公开待确认 |
| 10 | Transaction Hash（至少 3 笔） | ☐ 已有 2 笔 testnet evidence；若按赛方「3 笔」口径仍缺 1 笔 |
| 11 | 运行方式（后端 + 部署 API） | ☑ |
| 12 | 风险边界说明 | ☑ |
| 13 | 团队分工表 | ☑ |
| 14 | Demo 视频链接 | ☐ |

---

## 五、提交前最终检查（12 号晚）

| # | 检查项 | 状态 |
|---|--------|------|
| 1 | GitHub repo 可以在无登录状态下访问 | ☐ |
| 2 | README 没有 TODO / 占位符 / Lorem ipsum | ☐ |
| 3 | 所有 tx hash 都能在区块浏览器上查到 | ☐ |
| 4 | Agent Wallet 地址是正确的测试网地址 | ☐ |
| 5 | Demo 视频链接可以打开 | ☐ |
| 6 | PPT 没有错别字 | ☐ |
| 7 | 前端 Demo 可以正常打开 | ☐ |
| 8 | 没有包含敏感信息（私钥、API Key） | ☐ |
| 9 | 没有未完成的 git merge conflict | ☐ |
| 10 | 本地录屏备用版本已保存 | ☐ |
