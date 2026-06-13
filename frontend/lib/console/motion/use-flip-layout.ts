"use client";

import { useCallback, useRef } from "react";
import { Flip } from "gsap/Flip";
import { gsap } from "@/lib/gsap";

export function useFlipLayout<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  const capture = useCallback(() => {
    if (!containerRef.current) return;
    flipStateRef.current = Flip.getState(containerRef.current.children);
  }, []);

  const animate = useCallback(
    (opts?: Flip.FromToVars) => {
      if (!flipStateRef.current || !containerRef.current) return;
      Flip.from(flipStateRef.current, {
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.04,
        absolute: true,
        ...opts,
      });
    },
    []
  );

  const captureThenAnimate = useCallback(
    (mutate: () => void, opts?: Flip.FromToVars) => {
      capture();
      mutate();
      requestAnimationFrame(() => animate(opts));
    },
    [animate, capture]
  );

  return { containerRef, capture, animate, captureThenAnimate };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
