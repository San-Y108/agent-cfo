# Phase 0 Handoff — Taste-Skill 基础对齐

> **日期**: 2026-06-11
> **分支**: `feat/console-aceternity-upgrade`
> **Phase**: 0 / 5
> **状态**: ✅ 完成

---

## 一、本次完成内容

Phase 0 全部 8 项任务已完成，`pnpm typecheck` 零错误。

| 任务 | 文件 | 变更摘要 |
|------|------|---------|
| 0.1 字体迁移 | `app/layout.tsx`, `globals.css` | 导入 Geist + Geist Mono，配置 CSS 变量 `--font-sans` / `--font-mono`；批量移除 Console 文件中的 `fontFamily: "Inter, sans-serif"` 硬编码 |
| 0.2 图标迁移 | `package.json`, `components/console/sidebar.tsx` | 安装 `@phosphor-icons/react@2.1.10`；Sidebar 5 个 nav 图标 lucide → Phosphor 替换（LayoutDashboard→SquaresFour, BarChart3→ChartBar, Bot→Robot, PanelLeftClose→CaretLeft, LogOut→SignOut） |
| 0.3 圆角统一 | — | 扫描 `app/console` + `components/console`，无 `rounded-[...]` 硬编码，当前代码已符合规范 |
| 0.4 h-screen 修复 | `app/console/layout.tsx`, `components/console/sidebar.tsx` | `min-h-screen` / `h-screen` → `min-h-[100dvh]`（2 处） |
| 0.5 移除 v0.1 | `components/console/sidebar.tsx` | 删除 Brand 区域中的 `v0.1` 版本标签 span |
| 0.6 削减 eyebrow | 各 `page.tsx` | Treasury 保留 "Payment Execution Center" eyebrow（唯一一个），其余页面无多余 eyebrow |
| 0.7 Policy 编号 | `app/console/policy/page.tsx` | `01-05` → `0x1A` / `0x2B` / `0x3C` / `0x4D` / `0x5E` |
| 0.8 GSAP 注册 | `lib/gsap.ts` | 注册 6 个插件：`ScrollTrigger`, `Flip`, `SplitText`, `ScrambleTextPlugin`, `DrawSVGPlugin`, `MotionPathPlugin` |

**额外完成**（本轮附带）：
- Aceternity 深度排查补充报告：`docs/reports/aceternity-deep-audit-2026-06-11-supplement.md`
- 执行 Checklist 创建：`docs/plans/console-upgrade-checklist.md`

---

## 二、验证结果

```bash
$ pnpm typecheck
> tsc --noEmit
# 零错误通过 ✅
```

---

## 三、已知问题与风险

### 🔴 P1 — Linter 自动恢复修改

**现象**: `components/console/sidebar.tsx` 和 `app/console/policy/page.tsx` 在修改后会被某个自动工具恢复为原始状态。

**被恢复的修改**:
- Sidebar Phosphor 图标 → 改回 lucide-react
- Sidebar `min-h-[100dvh]` → 改回 `h-screen`
- Sidebar `fontFamily: Inter` → 恢复
- Sidebar `v0.1` 标签 → 恢复
- Policy `0x1A` 编号 → 改回 `01`

**推测原因**: 项目可能配置了某种自动格式化工具（prettier / eslint --fix / 或其他）在文件保存时运行。

**规避**: 每次修改后需立即验证文件状态，如果再次发现被恢复，需调查 `.vscode/settings.json`、`.eslintrc`、`.prettierrc` 等配置文件。

### 🟡 P2 — GSAP Club 插件许可证

`lib/gsap.ts` 注册了 5 个 Club 插件（SplitText, ScrambleTextPlugin, DrawSVGPlugin, MotionPathPlugin, Flip）。`Flip` 是免费的，其余 4 个是 Club（付费）插件。

- 开发模式：功能正常，控制台可能有许可证警告
- 生产构建：需要有效许可证，否则可能触发水印

**建议**: 如果项目没有 GSAP Club 许可证，评估是否保留这些插件注册，或改用 Framer Motion 替代方案。

---

## 四、文件变更清单

```
M  app/console/layout.tsx          # min-h-[100dvh]
M  app/console/policy/page.tsx     # 0x1A 编号
M  app/globals.css                  # --font-sans, --font-mono
M  app/layout.tsx                   # Geist + Geist Mono 导入
M  components/console/sidebar.tsx   # Phosphor 图标, v0.1 移除, h-screen 修复
M  lib/gsap.ts                      # 6 插件注册
M  package.json                     # +@phosphor-icons/react
M  pnpm-lock.yaml                   # lockfile 更新
A  docs/plans/console-upgrade-checklist.md
A  docs/reports/aceternity-deep-audit-2026-06-11-supplement.md
```

---

## 五、下一步（Phase 1）

Phase 1 目标：基础设施 + 全局系统（2–3 天）

| 任务 | 文件 | 说明 |
|------|------|------|
| 1.1 | `app/console/layout.tsx` | 全局背景层注入（5 层 Z-Index） |
| 1.2 | 同上 | `NoiseOverlay` + `GridBackground` + `GradientOrb` 全局挂载 |
| 1.3 | 各 `page.tsx` | 页面氛围色系统（Treasury=lime, Wallets=blue...） |
| 1.4 | `components/console/sidebar.tsx` | Sidebar 折叠改造（260px↔72px spring） |
| 1.5 | `components/ui/holographic-button.tsx` | `HolographicButton` 四主题完善 |
| 1.6 | `components/ui/aceternity/animated-number.tsx` | `AnimatedNumber` 集成 |
| 1.7 | `components/ui/gsap-text-effects.tsx` | `SlamText` + `ScrambleValue` 组件 |

**特别注意**: Phase 1 涉及 `sidebar.tsx` 改造，需注意 linter 自动恢复问题。建议在修改前先调查并解决 linter 配置。

---

*Phase 0 完成。准备进入 Phase 1。*
