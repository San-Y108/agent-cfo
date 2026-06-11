"use client";

import React, { useCallback, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, ArrowUpRight } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterColumn = {
  title: string;
  accent: string;
  links: FooterLink[];
};

const COLUMNS: FooterColumn[] = [
  {
    title: "Workflow",
    accent: "#B5FF4D",
    links: [
      { label: "01 · Records", href: "#workflow" },
      { label: "02 · Risk", href: "#workflow" },
      { label: "03 · Approval", href: "#workflow" },
      { label: "04 · Wallet", href: "#workflow" },
      { label: "05 · Audit", href: "#workflow" },
    ],
  },
  {
    title: "Resources",
    accent: "#5EEAD4",
    links: [
      { label: "GitHub repo", href: "https://github.com/San-Y108/agent-cfo", external: true },
      { label: "Vercel deploy", href: "https://agentcfo-frontend.vercel.app", external: true },
      { label: "Open Console", href: "/console" },
      { label: "API contract", href: "#workflow" },
    ],
  },
  {
    title: "Hackathon",
    accent: "#60A5FA",
    links: [
      { label: "Cobo Agentic Commerce", href: "#workflow" },
      { label: "Demo video", href: "#workflow" },
      { label: "Pitch slides", href: "#workflow" },
      { label: "Track submission", href: "#workflow" },
    ],
  },
  {
    title: "Legal",
    accent: "#C084FC",
    links: [
      { label: "Mock-only demo", href: "#workflow" },
      { label: "Testnet-simulated", href: "#workflow" },
      { label: "No real funds", href: "#workflow" },
      { label: "v0.1 · 2026", href: "#workflow" },
    ],
  },
];

