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
      <section id="platform" className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl mx-auto px-6 pt-16 items-start">
          <div className="flex flex-col gap-8">
            <HolographicCard />
            <Web3NodeCloud />
          </div>
          <CardSplitter />
        </div>
      </section>

      {/* The 5-stage pipeline */}
      <PipelineEditorial />

      <section id="guardrails" className="w-full">
        <GuardrailsCTA />
      </section>

      {/* Built-by team */}
      <section id="team" className="w-full">
        <TeamShowcase />
      </section>

      {/* Build timeline */}
      <section id="timeline" className="w-full">
        <BuildTimeline />
      </section>

      {/* FAQ + HSM 2-column layout — flush against timeline, no gap */}
      <section id="faq" className="w-full">
        <div className="max-w-6xl mx-auto border-t pt-16 grid grid-cols-1 md:grid-cols-5 gap-12 text-left border-white/18 px-6">
          <FAQSection />
          <HSMMonitor />
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
