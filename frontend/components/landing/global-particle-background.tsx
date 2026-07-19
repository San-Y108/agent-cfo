"use client";

import { useEffect, useRef } from "react";

/**
 * GlobalParticleBackground
 *
 * Fixed-position pixelated particle field covering the entire viewport.
 * Serves as the global background layer for the entire landing page
 * (except the Hero video area which is covered by its own content).
 *
 * Features:
 * - Multi-layer square particles (depth field)
 * - Mouse-driven ripple displacement
 * - Reduced motion support
 * - Mobile degradation (static render)
 */

interface Particle {
  x: number;
  y: number;
  z: number; // depth: 0 = far, 1 = near
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  alpha: number;
  color: string;
}

const COLORS = {
  white: "#ffffff",
  lime: "#B5FF4D",
  cyan: "#5EEAD4",
};

function initParticles(width: number, height: number, isMobile: boolean): Particle[] {
  const density = isMobile ? 25000 : 12000;
  const count = Math.max(80, Math.min(4000, Math.floor((width * height) / density)));
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const z = Math.random();
    const isEnergy = Math.random() > 0.94;

    const baseVx = (Math.random() - 0.5) * 0.08 * (z * 0.8 + 0.3);
    const baseVy = (Math.random() - 0.5) * 0.08 * (z * 0.8 + 0.3);

    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      z,
      vx: baseVx,
      vy: baseVy,
      baseVx,
      baseVy,
      size: z < 0.4 ? 1 : z < 0.75 ? 1.5 : 2.5,
      alpha: z < 0.4 ? 0.12 : z < 0.75 ? 0.22 : 0.38,
      color: isEnergy ? COLORS.lime : COLORS.white,
    });
  }

  return particles;
}

export function GlobalParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const reducedRef = useRef(false);
  const mobileRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    mobileRef.current = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Mobile: static render only
    if (mobileRef.current) {
      const particles = initParticles(width, height, true);
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.6;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      return () => window.removeEventListener("resize", resize);
    }

    // Desktop: animated
    const particles = initParticles(width, height, false);
    let raf: number;

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      for (const p of particles) {
        // Base drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -4) p.x = width + 4;
        if (p.x > width + 4) p.x = -4;
        if (p.y < -4) p.y = height + 4;
        if (p.y > height + 4) p.y = -4;

        // Mouse ripple (only if not reduced motion)
        if (!reducedRef.current && mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 160 + p.z * 80;

          if (dist < radius && dist > 0) {
            const force = ((radius - dist) / radius) * (0.35 + p.z * 0.25);
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Damping back to base velocity
        p.vx += (p.baseVx - p.vx) * 0.03;
        p.vy += (p.baseVy - p.vy) * 0.03;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (p.color === COLORS.lime ? 1.3 : 1);
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };

    if (!reducedRef.current) {
      raf = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.5;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    }

    const handleMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
    };
    const handleLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        background: "transparent",
        mixBlendMode: "screen",
        opacity: 0.56,
      }}
      aria-hidden="true"
    />
  );
}
