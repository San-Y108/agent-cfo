"use client";

import React, { useLayoutEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const SCAN_DURATION = 1.15;
const REVEAL_DELAY = 0.35;
const BOOT_KEY = "agentcfo-console-boot-shown";
const TOTAL_MS = (SCAN_DURATION + REVEAL_DELAY) * 1000;

const LIME = "#B5FF4D";
const CYAN = "#5EEAD4";

/**
 * Console route transition — holographic system boot from Landing → /console.
 * Plays once per browser session; internal /console/* hops skip the overlay.
 */
export default function ConsoleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const [booting, setBooting] = useState(false);

  useLayoutEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;

    const alreadyShown = sessionStorage.getItem(BOOT_KEY) === "true";
    if (!alreadyShown) {
      setBooting(true);
      const t = setTimeout(() => {
        setBooting(false);
        sessionStorage.setItem(BOOT_KEY, "true");
      }, TOTAL_MS);
      return () => clearTimeout(t);
    }
  }, [reduce]);

  return (
    <>
      <motion.div
        className="flex h-full min-h-0 flex-col"
        initial={false}
        animate={{ opacity: booting ? 0 : 1, scale: booting ? 0.985 : 1 }}
        transition={{
          duration: booting ? 0 : 0.45,
          ease: [0.22, 1, 0.36, 1],
          delay: booting ? 0 : 0.05,
        }}
      >
        {children}
      </motion.div>
      <AnimatePresence>
        {booting && <BootOverlay />}
      </AnimatePresence>
    </>
  );
}

function BootOverlay() {
  return (
    <motion.div
      key="console-boot"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#030712]"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        clipPath: "inset(0 0 0 0)",
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, rgba(3,7,18,0.85) 100%)",
        }}
      />

      {/* Central ambient glow — breathes in */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(181,255,77,0.12) 0%, rgba(94,234,212,0.06) 28%, transparent 62%)`,
          filter: "blur(72px)",
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Grid field */}
      <motion.div
        className="absolute inset-0 opacity-[0.22]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.22 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(181,255,77,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(circle at 50% 50%, black 0%, transparent 58%)",
          }}
        />
      </motion.div>

      {/* Expanding radar rings */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            width: 140 + i * 70,
            height: 140 + i * 70,
            borderColor: i % 2 === 0 ? "rgba(181,255,77,0.14)" : "rgba(94,234,212,0.11)",
          }}
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: [0, 0.75, 0], scale: [0.75, 1.2, 1.5] }}
          transition={{ duration: 1.25, delay: 0.08 + i * 0.1, ease: "easeOut" }}
        />
      ))}

      {/* Dual laser scan lines */}
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${LIME} 22%, ${CYAN} 50%, ${LIME} 78%, transparent 100%)`,
          boxShadow: `0 0 32px 6px rgba(181,255,77,0.5), 0 0 64px 12px rgba(94,234,212,0.2)`,
        }}
        initial={{ top: "108%" }}
        animate={{ top: "-8%" }}
        transition={{ duration: SCAN_DURATION, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute left-0 right-0 h-px opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
          boxShadow: `0 0 20px 2px rgba(94,234,212,0.35)`,
        }}
        initial={{ top: "108%" }}
        animate={{ top: "-8%" }}
        transition={{ duration: SCAN_DURATION, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Scan trail */}
      <motion.div
        className="absolute left-0 right-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(181,255,77,0.09) 0%, rgba(94,234,212,0.05) 40%, transparent 100%)",
        }}
        initial={{ top: "108%", height: "0%" }}
        animate={{ top: "-8%", height: "38%" }}
        transition={{ duration: SCAN_DURATION, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Floating particles */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            left: `${12 + ((i * 17) % 76)}%`,
            top: `${18 + ((i * 23) % 64)}%`,
            backgroundColor: i % 2 === 0 ? LIME : CYAN,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.2, 0],
            y: [0, -18 - (i % 4) * 6, -36],
          }}
          transition={{
            duration: 1.1,
            delay: 0.2 + i * 0.05,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Center HUD */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <motion.div
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] shadow-[0_0_40px_-8px_rgba(181,255,77,0.45)]"
          initial={{ opacity: 0, scale: 0.7, rotateY: -20 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="/logo.png"
            alt=""
            className="h-7 w-7"
            style={{ filter: "drop-shadow(0 0 8px rgba(181,255,77,0.5))" }}
          />
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-lime-400 via-cyan-300 to-violet-400 bg-clip-text text-lg font-bold tracking-tight text-transparent"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          AgentCFO
        </motion.div>

        <motion.div
          className="font-mono text-[10px] uppercase tracking-[0.35em] text-lime-400/80"
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          Initializing Command Center
        </motion.div>

        <div className="h-[3px] w-56 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full bg-gradient-to-r from-lime-400 via-cyan-300 to-lime-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: SCAN_DURATION, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          className="font-mono text-[11px] tracking-widest text-cyan-300/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          CAW.SECTOR.ONLINE
        </motion.div>
      </div>

      {/* Corner HUD brackets */}
      {(["top-6 left-6", "top-6 right-6", "bottom-6 left-6", "bottom-6 right-6"] as const).map(
        (pos, i) => (
          <motion.div
            key={pos}
            className={`pointer-events-none absolute ${pos} h-8 w-8 border-white/20`}
            style={{
              borderTopWidth: i < 2 ? 1 : 0,
              borderBottomWidth: i >= 2 ? 1 : 0,
              borderLeftWidth: i % 2 === 0 ? 1 : 0,
              borderRightWidth: i % 2 === 1 ? 1 : 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.25 + i * 0.06 }}
          />
        )
      )}
    </motion.div>
  );
}
