#!/usr/bin/env node
/**
 * Sync team demo video from assets/video/ → frontend/public/video/
 * for Next.js static serving. Canonical source: assets/video/ (team deliverable).
 *
 * Usage: node scripts/sync-demo-video.mjs
 * Called automatically by frontend predev / prebuild.
 */

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const FILES = [
  { src: "assets/video/agentcfo-demo.mp4", dest: "frontend/public/video/agentcfo-demo.mp4" },
  {
    src: "assets/video/agentcfo-demo-poster.jpg",
    dest: "frontend/public/video/agentcfo-demo-poster.jpg",
    optional: true,
  },
];

let synced = 0;

for (const { src, dest, optional } of FILES) {
  const srcPath = join(ROOT, src);
  const destPath = join(ROOT, dest);

  if (!existsSync(srcPath)) {
    if (!optional) {
      console.log(`[sync-demo-video] skip: ${src} not found (drop video here when ready)`);
    }
    continue;
  }

  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(srcPath, destPath);
  synced++;
  console.log(`[sync-demo-video] ${src} → ${dest}`);
}

if (synced === 0) {
  console.log("[sync-demo-video] no files synced; Landing shows placeholder until assets/video/agentcfo-demo.mp4 exists");
} else {
  console.log(`[sync-demo-video] done (${synced} file(s))`);
}
