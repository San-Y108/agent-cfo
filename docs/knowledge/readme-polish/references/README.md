# README Polish — Visual References

本目录是 **README 配图标杆包**（设计工具 / 真实产品 / 专业信息图）。  
Agent 产出 `readme-image-prompts.md` 前 **必须** Read：`visual-standards.md` + 对应 `prompts/*.md` + 选用标杆 PNG。

## 目录（按 README 图类型严格对应）

```text
references/
├── README.md
├── visual-standards.md
├── prompt-feed-catalog.md       # Agent 可直接喂的：标杆清单 + Prompt 入口
├── banner/                      # 页首气质
├── features/                    # 功能模块卡
├── architecture/                # 系统架构
├── tech-stack/                  # 技术栈图标墙 / 分层
├── workflow/                    # 用户主链路
├── structure/                   # 目录树
├── preview/                     # 预览站总览气质（对标截图，不仿画业务 UI）
├── showcase/                    # 实机 SaaS / Dashboard 气质条
└── prompts/
    ├── banner.md
    ├── features.md
    ├── architecture.md
    ├── tech-stack.md
    ├── workflow.md
    ├── structure.md
    └── preview-showcase.md      # Preview/Showcase：截图规范，非生图冒充
```

## 选用表

| README 文件 | 标杆目录 | Prompt | 制作 |
|-------------|----------|--------|------|
| `banner.png` | `banner/` | `prompts/banner.md` | 生图 / Figma；宁简勿繁 |
| `features.png` | `features/` | `prompts/features.md` | 模块卡；图标统一 |
| `architecture.png` | `architecture/` | `prompts/architecture.md` | **必选一种**风格；优先 img2img |
| `tech-stack.png` | `tech-stack/` | `prompts/tech-stack.md` | 图标墙或分层；与 architecture 分工 |
| `workflow.png` | `workflow/` | `prompts/workflow.md` | 主路径 + 明确决策点 |
| `structure.png` | `structure/` | `prompts/structure.md` | **优先 Markdown 树**；要画才用标杆 |
| `preview-shell.png` / `preview-*` | `preview/` | `prompts/preview-showcase.md` | **真实截图** |
| `showcase-*.png` | `showcase/` | `prompts/preview-showcase.md` | **Playwright 实机** |

## Agent 学习重点（硬约束）

- 颜色 **4–6 色**：主色 + 辅色 + 中性灰/黑白  
- 线条统一、圆角一致、间距对齐  
- 信息层级：标题 > 模块 > 细节  
- Showcase / Preview **必须真实运行界面**，不是画出来的  
- Banner 宁简勿繁：气质 + 可读性  

## 版权

标杆仅作风格参考，禁止原样贴进项目 README。节点名必须换成 **本项目真实内容**。
