"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { SplitText } from "gsap/SplitText";
import { prefersReducedMotion } from "@/lib/console/motion/use-flip-layout";

/* =============================================================================
 * GSAP TEXT EFFECTS — SplitText + ScrambleText wrappers
 *
 * ⚠️  These components rely on GSAP Club plugins (SplitText, ScrambleText).
 *     In development they work with a watermark warning.
 *     For production, a GSAP Club license is required.
 *     Fallback: use Framer Motion equivalents if no license available.
 * ===========================================================================*/

interface SlamTextProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

/**
 * SlamText — 逐字从上方砸入效果（SplitText + stagger）
 * 每个字符从 y:-40, opacity:0 动画到 y:0, opacity:1
 */
export function SlamText({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  as: Tag = "span",
}: SlamTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const split = new SplitText(el, { type: "chars" });

    gsap.from(split.chars, {
      y: -40,
      opacity: 0,
      duration,
      stagger: 0.03,
      delay,
      ease: "power4.out",
    });

    return () => {
      split.revert();
    };
  }, [children, delay, duration]);

  return (
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}

/* =============================================================================
 * ScrambleValue — 数字/文本从乱码解码到目标值
 * ===========================================================================*/

interface ScrambleValueProps {
  value: string | number;
  className?: string;
  delay?: number;
  duration?: number;
  chars?: string; // charset for scramble, default: upperAndLowerCase
}

export function ScrambleValue({
  value,
  className = "",
  delay = 0,
  duration = 1.2,
}: ScrambleValueProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const prevValue = useRef<string | null>(null);

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const text = String(value);
    if (prevValue.current === text) return;
    prevValue.current = text;

    if (reduceMotion || prefersReducedMotion()) {
      el.textContent = text;
      return;
    }

    gsap.killTweensOf(el);
    gsap.to(el, {
      duration,
      delay,
      scrambleText: {
        text,
        chars: "0123456789ABCDEF",
        revealDelay: 0.15,
        speed: 0.45,
      },
      ease: "none",
    });
  }, [value, delay, duration, reduceMotion]);

  return (
    <span ref={ref} className={className}>
      {String(value)}
    </span>
  );
}

/* =============================================================================
 * Framer Motion fallback — 当 GSAP Club 不可用时使用
 * ===========================================================================*/

interface FadeInTextProps {
  children: string;
  className?: string;
  delay?: number;
}

/** 纯 Framer Motion 替代方案 — 逐字淡入（无 GSAP 依赖） */
export function FadeInText({
  children,
  className = "",
  delay = 0,
}: FadeInTextProps) {
  const chars = children.split("");

  return (
    <span className={className}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + i * 0.03,
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}
