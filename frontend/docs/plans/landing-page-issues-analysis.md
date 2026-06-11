# Landing Page Issues — Analysis & Repair Plan

> **Scope**: `frontend/app/page.tsx` and all landing components under `frontend/components/landing/`
> **Date**: 2026-06-10
> **Status**: Read-only analysis; no files modified

---

## Issue 1: Layout — "Build by the team" + "Build timeline" Merge

### 1.1 File Map

| File | Role | Relevant Lines |
|---|---|---|
| `frontend/components/landing/landing-sections.tsx` | Section orchestrator; renders both components sequentially | 50–58 |
| `frontend/components/landing/team-showcase.tsx` | "Built by the team" fan-card section | 1–429 (full file) |
| `frontend/components/landing/build-timeline.tsx` | "Build timeline" Phase 0→3 horizontal timeline | 1–166 (full file) |

### 1.2 Root Cause Analysis

**Current state** (from `landing-sections.tsx` lines 50–58):

```tsx
{/* Built-by team fan-card showcase */}
<section id="team" className="w-full">
  <TeamShowcase />
</section>

{/* Build timeline — Phase 0→3 */}
<section id="timeline" className="w-full">
  <BuildTimeline />
</section>
```

- `TeamShowcase` and `BuildTimeline` are rendered as **two independent `<section>` blocks**.
- Each has its own heading (`"Built by the team"` / `"Build Timeline"`), its own vertical padding (`py-24 lg:py-32` vs `py-16 lg:py-24`), and its own entrance animations.
- The result is **visual redundancy**: two adjacent "team meta" sections that could be one compact module.
- `BuildTimeline` carries explanatory text (`descZh`/`descEn` per phase, rendered at line 117–118) that adds verbosity.

### 1.3 Repair Plan

**Option A — Merge into a single condensed module (recommended)**

1. In `landing-sections.tsx`, replace the two `<section>` blocks with a single wrapper:
   ```tsx
   <section id="team" className="w-full">
     <TeamShowcase />
     {/* Inline timeline, no separate heading */}
     <BuildTimelineCompact />
   </section>
   ```
2. Create a new component `BuildTimelineCompact` (or inline it inside `TeamShowcase`) that:
   - Removes the `<h3>` heading and subtitle (lines 65–72 of `build-timeline.tsx`).
   - Removes the `descZh`/`descEn` text rendering (lines 117–118).
   - Keeps only: **date dot → phase label → title** (4 items in a horizontal row).
   - Reduces vertical padding to `py-8 lg:py-12` (vs current `py-16 lg:py-24`).
   - Optionally reuses the existing gradient connecting line (lines 78–83).
3. Update `TeamShowcase` bottom margin (`mb-16 lg:mb-20` at line 239) to `mb-8 lg:mb-12` so the timeline sits closer.
4. Remove the old `<section id="timeline">` wrapper and its nav mapping (see Issue 2).

**Option B — Keep separate but compact**

- Keep both sections but strip `BuildTimeline` of its heading and descriptions (same as step 2 above).
- Reduce `TeamShowcase` bottom padding and `BuildTimeline` top padding so they visually merge.

### 1.4 Estimated Effort

- **Option A**: Medium (~30–45 min) — requires new compact component or inline refactor.
- **Option B**: Small (~15–20 min) — just strip text and adjust padding.

### 1.5 Risk Notes

- `BuildTimeline` has responsive layouts (desktop horizontal at line 75–123, mobile vertical at line 126–162). Both need the desc removal.
- The `useApp` i18n hook and `useReducedMotion` are self-contained; no side effects.
- If nav still references `#timeline`, it will 404 after removal — coordinate with Issue 2.

---

## Issue 2: Navigation — FAQ Missing from Nav Jump

### 2.1 File Map

| File | Role | Relevant Lines |
|---|---|---|
| `frontend/components/landing/velorix-hero.tsx` | Navbar + nav arc animation | 19–25, 125–337 |
| `frontend/components/landing/landing-sections.tsx` | FAQ section rendering (no `id`) | 61–64 |
| `frontend/components/landing/faq-section.tsx` | FAQ content component | 1–56 |
| `frontend/lib/i18n/dict.ts` | Translation keys for nav labels | 12–17, 420–425 |

