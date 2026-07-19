"use client";

import React from "react";
import { HolographicCard } from "./holographic-card";
import { CardSplitter } from "./card-splitter";
import { Web3NodeCloud } from "./web3-node-cloud";
import { PipelineEditorial } from "./pipeline-editorial";
import { GuardrailsCTA } from "./guardrails-cta";
import { TeamShowcase } from "./team-showcase";
import { BuildTimeline } from "./build-timeline";
import { FAQSection } from "./faq-section";
import { HSMMonitor } from "./hsm-monitor";
import { LandingFooter } from "./landing-footer";
import { LANDING_SECTION_IDS } from "@/lib/constants/landing-navigation";

/**
 * LandingSections — modules rendered below the Ramp-style hero.
 * All sections live on a Ramp near-black (#0D0D0D) background.
 *
 * The global particle background (GlobalParticleBackground) is rendered
 * at the page level in page.tsx as a fixed layer behind all content.
 *
 * Flow (top → bottom):
 *   HolographicCard + Web3NodeCloud  |  CardSplitter
 *   PipelineEditorial (5 stages, editorial flow with Pretext animations)
 *   GuardrailsCTA
 *   FAQ + HSM
 *   LandingFooter (giant wordmark + 4 columns)
 */
export function LandingSections() {
  return (
    <div
      className="relative w-full"
      style={{ backgroundColor: "#0D0D0D", fontFamily: "Inter, sans-serif" }}
    >
      {/* Hero-adjacent showcase row: left = AI Agent + Web3 Map, right = Budget Cards */}
      <section id={LANDING_SECTION_IDS.overview} className="w-full scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl mx-auto px-6 pt-16 items-start">
          <div className="flex flex-col gap-8">
            <HolographicCard />
            <Web3NodeCloud />
          </div>
          <CardSplitter />
        </div>
      </section>

      {/* The 5-stage pipeline */}
      <section id={LANDING_SECTION_IDS.payoutFlow} className="w-full scroll-mt-24">
        <PipelineEditorial />
      </section>

      <section id={LANDING_SECTION_IDS.demoAudit} className="w-full scroll-mt-24">
        <GuardrailsCTA />
      </section>

      {/* Soft transition from guardrails CTA into team constellation */}
      <div
        className="w-full h-16 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,1) 0%, rgba(13,13,13,0.85) 50%, rgba(13,13,13,1) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Built-by team */}
      <section id={LANDING_SECTION_IDS.team} className="w-full scroll-mt-24">
        <TeamShowcase />
      </section>

      {/* Build timeline */}
      <section id={LANDING_SECTION_IDS.buildTimeline} className="w-full scroll-mt-24">
        <BuildTimeline />
      </section>

      {/* FAQ + HSM 2-column layout — flush against timeline, no gap */}
      <section id={LANDING_SECTION_IDS.faqSecurity} className="w-full scroll-mt-24">
        <div className="max-w-6xl mx-auto border-t pt-16 grid grid-cols-1 md:grid-cols-5 gap-12 text-left border-white/18 px-6">
          <FAQSection />
          <HSMMonitor />
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
