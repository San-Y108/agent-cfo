"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useT, useApp } from "@/lib/i18n/context";
import type { DictKey } from "@/lib/i18n/dict";
import { ThemeLanguageToggle } from "@/components/ui/theme-language-toggle";
import { motion } from "framer-motion";
import { ParticleHeroTitle } from "@/components/landing/particle-hero-title";
import { DecodeHeadline } from "@/components/landing/decode-headline";

gsap.registerPlugin(ScrollTrigger);

// Background "robot + hand" cinematic visual — remote video, verbatim from Velorix IIC demo.
const BG_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_155101_f2540600-6fe9-433e-8e48-b3f4b72f0727.mp4";

const NAV_ITEMS: { key: DictKey; href: string }[] = [
  { key: "nav.platform", href: "#platform" },
  { key: "nav.workflow", href: "#workflow" },
  { key: "nav.guardrails", href: "#guardrails" },
  { key: "nav.team", href: "#team" },
  { key: "nav.timeline", href: "#timeline" },
  { key: "nav.faq", href: "#faq" },
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
          style={{ backgroundColor: "rgba(13,13,13,0.97)", borderBottom: "1px solid rgba(255,255,255,0.15)" }}
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={item.key}
                href={item.href}
                onClick={onClose}
                className="text-white/90 hover:text-white text-base py-3 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 flex items-center justify-between group"
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
              href="/console"
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
  const [activeIdx, setActiveIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const t = useT();
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const svgPathRef = useRef<SVGPathElement>(null);
  const svgDotRef = useRef<SVGCircleElement>(null);
  const arcRef = useRef({ curX: 0, animRaf: null as number | null });
  const navWrapRef = useRef<HTMLElement>(null);
  const clickCooldown = useRef(0);

  const HW = 14;

  const drawArc = (cx: number, arcH: number, hw: number) => {
    if (!svgPathRef.current || !svgDotRef.current) return;
    const x1 = cx - hw;
    const x2 = cx + hw;
    if (arcH < 0.5) {
      svgPathRef.current.setAttribute("d", `M${x1},0 L${x2},0`);
    } else {
      svgPathRef.current.setAttribute("d", `M${x1},0 Q${cx},${-arcH} ${x2},0`);
    }
    svgDotRef.current.setAttribute("cx", String(cx));
    svgDotRef.current.setAttribute("cy", String(-arcH * 0.08));
  };

  const jumpTo = (targetX: number) => {
    const arc = arcRef.current;
    if (arc.animRaf) cancelAnimationFrame(arc.animRaf);
    const fromX = arc.curX;
    const dist = Math.abs(targetX - fromX);
    if (dist < 1) {
      arc.curX = targetX;
      drawArc(arc.curX, 0, HW);
      return;
    }
    const maxArc = Math.min(28, dist * 0.45);
    const dur = 300 + dist * 0.55;
    const t0 = performance.now();
    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const ease = easeInOut(t);
      arc.curX = fromX + (targetX - fromX) * ease;
      const arcH = maxArc * Math.sin(t * Math.PI);
      const hw = HW + arcH * 0.15;
      drawArc(arc.curX, arcH, hw);
      if (t < 1) {
        arc.animRaf = requestAnimationFrame(step);
      } else {
        arc.curX = targetX;
        drawArc(arc.curX, 0, HW);
        arc.animRaf = null;
      }
    };
    arc.animRaf = requestAnimationFrame(step);
  };

  // Scroll-based active section detection — more reliable than IntersectionObserver
  // for pinned/sticky sections and overlapping layouts.
  useEffect(() => {
    const OFFSET = 200; // navbar + buffer
    const getActiveIdx = () => {
      if (Date.now() < clickCooldown.current) return; // respect click cooldown
      const y = window.scrollY + OFFSET;
      let bestIdx = 0;
      let bestTop = -Infinity;
      NAV_ITEMS.forEach((item, i) => {
        const el = document.querySelector(item.href) as HTMLElement | null;
        if (!el) return;
        const top = el.offsetTop;
        if (top <= y && top > bestTop) {
          bestTop = top;
          bestIdx = i;
        }
      });
      setActiveIdx(bestIdx);
    };
    window.addEventListener("scroll", getActiveIdx, { passive: true });
    getActiveIdx();
    return () => window.removeEventListener("scroll", getActiveIdx);
  }, []);

  // Move arc when activeIdx changes
  useEffect(() => {
    const link = linkRefs.current[activeIdx];
    const container = navRef.current;
    if (!link || !container) return;
    const containerRect = container.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const targetX = linkRect.left - containerRect.left + linkRect.width / 2;
    jumpTo(targetX);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  // Initial position + resize handler
  useEffect(() => {
    const setInitial = () => {
      const link = linkRefs.current[activeIdx];
      const container = navRef.current;
      if (!link || !container) return;
      const containerRect = container.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      arcRef.current.curX = linkRect.left - containerRect.left + linkRect.width / 2;
      drawArc(arcRef.current.curX, 0, HW);
    };
    requestAnimationFrame(setInitial);
    window.addEventListener("resize", setInitial);
    return () => window.removeEventListener("resize", setInitial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll detection —
  //   · scrolled  : transparent → solid background (at 50% hero)
  //   · pastHero  : hide logo + right buttons, keep only nav pills
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const heroH = window.innerHeight;
      setScrolled(y > heroH * 0.5);
      setPastHero(y > heroH * 0.95);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navTransition = {
    duration: 0.45,
    ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
  };

  return (
    <>
      <nav
        ref={navWrapRef}
        className="fixed top-4 left-0 right-0 z-50 flex items-center justify-center"
        style={{
          padding: pastHero ? "10px 16px" : "16px 40px",
          borderRadius: pastHero ? "9999px" : "0px",
          backgroundColor: pastHero
            ? "rgba(13,13,13,0.75)"
            : scrolled
              ? "rgba(13,13,13,0.85)"
              : "transparent",
          backdropFilter: scrolled || pastHero ? "blur(16px) saturate(1.2)" : "none",
          WebkitBackdropFilter: scrolled || pastHero ? "blur(16px) saturate(1.2)" : "none",
          borderBottom: pastHero ? "none" : scrolled ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
          boxShadow: pastHero
            ? "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)"
            : scrolled
              ? "0 1px 0 rgba(255,255,255,0.10), 0 4px 24px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(181,255,77,0.06)"
              : "none",
          transition: "background-color 0.5s ease, backdrop-filter 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease, padding 0.45s cubic-bezier(0.23, 1, 0.32, 1), border-radius 0.45s cubic-bezier(0.23, 1, 0.32, 1)",
          willChange: "background-color, backdrop-filter, box-shadow",
        }}
      >
        {/* Edge glow — hidden when compact */}
        {!pastHero && (
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent 0%, rgba(181,255,77,0.15) 20%, rgba(181,255,77,0.2) 50%, rgba(181,255,77,0.15) 80%, transparent 100%)",
              opacity: scrolled ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          />
        )}

        {/* Logo — absolute left, exits with transform + opacity */}
        <motion.div
          className="flex items-center gap-2.5 absolute left-5 lg:left-10"
          animate={{
            opacity: pastHero ? 0 : 1,
            x: pastHero ? -16 : 0,
            scale: pastHero ? 0.92 : 1,
          }}
          transition={navTransition}
          style={{ pointerEvents: pastHero ? "none" : "auto" }}
        >
          <img src="/logo.png" alt="AgentCFO" className="h-9 w-9" style={{ filter: "drop-shadow(0 0 6px rgba(181,255,77,0.5))" }} />
          <span
            className="text-xl font-bold tracking-tight bg-gradient-to-r from-lime-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent"
            style={{
              fontFamily: "Inter, sans-serif",
              filter: "drop-shadow(0 0 8px rgba(181,255,77,0.45)) drop-shadow(0 0 16px rgba(94,234,212,0.25))",
            }}
          >
            AgentCFO
          </span>
        </motion.div>

        {/* Nav pills — always centered */}
        <div
          ref={navRef}
          className="hidden lg:flex items-center gap-1 rounded-full px-2 py-1.5 relative"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
        >
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.key}
              ref={(el) => { linkRefs.current[i] = el; }}
              href={item.href}
              className={`text-sm px-4 py-1.5 rounded-full transition-all duration-200 ${
                activeIdx === i
                  ? "text-white"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector(item.href);
                if (el) {
                  clickCooldown.current = Date.now() + 1200;
                  setActiveIdx(i);
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {t(item.key)}
            </a>
          ))}
          {/* Arc jump indicator */}
          <svg
            className="absolute bottom-0 left-0 w-full overflow-visible pointer-events-none"
            style={{ height: "2px" }}
            preserveAspectRatio="none"
          >
            <path ref={svgPathRef} fill="none" stroke="#B5FF4D" strokeWidth="1.5" strokeLinecap="round" />
            <circle ref={svgDotRef} r="2" fill="#B5FF4D" />
          </svg>
        </div>

        {/* Controls — absolute right, exits with transform + opacity */}
        <motion.div
          className="flex items-center gap-2 absolute right-5 lg:right-10"
          animate={{
            opacity: pastHero ? 0 : 1,
            x: pastHero ? 16 : 0,
            scale: pastHero ? 0.92 : 1,
          }}
          transition={navTransition}
          style={{ pointerEvents: pastHero ? "none" : "auto" }}
        >
          <div className="hidden lg:block">
            <ThemeLanguageToggle variant="hero" />
          </div>
          <a
            href="https://github.com/San-Y108/agent-cfo"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/25 text-white/90 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/30"
            aria-label="GitHub"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
          <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
          <Link
            href="/console"
            className="hidden lg:block text-sm font-medium px-5 py-2 rounded-full transition-all duration-300 hover:opacity-80"
            style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#B5FF4D", color: "#0D0D0D" }}
          >
            {t("nav.openDemo")}
          </Link>
        </motion.div>
      </nav>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function VelorixHero() {
  const t = useT();
  const { lang } = useApp();
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
          suppressHydrationWarning
        />
      </div>

      {/* Dark overlay — separate from video so it doesn't get 3D transformed */}
      <div className="absolute inset-0 z-10 bg-black/40" />

      <Navbar />

      <div ref={contentRef} className="relative z-20 flex flex-col items-center text-center px-5 sm:px-8 max-w-4xl mx-auto -mt-24 md:-mt-32">
        {/* Eyebrow */}
        <span
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#B5FF4D] mb-6"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          DAO AI Treasury Officer
        </span>

        <DecodeHeadline
          as="h1"
          text={t("hero.title")}
          accent="#B5FF4D"
          className="text-white font-bold leading-[1.05] tracking-tight max-w-3xl"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            letterSpacing: "-0.03em",
          }}
          scrollTriggerStart="top 120%"
          scrambleDelay={0.1}
          charStagger={0.025}
          specialWords={[
            { match: ["DAO", "executable", "可执行的"] },
          ]}
        />

        <p
          className="mt-6 text-white/90 text-sm md:text-base leading-relaxed max-w-lg italic"
          style={{
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-0.01em",
            fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
            lineHeight: 1.6,
          }}
        >
          {t("hero.subtitle")}
        </p>

        <Link
          href="/console"
          className="mt-8 flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:opacity-80 group"
          style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#B5FF4D", color: "#0D0D0D" }}
        >
          {t("hero.cta")}
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>

      </div>
    </div>
  );
}
