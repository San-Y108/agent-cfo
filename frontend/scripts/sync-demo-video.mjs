#!/usr/bin/env node
/**
 * Sync team demo video from assets/video/ → public/video/ (frontend-local paths).
 * Works in monorepo dev and on Vercel (skips gracefully when source is absent).
 */

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Git LFS pointer files are tiny text blobs (~150 bytes).
// If the source is smaller than this threshold we know Vercel didn't pull the real
// LFS content — skip the copy so the committed video in public/video/ is preserved.
const LFS_POINTER_THRESHOLD = 1024 * 512; // 512 KB

const FRONTEND = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = join(FRONTEND, "..");

const FILES = [
  {
    src: join(REPO_ROOT, "assets/video/agentcfo-demo-web.mp4"),
    dest: join(FRONTEND, "public/video/agentcfo-demo-web.mp4"),
    optional: true,
  },
  {
    src: join(REPO_ROOT, "assets/video/agentcfo-demo.mp4"),
    dest: join(FRONTEND, "public/video/agentcfo-demo.mp4"),
    optional: true,
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

  const srcSize = statSync(src).size;
  if (srcSize < LFS_POINTER_THRESHOLD) {
    console.log(
      `[sync-demo-video] skip: ${src} looks like a Git LFS pointer (${srcSize} bytes) — keeping committed file`,
    );
    continue;
  }

  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  synced++;
  console.log(`[sync-demo-video] ${src} → ${dest} (${(srcSize / 1024 / 1024).toFixed(1)} MB)`);
}

if (synced === 0) {
  console.log(
    "[sync-demo-video] no files synced; Landing shows placeholder until assets/video/agentcfo-demo.mp4 exists",
  );
} else {
  console.log(`[sync-demo-video] done (${synced} file(s))`);
}
