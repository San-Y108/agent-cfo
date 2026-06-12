// GSAP 基础配置 —— AgentCFO Demo Redesign 动效层
// 用法：在 "use client" 组件中 import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// 注册插件（只需一次，此处集中注册）
if (typeof window !== "undefined") {
  gsap.registerPlugin(
    ScrollTrigger,
    Flip,
    SplitText,
    ScrambleTextPlugin,
    DrawSVGPlugin,
    MotionPathPlugin,
    ScrollToPlugin
  );
}

// 导出常用工具
export { gsap, ScrollTrigger, useGSAP };

// 预设动画缓动曲线
export const EASE = {
  smooth: "power3.out",
  snappy: "power2.out",
  dramatic: "power4.inOut",
  elastic: "elastic.out(1, 0.5)",
} as const;

// 预设 stagger 间隔（分步揭示用）
export const STAGGER = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.2,
  dramatic: 0.4,
} as const;

// 常用 reveal 动画预设
export function fadeInUp(
  targets: gsap.TweenTarget,
  opts?: { duration?: number; delay?: number; y?: number; ease?: string }
) {
  return gsap.from(targets, {
    opacity: 0,
    y: opts?.y ?? 24,
    duration: opts?.duration ?? 0.8,
    delay: opts?.delay ?? 0,
    ease: opts?.ease ?? EASE.smooth,
  });
}

export function staggerReveal(
  targets: gsap.TweenTarget,
  opts?: { stagger?: number; duration?: number; y?: number }
) {
  return gsap.from(targets, {
    opacity: 0,
    y: opts?.y ?? 20,
    duration: opts?.duration ?? 0.6,
    stagger: opts?.stagger ?? STAGGER.normal,
    ease: EASE.smooth,
  });
}
