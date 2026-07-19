# Pitch deck assets

本目录是 AgentCFO 路演 PPT 的 canonical 路径。

## 当前资产

| 资产 | 路径 |
| --- | --- |
| 主 PPT | `agentcfo-pitch.pptx` |
| 物料 PDF | `material/agentcfo-pitch-material-team-v1.pdf` |
| ppt-master 源工程 | `agentcfo-pitch/` |
| 逐页 SVG | `agentcfo-pitch/svg_final/` |
| 演讲备注 | `agentcfo-pitch/notes/` |

## 修改流程

1. 阅读 `.claude/skills/ppt-master/SKILL.md`；
2. 修改 `agentcfo-pitch/` 源工程；
3. 检查设计规范、14 页 SVG 和演讲备注；
4. 导出到本地 `exports/`；
5. 人工 Review；
6. 更新主 `agentcfo-pitch.pptx`。

`exports/`、时间戳 backup 和 `.live_preview.lock` 是可重建的本地产物，不纳入版本控制。

## 事实边界

CAW 证据使用当前可核验的 2 笔 Sepolia/SETH testnet 交易。线上 Console 默认 mock。P2 能力必须标为 preview 或 simulation。
