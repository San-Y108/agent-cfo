# AgentCFO /demo Redesign Plan

> 目标：静态看板 → 分步揭示的 Agent 工作流演示
> 设计原则：黑色高级感、叙事动线、真交互、与 `/` Hero 视觉统一

---

## 1. 信息架构

```
┌─────────────────────────────────────────────────────────────┐
│  Header: AgentCFO Command Center + Mode Badge               │
├─────────────────────────────────────────────────────────────┤
│  KPI Strip: Budget / Approved / Blocked / Executed / Mode   │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ Sidebar  │  Main Content Area (Step-by-step reveal)         │
│          │                                                  │
│ - Plan   │  ┌──────────────────────────────────────────┐   │
│ - Risk   │  │  Step 0: Intro + Generate Plan Button    │   │
│ - Approve│  │  Step 1: Payment Plan (Bento Cards)      │   │
│ - Execute│  │  Step 2: Risk Gate (Bob blocked red)     │   │
│ - Audit  │  │  Step 3: Human Approval + CTA            │   │
│          │  │  Step 4: Execution Result                │   │
│          │  │  Step 5: Audit Report                    │   │
│          │  └──────────────────────────────────────────┘   │
│          │                                                  │
├──────────┴──────────────────────────────────────────────────┤
│  Footer                                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 分步动线（6 Steps）

| Step | 名称 | 触发方式 | 核心内容 | 动效 |
|---|---|---|---|---|
| 0 | **Intro** | 页面加载 | 场景数据摘要 + "Generate Plan" 大按钮 | Fade in |
| 1 | **Payment Plan** | 点击 Generate Plan | 4 张 Bento Card（Alice/Bob/Charlie/Data API） | Stagger reveal 0.1s |
| 2 | **Risk Gate** | 自动推进（1s delay） | 5 项检查 + Bob 标红动画 | Slide in + pulse |
| 3 | **Approval** | 自动推进 | Approved/Blocked 队列 + "Approve & Execute" 按钮 | Scale in |
| 4 | **Execution** | 点击 Approve | CAW 执行动画 + tx hash 展示 | Beam/Sparkle + loading |
| 5 | **Audit** | 自动推进 | 完整审计报告 + 重运行按钮 | Fade up |

**手动控制：** Sidebar 可点击跳转任意步骤（已揭示的）。

---

## 3. 状态机

```tsx
type DemoStep = 0 | 1 | 2 | 3 | 4 | 5;

const [step, setStep] = useState<DemoStep>(0);
const [revealedSteps, setRevealedSteps] = useState<Set<number>>(new Set([0]));
const [isRunning, setIsRunning] = useState(false);

// Auto-advance logic
// Step 0 → 1: manual (button click)
// Step 1 → 2: auto (1.5s delay)
// Step 2 → 3: auto (1s delay)
// Step 3 → 4: manual (Approve button)
// Step 4 → 5: auto (2s delay, simulate execution)
```

---

## 4. 组件清单

### 新组件
| 组件 | 位置 | 说明 |
|---|---|---|
| `DemoFlow` | `components/demo/demo-flow.tsx` | 分步状态机容器 |
| `StepIntro` | `components/demo/steps/step-intro.tsx` | Step 0: 场景摘要 + Generate Plan |
| `StepPlan` | `components/demo/steps/step-plan.tsx` | Step 1: Payment Plan Bento Cards |
| `StepRisk` | `components/demo/steps/step-risk.tsx` | Step 2: Risk Gate 检查项 |
| `StepApproval` | `components/demo/steps/step-approval.tsx` | Step 3: Approval UI |
| `StepExecution` | `components/demo/steps/step-execution.tsx` | Step 4: Execution 动画 |
| `StepAudit` | `components/demo/steps/step-audit.tsx` | Step 5: Audit Report |

### 复用/适配现有组件
| 现有组件 | 适配方式 |
|---|---|
| `PaymentPlanBoard` | 放入 BentoCard 中展示 |
| `RiskGate` | 放入 BentoCard，Bob 项加红色 pulse 动效 |
| `HumanApproval` | 简化版，突出 CTA 按钮 |
| `ExecutionResult` | 加 beam/sparkle 动效 |
| `AuditReport` | 放入 BentoCard，全宽展示 |
| `WorkflowTimeline` | 改造为与 step 联动的进度条 |

### Aceternity 组件
| 组件 | 用途 |
|---|---|
| `DemoSidebar` | 左侧导航 |
| `StatsStrip` | 顶部 KPI（数字滚动）|
| `BentoGrid` / `BentoCard` | 主内容卡片 |
| `Card` / `CardTitle` / `CardDescription` | 通用卡片 |
| `GridBackground` / `DotBackground` | 背景点缀 |
| `GradientOrb` | 视觉层次 |

---

## 5. 视觉规范

### 颜色
| Token | 值 | 用途 |
|---|---|---|
| `bg-primary` | `#030712` | 全局背景 |
| `bg-card` | `rgba(20,20,20,0.7)` | 卡片背景 |
| `border` | `rgba(255,255,255,0.1)` | 卡片边框 |
| `accent` | `#f59e0b` (amber-500) | AgentCFO 品牌色 |
| `success` | `#10b981` (emerald-500) | Approved/通过 |
| `danger` | `#ef4444` (red-500) | Blocked/Bob 标红 |
| `info` | `#3b82f6` (blue-500) | Execution/信息 |

### 背景
- `noise.webp` 全局纹理叠加
- `GridBackground`  subtle grid lines
- `GradientOrb` (blue/purple) 在 CTA 区域背后

### 动效
| 场景 | 动效 | 实现 |
|---|---|---|
| 卡片进入 | Fade up + stagger | Framer Motion `variants` |
| Bob blocked | Red pulse + shake | Framer Motion `animate` |
| 数字变化 | 滚动计数 | `useSpring` + `useTransform` |
| 执行中 | Beam + sparkle | CSS + Framer Motion |
| Sidebar hover | Slide highlight | Framer Motion `layoutId` |
| 背景 | Subtle parallax | GSAP ScrollTrigger |

---

## 6. 数据流

```
demoData (mock) → DemoFlow state machine → Step components
                              ↓
                     Sidebar navigation
                              ↓
                     WorkflowTimeline (progress)
```

---

## 7. 验证清单

- [ ] `pnpm typecheck` 通过
- [ ] `pnpm build` 通过
- [ ] 分步动线可完整跑通（Intro → Plan → Risk → Approval → Execution → Audit）
- [ ] Sidebar 可跳转已揭示步骤
- [ ] Bob 标红戏剧化效果可见
- [ ] 数字滚动动效正常
- [ ] 移动端 responsive
- [ ] 与 `/` Hero 视觉风格统一
