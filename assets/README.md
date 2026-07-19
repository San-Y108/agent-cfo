# AgentCFO 交付资产

竞赛路演与提交用的**可交付资产**统一放在本目录。技术文档见 [`../docs/`](../docs/)。

## 目录结构

```
assets/
├── backup/                 # 外部上游二进制资产只读备份
├── video/                  # 答辩 / Demo 视频
├── images/                 # 截图、海报、流程图
│   ├── readme/             # 根目录 README 用图（banner、showcase）
│   ├── avatar/             # 团队头像与 3D 吉祥物
│   ├── icon/               # Logo、品牌图标与设计源文件
│   └── console/            # Console 模块吉祥物 + 聚合参考页（见 images/console/README.md）
└── theme/
    ├── ppt/                # PPT、PDF、SVG、notes 与源工程
    └── script/             # 路演稿、Demo 逐字稿、成员口述
```

## 当前状态

| 资产 | 路径 | 状态 |
| --- | --- | --- |
| 路演 PPT（ppt-master） | `theme/ppt/agentcfo-pitch.pptx` | ✅ 已生成（14 页，含演讲备注） |
| 路演 PPT（物料同学 PDF） | `theme/ppt/material/agentcfo-pitch-material-team-v1.pdf` | ✅ 已归类 |
| PPT 源工程 | `theme/ppt/agentcfo-pitch/` | ✅ SVG、notes、设计规范与导出 |
| 路演与 Demo 讲稿 | `theme/script/` | ✅ 主叙事、流程、成员稿、录制指南 |
| 答辩视频 | `video/agentcfo-demo.mp4` | ✅ 已录制 |
| README Banner | `images/readme/banner.png` | ✅ 已归类（3:1，1200×400） |
| README Showcase | `images/readme/landing-*.png` · `console-*.png` | ✅ Landing 8 张；Console 单页截图 5 张 |
| Console 模块吉祥物 | `images/console/module-mascots/*-module-mascot.png` | ✅ 5 张（2026-06-13 从 inbox 归类） |
| Console 聚合参考页 | `images/console/references/ref-*.png` | ✅ 4 张混排布局参考 |
| 团队头像与吉祥物 | `images/avatar/` | ✅ 6 位成员，共 12 个文件 |
| 项目 Logo | `images/icon/` | ☐ 待正式设计源文件 |
| Demo 流程分步截图 | `images/` | ☐ 低优先级（有 Showcase 即可） |

## 投递与归类

未归类文件先放 `inbox/`（见 `inbox/README.md`），整理后迁入上述标准目录并删除 `inbox/` 原文件。旧路径仅保留跳转 README，不再接收新资产。

## 重新导出 PPT

```bash
python .claude/skills/ppt-master/scripts/svg_to_pptx.py assets/theme/ppt/agentcfo-pitch
```

导出文件会写入 `assets/theme/ppt/agentcfo-pitch/exports/`。确认无误后，复制到 `assets/theme/ppt/agentcfo-pitch.pptx` 作为交付版本。
