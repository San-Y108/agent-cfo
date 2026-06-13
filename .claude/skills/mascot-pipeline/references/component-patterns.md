# 组件 Pattern 模板

> 5 个 Console 模块吉祥物接入时的可复用代码片段。  
> 适用：Agent / Treasury / Wallets / Analytics / Policy

---

## Pattern 1 · 通用 ModuleHeroSlot（4 模块用）

**适用**：Treasury / Wallets / Analytics / Policy  
**位置**：`ModuleStageLayout.Header` 顶部，hero 区  
**特点**：grid 嵌入（非 absolute 贴纸），底部光晕，颜色 token 化

```tsx
import { ModuleHeroSlot } from "@/components/console/module-hero-slot";
import { GradientText } from "@/components/ui/aceternity/colourful-text";

<ModuleHeroSlot
  src="/console/mascots/modules/treasury-module.png"
  alt="Treasury module mascot"
  color="cyan"                    // 对照 color-glow-system.md
  size="lg"                       // sm 120 / md 180 / lg 220
  className="shrink-0 lg:h-[220px]"
  footer={
    <div className="text-center">
      <p className="text-sm font-bold tracking-tight">
        <GradientText>Treasury</GradientText>
      </p>
      <p className="text-[11px] text-fg-muted">
        {lang === "zh" ? "付款计划 / 风控 / 执行" : "Plan / Risk / Execute"}
      </p>
    </div>
  }
/>
```

**颜色对照**（必须正确，否则光晕错配）：

| 模块 | color | hex |
|---|---|---|
| Treasury | `cyan` | `#5EEAD4` |
| Wallets | `blue` | `#60A5FA` |
| Analytics | `violet` | `#C084FC` |
| Policy | `coral` | `#FB7185` |

---

## Pattern 2 · Agent 特化 AgentCfoMascot

**适用**：仅 `/console` 首页 Agent 面板  
**特点**：紫色光晕 + 3D 鼠标跟随 + 浮动 + 阴影（最强视觉）  
**触发条件**：用户说"Agent 页面"或"首页"

```tsx
import { AgentCfoMascot } from "@/components/console/agent-cfo-mascot";

<AgentCfoMascot
  size="lg"             // sm 92 / md 224 / lg 268
  interactive           // 开启 rotateX/Y 鼠标跟随
  analyzing={isThinking}  // 切青色光晕 + 加速浮动
  className="shrink-0"
/>
```

**与 ModuleHeroSlot 的关键差异**：

| 维度 | ModuleHeroSlot | AgentCfoMascot |
|---|---|---|
| 鼠标跟随 3D | ❌ | ✅ rotateX/Y 22x |
| 浮动呼吸 | ❌ | ✅ y: [0,-10,0] 3.6s |
| 紫色光晕族 | ❌ | ✅ drop-shadow + radial + 底部投影 |
| analyzing 反馈 | ❌ | ✅ 切青色 + 1.6s 加速 |
| 颜色 token | ✅ 5 色可配 | ❌ 写死 violet |
| 适用模块 | 4 个通用 | 仅 Agent |

---

## Pattern 3 · Workflow Strip（4 色 stepper）

**适用**：Agent 面板的 Plan / Risk / Approve / Execute 流程  
**经验教训**：单色（lime）显得单调 → 4 步各 1 色

```tsx
function AgentWorkflowStrip({ step, lang }: { step: FlowStep; lang: "en" | "zh" }) {
  const steps = [
    { key: "plan",    en: "Plan",    zh: "计划", minStep: FlowStep.Scanning,  color: "#B5FF4D" /* lime */ },
    { key: "risk",    en: "Risk",    zh: "风控", minStep: FlowStep.Review,     color: "#5EEAD4" /* cyan */ },
    { key: "approve", en: "Approve", zh: "确认", minStep: FlowStep.Executing,  color: "#FBBF24" /* amber */ },
    { key: "execute", en: "Execute", zh: "执行", minStep: FlowStep.Done,       color: "#C084FC" /* violet */ },
  ] as const;
  // ... 见 agent-hub.tsx line 200+
}
```

**已实现位置**：`frontend/components/console/agent-hub.tsx` `AgentWorkflowStrip`

---

## Pattern 4 · Telemetry Chip Row（轻量 KPI）

**适用**：右侧 chat 顶部，替代左侧 2x2 大卡  
**特点**：紧凑、单行 4 chip、颜色编码

```tsx
function TelemetryChipRow({ items }: {
  items: { labelKey: readonly [string, string]; value: number; unit: string; color: string }[]
}) {
  const { lang } = useApp();
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
      {items.map((item) => {
        const label = lang === "zh" ? item.labelKey[0] : item.labelKey[1];
        return (
          <div
            key={item.labelKey[1]}
            className="flex flex-col gap-0.5 rounded-lg border border-border-token bg-surface-2/55 px-2.5 py-1.5"
            style={{ borderLeftColor: item.color, borderLeftWidth: 2 }}
          >
            <span className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-fg-muted">
              {label}
            </span>
            <div className="flex items-baseline gap-1" style={{ color: item.color }}>
              <AnimatedNumber
                value={item.value}
                className="font-mono text-[13px] font-bold tabular-nums"
                springConfig={{ stiffness: 90, damping: 28 }}
              />
              <span className="font-mono text-[9px] text-fg-subtle">{item.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

**已实现位置**：`frontend/components/console/agent-hub.tsx` `TelemetryChipRow`

---

## Pattern 5 · 留空 footer（仅图像）

**适用**：某些模块（如 Analytics）数据图本身就有大量信息，不需要 footer 文字  
**实现**：传 `footer={undefined}`（不传 footer prop）

```tsx
<ModuleHeroSlot
  src="/console/mascots/modules/analytics-module.png"
  alt="Analytics mascot"
  color="violet"
  size="lg"
  className="shrink-0 lg:h-[220px]"
  // 不传 footer
