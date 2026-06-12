"use client";

import React, { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "framer-motion";

/* =============================================================================
 * BREATHING TEXT — Pretext-style "text breathing"
 *
 * Each word rides its own sine wave (scale 1 → 1+amplitude → 1), phase-shifted
 * by index, so the headline gently inhales / exhales like the breathing demo
 * in @chenglou/pretext. Transform-only (GPU compositing, no reflow), pauses
 * when off-screen, and collapses to static text under reduced motion.
 * ===========================================================================*/

interface BreathingTextProps {
  /** Text to render. Use \n for line breaks. */
  text: string;
  /** Words tinted with accentColor (punctuation-insensitive match). */
  accentWords?: string[];
  accentColor?: string;
  /** Max scale delta per word — keep subtle (default 0.03). */
  amplitude?: number;
  /** Seconds for one inhale or exhale (default 2.6). */
  period?: number;
  /** Per-word phase offset in seconds (default 0.16). */
  stagger?: number;
  className?: string;
}

const stripPunct = (w: string) => w.toLowerCase().replace(/[^a-z0-9一-龥]/gi, "");

export function BreathingText({
  text,
  accentWords,
  accentColor = "#B5FF4D",
  amplitude = 0.03,
  period = 2.6,
  stagger = 0.16,
  className = "",
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

      const tween = gsap.to(words, {
        scale: 1 + amplitude,
        transformOrigin: "50% 70%",
        duration: period,
        ease: "sine.inOut",
        yoyo: true,
        yoyoEase: true,
        repeat: -1,
        stagger: { each: stagger },
        paused: true,
      });

      // Only breathe while visible — saves main-thread work off-screen.
      ScrollTrigger.create({
        trigger: scopeRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
      });
    },
    {
      scope: scopeRef,
      dependencies: [text, amplitude, period, stagger, prefersReducedMotion],
    }
  );

  return (
    <span ref={scopeRef} className={`block ${className}`}>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block">
          {line.split(" ").map((word, wordIdx) => (
            <React.Fragment key={wordIdx}>
              <span
                className="breath-word inline-block whitespace-nowrap will-change-transform"
                style={
                  accentSet.has(stripPunct(word))
                    ? { color: accentColor }
                    : undefined
                }
              >
                {word}
              </span>
              {wordIdx < line.split(" ").length - 1 && " "}
            </React.Fragment>
          ))}
        </span>
      ))}
    </span>
  );
}
