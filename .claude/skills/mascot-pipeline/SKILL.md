---
name: mascot-pipeline
description: Console 模块吉祥物的"提取 → 组件化 → 接入"全链路 skill。用于在 Agent / Treasury / Wallets / Analytics / Policy 五个模块统一嵌入吉祥物资源。触发：用户提到"加吉祥物"/"嵌入 mascot"/"模块 hero"/"图标提取"；新增 Console 模块需要吉祥物时；想统一或修复已接入的吉祥物时。
---

# Console Mascot Pipeline（提取 → 组件化 → 接入）

> **作用域**：`frontend/` 下的 Console 模块吉祥物  
> **沉淀来源**：旧版 AgentCFO 吉祥物（commit `8446639a`）的成功经验  
> **目标**：把 5 个模块（Agent / Treasury / Wallets / Analytics / Policy）的吉祥物接入流程沉淀成可复用 SOP

---

## 1. 何时启用

| 触发 | 例子 |
|---|---|
| 新增 Console 模块 | "给新加的 module X 接入吉祥物" |
| 修复已接入吉祥物 | "Agent 吉祥物没紫色光晕了" / "Treasury 吉祥物太小" |
| 提取新 3D 源图 | 物料同学投放了 `*-source.png` 到 `inbox/` |
| review"贴纸方案" | 用户说"看起来像贴纸" → 转用本 pipeline |
| 跨模块视觉统一 | 用户说"五个模块吉祥物风格不一致" |

**不要用于**：Landing 区的 `team-mascots/`（不是模块吉祥物；走 Landing 工作流）、静态图标（lucide-react）、参考图（`inbox/console-references/`）

---

## 2. 资源命名与目录约定

| 类型 | 路径 | 命名 | 例子 |
|---|---|---|---|
| **源图** | `inbox/module-mascots/{name}-module-mascot-source.png` | RGB 模式（带棋盘/纯色背景） | `treasury-module-mascot-source.png` |
| **提取图** | `frontend/public/console/mascots/modules/{name}-module.png` | RGBA 模式（透明背景） | `treasury-module.png` |
| **Hero 组件** | `frontend/components/console/module-hero-slot.tsx` | 通用 ModuleHeroSlot | — |
| **Agent 特化组件** | `frontend/components/console/agent-cfo-mascot.tsx` | 紫色光晕 + 3D + 浮动 + 阴影 | 仅 Agent 用 |
| **资产映射** | `frontend/public/console/mascots/modules/README.md` | 五模块色 + 路径索引 | 见 §5 |

---

## 3. 五模块色 + 光晕对照表

| 模块 | src 路径 | HudColor | accent hex | 用途 |
|---|---|---|---|---|
| Agent | `agent-module.png` | `lime` | `#B5FF4D` | 活跃、计划就绪 |
| Treasury | `treasury-module.png` | `cyan` | `#5EEAD4` | 资金流、风控 |
| Wallets | `wallets-module.png` | `blue` | `#60A5FA` | 钱包、签名 |
| Analytics | `analytics-module.png` | `violet` | `#C084FC` | 数据、图表 |
| Policy | `policy-module.png` | `coral` | `#FB7185` | 拦截、规则 |

**这些颜色**对应：
- `tailwind.config` / `globals.css` 中的 `--glow-{color}` CSS 变量
- `command-deck` HUD 组件的 `HudColor` 类型字面量
- Hero 区域底部 radial-gradient 光晕颜色

---

## 4. 完整流程（5 步）

### Step 1 · 拿源图

物料同学把 3D 渲染图（带纯色/棋盘背景的 PNG）放到 `inbox/module-mascots/`，命名 `{name}-module-mascot-source.png`。

**质量门**：
- 尺寸 ≥ 1024×1024（推荐 1086×1448，与现有图集一致）
- 模式 RGB（非 RGBA）
- 背景必须是纯色/棋盘/低饱和灰度，不要复杂场景

### Step 2 · 提取（去背景）

**单图命令**（用现有脚本）：

```bash
python frontend/scripts/remove-mascot-bg.py
```

