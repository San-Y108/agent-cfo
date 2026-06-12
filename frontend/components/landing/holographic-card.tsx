"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { useT } from "@/lib/i18n/context";

const SPRING_CONFIG = { stiffness: 220, damping: 22, mass: 0.7 } as const;

export function HolographicCard() {
  const t = useT();
  const [timestamp, setTimestamp] = useState("");

  // Raw pointer-driven values (no React re-render on update)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Spring-smoothed values feed transforms — gives the card a tactile lag/recoil
  const springX = useSpring(rawX, SPRING_CONFIG);
  const springY = useSpring(rawY, SPRING_CONFIG);

  const rotateX = useTransform(springY, (v) => -v / 15);
  const rotateY = useTransform(springX, (v) => v / 15);

  // Subtle parallax on the inner content
  const innerX = useTransform(springX, (v) => v / 40);
  const innerY = useTransform(springY, (v) => v / 40);

  useEffect(() => {
    setTimestamp(new Date().toLocaleTimeString());
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    rawX.set(e.clientX - box.left - box.width / 2);
    rawY.set(e.clientY - box.top - box.height / 2);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ perspective: "1200px" }}>
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full max-w-3xl mx-auto border rounded-2xl p-8 backdrop-blur-md shadow-2xl relative cursor-pointer group will-change-transform bg-gradient-to-br from-white/[0.08] to-white/[0.04] border-white/15"
      >
        {/* Glossy overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-[#B5FF4D]/5 to-transparent pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity" />

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
          style={{ x: innerX, y: innerY, transform: "translateZ(35px)" }}
        >
          {/* Card Left: Core Meta */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono tracking-widest text-[#B5FF4D] font-bold uppercase">
                {t("heroCard.secured")}
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#B5FF4D] animate-pulse" />
            </div>

            <div>
              <h3 className="text-2xl font-black tracking-tight mb-2 text-white">{t("heroCard.title")}</h3>
              <p className="text-xs italic leading-relaxed font-mono text-white/75">
                {t("heroCard.desc")}
              </p>
            </div>

            {/* Animated progress bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="w-[90%] h-full bg-[#B5FF4D] rounded-full shadow-[0_0_12px_rgba(181,255,77,0.6)]" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <div className="text-[9px] uppercase font-mono mb-1 text-white/40">COBO CLIENT ID</div>
                <div className="text-xs font-mono font-bold text-white/80">CAW-90A81D-CFO</div>
              </div>
              <div>
                <div className="text-[9px] uppercase font-mono mb-1 text-white/40">SAFE BOUNDARIES</div>
                <div className="text-xs font-mono font-bold text-[#B5FF4D]">4 RUN RULES READY</div>
              </div>
            </div>
          </div>

          {/* Card Right: Live Audit Interface Simulation */}
          <div className="border rounded-xl p-6 font-mono text-[11px] space-y-3 shadow-inner bg-[#0D0D0D]/65 border-white/12 text-white">
            <div className="text-[9px] font-bold flex items-center justify-between mb-2 text-[#B5FF4D]">
              <span>AGENT LOG OVERVIEW</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-[#B5FF4D]/10 text-[#B5FF4D]">ACTIVE</span>
            </div>
            <div className="text-white/40">[{timestamp || "--:--:--"}] Fetching payroll record list...</div>
            <div className="text-white/40">[{timestamp || "--:--:--"}] Testing Whitelist validations...</div>
            <div className="flex items-center gap-1.5 font-semibold text-[#B5FF4D]">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Rule Approved: Alice (20 USDC)
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-red-400">
              <ShieldAlert className="w-3 h-3 text-red-500" /> Risk Flagged: Bob (Unverified)
            </div>
            <div className="font-semibold text-white/45">[{timestamp || "--:--:--"}] Synthesized payment queue created. Waiting human check.</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
