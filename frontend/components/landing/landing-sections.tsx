"use client";

import React from "react";
import { OperatorStartCard } from "./operator-start-card";
import { SystemFeatureGrid } from "./system-feature-grid";
import { RuntimeArchitecture } from "./runtime-architecture";
import { ToolkitShowcase } from "./toolkit-showcase";
import { GuardrailsCTA } from "./guardrails-cta";
import { MarqueeTrust } from "./marquee-trust";

/**
 * LandingSections — modules rendered below the Ramp-style hero.
 * All sections live on a Ramp near-black (#0D0D0D) background.
 */
export function LandingSections() {
  return (
    <div className="relative w-full" style={{ backgroundColor: "#0D0D0D", fontFamily: "Inter, sans-serif" }}>
      <MarqueeTrust />
      <OperatorStartCard />
      <SystemFeatureGrid />
      <RuntimeArchitecture />
      <ToolkitShowcase />
      <GuardrailsCTA />
    </div>
  );
}
