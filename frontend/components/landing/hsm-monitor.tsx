"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { ROUTES } from "@/lib/constants/routes";

export function HSMMonitor() {
  const t = useT();

  return (
    <div className="md:col-span-2 p-6 border border-white/18 rounded-2xl bg-gradient-to-b from-neutral-900 to-black flex flex-col justify-between relative overflow-hidden group">
      {/* Glossy radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(181,255,77,0.05),transparent_60%)] rounded-2xl pointer-events-none" />

      <div className="space-y-4 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/12 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B5FF4D] shadow-[0_0_8px_rgba(181,255,77,0.8)] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white font-bold">
              {t("hsm.header")}
            </span>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-white border border-white/15">
            TLS V1.3 SECURE
          </span>
        </div>

        {/* Stats Matrix */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-white/[0.05] border border-white/12 rounded-lg">
            <span className="text-[9px] font-mono text-white/65 block mb-0.5">
              {t("hsm.latency")}
            </span>
            <span className="text-xs font-mono font-bold text-[#B5FF4D]">
              0.12ms (FAST)
            </span>
          </div>
          <div className="p-3 bg-white/[0.05] border border-white/12 rounded-lg">
            <span className="text-[9px] font-mono text-white/65 block mb-0.5">
              {t("hsm.quorum")}
            </span>
            <span className="text-xs font-mono font-bold text-white">
              2 of 3 Registered
            </span>
          </div>
          <div className="p-3 bg-white/[0.05] border border-white/12 rounded-lg">
            <span className="text-[9px] font-mono text-white/65 block mb-0.5">
              {t("hsm.encryption")}
            </span>
            <span className="text-xs font-mono font-bold text-white">
              AES-256 GCM
            </span>
          </div>
          <div className="p-3 bg-white/[0.05] border border-white/12 rounded-lg">
            <span className="text-[9px] font-mono text-white/65 block mb-0.5">
              {t("hsm.policies")}
            </span>
            <span className="text-xs font-mono font-bold text-[#B5FF4D]">
              4 Policies Active
            </span>
          </div>
        </div>

        {/* Load bar */}
        <div className="p-3 bg-white/[0.05] border border-white/12 rounded-lg space-y-1.5 mt-2">
          <div className="flex justify-between text-[9px] font-mono text-white/40">
            <span>{t("hsm.load")}</span>
            <span className="text-white font-bold">14%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="w-[14%] h-full bg-[#B5FF4D] rounded-full shadow-[0_0_8px_rgba(181,255,77,0.5)]" />
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-8 pt-4 border-t border-white/12 flex items-center justify-between text-xs relative z-10">
        <span className="text-white/65 font-mono text-[10px]">
          COBO CLIENT INTG OK
        </span>
        <a
          href={ROUTES.console}
          className="text-xs font-bold font-mono text-[#B5FF4D] uppercase flex items-center gap-1.5 hover:underline"
        >
          {t("hsm.enter")} <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
