"use client";

import { motion } from "framer-motion";
import { MiniCommandPreview } from "./mini-command-preview";
import { ArrowRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#030712]" />
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 radial-glow" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen py-12">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2 self-start rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-amber-400 tracking-wide">
                AI Treasury Command Center
              </span>
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              AgentCFO
            </h1>
            <p className="mt-3 text-xl sm:text-2xl font-light text-slate-400">
              DAO AI 财务官
            </p>

            {/* Subtitle */}
            <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-400">
              Risk-checked DAO payouts, human-approved execution, and auditable settlement reports.
              Built for Web3 teams that need a transparent AI treasury agent.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <a
                href="/demo"
                className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:scale-[1.02]"
              >
                Launch Demo Console
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="https://github.com/Aafff623/hackathon-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-300 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                View on GitHub
              </a>
            </div>

            {/* Mock note */}
            <p className="mt-6 text-xs text-slate-600">
              Mock-only frontend demo · No real API, Cobo CAW call, or blockchain transaction yet.
            </p>
          </motion.div>

          {/* Right: Mini Command Preview */}
          <div className="flex justify-center lg:justify-end">
            <MiniCommandPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
