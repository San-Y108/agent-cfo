"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "framer-motion";

const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

interface DecodeHeadlineProps {
  text: string;
  accent?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  scrollTriggerStart?: string;
  scrambleDelay?: number;
  charStagger?: number;
}

export function DecodeHeadline({
  text,
  accent = "#B5FF4D",
  className = "",
  style,
  as: Tag = "div",
  scrollTriggerStart = "top 85%",
  scrambleDelay = 0.2,
  charStagger = 0.035,
}: DecodeHeadlineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const lines = text.split("\n");
  const [isClient, setIsClient] = useState(false);

  // Physics refs for mouse repel
  const charStatesRef = useRef<
    Map<string, { x: number; y: number; vx: number; vy: number }>
  >(new Map());
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Decode animation (GSAP)
  useGSAP(
    () => {
      if (!containerRef.current || prefersReducedMotion || !isClient) return;
      const chars = containerRef.current.querySelectorAll(".decode-char");
      chars.forEach((char, i) => {
        const el = char as HTMLElement;
        const targetChar = el.dataset.char!;
        if (targetChar === " ") {
          el.textContent = " ";
          el.style.opacity = "1";
          return;
        }
        gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.05,
            delay: scrambleDelay + i * charStagger,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: scrollTriggerStart,
              toggleActions: "play none none none",
            },
            onStart: () => {
              let count = 0;
              const maxScrambles = 6;
              const interval = setInterval(() => {
                el.textContent =
                  SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                count++;
                if (count >= maxScrambles) {
                  clearInterval(interval);
                  el.textContent = targetChar;
                  el.style.color = "white";
                }
              }, 35);
            },
          }
        );
      });
    },
    { scope: containerRef, dependencies: [text, accent, prefersReducedMotion, isClient] }
  );

  // Mouse repel physics loop
  useEffect(() => {
    if (prefersReducedMotion || !isClient) return;
    const container = containerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll(".decode-char");
    chars.forEach((char) => {
      const el = char as HTMLElement;
      const key = el.dataset.key!;
      charStatesRef.current.set(key, { x: 0, y: 0, vx: 0, vy: 0 });
    });

    const REPEL_RADIUS = 100;
    const REPEL_STRENGTH = 3.5;
    const SPRING = 0.08;
    const DAMPING = 0.82;

    const animate = () => {
      const mouse = mouseRef.current;

      chars.forEach((char) => {
        const el = char as HTMLElement;
        const key = el.dataset.key!;
        const state = charStatesRef.current.get(key);
        if (!state) return;

        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        if (mouse.active) {
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_RADIUS && dist > 1) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
            state.vx += (dx / dist) * force;
            state.vy += (dy / dist) * force;
          }
        }

        state.vx += -state.x * SPRING;
        state.vy += -state.y * SPRING;
        state.vx *= DAMPING;
        state.vy *= DAMPING;
        state.x += state.vx;
        state.y += state.vy;

        if (Math.abs(state.x) > 0.1 || Math.abs(state.y) > 0.1) {
          el.style.transform = `translate(${state.x}px, ${state.y}px)`;
        } else {
          el.style.transform = "";
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleLeave = () => {
      mouseRef.current = { x: -9999, y: -9999, active: false };
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);
    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
    };
  }, [prefersReducedMotion, isClient]);

  if (prefersReducedMotion) {
    return (
      <Tag ref={containerRef as any} className={className} style={style}>
        {lines.map((line, i) => (
          <div key={i} className="font-medium text-white" style={style}>
            {line}
          </div>
        ))}
      </Tag>
    );
  }

  return (
    <Tag
      ref={containerRef as any}
      className={`cursor-crosshair ${className}`}
      style={style}
    >
      {lines.map((line, lineIdx) => (
        <div
          key={lineIdx}
          className="font-medium"
          style={{
            fontFamily: style?.fontFamily || "Inter, sans-serif",
            fontSize: style?.fontSize,
            letterSpacing: style?.letterSpacing || "-0.022em",
            lineHeight: style?.lineHeight || 1.08,
          }}
        >
          {line.split(" ").map((word, wordIdx) => {
            const wordKey = `${lineIdx}-w${wordIdx}`;
            return (
              <span
                key={wordKey}
                style={{ display: "inline-block", whiteSpace: "nowrap" }}
              >
                {word.split("").map((char, charIdx) => {
                  const key = `${lineIdx}-${wordIdx}-${charIdx}`;
                  const fallbackChar =
                    char === " "
                      ? " "
                      : SCRAMBLE_CHARS[(key.length + charIdx + wordIdx) % SCRAMBLE_CHARS.length];
                  return (
                    <span
                      key={key}
                      className="decode-char inline-block will-change-transform"
                      data-char={char}
                      data-key={key}
                      style={{
                        color: accent,
                        opacity: isClient ? 0 : 1,
                        minWidth: char === " " ? "0.25em" : undefined,
                      }}
                    >
                      {isClient ? fallbackChar : char}
                    </span>
                  );
                })}
                {/* Space between words — allow wrapping here */}
                {wordIdx < line.split(" ").length - 1 && (
                  <span className="decode-char inline-block" data-char=" " data-key={`${wordKey}-sp`} style={{ minWidth: "0.25em" }}>
                    {" "}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      ))}
    </Tag>
  );
}
