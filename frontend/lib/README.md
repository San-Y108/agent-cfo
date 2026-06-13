# lib/

非 UI 逻辑层。

## 目录

| 目录 / 文件 | 用途 |
|---|---|
| `api/` | 后端 4 端点 adapter + `types.ts` 契约镜像 |
| `mock/` | 后端形状 mock（payment-plan / risk-check / caw / audit） |
| `workflow/` | `runDemoFlow()` real 调用链、状态机、步骤文案 |
| `demo/console-mock.ts` | Console 工作台统一 mock 数据 |
| `console/console-state.tsx` | Console 全局 React context（面板状态） |
| `i18n/` | 自定义双语：`context.tsx` + `dict.ts`（`console.*` 命名空间） |
| `types/console.ts` | Console 业务类型（从 AI Studio 迁移） |
| `constants/` | `routes.ts` · `project.ts` |
| `gsap.ts` | GSAP + ScrollTrigger 注册 |
| `utils.ts` | `cn()` 等通用工具 |

## 数据流

```
mock mode:  console-mock.ts → Console 组件直接读取
real mode:  runDemoFlow() → lib/api/* → 后端 /api/*
```

## 已移除（历史）

- `lib/demo/demo-data.ts` — 旧 `/demo` mock，由 `console-mock.ts` 取代
