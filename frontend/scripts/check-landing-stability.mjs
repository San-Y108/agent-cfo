#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND = join(fileURLToPath(new URL("..", import.meta.url)));

const files = {
  headline: join(FRONTEND, "components/landing/decode-headline.tsx"),
  repel: join(FRONTEND, "components/landing/use-pointer-repel.ts"),
  holographic: join(FRONTEND, "components/landing/holographic-card.tsx"),
  particles: join(FRONTEND, "components/landing/global-particle-background.tsx"),
  pipeline: join(FRONTEND, "components/landing/pipeline-editorial.tsx"),
  sections: join(FRONTEND, "components/landing/landing-sections.tsx"),
  team: join(FRONTEND, "components/landing/team-showcase.tsx"),
  navigation: join(FRONTEND, "components/landing/velorix-hero.tsx"),
  guardrails: join(FRONTEND, "components/landing/guardrails-cta.tsx"),
  timeline: join(FRONTEND, "components/landing/build-timeline.tsx"),
};

const source = Object.fromEntries(
  Object.entries(files).map(([name, path]) => [
    name,
    readFileSync(path, "utf8"),
  ]),
);

const forbidden = [
  ["headline", /SCRAMBLE_CHARS/, "random glyph charset"],
  ["headline", /Math\.random/, "random headline mutation"],
  ["headline", /setInterval/, "per-character interval"],
  ["headline", /requestAnimationFrame/, "permanent headline RAF"],
  ["headline", /getBoundingClientRect/, "frame-by-frame layout read"],
  ["repel", /setInterval|Math\.random/, "timer or random glyph mutation"],
  ["timeline", /brightness\(0\.[56]\)/, "inactive gray filter"],
  ["timeline", /const tl = gsap\.timeline/, "overlapping scrub timeline"],
  ["timeline", /feTurbulence/, "full-frame animated film grain"],
  ["holographic", /backdrop-blur|from-white\/\[0\.08\]/, "lifted gray card surface"],
  ["particles", /rgba\(13,\s*13,\s*13,\s*0\.9\)/, "global dark hydration overlay"],
  ["pipeline", /scrollTriggerRef=\{sectionRef\}[\s\S]{0,180}\brepel\b/, "body-copy repulsion"],
  ["pipeline", /id="workflow"/, "duplicate workflow section id"],
  ["team", /id="team"/, "duplicate team section id"],
  ["timeline", /id="timeline"/, "duplicate timeline section id"],
  ["navigation", /\.offsetTop\b/, "relative section offset tracking"],
  ["guardrails", /variants=\{reveal\}/, "whole-card opacity reveal"],
  ["guardrails", /rgba\(255,\s*255,\s*255,\s*0\.88\)/, "dimmed headline white"],
];

const failures = forbidden
  .filter(([file, pattern]) => pattern.test(source[file]))
  .map(([file, , label]) => `${file}: ${label}`);

const repelLayoutReads =
  source.repel.match(/getBoundingClientRect/g)?.length ?? 0;
if (repelLayoutReads !== 1) {
  failures.push(
    `repel: expected one cached layout measurement, found ${repelLayoutReads}`,
  );
}
if (!source.repel.includes('addEventListener("pointermove"')) {
  failures.push("repel: interaction is not pointer-event driven");
}
if (!source.particles.includes('mixBlendMode: "screen"')) {
  failures.push("particles: canvas must brighten, never darken, page content");
}
if (
  (source.sections.match(/LANDING_SECTION_IDS\./g)?.length ?? 0) !== 6
) {
  failures.push("sections: expected six canonical navigation targets");
}
if (!source.navigation.includes("- navHeight - 16")) {
  failures.push("navigation: click target must account for fixed navbar height");
}

if (failures.length) {
  console.error("[landing-stability] failed");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("[landing-stability] stable text, contrast, and timeline checks passed");
