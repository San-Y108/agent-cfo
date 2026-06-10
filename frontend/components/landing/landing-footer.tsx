"use client";

import React from "react";
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
  return (
    <footer className="relative mt-24 w-full overflow-hidden border-t border-white/[0.06] bg-[#080808]">
      {/* Top gradient hairline echoing pipeline accents */}
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, #5EEAD4, #B5FF4D, #60A5FA, #C084FC, transparent)",
          opacity: 0.4,
        }}
      />

      <div className="mx-auto max-w-7xl px-6 pt-20 lg:px-10 lg:pt-28">
        {/* Top: brand summary + 4 columns */}
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-20">
          {/* Brand summary */}
          <div>
            <div className="flex items-baseline gap-2">
              <img src="/logo.png" alt="AgentCFO" className="h-7 w-7 rounded-full" />
              <span
                className="text-2xl font-bold tracking-tight text-white"
                style={{ fontFamily: "Inter, sans-serif" }}
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
              className="mt-4 max-w-sm text-sm leading-relaxed text-white/55"
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
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
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

        {/* Giant wordmark — SVG auto-fits container width */}
        <div className="relative mt-20 select-none pb-8 lg:mt-28 lg:pb-12">
          <svg
            viewBox="0 0 1000 140"
            preserveAspectRatio="xMidYMid meet"
            className="block w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="agentcfo-wordmark" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(94,234,212,0.22)" />
                <stop offset="35%" stopColor="rgba(181,255,77,0.28)" />
                <stop offset="70%" stopColor="rgba(96,165,250,0.22)" />
                <stop offset="100%" stopColor="rgba(192,132,252,0.22)" />
              </linearGradient>
            </defs>
            <text
              x="0"
              y="118"
              fill="url(#agentcfo-wordmark)"
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
          </svg>
          <span className="sr-only">AgentCFO</span>
        </div>

        {/* Bottom info row */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.05] py-6 sm:flex-row">
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
                  className="group block text-sm text-white/65 transition-colors hover:text-white"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {inner}
                </a>
              ) : (
                <Link
                  href={l.href}
                  className="group block text-sm text-white/65 transition-colors hover:text-white"
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