### 2.2 Root Cause Analysis

**Nav items** (`velorix-hero.tsx` lines 19–25):

```tsx
const NAV_ITEMS: { key: DictKey; href: string }[] = [
  { key: "nav.platform", href: "#platform" },
  { key: "nav.workflow", href: "#workflow" },
  { key: "nav.guardrails", href: "#guardrails" },
  { key: "nav.team", href: "#team" },
  { key: "nav.timeline", href: "#timeline" },
];
```

- **No FAQ entry** exists in `NAV_ITEMS`.
- The FAQ section is rendered inside `landing-sections.tsx` lines 61–64 **without an `id` attribute**:
  ```tsx
  {/* FAQ + HSM 2-column layout */}
  <div className="w-full max-w-6xl mx-auto mt-28 border-t pt-16 grid grid-cols-1 md:grid-cols-5 gap-12 text-left border-white/10 px-6">
    <FAQSection />
    <HSMMonitor />
  </div>
  ```
  It uses a plain `<div>`, not `<section id="faq">`.
- The nav arc jump logic (`jumpTo` at lines 152–183) and `IntersectionObserver` (lines 186–204) both iterate over `NAV_ITEMS`. Adding FAQ requires:
  1. Adding an entry to `NAV_ITEMS`.
  2. Adding a matching `id="faq"` to the DOM.
  3. Ensuring the arc animation covers the new item.

**How the arc works**:
- `jumpTo(targetX)` (lines 152–183) animates an SVG quadratic bezier (`Q` command) from the current nav pill center to the target center.
- `drawArc(cx, arcH, hw)` (lines 139–150) draws `M${x1},0 Q${cx},${-arcH} ${x2},0`.
- The arc height is proportional to distance (`maxArc = Math.min(28, dist * 0.45)`).
- When `activeIdx` changes (via `IntersectionObserver` or click), `jumpTo` fires.

**Team/Timeline scroll behavior**:
- Click handler at lines 297–304: `el.scrollIntoView({ behavior: "smooth" })`.
- `IntersectionObserver` at lines 186–204 tracks which section is in view and updates `activeIdx`.

### 2.3 Repair Plan

1. **Add `id="faq"`** to the FAQ wrapper in `landing-sections.tsx`:
   ```tsx
   <section id="faq" className="w-full">
     <div className="max-w-6xl mx-auto ...">
       <FAQSection />
       <HSMMonitor />
     </div>
   </section>
   ```
2. **Add nav item** to `NAV_ITEMS` in `velorix-hero.tsx`:
   ```tsx
   { key: "nav.faq", href: "#faq" },
   ```
   Insert after `guardrails` (so order is: Platform → Workflow → Guardrails → FAQ → Team).
3. **Add translation keys** to `dict.ts`:
   - `"nav.faq": "FAQ"` (en)
   - `"nav.faq": "常见问题"` (zh)
4. **Verify arc behavior**:
   - The arc logic is index-agnostic — it reads `activeIdx` and looks up `linkRefs.current[activeIdx]`. Adding one item in the middle shifts indices but the math remains correct.
   - Confirm `IntersectionObserver` threshold (`0.2`) works for the FAQ section height. FAQ is short (~3 items); if it never reaches `0.2` visibility, the observer may not trigger. Consider lowering threshold to `0.1` for FAQ or wrapping it in a taller spacer.
5. **Mobile menu** (`MobileMenu` at lines 51–123) iterates `NAV_ITEMS` dynamically; it will auto-include FAQ.

### 2.4 Estimated Effort

Small (~15–20 min).

### 2.5 Risk Notes

- `DictKey` type is derived from the `dict.en` keys. Adding `"nav.faq"` is type-safe as long as both `en` and `zh` objects receive the key.
- If Issue 1 removes `#timeline`, update `NAV_ITEMS` to drop the timeline entry (or replace it with FAQ). Coordinate both issues.
- The `IntersectionObserver` uses `rootMargin: "-80px 0px -60% 0px"`. Short sections like FAQ may struggle to register. Test scroll behavior after implementation.

