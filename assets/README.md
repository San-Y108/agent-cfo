# AgentCFO 交付资产

竞赛路演与提交用的**可交付资产**统一放在本目录。技术文档见 [`../docs/`](../docs/)。

## 目录结构

```
assets/
├── ppt/                    # 路演幻灯片
│   ├── agentcfo-pitch.pptx # ppt-master 导出（14 页，含演讲备注）
│   ├── agentcfo-pitch/     # ppt-master 源工程（SVG、备注、设计规格）
│   └── material/           # 物料同学校稿 / 设计稿
│       └── agentcfo-pitch-material-team-v1.pdf
├── video/                  # 答辩 / Demo 视频
├── images/                 # 截图、海报、流程图
│   ├── readme/             # 根目录 README 用图（banner、showcase、团队头像）
│   └── console/            # Console 模块吉祥物 + 聚合参考页（见 images/console/README.md）
├── design/                 # Logo、品牌素材、设计稿
├── poster.png              # [legacy] 头图；当前 Banner 见 images/readme/banner.png
└── logo.png                # 项目 Logo（待物料补充）
```

## 当前状态

| 资产 | 路径 | 状态 |
| --- | --- | --- |
| 路演 PPT（ppt-master） | `ppt/agentcfo-pitch.pptx` | ✅ 已生成（14 页，含演讲备注） |
| 路演 PPT（物料同学 PDF） | `ppt/material/agentcfo-pitch-material-team-v1.pdf` | ✅ 已从 `inbox/` 归类入库 |
| PPT 源工程 | `ppt/agentcfo-pitch/` | ✅ 可继续用 ppt-master 修改后重新导出 |
| 答辩视频 | `video/` | ☐ 待录制；**拖入 `assets/video/agentcfo-demo.mp4`**，接入见 `docs/plans/demo-video-landing-integration-plan.md` |
| README Banner | `images/readme/banner.png` | ✅ 已归类（3:1，1200×400） |
| README Showcase | `images/readme/landing-*.png` · `console-*.png` | ✅ Landing 8 张；Console 单页截图 5 张 |
| Console 模块吉祥物 | `images/console/module-mascots/*-module-mascot.png` | ✅ 5 张（2026-06-13 从 inbox 归类） |
| Console 聚合参考页 | `images/console/references/ref-*.png` | ✅ 4 张混排布局参考 |
| README 团队头像 | `images/readme/team/*-role.jpg` | ✅ 微信头像已归类 |
| 项目 Logo | `logo.png` | ☐ 待物料 |
| Demo 流程分步截图 | `images/` | ☐ 低优先级（有 Showcase 即可） |

## 投递与归类

未归类文件先放 `inbox/`（见 `inbox/README.md`），整理后迁入 `assets/` 或 `docs/` 并删除 `inbox/` 内原文件。

## 重新导出 PPT

```bash
python .claude/skills/ppt-master/scripts/svg_to_pptx.py assets/ppt/agentcfo-pitch
```

导出文件会写入 `assets/ppt/agentcfo-pitch/exports/`。确认无误后，复制到 `assets/ppt/agentcfo-pitch.pptx` 作为交付版本。
