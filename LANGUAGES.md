# Languages and runtime map

| 区域 | 语言 / 运行时 | 主要工具 | 验证 |
| --- | --- | --- | --- |
| `frontend/` | TypeScript、TSX、CSS | Next.js 16、React 19、pnpm | `pnpm typecheck`、`pnpm build` |
| `app/`、`tests/` | Python 3 | FastAPI、Pydantic、pytest | `python -m pytest -q` |
| `assets/ppt/agentcfo-pitch/` | Python、SVG | ppt-master | 按该目录 README 导出 |
| 根目录与 `docs/` | Markdown | GFM | README preview shell |
| 配置 | JSON、YAML、MDC | Cursor、Claude Code、Vercel、Render | 语法检查与人工 Review |

## 文案语言

- 项目文档默认中文；
- API 名、字段、命令、错误信息保留英文；
- 对外 README 可保留中英混合的产品名与技术术语；
- Agent 输出语气见 `docs/agents/voice.md`。

## 金额与链上数据

真实资金路径不得依赖 JavaScript 或 Python 浮点语义作为最终账务表示。生产化改造应使用最小单位整数或 `Decimal`，并显式记录 token decimals、chain 和 network。
