# Design Reference

从 [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) 下载的参考设计系统。

## 当前收录

| 品牌 | 文件夹 | 风格关键词 | 适用场景参考 |
|---|---|---|---|
| [Zapier](./zapier/DESIGN.md) | `zapier/` | 暖奶油白 + 深咖啡黑 + 单一饱和橙 CTA + Degular Display 500 配 Inter | 暖色调现代 SaaS landing |

## 使用方式

打开对应品牌文件夹的 `DESIGN.md`，告诉 AI 代理：

> "build me a page that looks like this"

或在 Codex/Claude Code 中：

> "请参考 ./design-ref/zapier/DESIGN.md 实现 [某个具体页面]"

## AgentCFO 风格对照

| 项 | AgentCFO 当前 | Zapier 参考 |
|---|---|---|
| 主背景 | 纯黑 `#000000` | 暖奶油白 `#fffefb` |
| 主色 / CTA | 琥珀金 `#f59e0b` | 饱和橙 `#ff4f00` |
| 文字 | 白 / 灰 | 深咖啡 `#201515` / 暖灰 |
| 圆角 | `rounded-2xl` (16px) | 12px (`rounded.md`) |
| 字体 | Inter + Courier New | Degular Display 500 + Inter |
| 品牌调性 | 高级感 / 电影感 | 温暖 / 友好 / 专业 |

两个风格定位不同（深色高级 vs 暖色友好），保留为未来方向参考。AgentCFO 当前的 Velorix 风格纯黑路线仍为主。
