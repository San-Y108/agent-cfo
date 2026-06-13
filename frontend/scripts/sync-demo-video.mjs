#!/usr/bin/env node
/**
 * Sync team demo video from assets/video/ → public/video/ (frontend-local paths).
 * Works in monorepo dev and on Vercel (skips gracefully when source is absent).
 */

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = join(FRONTEND, "..");

const FILES = [
  {
    src: join(REPO_ROOT, "assets/video/agentcfo-demo.mp4"),
    dest: join(FRONTEND, "public/video/agentcfo-demo.mp4"),
  },
  {
    src: join(REPO_ROOT, "assets/video/agentcfo-demo-poster.jpg"),
    dest: join(FRONTEND, "public/video/agentcfo-demo-poster.jpg"),
    optional: true,
  },
];

let synced = 0;

for (const { src, dest, optional } of FILES) {
  if (!existsSync(src)) {
    if (!optional) {
      console.log(`[sync-demo-video] skip: ${src} not found (drop video here when ready)`);
    }
    continue;
  }

  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  synced++;
  console.log(`[sync-demo-video] ${src} → ${dest}`);
}

if (synced === 0) {
  console.log(
    "[sync-demo-video] no files synced; Landing shows placeholder until assets/video/agentcfo-demo.mp4 exists",
  );
} else {
  console.log(`[sync-demo-video] done (${synced} file(s))`);
}
