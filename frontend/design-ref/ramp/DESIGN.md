---
version: alpha
name: Ramp
description: "A corporate spend management platform with a confident, modern canvas — predominantly white (#FFFFFF) with a near-black (#0D0D0D) for marketing surfaces and Ramp's distinctive yellow-green (#B5FF4D / #CCFF00) as an electric accent that signals savings, growth, and money-forward thinking. The dashboard is clean and data-dense: expense tables, spend analytics, card management — all in a white product environment where yellow-green appears on the primary action and brand mark. The system reads as the anti-expense-report: modern, fast, and built by people who understand that finance software should be as good as consumer software."

colors:
  primary: "#B5FF4D"
  on-primary: "#0D0D0D"
  primary-hover: "#A8F040"
  ink: "#0D0D0D"
  ink-muted: "#6B7280"
  canvas: "#ffffff"
  surface-1: "#F8F8F8"
  surface-2: "#F0F0F0"
  border: "#E5E5E5"
  marketing-bg: "#0D0D0D"
  marketing-ink: "#F5F5F5"
  savings: "#B5FF4D"
  chart-accent: "#B5FF4D"
  success: "#22C55E"
  danger: "#EF4444"

typography:
  display:
    fontFamily: "Ramp Grotesk, ABC Diatype, Inter, -apple-system, sans-serif"
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.03em
  body:
    fontFamily: "Ramp Grotesk, Inter, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: -0.01em

spacing:
  base: 8px
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]

radius:
  sm: 4px
  md: 8px
  lg: 12px
  pill: 9999px

shadows:
  card: "0 1px 3px rgba(0,0,0,0.08)"
  elevated: "0 4px 16px rgba(0,0,0,0.1)"

motion:
  duration-fast: 100ms
  duration-base: 200ms
  easing: cubic-bezier(0.4, 0, 0.2, 1)
---

## Rationale

**Yellow-green (#B5FF4D) as "savings" made visible** — The electric yellow-green accent is used specifically to display savings amounts — the money Ramp has saved your company. Associating an unusual, high-energy color with financial gain turns a dashboard metric into an emotionally charged product moment. It's a behavioral design decision: seeing your savings in electric green feels different from seeing them in neutral gray.

**White product canvas for trust and clarity** — Despite the bold dark marketing palette, the product dashboard runs on clean white because financial software requires maximum legibility. Finance teams reviewing expense reports, approvals, and audit trails need data clarity above brand expressiveness — white is the functional choice that earns trust through precision.

**Dark marketing, light product — same accent** — Carrying the yellow-green accent across both the dark marketing surface and the light product dashboard creates visual continuity between what companies see when evaluating Ramp and what they use every day. The accent is the brand anchor that makes the dual-palette system feel coherent.

**Ramp Grotesk as precision type investment** — A custom typeface (ABC Diatype-derived) with tabular figures communicates that Ramp is a serious financial platform. Tabular numerals in expense tables and spend charts are a professional-grade detail — columns align correctly when numbers are different widths, which matters when you're looking at thousands of transactions.

**Savings counter animation as brand signature** — Animating the savings total upward on dashboard load transforms a static number into a performance. It's the product equivalent of watching a slot machine: the anticipation of seeing how much you've saved creates a brief dopamine moment that differentiates the Ramp dashboard from every other expense tool's utilitarian summary page.

## 1. Visual Theme & Atmosphere
Ramp is the corporate card company that made expense management aspirational. The yellow-green accent (#B5FF4D) is used as a "savings" color — the amount Ramp has saved your company is displayed in this electric shade, making frugality feel exciting. The product is white and clean, a complete departure from the gray enterprise software that finance teams have historically tolerated. Marketing uses black canvas with the yellow-green for maximum impact and a bold, modern brand voice.

## 2. Color System
**Dashboard (light)**:
- Canvas: pure white — finance-grade clarity
- Yellow-green: #B5FF4D — primary CTA, savings amount highlight, Ramp card art
- Ink: #0D0D0D — near-true black for authority

**Marketing (dark)**:
- Canvas: #0D0D0D
- Yellow-green carries over — same accent, maximum contrast on dark
- White body text

The yellow-green is unusual in fintech — it says "fast, modern, profitable" rather than the trust-navy of traditional players.

## 3. Typography
Ramp Grotesk (ABC Diatype-derived) — a precise, slightly condensed grotesque at -0.03em display tracking. Bold at headlines, lighter at body. The financial data tables use tabular figures for column alignment. The brand has invested in typography as a differentiator from competitors.

## 4. Components & Patterns
- **Spend chart**: Yellow-green bars showing category spend, clean white background
- **Expense table**: Merchant logo + name + employee + amount + status pill — dense but scannable
- **Card management**: Physical card render + spending limit + recent transactions
- **Savings dashboard**: Large yellow-green number — total saved through Ramp intelligence
- **Approval workflow**: Step-by-step flow for expense approval routing
- **Receipt matching**: AI-matched receipts with confidence score visualization

## 5. Spacing & Layout
Dashboard: 240px sidebar, content max 1200px. Table row height: 48px for comfortable clicking. Card grid: 3-column with 24px gap. Marketing: 1440px max, dramatic full-bleed sections.

## 6. Motion & Interaction
Savings counter animates up on dashboard load — the number increasing is the signature Ramp delight moment. Approval actions have immediate feedback. Expense categorization shows AI-assigned category with confidence. Charts load with subtle bar-rise animation.

## Accessibility

### Contrast Ratios
- **Primary on background** (#B5FF4D on #ffffff): 1.2:1 — fails AA (decorative only on white; text must use on-primary #0D0D0D)
- **Text on background** (#0D0D0D on #ffffff): 19.4:1 — passes AA, passes AAA
- **Muted on background** (#6B7280 on #ffffff): 4.8:1 — passes AA, fails AAA

### Minimum Requirements
- **Touch target**: 44×44px minimum for all interactive elements
- **Focus indicator**: #0D0D0D outline, 2px, 2px offset
- **Focus contrast**: 19.4:1 against #ffffff background

### Motion
- Respects `prefers-reduced-motion`: yes — all transitions and animations should be suppressed
- All transitions use `@media (prefers-reduced-motion: reduce)` guard

### Notes
- The yellow-green (#B5FF4D) is essentially invisible as a foreground color on white (1.2:1) — it only works as a background fill with dark (#0D0D0D) text on top; every use of #B5FF4D must have #0D0D0D text over it, which achieves 16.1:1
- The savings counter animation (number counting upward on load) is the signature moment — wrap it in a `prefers-reduced-motion` guard and display the final value statically instead
- On the dark marketing surface (#0D0D0D canvas), #B5FF4D as text achieves 16.1:1 — that context is safe; confirm that any body copy color on the marketing canvas also reaches 4.5:1
- Chart bars filled with #B5FF4D convey financial data — ensure bar labels or axis values repeat the same information in text so color alone is not the data channel

---

*Source: https://www.designmd.co/d/ramp*
*Created for AgentCFO design reference.*
