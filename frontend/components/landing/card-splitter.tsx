"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { MousePointerClick } from "lucide-react";
import { useT } from "@/lib/i18n/context";

export function CardSplitter() {
  const t = useT();
  const [cardProgress, setCardProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const motionProgress = useMotionValue(0);
  const springProgress = useSpring(motionProgress, { stiffness: 65, damping: 20 });

  useEffect(() => {
    motionProgress.set(cardProgress);
  }, [cardProgress, motionProgress]);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const minVal = 0.3;
      const maxVal = 0.65;
      let mapped = 0;
      if (latest <= minVal) {
        mapped = 0;
      } else if (latest >= maxVal) {
        mapped = 100;
      } else {
        mapped = ((latest - minVal) / (maxVal - minVal)) * 100;
      }
      setCardProgress(mapped);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // CARD A offsets (translates up & left)
  const cardAX = useTransform(springProgress, [0, 100], [0, -115]);
  const cardAY = useTransform(springProgress, [0, 100], [0, -80]);
  const cardARotate = useTransform(springProgress, [0, 100], [0, -6]);

  // CARD B offsets (translates down)
  const cardBY = useTransform(springProgress, [0, 100], [0, 115]);
  const cardBRotate = useTransform(springProgress, [0, 100], [0, 4]);

  // CARD C offsets (translates up & right)
  const cardCX = useTransform(springProgress, [0, 100], [0, 115]);
  const cardCY = useTransform(springProgress, [0, 100], [0, -35]);
  const cardCRotate = useTransform(springProgress, [0, 100], [0, 8]);

  // Master card effects
  const masterOpacity = useTransform(springProgress, [0, 45], [1, 0]);
  const masterScale = useTransform(springProgress, [0, 100], [1, 1.05]);
  const masterFilter = useTransform(springProgress, [0, 45], ["blur(0px)", "blur(10px)"]);

  return (
    <section
      ref={scrollContainerRef}
      className="w-full h-full py-16 px-6 border rounded-3xl relative overflow-hidden border-white/10 bg-neutral-900/60 backdrop-blur-xl"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#B5FF4D]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] uppercase font-mono mb-4 border-[#B5FF4D]/30 bg-[#B5FF4D]/5 text-[#B5FF4D]">
          <MousePointerClick className="w-3 h-3 text-[#B5FF4D]" />
          {t("cardSplitter.eyebrow")}
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">
          {t("cardSplitter.title")}
        </h2>
        <p className="text-sm md:text-base text-white/50">
          {t("cardSplitter.subtitle")}
        </p>
      </div>

      <div className="relative h-[480px] md:h-[450px] w-full flex items-center justify-center">
        <div className="relative w-full max-w-sm h-72 flex items-center justify-center scale-[0.62] min-[400px]:scale-[0.75] sm:scale-[0.88] md:scale-100 transition-transform duration-300">
          {/* CARD A: Alice */}
          <motion.div
            style={{ x: cardAX, y: cardAY, rotate: cardARotate, zIndex: cardProgress > 22 ? 30 : 10 }}
            className="absolute w-80 h-52 bg-gradient-to-br from-neutral-800 to-neutral-950 border border-white/20 rounded-xl p-5 shadow-2xl flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#B5FF4D] tracking-widest font-bold">DEVELOPER BOUNTY</span>
                  <h4 className="text-sm font-bold text-white mt-1">Alice Dev Rewards</h4>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#B5FF4D]/10 text-[#B5FF4D] border border-[#B5FF4D]/20 font-bold">ACTIVE</span>
              </div>
              <div className="mt-8 flex justify-between font-mono text-[10px] text-white/50">
                <span>Spent: <strong className="text-white">$20</strong></span>
                <span>Limit: <strong className="text-white">$50</strong></span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="w-[40%] h-full bg-[#B5FF4D] rounded-full shadow-[0_0_8px_rgba(181,255,77,0.5)]" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="text-[9px] font-mono text-white/40">
                RECIPIENT: <span className="text-white/80">0xAlice123...12</span>
              </div>
              <div className="flex gap-1">
                <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-white/60 font-semibold font-mono">Sepolia</span>
                <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-white/60 font-semibold font-mono font-bold">100% Secure</span>
              </div>
            </div>
          </motion.div>

          {/* CARD B: Charlie */}
          <motion.div
            style={{ y: cardBY, rotate: cardBRotate, zIndex: cardProgress > 22 ? 25 : 9 }}
            className="absolute w-80 h-52 bg-gradient-to-br from-neutral-900 via-neutral-950 to-[#0D0D0D] border border-white/10 rounded-xl p-5 shadow-xl flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase text-pink-400 tracking-widest font-bold">AUDIT SERVICES</span>
                  <h4 className="text-sm font-bold text-white mt-1">Charlie Security Pool</h4>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold">LIMITED</span>
              </div>
              <div className="mt-8 flex justify-between font-mono text-[10px] text-white/50">
                <span>Spent: <strong className="text-white">$10</strong></span>
                <span>Limit: <strong className="text-white">$30</strong></span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="w-[33%] h-full bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="text-[9px] font-mono text-white/40">
                RECIPIENT: <span className="text-white/80">0xCharlie123...ff</span>
              </div>
              <span className="text-[9px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded font-bold font-mono">Whitelisted</span>
            </div>
          </motion.div>

          {/* CARD C: Data API */}
          <motion.div
            style={{ x: cardCX, y: cardCY, rotate: cardCRotate, zIndex: cardProgress > 22 ? 20 : 8 }}
            className="absolute w-80 h-52 bg-gradient-to-br from-slate-950 to-neutral-900 border border-white/10 rounded-xl p-5 shadow-lg flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase text-blue-400 tracking-widest font-bold">INFRASTRUCTURE</span>
                  <h4 className="text-sm font-bold text-white mt-1">Indexer Subscriptions</h4>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">METERED</span>
              </div>
              <div className="mt-8 flex justify-between font-mono text-[10px] text-white/50">
                <span>Spent: <strong className="text-white">$5</strong></span>
                <span>Limit: <strong className="text-white">$10</strong></span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="w-[50%] h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="text-[9px] font-mono text-white/40">
                RECIPIENT: <span className="text-white/80">0xDataAPI12...de</span>
              </div>
              <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-white/50 font-bold font-mono">Auto Relayed</span>
            </div>
          </motion.div>

          {/* MASTER CARD */}
          <motion.div
            style={{
              opacity: masterOpacity,
              scale: masterScale,
              filter: masterFilter,
              zIndex: 40,
              pointerEvents: cardProgress > 22 ? "none" : "auto",
            }}
            className="absolute w-80 h-52 bg-gradient-to-br from-neutral-900 via-[#0D0D0D] to-black border-2 border-[#B5FF4D]/40 rounded-xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col justify-between text-left"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(181,255,77,0.06),transparent_65%)] rounded-xl pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#B5FF4D] tracking-widest font-bold">COBO CLIENT MASTER</span>
                <h3 className="text-lg font-bold tracking-tight text-white mt-0.5">AgentCFO Elite</h3>
              </div>
              <div className="w-8 h-6 rounded bg-gradient-to-br from-amber-400 to-yellow-600 border border-yellow-700/50 shadow-inner flex flex-col items-center justify-center p-1.5">
                <div className="w-full h-0.5 bg-neutral-900/10 rounded-full" />
                <div className="w-full h-0.5 bg-neutral-900/10 rounded-full mt-0.5" />
              </div>
            </div>

            <div className="font-mono text-xs tracking-wider text-white/80 relative z-10">••••  ••••  ••••  90A8</div>

            <div className="flex items-center justify-between relative z-10 pt-3 border-t border-white/5">
              <div className="text-[8px] font-mono text-white/40">
                EXPIRE: <span className="text-white/80">06/2030</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#B5FF4D]/30" />
                <span className="text-[10px] font-mono font-bold text-[#B5FF4D]">SECURE RUN STATE</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
