"use client";

import React from "react";
import { OperatorStartCard } from "./operator-start-card";
import { SystemFeatureGrid } from "./system-feature-grid";
import { RuntimeArchitecture } from "./runtime-architecture";
import { ToolkitShowcase } from "./toolkit-showcase";
import { GuardrailsCTA } from "./guardrails-cta";

/**
 * LandingSections — modules rendered below the Velorix-style hero video.
 * Hero (velorix-hero.tsx) is intentionally untouched. All sections below
 * live on a pure-black background; warm-cream paper cards provide
 * Zapier-inspired product system feel without overriding the brand.
 */
export function LandingSections() {
  return (
    <div className="relative w-full bg-black" style={{ fontFamily: "Inter, sans-serif" }}>
      <OperatorStartCard />
      <SystemFeatureGrid />
      <RuntimeArchitecture />
      <ToolkitShowcase />
      <GuardrailsCTA />
    </div>
  );
}
