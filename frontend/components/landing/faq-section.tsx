"use client";

import React from "react";
import { useT } from "@/lib/i18n/context";

const faqItems = [
  {
    question: "faq.q1" as const,
    answer: "faq.a1" as const,
    pill: "SECURED" as const,
  },
  {
    question: "faq.q2" as const,
    answer: "faq.a2" as const,
    pill: "POLICY ENFORCED" as const,
  },
  {
    question: "faq.q3" as const,
    answer: "faq.a3" as const,
    pill: "CROSS-CHAIN READY" as const,
  },
];

export function FAQSection() {
  const t = useT();

  return (
    <div className="md:col-span-3 space-y-6">
      <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-white">
        {t("faq.title")}
      </h3>
      <p className="text-sm mb-8 max-w-md font-normal leading-relaxed text-white/60">
        {t("faq.subtitle")}
      </p>

      <div className="space-y-4">
        {faqItems.map((item, idx) => (
          <div
            key={idx}
            className="p-5 border rounded-xl transition-colors relative group border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
          >
            <h4 className="text-sm font-bold flex items-center justify-between gap-4 text-white">
              <span>{t(item.question)}</span>
              <span className="shrink-0 text-xs font-mono font-black text-[#B5FF4D]">
                {item.pill}
              </span>
            </h4>
            <p className="text-xs mt-3 leading-relaxed font-normal text-white/60">
              {t(item.answer)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
