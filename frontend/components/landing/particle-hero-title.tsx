"use client";

import { useEffect, useRef } from "react";

/**
 * ParticleHeroTitle
 *
 * Renders the hero headline as an interactive particle field.
 * - Particles are sampled from the text rendered on an offscreen canvas
 * - Mouse repulsion pushes particles away, creating a "digital tear" effect
 * - Particles slowly return to their original positions
 * - Colors shift across the hue spectrum for a cyber/finance energy feel
 *
 * Reduced motion: falls back to plain text rendering.
 */

interface Particle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  hue: number;
  size: number;
}

function sampleTextParticles(
  text: string,
  width: number,
  height: number,
  font: string,
  step: number
): Particle[] {
  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;
  const ctx = off.getContext("2d");
  if (!ctx) return [];

  ctx.fillStyle = "#ffffff";
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const particles: Particle[] = [];

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      if (data[i + 3] > 128) {
        const hue = (x / width) * 280 + 80; // 80-360 range (cyan → violet)
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          tx: x,
          ty: y,
          vx: 0,
          vy: 0,
          hue,
          size: Math.random() * 1.4 + 0.8,
        });
      }
    }
  }

  return particles;
}

export function ParticleHeroTitle({ text }: { text: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedRef.current) return;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { width: rect.width, height: rect.height };
    };

    const { width, height } = setSize();

    // Font scales with container width
    const fontSize = Math.max(32, Math.min(64, width / 12));
    const font = `bold ${fontSize}px Inter, sans-serif`;

    const step = 3;
    const particles = sampleTextParticles(text, width, height, font, step);

    let raf: number;
    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const radius = 100;
      const maxForce = 6;

      for (const p of particles) {
        // Attraction to text target
        const ax = (p.tx - p.x) * 0.04;
        const ay = (p.ty - p.y) * 0.04;
        p.vx += ax;
        p.vy += ay;

        // Mouse repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius && dist > 0) {
            const force = ((radius - dist) / radius) * maxForce;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Damping
        p.vx *= 0.9;
        p.vy *= 0.9;

        p.x += p.vx;
        p.y += p.vy;

        // Speed-based brightness
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const lightness = 60 + Math.min(30, speed * 4);

        ctx.fillStyle = `hsl(${p.hue}, 80%, ${lightness}%)`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

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
    const handleResize = () => {
      setSize();
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, [text]);

  return (
    <span ref={wrapRef} className="relative inline-block w-full">
      {/* Text always visible underneath — canvas particles overlay on top */}
      <span className="text-white">{text}</span>

      {/* Particle canvas overlay — absolutely positioned so text stays visible even if canvas fails */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
        style={{ imageRendering: "pixelated" }}
      />
    </span>
  );
}
