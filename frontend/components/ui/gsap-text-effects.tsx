"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";

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
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;
    hasAnimated.current = true;

    const text = String(value);

    gsap.to(el, {
      duration,
      delay,
      scrambleText: {
        text,
        chars: "upperAndLowerCase",
        revealDelay: 0.2,
      },
      ease: "none",
    });
  }, [value, delay, duration]);

  return (
    <span ref={ref} className={className}>
      {/* initial placeholder — will be overwritten by GSAP */}
      {Array(String(value).length).fill("?").join("")}
    </span>
  );
}

/* =============================================================================
 * Framer Motion fallback — 当 GSAP Club 不可用时使用
 * ===========================================================================*/

import { motion } from "framer-motion";

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