---

## Issue 3: Bug — "Plan From" Arc Jump Logic Skips "Workflow"

### 3.1 File Map

| File | Role | Relevant Lines |
|---|---|---|
| `frontend/components/landing/velorix-hero.tsx` | Navbar arc animation | 125–337 |
| `frontend/components/landing/pipeline-showcase.tsx` | 5-stage pipeline (Workflow section) | 1–861 |

### 3.2 Root Cause Analysis

**Nav order** (from `velorix-hero.tsx` lines 19–25):

```
0: #platform  (Platform)
1: #workflow  (Workflow)
2: #guardrails (Guardrails)
3: #team      (Team)
4: #timeline  (Timeline)
```

**The bug**: When a user clicks "Workflow" (index 1) then scrolls to "Guardrails" (index 2), the arc **jumps directly from index 1 to index 2**, visually passing over the Workflow section as if it were skipped. But the actual bug described is the opposite: **the arc jumps from "Plan" (which doesn't exist as a nav item) to "Guardrails", skipping "Workflow"**.

**Clarification**: There is no "Plan" nav item. The nav items are Platform, Workflow, Guardrails, Team, Timeline. The bug likely manifests as:

- When scrolling from **Platform** (`#platform`) to **Workflow** (`#workflow`), the arc may appear to jump from Platform directly toward Guardrails, or
- The `IntersectionObserver` may favor Guardrails over Workflow because the Workflow section (`PipelineShowcase`) is a **GSAP-pinned horizontal scroll section** that occupies significant viewport time. During pin, the `#workflow` element is technically at the top of the viewport, but the observer with `rootMargin: "-80px 0px -60% 0px"` may not register it as "in view" because the section is `100vh` tall and the observer threshold is `0.2`.

**Deeper analysis of the arc logic** (`jumpTo`, lines 152–183):

```tsx
const jumpTo = (targetX: number) => {
  const fromX = arc.curX;
  const dist = Math.abs(targetX - fromX);
  const maxArc = Math.min(28, dist * 0.45);
  const dur = 300 + dist * 0.55;
  // ... animate arc.curX from fromX to targetX with easeInOut
};
```

The arc is a **single quadratic bezier** drawn between two x-coordinates. It does not "pass through" intermediate nav items — it is a direct jump from the previous active pill center to the new active pill center. The visual "path" is just the arc curve, not a multi-segment path.

**However**, the user describes the arc as "showing the workflow path" and that it "should pass through Workflow before reaching Guardrails". This suggests the **intended design** is:

> When navigating from Platform → Guardrails, the arc should briefly highlight/dwell on Workflow, not jump directly.

**Current behavior**:
- `activeIdx` is driven by `IntersectionObserver`. As the user scrolls, whichever section is most visible becomes active.
- When scrolling past the pinned Workflow section quickly (especially with `fastScrollEnd: true` in GSAP), the observer may transition from `platform` → `guardrails` without ever setting `workflow` as active, because:
  1. The Workflow section is pinned (`position: fixed` during GSAP pin), so its `boundingClientRect` stays at the top.
  2. The observer's `rootMargin: "-80px 0px -60% 0px"` means the top 80px and bottom 60% of the viewport are excluded. A pinned `100vh` section at the top may never satisfy `isIntersecting` with `threshold: 0.2`.
  3. The `topmost` reduction (line 193–194) picks the section with the smallest `top` value. During pin, `#workflow` has `top ≈ 0`, but `#guardrails` may also be entering. If both are visible, the logic picks the one higher up — but if `#workflow` is pinned and `#guardrails` is below, the observer may see `#guardrails` as more "in view" because `#workflow` is technically fixed and its intersection ratio may be stale.

**Conclusion**: The bug is not in the arc drawing math itself, but in the **IntersectionObserver configuration failing to reliably detect the pinned Workflow section**, causing `activeIdx` to skip from `platform` (0) directly to `guardrails` (2), skipping `workflow` (1).

### 3.3 Repair Plan

1. **Fix IntersectionObserver for pinned sections**:
   - The `#workflow` section uses GSAP ScrollTrigger pin. During pin, the element is `position: fixed` and may not intersect normally.
   - **Option A**: Add a dedicated invisible marker element inside `PipelineShowcase` that is NOT pinned, and observe that marker instead of `#workflow`.
     ```tsx
     // Inside PipelineShowcase
     <div id="workflow-marker" className="absolute top-0 h-1 w-full" />
     ```
     Then observe `#workflow-marker` in the nav.
   - **Option B**: Use GSAP's `onEnter` / `onLeave` callbacks on the ScrollTrigger to manually dispatch a custom event or call a callback that updates nav state.
   - **Option C**: Lower the `IntersectionObserver` threshold for `#workflow` specifically, or increase `rootMargin` to be more generous.

2. **Recommended: Option A (marker element)**:
   - In `pipeline-showcase.tsx`, add a `<div id="workflow" className="absolute top-0">` as the first child of the outer wrapper (line 198). The current code already has:
     ```tsx
     <div id="workflow" className="relative w-full">
     ```
     But this entire div is the pin target. Instead, add a **separate, non-pinned marker**:
     ```tsx
     <div id="workflow" className="relative w-full">
       <div id="workflow-start" className="absolute top-0 h-px w-full" />
       {/* ... rest of content */}
     </div>
     ```
     Then update `NAV_ITEMS` to use `href: "#workflow-start"` for the Workflow item, OR keep `#workflow` for the nav but ensure the observer looks at a child that isn't pinned.

3. **Alternative: Use ScrollTrigger callbacks**:
   - In `pipeline-showcase.tsx`, inside the `useGSAP` hook (line 133), add:
     ```tsx
     scrollTrigger: {
       // ... existing config
       onEnter: () => window.dispatchEvent(new CustomEvent("nav:set", { detail: 1 })),
       onLeave: () => window.dispatchEvent(new CustomEvent("nav:clear", { detail: 1 })),
       onEnterBack: () => window.dispatchEvent(new CustomEvent("nav:set", { detail: 1 })),
       onLeaveBack: () => window.dispatchEvent(new CustomEvent("nav:clear", { detail: 1 })),
     }
     ```
     Then in `velorix-hero.tsx`, listen for these events in `Navbar`.

4. **Verify the arc path**:
   - Once `activeIdx` reliably hits index 1 (Workflow) while scrolling, the arc will naturally pass through it because `jumpTo` will be called with the Workflow pill's x-coordinate as an intermediate step.
   - The arc is a smooth curve, not a stepped path. It will not "stop" at Workflow, but the active pill highlight will land on Workflow during scroll, which is the intended behavior.

### 3.4 Estimated Effort

Medium (~30–45 min) — requires understanding GSAP ScrollTrigger + IntersectionObserver interaction and testing scroll behavior.

### 3.5 Risk Notes

- GSAP ScrollTrigger pin changes the element's `position` to `fixed` during scroll. This is a known footgun with `IntersectionObserver`.
- Changing the observed element for Workflow may affect other scroll-dependent behaviors (e.g., if other components also query `#workflow`).
- The `fastScrollEnd: true` in GSAP (line 147 of `pipeline-showcase.tsx`) means fast scrolls instantly complete the pin animation. This can make the Workflow section flash by, making it hard for the observer to catch. Consider whether the observer threshold needs to be more sensitive.
- If implementing Option A, ensure the marker element does not affect layout (use `h-px` or `h-1` with `absolute`).

---

## Summary Table

| Issue | Files to Touch | Root Cause | Fix Strategy | Effort | Risks |
|---|---|---|---|---|---|
| 1. Team + Timeline merge | `landing-sections.tsx`, `build-timeline.tsx` (or new compact variant), `team-showcase.tsx` | Two redundant sections with duplicate headings | Strip heading/desc from timeline, embed compactly under Team section | Medium | Responsive layouts need desc removal on both desktop & mobile |
| 2. FAQ missing from nav | `velorix-hero.tsx`, `landing-sections.tsx`, `dict.ts` | No `id="faq"` on wrapper; no nav item | Add `id="faq"` to section wrapper; add `"nav.faq"` to `NAV_ITEMS` and translations | Small | Short FAQ may not trigger `IntersectionObserver` at threshold 0.2 |
| 3. Arc skips Workflow | `velorix-hero.tsx`, `pipeline-showcase.tsx` | GSAP pin makes `#workflow` invisible to `IntersectionObserver` | Add non-pinned marker element or use ScrollTrigger callbacks to manually set nav state | Medium | GSAP pin + observer is a known conflict; needs scroll testing |
| 4. Hero text blocks video | `velorix-hero.tsx` | Hero text + CTA + disclaimer occupies too much vertical space, obscuring the background video focal point | Remove disclaimer text OR shift entire text block upward by ~40px | Small | Ensure text remains readable against video; test mobile |

---

## Issue 4: Hero Section — Text Obscures Video Focal Point

### 4.1 File Map

| File | Role | Relevant Lines |
|---|---|---|
| `frontend/components/landing/velorix-hero.tsx` | Hero section with text + CTA + disclaimer | 1–120 (approx) |

### 4.2 Root Cause Analysis

**Current Hero text block** (verbatim from user):

```
Where DAO treasury decisions become executable payment flows
from contributor records to wallet execution — risk-checked, human-approved, audit-ready

[Run the payout flow]  ← CTA button

testnet-simulated · Cobo Agentic Wallet · no real funds  ← disclaimer
```

- The entire text block (headline + subtitle + CTA + disclaimer) sits in the vertical center of the Hero section.
- The background video has a **focal point where two fingers point toward a slice/card** — this visual element is the Hero's primary "wow" moment.
- The text block **overlaps and obscures** this focal point, making the video's subject less prominent and the overall composition feel cluttered.
- The disclaimer line (`testnet-simulated · Cobo Agentic Wallet · no real funds`) is especially problematic: it's small, low-contrast, and adds visual noise without contributing to the core message.

### 4.3 Repair Plan

**Option A — Remove disclaimer (recommended, 5 min)**

1. Locate the disclaimer `<div>` or `<span>` in `velorix-hero.tsx` (search for "testnet-simulated" or "no real funds").
2. Delete the entire disclaimer element.
3. Adjust the CTA button's `margin-bottom` to compensate (remove the gap that was above the disclaimer).

**Option B — Shift entire text block upward (~15 min)**

1. Find the text container in `velorix-hero.tsx` (likely a flex column centered with `items-center justify-center`).
2. Change vertical alignment from `justify-center` to `justify-start` or add a negative margin (`-mt-10` or `translate-y-[-40px]`).
3. Ensure the text doesn't collide with the nav bar (maintain `pt-20` or similar safe zone).
4. Test on mobile: upward shift may cause text to be too close to the nav; may need responsive adjustment (`md:-mt-10`).

**Option C — Reduce text density (hybrid, ~10 min)**

1. Remove the subtitle line (`from contributor records to wallet execution...`) or shorten it.
2. Remove the disclaimer.
3. Keep headline + CTA only — minimal, bold, unobstructed.

### 4.4 Estimated Effort

Small (~5–15 min).

### 4.5 Risk Notes

- Removing the disclaimer may reduce legal/transparency clarity. If the disclaimer is required, consider moving it to the **footer** or a small badge near the CTA instead of a full line.
- Upward shift must not cause text to overlap with the fixed navbar.
- The background video's focal point may vary by screen size; test on 1440px, 1920px, and mobile.

---

## Cross-Issue Coordination Notes

1. **If Issue 1 removes `#timeline`**: Update `NAV_ITEMS` in `velorix-hero.tsx` to drop the timeline entry. The nav arc logic is index-based, so removing an item shifts indices — verify arc positions after change.
2. **If Issue 2 adds `#faq`**: Decide nav order. Suggested: Platform → Workflow → Guardrails → FAQ → Team (drop Timeline).
3. **Issue 3 depends on Issue 2**: If nav items change, the `activeIdx` values shift. Ensure the ScrollTrigger callback (if used) dispatches the correct index.
4. **i18n**: All new nav keys must be added to both `en` and `zh` in `dict.ts`. The `DictKey` type auto-infers from the object shape.
