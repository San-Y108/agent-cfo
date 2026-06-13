# 5 模块色 + 光晕系统

> 统一管理 AgentCFO Console 的 5 个模块吉祥物颜色 token，确保视觉一致。

---

## 5 模块色对照

| 模块 | HudColor 字面量 | accent hex | Tailwind class | CSS 变量 |
|---|---|---|---|---|
| **Agent** | `lime` | `#B5FF4D` | `text-hud-lime` · `bg-hud-lime/10` | `--glow-lime` |
| **Treasury** | `cyan` | `#5EEAD4` | `text-hud-cyan` · `bg-hud-cyan/10` | `--glow-cyan` |
| **Wallets** | `blue` | `#60A5FA` | `text-hud-blue` · `bg-hud-blue/10` | `--glow-blue` |
| **Analytics** | `violet` | `#C084FC` | `text-hud-violet` · `bg-hud-violet/10` | `--glow-violet` |
| **Policy** | `coral` | `#FB7185` | `text-hud-coral` · `bg-hud-coral/10` | `--glow-coral` |

辅助色（不直接做 module 色）：

| 名称 | hex | 用途 |
|---|---|---|
| amber | `#FBBF24` | Workflow Strip step 3（Approve 确认环节） |
| emerald | `#10B981` | （未启用，预留 Success 反馈） |
| purple | `#A855F7` | （未启用，预留 Mentor / 导师） |

---

## 双层光晕系统

每个 ModuleHeroSlot 容器默认加两层光晕，保证亮/暗色双适配：

### Layer 1 · 底部 radial gradient（`var(--glow-{color})`）

```tsx
// module-hero-slot.tsx line 53
<div
  className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[70%]"
  style={{
    background: `radial-gradient(ellipse 90% 80% at 50% 100%, ${GLOW[color]} 0%, transparent 68%)`,
  }}
/>
```

- 椭圆中心 50% 100%（底部居中）
- 高度占 70%（覆盖下半区）
- 渐变到透明 68%
- 颜色取自 `--glow-{color}` token

### Layer 2 · 底部 surface 渐隐（`var(--surface)`）

```tsx
// module-hero-slot.tsx line 66
<div
  className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%]"
  style={{
    background:
      "linear-gradient(to top, var(--surface) 0%, color-mix(in srgb, var(--surface) 55%, transparent) 45%, transparent 100%)",
  }}
/>
```

- 从底向上 surface 色渐显
- 45% 处开始 55% 透明
- 顶部 100% 透明
- 亮/暗色都用 `var(--surface)`，自动适配

---

## GLOW 变量定义（`frontend/app/globals.css`）

查找模式（不一定精确匹配）：

```css
:root {
  --glow-lime: rgba(181, 255, 77, 0.5);
  --glow-cyan: rgba(94, 234, 212, 0.5);
  --glow-coral: rgba(251, 113, 133, 0.5);
  --glow-amber: rgba(251, 191, 36, 0.5);
  --glow-blue: rgba(96, 165, 250, 0.5);
  --glow-violet: rgba(192, 132, 252, 0.5);
  --surface: #0d0d0d;  /* 暗色默认 */
}

[data-theme="light"] {
  --surface: #fafafa;
}
```

**修改时**：若调整 hex，必须同步改 `tailwind.config` 和 `lib/constants/console-colors.ts`（如有）。

---

## AgentCfoMascot 紫色光晕族（特例）

Agent 用 **violet 紫**而非 lime（强调 AI 的人格感）：

```tsx
// agent-cfo-mascot.tsx line 75
filter: analyzing
  ? "drop-shadow(0 18px 32px rgba(94,234,212,0.35))"  // 青色（思考态）
  : "drop-shadow(0 16px 28px rgba(192,132,252,0.28)) drop-shadow(0 6px 14px rgba(0,0,0,0.55))"
```

底部阴影：

```tsx
// line 130
background: analyzing ? "rgba(94,234,212,0.5)" : "rgba(192,132,252,0.42)",
filter: "blur(14px)",
```

径向渐变背景：

```tsx
// line 110
background: "radial-gradient(ellipse 95% 75% at 50% 92%, rgba(192,132,252,0.14) 0%, transparent 62%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 45%)"
```

---

## 颜色 vs 业务语义

| 颜色 | 业务语义 |
|---|---|
| **lime** | 通过、就绪、活跃（Agent 在线、Plan ready） |
| **cyan** | 资金、风控扫描（Treasury risk check） |
| **blue** | 钱包、签名、CAW（Wallets） |
| **violet** | AI、数据、洞察（Agent + Analytics） |
| **coral** | 拦截、风险、警告（Policy + Blocked items） |
| **amber** | 确认、待执行（Approve step） |

**冲突时**：业务语义优先于视觉喜好。例如 Treasury 内部出现 "Bob blocked" 状态，必须用 coral 而不是 cyan。

---

## 调色板扩展流程

新增第 6 个模块时：

1. 选语义匹配的 HudColor（参考上表）
2. `app/globals.css` 加 `--glow-{newcolor}`
3. `tailwind.config` 加 `hud-{newcolor}` 颜色组
4. `module-hero-slot.tsx` `GLOW` map 加一行
5. `lib/constants/console-colors.ts`（如有）登记
6. `public/console/mascots/modules/README.md` 追加新行
7. checklist M{N} 段加 Hero Slot color 验收项