/>
```

---

## Pattern 6 · CardMascotAccent（卡片内嵌入式吉祥物 — 推荐）

**适用**：Treasury / Wallets / Analytics / Policy 的侧边卡片  
**来源**：`inbox/console-references/ref-agent-treasury-hub-source.png`、`ref-command-center-grid-source.png`  
**特点**：吉祥物是**卡片内容的一部分**，不是独立 banner；人物占卡片右侧 30-40%，底部与卡片底部融合

### 参考图规律

| 维度 | Treasury 卡 | Wallets 卡 | Agent 移动 |
|---|---|---|---|
| 容器 | 一张完整圆角卡片 | 一张完整圆角卡片 | 功能区底部 |
| 人物位置 | 卡片**右侧**，底边贴齐 | 卡片**右侧**，底边贴齐 | 中央/右下 |
| 人物尺寸 | 占卡片高 **60-70%**，宽 **35-40%** | 占卡片高 **50%**，宽 **30%** | 占区域高 **60%** |
| 人像类型 | **半身像**（腰以上），面向左 | 机器人，面向左 | 女孩+机器人，面向前 |
| 接地光晕 | 底部紫色/模块色径向渐变 | 底部淡紫/蓝色光晕 | 底部发光 |
| 内容避让 | 数字、圆环、列表在**左侧** | 总资产、饼图在**左侧** | 输入框在人物下方 |
| 人物占比 | 装饰性，不抢数据 | 装饰性 | 视觉锚点 |

### 实现模板

```tsx
// 容器：相对定位的卡片，右侧留出 30-40% 宽度
<div className="relative flex h-full overflow-hidden rounded-card border border-border-token bg-surface-2/50 p-4">
  {/* 左侧：数据和标题 */}
  <div className="z-10 flex min-w-0 flex-1 flex-col">
    <p className="mb-3 text-[12px] font-medium text-fg-muted">{_("风险概览", "Risk Overview")}</p>
    {/* ... 数据 ... */}
  </div>

  {/* 右侧：吉祥物容器 */}
  <div className="relative z-0 w-[38%] min-w-[100px] max-w-[150px]">
    {/* 底部接地光晕 */}
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[75%]"
      style={{
        background:
          "radial-gradient(ellipse 90% 80% at 50% 100%, rgba(192,132,252,0.22) 0%, transparent 68%)",
      }}
    />
    {/* 吉祥物半身像 */}
    <img
      src="/console/mascots/modules/treasury-module.png"
      alt="Treasury mascot"
      className="pointer-events-none absolute bottom-0 left-1/2 h-[160px] w-auto max-w-none -translate-x-1/2 select-none object-cover object-[center_20%]"
      draggable={false}
    />
  </div>
</div>
```

### 关键参数

| 参数 | 推荐值 | 说明 |
|---|---|---|
| 容器宽度占比 | 30-40% | 过小像贴纸，过大抢内容 |
| 人物高度 | 140-180px | 半身像最佳；全身像会显小 |
| 接地光晕高度 | 容器底部 75% | 椭圆径向渐变，制造"坐在地上"感 |
| object-fit | `object-cover` | 裁掉透明外边，填满容器 |
| object-position | `object-[center_20%]` | 让人脸/上半身居中偏上 |
| 底部对齐 | `absolute bottom-0` | 人物脚底贴卡片底边 |

### 已实现参考

- `frontend/components/console/modules/treasury.tsx` `TreasuryMetricsRail`（参考图右侧 Risk Overview 卡）

---

## 错误用法

❌ **不要把吉祥物做成顶部 banner**：

```tsx
// 反例 — 破坏 workspace 布局，像贴纸横幅
<div className="h-[180px] w-full">
  <ModuleHeroSlot src="..." size="md" />
</div>
```

❌ **不要直接 img 标签贴图**：

```tsx
// 反例 — 看起来像贴纸
<img src="/console/mascots/modules/treasury-module.png" className="absolute right-4 top-4 w-32" />
```

❌ **不要在 HeroSlot 里塞 KPI**：

```tsx
// 反例 — 拥挤
<ModuleHeroSlot
  footer={
    <div>
      <KpiCard ... />
      <KpiCard ... />
    </div>
  }
/>
```

✅ **正确做法**：
- 数据区在左，吉祥物在右，各占一栏
- 吉祥物用 `object-cover` + 底部光晕 + 半身像
- 全身/大吉祥物只在 Agent 首页使用
- 其他模块统一用 **CardMascotAccent** 模式
