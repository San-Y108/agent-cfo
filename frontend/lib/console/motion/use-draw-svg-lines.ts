"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "./use-flip-layout";

/**
 * Animates SVG stroke reveal via GSAP DrawSVG on mount / when deps change.
 * Targets elements matching `selector` inside the attached SVG root.
 */
export function useDrawSvgLines(deps: unknown[], selector = "[data-draw-svg]") {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const root = svgRef.current;
    if (!root || prefersReducedMotion()) return;

    const targets = root.querySelectorAll<SVGGeometryElement>(selector);
    if (!targets.length) return;

    gsap.killTweensOf(targets);
    gsap.set(targets, { drawSVG: "0%" });
    gsap.to(targets, {
      drawSVG: "100%",
      duration: 0.75,
      stagger: 0.07,
      ease: "power2.out",
    });
  }, deps);

  return svgRef;
}
