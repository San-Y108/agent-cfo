"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useT } from "@/lib/i18n/context";
import type { DictKey } from "@/lib/i18n/dict";
import { ThemeLanguageToggle } from "@/components/ui/theme-language-toggle";

gsap.registerPlugin(ScrollTrigger);

// Background "robot + hand" cinematic visual — remote video, verbatim from Velorix IIC demo.
const BG_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_155101_f2540600-6fe9-433e-8e48-b3f4b72f0727.mp4";

const NAV_ITEMS: { key: DictKey; href: string }[] = [
  { key: "nav.problem", href: "#problem" },
  { key: "nav.workflow", href: "#workflow" },
  { key: "nav.risk", href: "#risk-guardrails" },
  { key: "nav.wallet", href: "#wallet-execution" },
  { key: "nav.audit", href: "#audit-trail" },
];

function HamburgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300"
      style={{ backgroundColor: open ? "#1a1a1a" : "transparent" }}
      aria-label="Toggle menu"
    >
      <span
        className="absolute transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ opacity: open ? 0 : 1, transform: open ? "rotate(-90deg) scale(0.5)" : "rotate(0deg) scale(1)" }}
      >
        <Menu size={20} color="white" strokeWidth={1.5} />
      </span>
      <span
        className="absolute transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ opacity: open ? 1 : 0, transform: open ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.5)" }}
      >
        <X size={20} color="white" strokeWidth={1.5} />
      </span>
    </button>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  return (
    <>
      <div
        className="fixed inset-0 z-30 lg:hidden transition-all duration-500"
        style={{
          backdropFilter: open ? "blur(12px)" : "blur(0px)",
          backgroundColor: open ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
      />

      <div
        className="fixed top-0 left-0 right-0 z-40 lg:hidden overflow-hidden"
        style={{
          maxHeight: open ? "420px" : "0px",
          transition: "max-height 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div
          className="pt-20 pb-6 px-5"
          style={{ backgroundColor: "rgba(13,13,13,0.97)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={item.key}
                href={item.href}
                onClick={onClose}
                className="text-white/70 hover:text-white text-base py-3 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 flex items-center justify-between group"
                style={{
                  fontFamily: "Inter, sans-serif",
                  transitionDelay: open ? `${i * 50 + 80}ms` : "0ms",
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0)" : "translateY(-8px)",
                  transition: `opacity 0.4s cubic-bezier(0.23,1,0.32,1) ${i * 50 + 80}ms, transform 0.4s cubic-bezier(0.23,1,0.32,1) ${i * 50 + 80}ms, color 0.2s, background 0.2s`,
                }}
              >
                {t(item.key)}
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-40 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
              </a>
            ))}
          </div>

          <div
            className="mt-5 pt-5"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              transitionDelay: open ? "360ms" : "0ms",
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(-8px)",
              transition: `opacity 0.4s cubic-bezier(0.23,1,0.32,1) 360ms, transform 0.4s cubic-bezier(0.23,1,0.32,1) 360ms`,
            }}
          >
            <Link
              href="/demo"
              onClick={onClose}
              className="block w-full py-3 rounded-full text-sm font-medium text-center transition-all duration-300 hover:opacity-80"
              style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#B5FF4D", color: "#0D0D0D" }}
            >
              {t("nav.openDemo")}
            </Link>
            <div className="mt-4 flex justify-center">
              <ThemeLanguageToggle variant="hero" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const t = useT();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 lg:px-10 lg:py-6">
        <span className="text-white text-xl font-semibold tracking-tight" style={{ fontFamily: "Inter, sans-serif" }}>
          AgentCFO
        </span>
        <div className="hidden lg:flex items-center gap-1 rounded-full px-2 py-1.5" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="text-white/70 hover:text-white text-sm px-4 py-1.5 rounded-full hover:bg-white/10 transition-all duration-200"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {t(item.key)}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <ThemeLanguageToggle variant="hero" />
          </div>
          <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
          <Link
            href="/demo"
            className="hidden lg:block text-sm font-medium px-5 py-2 rounded-full transition-all duration-300 hover:opacity-80"
            style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#B5FF4D", color: "#0D0D0D" }}
          >
            {t("nav.openDemo")}
          </Link>
        </div>
      </nav>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function VelorixHero() {
  const t = useT();
  const heroRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!heroRef.current || !videoWrapRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // --- 1. Video shrink + fade on scroll ---
      gsap.to(videoWrapRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
        scale: 0.9,
        opacity: 0.3,
        borderRadius: "24px",
        ease: "none",
      });

      // --- 2. Content fade out ---
      gsap.to(contentRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "50% top",
          scrub: 0.5,
        },
        opacity: 0,
        y: -30,
        ease: "none",
      });
    }, heroRef);

    return () => ctx.revert();
  }, { scope: heroRef });

  return (
    <div
      ref={heroRef}
      className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#0D0D0D",
      }}
    >
      {/* Video wrapper — transform target for 3D effect */}
      <div
        ref={videoWrapRef}
        className="absolute inset-0 z-0"
        style={{ willChange: "transform" }}
      >
        <video
          className="w-full h-full object-cover"
          src={BG_VIDEO}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* Dark overlay — separate from video so it doesn't get 3D transformed */}
      <div className="absolute inset-0 z-10 bg-black/50" />

      <Navbar />

      <div ref={contentRef} className="relative z-20 flex flex-col items-center text-center px-5 sm:px-8 max-w-4xl mx-auto">
        {/* Eyebrow */}
        <span
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#B5FF4D] mb-6"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          DAO AI Treasury Officer
        </span>

        <h1
          className="text-white font-bold leading-[1.05] tracking-tight max-w-3xl"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            letterSpacing: "-0.03em",
          }}
        >
          {t("hero.title")}
        </h1>

        <p
          className="mt-6 text-white/50 text-sm md:text-base leading-relaxed max-w-lg"
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em" }}
        >
          {t("hero.subtitle")}
        </p>

        <Link
          href="/demo"
          className="mt-8 flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:opacity-80 group"
          style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#B5FF4D", color: "#0D0D0D" }}
        >
          {t("hero.cta")}
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>

        {/* Trust microcopy */}
        <div
          className="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-white/35"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          <span>testnet-simulated</span>
          <span className="text-white/15">·</span>
          <span>Cobo Agentic Wallet</span>
          <span className="text-white/15">·</span>
          <span>no real funds</span>
        </div>
      </div>
    </div>
  );
}
