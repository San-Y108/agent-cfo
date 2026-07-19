# 设计素材

品牌与视觉相关源文件。

## 建议内容

| 文件 | 用途 |
| --- | --- |
| `logo.svg` / `logo.png` | 项目 Logo 源文件 |
| `poster.psd` / `poster.fig` | README 头图设计稿 |
| `brand-colors.md` | 品牌色与字体约定 |

前端运行时 Logo 包在 [`frontend/public/logos/`](../../../frontend/public/logos/)。本目录存放**竞赛交付 / 物料设计**用的源文件。

## 状态

☐ 待物料补充

## 计划资产

| 资产 | 文件 | 用途 |
| --- | --- | --- |
| 主 Logo | `agentcfo-logo.svg` | README、PPT、产品 |
| 方形 App Icon | `agentcfo-icon.svg` | favicon、社交头像 |
| 单色标记 | `agentcfo-mark-mono.svg` | 深浅背景和印刷 |
| PNG 导出 | `exports/*.png` | 不支持 SVG 的平台 |

## 归档规则

- 主源文件优先 SVG；
- 深色、浅色和单色版本来自同一设计源；
- 不把组件库图标改名后冒充品牌 Logo；
- 不使用未经授权的合作方 Logo 组合成项目标识；
- 前端引用 `frontend/public/` 中的运行时镜像，设计源仍以本目录为准。