当前脚本为 hard-coded 处理 `agent-cfo-mascot-source.png` 一张图。**通用化版本**（待写 — `frontend/scripts/extract-mascot.py`）：

```python
# 通用入口：接受 --src / --out 命令行参数
# 算法：neutral flood fill + edge fringe removal（见 references/extraction-algorithm.md）
python frontend/scripts/extract-mascot.py \
  --src inbox/module-mascots/treasury-module-mascot-source.png \
  --out frontend/public/console/mascots/modules/treasury-module.png
```

**批量模式**（已提取过的图可跳过）：

```python
# 扫描 inbox/module-mascots/，自动映射到 public/console/mascots/modules/
# 若输出已存在且 alpha 透明比例 > 30%，跳过；否则重提
```

**输出验证**（必做）：

```python
from PIL import Image
im = Image.open(out_path).convert("RGBA")
alpha_ratio = sum(1 for a in im.getdata(3) if a < 10) / (im.size[0] * im.size[1])
assert alpha_ratio > 0.3, f"Transparent ratio too low: {alpha_ratio:.1%}"
assert im.mode == "RGBA", "Output must be RGBA"
```

### Step 3 · 落档 + README 更新

把输出 PNG 放到 `frontend/public/console/mascots/modules/{name}-module.png`，并在 `frontend/public/console/mascots/modules/README.md` 中追加新行（若新增模块）。

### Step 4 · 组件化（嵌入 hero 区）

**通用方案**：`ModuleHeroSlot`（适用于 4 个非 Agent 模块）

```tsx
import { ModuleHeroSlot } from "@/components/console/module-hero-slot";

<ModuleHeroSlot
  src="/console/mascots/modules/treasury-module.png"
  alt="Treasury module mascot"
  color="cyan"                    // 对照 §3 表
  size="lg"                       // sm 120 / md 180 / lg 220
  className="shrink-0 lg:h-[220px]"
  footer={
    <div className="text-center">
      <p className="text-sm font-bold tracking-tight">
        <GradientText>Treasury</GradientText>
      </p>
      <p className="text-[11px] text-fg-muted">付款计划 / 风控 / 执行</p>
    </div>
  }
/>
```

**Agent 特化方案**（带紫色光晕 + 3D 鼠标跟随 + 浮动 + 阴影）：

```tsx
import { AgentCfoMascot } from "@/components/console/agent-cfo-mascot";

<AgentCfoMascot
  size="lg"           // sm 92 / md 224 / lg 268
  interactive         // 开启鼠标跟随
  analyzing={isThinking}  // 思考时切青色光晕
  className="shrink-0"
/>
```

### Step 5 · 布局（卡片化自然嵌入）

放在 `ModuleStageLayout` 三栏布局的 **header / left rail / top rail** 位置（参考 `console-module-visual-upgrade-plan.md` §布局原则）：

```tsx
<ModuleStageLayout
  moduleKey="treasury"
  color="cyan"
  // ...
>
  <ModuleStageLayout.Header>
    <ModuleHeroSlot ... />  {/* ← 放这里 */}
  </ModuleStageLayout.Header>
  <ModuleStageLayout.LeftRail>
    {/* metrics / stepper */}
  </ModuleStageLayout.LeftRail>
  <ModuleStageLayout.DetailDeck>
    {/* 主要内容 */}
  </ModuleStageLayout.DetailDeck>
</ModuleStageLayout>
```

**布局原则**（来自 plan §4）：
- 吉祥物放 header 区（顶部视觉锚点），不与 left rail 抢空间
- 容器高度 `lg: 220px`（与左栏高度对齐）
- 颜色用对应 HudColor（`cyan` for Treasury, `violet` for Analytics …）
- footer 简短（模块名 + 一行 sub-label），不堆 KPI

---

## 5. 接入检查清单（每模块必跑）

复制到 `frontend/docs/plans/console-module-visual-upgrade-checklist.md` M 段：

