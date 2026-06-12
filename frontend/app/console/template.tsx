"use client";

import React, { useLayoutEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const SCAN_DURATION = 0.9;
const REVEAL_DELAY = 0.25;
const BOOT_KEY = "agentcfo-console-boot-shown";

/**
 * Console route transition — "holographic system initialization".
 *
 * Triggered only when entering the console from outside (e.g. landing → /console).
 * Internal navigation between /console/* routes remounts this template, but the
 * sessionStorage flag suppresses the animation on subsequent mounts.
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
      }, (SCAN_DURATION + REVEAL_DELAY) * 1000);
      return () => clearTimeout(t);
    }
  }, [reduce]);

  return (
    <>
      {children}
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030712]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Central ambient glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(181,255,77,0.07) 0%, rgba(94,234,212,0.04) 30%, transparent 65%)",
          filter: "blur(64px)",
        }}
      />

      {/* Subtle grid field */}
      <div className="absolute inset-0 opacity-[0.18]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(181,255,77,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.04) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(circle at 50% 50%, black 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Expanding radar rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            width: 180 + i * 80,
            height: 180 + i * 80,
            borderColor:
              i % 2 === 0
                ? "rgba(181,255,77,0.12)"
                : "rgba(94,234,212,0.10)",
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: [0, 0.7, 0], scale: [0.85, 1.25, 1.45] }}
          transition={{ duration: 1.1, delay: i * 0.12, ease: "easeOut" }}
        />
      ))}

      {/* Laser scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #B5FF4D 25%, #5EEAD4 50%, #B5FF4D 75%, transparent 100%)",
          boxShadow:
            "0 0 28px 5px rgba(181,255,77,0.45), 0 0 56px 10px rgba(94,234,212,0.18)",
        }}
        initial={{ top: "110%" }}
        animate={{ top: "-10%" }}
        transition={{ duration: SCAN_DURATION, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Trail behind the scan line */}
      <motion.div
        className="absolute left-0 right-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(181,255,77,0.07) 0%, rgba(94,234,212,0.04) 35%, transparent 100%)",
        }}
        initial={{ top: "110%", height: "0%" }}
        animate={{ top: "-10%", height: "34%" }}
        transition={{ duration: SCAN_DURATION, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Center terminal HUD */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <motion.div
          className="font-mono text-[10px] uppercase tracking-[0.35em] text-lime-400/80"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          Initializing Treasury OS
        </motion.div>

        <div className="w-52 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
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
          transition={{ delay: 0.5 }}
        >
          CAW.SECTOR.ONLINE
        </motion.div>
      </div>
    </motion.div>
  );
}
