"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronRight, Shield, Lock, Globe } from "lucide-react";
import { useT } from "@/lib/i18n/context";

type FAQItem = {
  question: "faq.q1" | "faq.q2" | "faq.q3";
  answer: "faq.a1" | "faq.a2" | "faq.a3";
  pill: string;
  accent: string;
  icon: React.ElementType;
};

const faqItems: FAQItem[] = [
  {
    question: "faq.q1",
    answer: "faq.a1",
    pill: "SECURED",
    accent: "#B5FF4D",
    icon: Shield,
  },
  {
    question: "faq.q2",
    answer: "faq.a2",
    pill: "POLICY ENFORCED",
    accent: "#60A5FA",
    icon: Lock,
  },
  {
    question: "faq.q3",
    answer: "faq.a3",
    pill: "CROSS-CHAIN READY",
    accent: "#C084FC",
    icon: Globe,
  },
];

function FAQCard({
  item,
  index,
  isOpen,
  onHover,
}: {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onHover: () => void;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  const number = String(index + 1).padStart(2, "0");
  const Icon = item.icon;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.5,
        delay: reduce ? 0 : index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={onHover}
      className="group relative rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/18 hover:bg-white/[0.05] overflow-hidden"
    >
      {/* Left accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-300"
        style={{
          background: isOpen
            ? item.accent
            : `linear-gradient(180deg, ${item.accent}40, transparent)`,
          opacity: isOpen ? 1 : 0,
          boxShadow: isOpen ? `0 0 12px ${item.accent}60` : "none",
        }}
      />

      <div
        className="w-full text-left p-5"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-4">
          {/* Terminal number */}
          <span
            className="mt-0.5 text-[10px] font-mono font-bold tracking-wider tabular-nums shrink-0"
            style={{ color: item.accent }}
          >
            {number}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-sm font-bold text-white group-hover:text-white/95 transition-colors">
                {t(item.question)}
              </h4>
              <span
                className="shrink-0 text-[10px] font-mono font-black px-2 py-0.5 rounded border"
                style={{
                  color: item.accent,
                  borderColor: `${item.accent}30`,
                  background: `${item.accent}10`,
                }}
              >
                {item.pill}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-white/30">
              <Icon className="w-3 h-3" style={{ color: item.accent }} />
              <span style={{ color: isOpen ? item.accent : undefined }}>
                {isOpen ? "> expanded" : "> hover to expand"}
              </span>
            </div>
          </div>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="mt-1 text-white/30 group-hover:text-white/60"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reduce ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{
              height: { duration: reduce ? 0 : 0.55, ease: [0.25, 1, 0.5, 1] },
              opacity: { duration: reduce ? 0 : 0.35, ease: "easeInOut" },
            }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pl-[52px]">
              <div className="flex items-start gap-3">
                <span className="text-[#B5FF4D] font-mono text-xs mt-0.5">$</span>
                <p className="text-xs leading-relaxed text-white/75 italic">
                  {t(item.answer)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const t = useT();
  const reduce = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="md:col-span-3 space-y-6">
      <motion.h3
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-white"
      >
        {t("faq.title")}
      </motion.h3>

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="text-sm mb-8 max-w-md font-normal italic leading-relaxed text-white/85"
      >
        {t("faq.subtitle")}
      </motion.p>

      <div className="space-y-3">
        {faqItems.map((item, idx) => (
          <FAQCard
            key={idx}
            item={item}
            index={idx}
            isOpen={openIndex === idx}
            onHover={() => setOpenIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
}