export function LandingFooter() {
  const lastWave = useRef(0);
  const wordmarkRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);

  // Throttled ripple trigger — every 200ms max
  const triggerWave = useCallback(() => {
    const now = Date.now();
    if (now - lastWave.current < 180) return;
    lastWave.current = now;

    const svg = svgRef.current;
    const anims = svg?.querySelectorAll("animate");
    const bf = Array.from(anims || []).find(
      (a) => a.getAttribute("attributeName") === "baseFrequency"
    ) as SVGAnimateElement | null;
    const sc = Array.from(anims || []).find(
      (a) => a.getAttribute("attributeName") === "scale"
    ) as SVGAnimateElement | null;

    if (bf && typeof bf.beginElement === "function") {
      try { bf.endElement(); } catch { }
      bf.beginElement();
    }
    if (sc && typeof sc.beginElement === "function") {
      try { sc.endElement(); } catch { }
      sc.beginElement();
    }
  }, []);

  // 3D tilt follow
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = wordmarkRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
    triggerWave();
  }, [triggerWave]);

  const tiltX = (mousePos.y - 0.5) * 12;
  const tiltY = (mousePos.x - 0.5) * -8;

  return (
    <footer className="relative mt-24 w-full overflow-hidden border-t border-white/[0.12] bg-[#0a0a0a]">
      {/* Top gradient hairline echoing pipeline accents */}
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, #5EEAD4, #B5FF4D, #60A5FA, #C084FC, transparent)",
          opacity: 0.6,
        }}
      />

      <div className="mx-auto max-w-7xl px-6 pt-20 lg:px-10 lg:pt-28">
        {/* Top: brand summary + 4 columns */}
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-20">
          {/* Brand summary */}
          <div>
            <div className="flex items-baseline gap-2">
              <img src="/logo.png" alt="AgentCFO" className="h-9 w-9" style={{ filter: "drop-shadow(0 0 6px rgba(181,255,77,0.5))" }} />
              <span
                className="text-2xl font-black tracking-tight bg-gradient-to-r from-lime-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent"
                style={{
                  fontFamily: "Inter, sans-serif",
                  filter: "drop-shadow(0 0 10px rgba(181,255,77,0.5)) drop-shadow(0 0 20px rgba(94,234,212,0.3))",
                }}
              >
                AgentCFO
              </span>
              <span
                className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                v0.1 · 2026
              </span>
            </div>
            <p
              className="mt-4 max-w-sm text-sm leading-relaxed text-white/80"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              DAO AI Treasury Officer — risk-checked payouts, human approval, audit-grade settlement, built on Cobo Agentic Wallet.
            </p>

            {/* Quick CTA */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                href="/console"
                className="group inline-flex items-center gap-1.5 rounded-full bg-[#B5FF4D] px-4 py-2 text-xs font-bold text-[#0D0D0D] transition-opacity hover:opacity-90"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Open Console
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="https://github.com/San-Y108/agent-cfo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/5 hover:text-white"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <GithubIcon className="h-3 w-3" />
                GitHub
              </a>
            </div>

            {/* Trust microcopy */}
            <div
              className="mt-6 flex flex-wrap items-center gap-3 text-[10px] text-white/35"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              <span>testnet-simulated</span>
              <span className="text-white/15">·</span>
              <span>Cobo Agentic Wallet</span>
              <span className="text-white/15">·</span>
              <span>no real funds</span>
            </div>
          </div>

          {/* 4 columns of links */}
          <div className="grid grid-cols-2 gap-8 sm:gap-12 md:grid-cols-4">
            {COLUMNS.map((col) => (
              <FooterColumnView key={col.title} col={col} />
            ))}
          </div>
        </div>

        {/* Giant wordmark — Holographic Neon 3D */}
        <div
          ref={wordmarkRef}
          className="relative mt-20 select-none pb-8 lg:mt-28 lg:pb-12"
          style={{ perspective: 1200 }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Ambient glow behind text */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: isHovering ? 1 : 0.3,
              background: `radial-gradient(ellipse 60% 50% at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(181,255,77,0.12) 0%, rgba(96,165,250,0.08) 40%, transparent 70%)`,
            }}
          />

          <svg
            ref={svgRef}
            viewBox="0 0 1000 140"
            preserveAspectRatio="xMidYMid meet"
            className="relative z-10 block w-full"
            style={{
              transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
              transition: isHovering ? 'transform 0.15s ease-out' : 'transform 0.6s ease-out',
              transformStyle: 'preserve-3d',
            }}
            aria-hidden
          >
            <defs>
              {/* Neon gradient — pure fluorescent, max saturation */}
              <linearGradient id="agentcfo-wordmark" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00FFD1" />
                <stop offset="30%" stopColor="#CCFF00" />
                <stop offset="60%" stopColor="#00B8FF" />
                <stop offset="100%" stopColor="#E040FB" />
              </linearGradient>

              {/* Outer glow — blurred text only, no source merge */}
              <filter id="neon-glow-lg" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="16" result="blur" />
              </filter>
              <filter id="neon-glow-md" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
              </filter>

              {/* Displacement filter — ripple on mouse move */}
              <filter id="footer-distortion" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.005 0.02"
                  numOctaves="2"
                  result="noise"
                >
                  <animate
                    attributeName="baseFrequency"
                    dur="0.4s"
                    values="0.005 0.02;0.015 0.06;0.005 0.02"
                    repeatCount="1"
                    begin="indefinite"
                    fill="freeze"
                  />
                </feTurbulence>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="0"
                  xChannelSelector="R"
                  yChannelSelector="G"
                >
                  <animate
                    attributeName="scale"
                    dur="0.35s"
                    values="0;22;10;0"
                    repeatCount="1"
                    begin="indefinite"
                    fill="freeze"
                    calcMode="spline"
                    keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
                    keyTimes="0;0.3;0.6;1"
                  />
                </feDisplacementMap>
              </filter>

              {/* Scanline beam gradient */}
              <linearGradient id="scanline-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="40%" stopColor="rgba(181,255,77,0.6)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="60%" stopColor="rgba(96,165,250,0.6)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Layer 1: Deep outer glow — strong halo */}
            <text
              x="0"
              y="118"
              fill="url(#agentcfo-wordmark)"
              filter="url(#neon-glow-lg)"
              opacity={isHovering ? 0.95 : 0.65}
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 900,
                fontSize: 130,
                letterSpacing: "-6px",
                transition: "opacity 0.5s ease",
              }}
            >
              AGENTCFO
            </text>

            {/* Layer 2: Medium glow — tight edge halo */}
            <text
              x="0"
              y="118"
              fill="url(#agentcfo-wordmark)"
              filter="url(#neon-glow-md)"
              opacity={isHovering ? 0.95 : 0.7}
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 900,
                fontSize: 130,
                letterSpacing: "-6px",
                transition: "opacity 0.5s ease",
              }}
            >
              AGENTCFO
            </text>

            {/* Layer 3: Cyan edge stroke (RGB split) */}
            <text
              x="-2"
              y="118"
              fill="none"
              stroke="#00FFD1"
              strokeWidth="2"
              opacity={isHovering ? 0.7 : 0.3}
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 900,
                fontSize: 130,
                letterSpacing: "-6px",
                transition: "opacity 0.3s ease",
              }}
            >
              AGENTCFO
            </text>

            {/* Layer 4: Magenta edge stroke (RGB split) */}
            <text
              x="2"
              y="118"
              fill="none"
              stroke="#FF2E8C"
              strokeWidth="2"
              opacity={isHovering ? 0.7 : 0.3}
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 900,
                fontSize: 130,
                letterSpacing: "-6px",
                transition: "opacity 0.3s ease",
              }}
            >
              AGENTCFO
            </text>

            {/* Layer 5: Bright white inner glow */}
            <text
              x="0"
              y="118"
              fill="white"
              opacity={isHovering ? 0.4 : 0.28}
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 900,
                fontSize: 130,
                letterSpacing: "-6px",
                transition: "opacity 0.5s ease",
              }}
            >
              AGENTCFO
            </text>

            {/* Layer 6: Solid core — pure neon, no blur, full opacity */}
            <text
              x="0"
              y="118"
              fill="url(#agentcfo-wordmark)"
              filter="url(#footer-distortion)"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 900,
                fontSize: 130,
                letterSpacing: "-6px",
              }}
            >
              AGENTCFO
            </text>

            {/* Layer 6: Scanline beam */}
            <rect
              x="0"
              y="0"
              width="1000"
              height="6"
              fill="url(#scanline-grad)"
              opacity={isHovering ? 0.7 : 0}
              style={{ mixBlendMode: 'screen' }}
            >
              <animate
                attributeName="y"
                dur="2.5s"
                values="0;132;0"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                keyTimes="0;0.5;1"
              />
              <animate
                attributeName="opacity"
                dur="2.5s"
                values="0;0.8;0"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                keyTimes="0;0.5;1"
              />
            </rect>
          </svg>
          <span className="sr-only">AgentCFO</span>
        </div>

        {/* Bottom info row */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.10] py-6 sm:flex-row">
          <div
            className="flex flex-wrap items-center gap-2 text-[11px] text-white/40"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            <span>© 2026 AgentCFO</span>
            <span className="text-white/15">·</span>
            <span>Cobo Agentic Commerce hackathon</span>
            <span className="text-white/15">·</span>
            <span>Mock demo — no real transactions</span>
          </div>
          <div
            className="flex items-center gap-2 text-[11px] text-white/40"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-[#B5FF4D]" />
            <span>Build status · green</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumnView({ col }: { col: FooterColumn }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: col.accent, boxShadow: `0 0 8px ${col.accent}` }}
        />
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{
            color: col.accent,
            fontFamily: "'Courier New', Courier, monospace",
          }}
        >
          {col.title}
        </span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {col.links.map((l) => {
          const inner = (
            <span className="inline-flex items-center gap-1.5">
              <span>{l.label}</span>
              {l.external && (
                <ExternalLink className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-60" />
              )}
            </span>
          );
          return (
            <li key={l.label}>
              {l.external ? (
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block text-sm text-white/85 transition-colors hover:text-white"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {inner}
                </a>
              ) : (
                <Link
                  href={l.href}
                  className="group block text-sm text-white/85 transition-colors hover:text-white"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
