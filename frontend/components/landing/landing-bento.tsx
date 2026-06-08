"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  Wallet,
  ShieldCheck,
  UserCheck,
  FileCheck,
  Layers,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Payment Plan",
    description:
      "Consolidate contributor payouts and subscriptions into a single settlement plan with clear amounts and recipients.",
    accent: "blue" as const,
    size: "large" as const,
  },
  {
    icon: ShieldCheck,
    title: "Risk Gate",
    description:
      "Auto-check budget limits, whitelist, single-payment caps, and duplicate payments before any execution.",
    accent: "amber" as const,
    size: "normal" as const,
  },
  {
    icon: UserCheck,
    title: "Human Approval",
    description:
      "No autonomous fund transfer. Every payout requires explicit human approval after risk screening.",
    accent: "emerald" as const,
    size: "normal" as const,
  },
  {
    icon: FileCheck,
    title: "Settlement Receipt",
    description:
      "Formal audit report with approved count, blocked items, risk summary, and execution proof.",
    accent: "slate" as const,
    size: "normal" as const,
  },
  {
    icon: Layers,
    title: "Agent Workflow",
    description:
      "7-step transparent execution: analyze → plan → risk-check → approve → execute → audit → settle.",
    accent: "blue" as const,
    size: "normal" as const,
  },
  {
    icon: Lock,
    title: "Policy Engine",
    description:
      "Configurable treasury rules: budget limits, recipient whitelist, token constraints, and approval thresholds.",
    accent: "amber" as const,
    size: "large" as const,
  },
];

const accentBorder = {
  blue: "border-blue-500/15 hover:border-blue-500/30",
  amber: "border-amber-500/15 hover:border-amber-500/30",
  emerald: "border-emerald-500/15 hover:border-emerald-500/30",
  slate: "border-white/10 hover:border-white/20",
};

const accentIcon = {
  blue: "text-blue-400 bg-blue-500/10",
  amber: "text-amber-400 bg-amber-500/10",
  emerald: "text-emerald-400 bg-emerald-500/10",
  slate: "text-slate-400 bg-white/5",
};

export function LandingBento() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#0a0f1e] to-[#030712]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How AgentCFO Works
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            From contribution records to risk-checked payouts — every step is
            transparent, auditable, and human-gated.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = feature.size === "large";

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={isLarge ? "md:col-span-2 lg:col-span-1" : ""}
              >
                <GlassPanel
                  className={`h-full p-6 transition-all duration-300 hover:bg-[#0B1120]/80 ${accentBorder[feature.accent]}`}
                  hover
                >
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${accentIcon[feature.accent]} mb-4`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <GlassPanel className="inline-block px-8 py-6">
            <p className="text-sm text-slate-400 mb-4">
              Built for the Cobo Agentic Wallet Hackathon
            </p>
            <a
              href="/demo"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:scale-[1.02]"
            >
              Launch Demo Console
              <span>→</span>
            </a>
          </GlassPanel>
        </motion.div>
      </div>
    </section>
  );
}
