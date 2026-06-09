"use client";

import React from "react";

const TRUST_ITEMS = [
  "Cobo",
  "Ethereum",
  "GitHub",
  "Notion",
  "USDC",
  "OpenAI",
  "Next.js",
  "Tailwind",
  "Vercel",
  "React",
];

export function MarqueeTrust() {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 mb-8">
        <p
          className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-white/30"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          Built with the stack you already trust
        </p>
      </div>

      <div
        className="relative flex overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, white 15%, white 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, white 15%, white 85%, transparent)",
        }}
      >
        <div className="flex shrink-0 animate-marquee gap-16 items-center">
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <span
              key={i}
              className="text-lg font-semibold text-white/20 whitespace-nowrap select-none"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 animate-marquee gap-16 items-center" aria-hidden="true">
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <span
              key={i}
              className="text-lg font-semibold text-white/20 whitespace-nowrap select-none"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