```markdown
### M{N} · {ModuleName} `/console/{route}`

#### 视觉
- [ ] Hero Slot：`{name}-module.png` 正确嵌入
- [ ] color prop = `{color}`（对照 §3 表）
- [ ] footer 文本 ≤ 2 行
- [ ] 亮/暗色可读性验收

#### 资源
- [ ] `inbox/module-mascots/{name}-module-mascot-source.png` 存在
- [ ] `frontend/public/console/mascots/modules/{name}-module.png` 提取过（透明比例 > 30%）
- [ ] `public/console/mascots/modules/README.md` 同步
```

---

## 6. 已知坑（避免重蹈）

| 坑 | 表现 | 修复 |
|---|---|---|
| **贴纸感** | 图片直接 absolute 浮在背景上 | 用 `ModuleHeroSlot` 网格嵌入，加底部光晕 |
| **位置偏移** | 人物被切头/切脚 | `object-contain object-bottom`，留 8% padding |
| **颜色错配** | Treasury hero 用 lime 光晕 | color prop 必须与 §3 表一致 |
| **亮色消失** | 暗色设计的吉祥物在亮色主题变透明 | `bg-surface-2/50` 容器底 + 双色 gradient 适配 |
| **图太大未压缩** | 2MB 源图拖慢 LCP | 提取后 `optimize=True` 跑过 PIL；目标 < 500KB |
| **空心圆 stepper 太单调** | Plan/Risk/Approve/Execute 一色 | 用 §3 4 色（lime/cyan/amber/violet）— 见 references/component-patterns.md |
| **重叠拥挤** | 多卡片 + 按钮堆在 hero 下 | Plan summary 留；Budget/Status 4 卡 → 迁到 chat 顶部 chip row（见 references/component-patterns.md） |

---

## 7. 与其他 skill 关系

| Skill | 用法 |
|---|---|
| `frontend-agent-workflow` | 落地时遵循（scope commit / 维护联想） |
| `taste-skill` | Footer 文本、布局间距调优时调它 |
| `ui-ux-pro-max` | 整体视觉一致性 review 时调它 |
| `agent-cfo-monorepo-workflow` | 跨角色（物料同学投放源图 → Agent 接入）协作 |

---

## 8. 沉淀物路径

| 资源 | 路径 | 状态 |
|---|---|---|
| SKILL.md（本文件） | `.claude/skills/mascot-pipeline/SKILL.md` | ✅ |
| 提取算法详解 | `.claude/skills/mascot-pipeline/references/extraction-algorithm.md` | ✅ |
| 组件 pattern 模板 | `.claude/skills/mascot-pipeline/references/component-patterns.md` | ✅ |
| 5 模块色 + 光晕对照 | `.claude/skills/mascot-pipeline/references/color-glow-system.md` | ✅ |
| 提取脚本（通用版） | `frontend/scripts/extract-mascot.py` | ⏳ 待写（当前 hard-coded） |
| 资源索引 | `frontend/public/console/mascots/modules/README.md` | ✅ 已存 |

---

## 9. 关键经验（来自旧版 AgentCFO 吉祥物 commit `8446639a`）

> **核心**：3D 吉祥物的"惊艳感"不在图本身，而在**容器给图加的"环境"**：
> 1. **紫色光晕族**（drop-shadow + 底部 radial gradient）— 让图浮在"能量场"里
> 2. **3D 鼠标跟随**（rotateX/rotateY，22 倍除数）— 让用户感觉"它看着你"
> 3. **浮动呼吸**（y: [0, -10, 0] 3.6s）— 让图"活着"
> 4. **底部投影**（blur 14px，accent 色 42% 透明）— 物理接地感
> 5. **analyzing 反馈**（切青色光晕 + 1.6s 加速浮动）— 业务状态可视

**非 Agent 模块**不需要全套（不需要鼠标跟随 + analyzing 反馈），但应保留：底部光晕 + 浮动呼吸 + 颜色 token。`ModuleHeroSlot` 已经默认带 1 和 5。

**如果未来想让其他模块也"惊艳"**：在 `ModuleHeroSlot` 上加 `interactive` 和 `analyzing` props，把 `AgentCfoMascot` 的 `rotateX/Y` 和浮动循环抽象成共享 hooks（`useFloatingMascot`），即可一行启用。
