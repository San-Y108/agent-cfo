"""Extract treasury audit robot mascot from dark background PNG."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets" / "images" / "console" / "module-mascots" / "wallets-module-mascot.png"
OUT = ROOT / "frontend" / "public" / "console" / "mascots" / "treasury-audit-robot.png"


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    arr = np.array(im, dtype=np.uint8)
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)

    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)
    sat = maxc - minc

    # Dark navy background + floor purple glow (edge-connected only)
    bg = (maxc <= 85) & (sat <= 120)

    h, w = bg.shape
    visited = np.zeros((h, w), dtype=bool)
    stack: list[tuple[int, int]] = []

    def push(y: int, x: int) -> None:
        if 0 <= y < h and 0 <= x < w and not visited[y, x] and bg[y, x]:
            visited[y, x] = True
            stack.append((y, x))

    for x in range(w):
        push(0, x)
        push(h - 1, x)
    for y in range(h):
        push(y, 0)
        push(y, w - 1)

    while stack:
        y, x = stack.pop()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            push(ny, nx)

    alpha = np.where(visited, 0, 255).astype(np.uint8)

    for _ in range(3):
        transparent = alpha == 0
        edge = np.zeros_like(alpha, dtype=bool)
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            edge |= np.roll(np.roll(transparent, dy, axis=0), dx, axis=1)
        fringe = edge & (alpha == 255) & (maxc <= 95)
        alpha[fringe] = 0

    arr[:, :, 3] = alpha
    OUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(arr).save(OUT, optimize=True)
    ratio = (alpha == 0).sum() / alpha.size
    print(f"Wrote {OUT} ({ratio:.1%} transparent, size {im.size})")


if __name__ == "__main__":
    main()
