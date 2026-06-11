"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

interface CharState {
  char: string;
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

interface PretextRepelTextProps {
  text: string;
  font?: string;
  color?: string;
  accentColor?: string;
  lineHeight?: number;
  repelRadius?: number;
  repelStrength?: number;
  springStrength?: number;
  damping?: number;
  className?: string;
}

export function PretextRepelText({
  text,
  font = '600 36px "Inter", sans-serif',
  color = "#ffffff",
  accentColor = "#B5FF4D",
  lineHeight = 44,
  repelRadius = 120,
  repelStrength = 8,
  springStrength = 0.06,
  damping = 0.88,
  className = "",
}: PretextRepelTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<CharState[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number>(0);
  const dprRef = useRef(1);

  const measureAndInit = useCallback(async () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    await document.fonts.ready;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;

    const width = rect.width;
    const displayWidth = Math.floor(width);
    const displayHeight = Math.floor(rect.height);

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Measure with Pretext
    const computedFont = font.replace(/36px/, `${Math.floor(width * 0.065)}px`);
    const prepared = prepareWithSegments(text, computedFont);
    const result = layoutWithLines(prepared, displayWidth * 0.9, lineHeight);

    const newChars: CharState[] = [];
    const ctx2d = document.createElement("canvas").getContext("2d")!;
    ctx2d.font = computedFont;

    let currentX = 0;
    let currentY = 0;
    const lines = text.split("\n");
    const totalTextHeight = lines.length * lineHeight;
    const startY = (displayHeight - totalTextHeight) / 2 + lineHeight * 0.75;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const lineWidth = ctx2d.measureText(line).width;
      const lineX = (displayWidth - lineWidth) / 2;
      let charX = lineX;

      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        const charWidth = ctx2d.measureText(ch).width;
        const originX = charX + charWidth / 2;
        const originY = startY + lineIdx * lineHeight;

        newChars.push({
          char: ch,
          originX,
          originY,
          x: originX,
          y: originY,
          vx: 0,
          vy: 0,
          color: ch.trim() ? accentColor : color,
        });

        charX += charWidth;
      }
    }

    charsRef.current = newChars;
  }, [text, font, lineHeight, color, accentColor]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = dprRef.current;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      const chars = charsRef.current;
      for (const ch of chars) {
        // Repel force from mouse
        if (mouse.active) {
          const dx = ch.x - mouse.x;
          const dy = ch.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < repelRadius && dist > 1) {
            const force = (1 - dist / repelRadius) * repelStrength;
            ch.vx += (dx / dist) * force;
            ch.vy += (dy / dist) * force;
          }
        }

        // Spring back to origin
        ch.vx += (ch.originX - ch.x) * springStrength;
        ch.vy += (ch.originY - ch.y) * springStrength;

        // Damping
        ch.vx *= damping;
        ch.vy *= damping;

        // Update position
        ch.x += ch.vx;
        ch.y += ch.vy;

        // Draw character
        if (ch.char === " ") continue;
        ctx.font = font.replace(/36px/, `${Math.floor(w * 0.065)}px`);
        ctx.fillStyle = ch.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ch.char, ch.x, ch.y);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [font, repelRadius, repelStrength, springStrength, damping]);

  // Mouse handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    return () => {
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  // Init + resize
  useEffect(() => {
    measureAndInit();
    const ro = new ResizeObserver(() => measureAndInit());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measureAndInit]);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ height: "120px" }}>
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" />
    </div>
  );
}
