"use client";

import React, { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePointerRepel } from "./use-pointer-repel";

interface WordStyle {
  match: string[];
  className?: string;
  style?: React.CSSProperties;
}

interface DecodeHeadlineProps {
  text: string;
  accent?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  scrollTriggerStart?: string;
  /** Retained for call-site compatibility; now controls the stable reveal delay. */
  scrambleDelay?: number;
  /** Retained for call-site compatibility; now controls word-level reveal stagger. */
  charStagger?: number;
  specialWords?: WordStyle[];
  /** Retained for API compatibility. Continuous breathing was removed for stability. */
  breathe?: boolean;
}

/**
 * Stable editorial headline with a single word-level reveal.
 *
 * The previous implementation wrote random glyphs into every character, created
 * one ScrollTrigger and timer per character, and ran a permanent layout-reading
 * RAF loop. That made intended copy appear as mojibake and caused scroll jank.
 */
export function DecodeHeadline({
  text,
  accent = "#B5FF4D",
  className = "",
  style,
  as: Tag = "div",
  scrollTriggerStart = "top 85%",
  scrambleDelay = 0.2,
  charStagger = 0.035,
  specialWords,
}: DecodeHeadlineProps) {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const lines = text.split("\n");

  usePointerRepel(
    containerRef,
    ".headline-repel-char",
    Boolean(prefersReducedMotion),
    text,
  );

  useGSAP(
    () => {
      if (!containerRef.current || prefersReducedMotion) return;

      const words = gsap.utils.toArray<HTMLElement>(
        ".decode-word",
        containerRef.current,
      );
      if (!words.length) return;

      gsap.fromTo(
        words,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          delay: scrambleDelay,
          stagger: Math.min(Math.max(charStagger * 1.5, 0.02), 0.08),
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: containerRef.current,
            start: scrollTriggerStart,
            toggleActions: "play none none none",
            once: true,
          },
        },
      );
    },
    {
      scope: containerRef,
      dependencies: [
        text,
        scrollTriggerStart,
        scrambleDelay,
        charStagger,
        prefersReducedMotion,
      ],
    },
  );

  return (
    <Tag
      ref={containerRef as React.Ref<never>}
      className={`cursor-crosshair ${className}`}
      style={style}
    >
      {lines.map((line, lineIndex) => (
        <div
          key={`${lineIndex}-${line}`}
          className="font-medium"
          style={{
            fontFamily: style?.fontFamily || "Inter, sans-serif",
            fontSize: style?.fontSize,
            letterSpacing: style?.letterSpacing || "-0.022em",
            lineHeight: style?.lineHeight || 1.08,
          }}
        >
          {line.split(" ").map((word, wordIndex, words) => {
            const normalizedWord = word
              .toLowerCase()
              .replace(/[^a-z一-龥]/gi, "");
            const matchedStyle = specialWords?.find((wordStyle) =>
              wordStyle.match.some(
                (match) => match.toLowerCase() === normalizedWord,
              ),
            );

            return (
              <React.Fragment key={`${lineIndex}-${wordIndex}-${word}`}>
                <span
                  className={`decode-word inline-block ${matchedStyle?.className || ""}`}
                  style={{
                    whiteSpace: "nowrap",
                    color: matchedStyle ? accent : undefined,
                    ...matchedStyle?.style,
                  }}
                >
                  {Array.from(word).map((char, charIndex) => (
                    <span
                      key={`${char}-${charIndex}`}
                      className="headline-repel-char inline-block"
                    >
                      {char}
                    </span>
                  ))}
                </span>
                {wordIndex < words.length - 1 ? " " : null}
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </Tag>
  );
}
