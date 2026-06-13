"use client";

import React, { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "framer-motion";

/* =============================================================================
 * BREATHING TEXT — Pretext-style "text breathing"
 *
 * Each token rides its own sine wave (scale 1 → 1+amplitude → 1), phase-shifted
 * by index, so copy gently inhales / exhales. Transform-only (GPU compositing,
 * no reflow), pauses when off-screen, and collapses to static text under
 * reduced motion.
 * ===========================================================================*/

interface BreathingTextProps {
  /** Text to render. Use \n for line breaks. */
  text: string;
  /** Words tinted with accentColor (punctuation-insensitive match). */
  accentWords?: string[];
  accentColor?: string;
  /** Max scale delta per token — keep subtle (default 0.03). */
  amplitude?: number;
  /** Seconds for one inhale or exhale (default 2.6). */
  period?: number;
  /** Per-token phase offset in seconds (default 0.16). */
  stagger?: number;
  /** Optional opacity pulse on top of scale (makes breathing far more readable). */
  opacityPulse?: { from: number; to: number };
  /** English splits on spaces; Chinese uses Intl.Segmenter when available. */
  lang?: "en" | "zh";
  /** Optional outer scroll container — e.g. the whole pipeline stage section. */
  scrollTriggerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  style?: React.CSSProperties;
}

const stripPunct = (w: string) => w.toLowerCase().replace(/[^a-z0-9一-龥]/gi, "");

type BreathToken = { text: string; animate: boolean };

function tokenizeLine(line: string, lang: "en" | "zh"): BreathToken[] {
  if (lang === "zh") {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      const segmenter = new Intl.Segmenter("zh-Hans", { granularity: "word" });
      return [...segmenter.segment(line)].map((part) => ({
        text: part.segment,
        animate: Boolean(part.isWordLike),
      }));
    }
    return [...line].map((char) => ({
      text: char,
      animate: !/\s/.test(char),
    }));
  }

  return line.split(/(\s+)/).filter(Boolean).map((part) => ({
    text: part,
    animate: !/^\s+$/.test(part),
  }));
}

export function BreathingText({
  text,
  accentWords,
  accentColor = "#B5FF4D",
  amplitude = 0.03,
  period = 2.6,
  stagger = 0.16,
  opacityPulse,
  lang = "en",
  scrollTriggerRef,
  className = "",
  style,
}: BreathingTextProps) {
  const scopeRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const lines = text.split("\n");
  const accentSet = new Set((accentWords ?? []).map(stripPunct));

  useGSAP(
    () => {
      if (!scopeRef.current || prefersReducedMotion) return;
      const words = scopeRef.current.querySelectorAll(".breath-word");
      if (!words.length) return;

      const vars: gsap.TweenVars = {
        scale: 1 + amplitude,
        transformOrigin: "50% 70%",
        duration: period,
        ease: "sine.inOut",
        yoyo: true,
        yoyoEase: true,
        repeat: -1,
        stagger: { each: stagger },
        paused: true,
      };

      if (opacityPulse) {
        vars.opacity = opacityPulse.to;
      }

      const tween = gsap.to(words, vars);

      const triggerEl = scrollTriggerRef?.current ?? scopeRef.current;
      if (!triggerEl) return;

      ScrollTrigger.create({
        trigger: triggerEl,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
      });
    },
    {
      scope: scopeRef,
      dependencies: [
        text,
        amplitude,
        period,
        stagger,
        lang,
        prefersReducedMotion,
        scrollTriggerRef,
        opacityPulse,
      ],
    }
  );

  if (prefersReducedMotion) {
    return (
      <span className={`block ${className}`} style={style}>
        {text}
      </span>
    );
  }

  return (
    <span ref={scopeRef} className={`block ${className}`} style={style}>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block">
          {tokenizeLine(line, lang).map((token, tokenIdx) => {
            if (!token.animate) {
              return <React.Fragment key={tokenIdx}>{token.text}</React.Fragment>;
            }

            const isAccent = accentSet.has(stripPunct(token.text));
            const initialOpacity = opacityPulse && !isAccent ? opacityPulse.from : undefined;

            return (
              <span
                key={tokenIdx}
                className="breath-word inline-block whitespace-nowrap will-change-transform"
                style={{
                  color: isAccent ? accentColor : undefined,
                  opacity: initialOpacity,
                }}
              >
                {token.text}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
