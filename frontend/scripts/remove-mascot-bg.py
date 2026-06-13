"""Remove baked-in checkerboard backdrop from agent-cfo mascot PNG."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "inbox" / "3d-assets" / "agent-cfo-mascot-source.png"
OUT = ROOT / "frontend" / "public" / "console" / "mascots" / "agent-cfo-mascot.png"


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    arr = np.array(im, dtype=np.uint8)
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)

    neutral = (np.abs(r - g) <= 18) & (np.abs(g - b) <= 18)
    white = neutral & (r >= 235)
    light_gray = neutral & (r >= 175) & (r < 235)
    medium_gray = neutral & (r >= 140) & (r < 175)
    bg = white | light_gray | medium_gray

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

    for _ in range(2):
        transparent = alpha == 0
        edge = np.zeros_like(alpha, dtype=bool)
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            edge |= np.roll(np.roll(transparent, dy, axis=0), dx, axis=1)
        fringe = edge & (alpha == 255) & neutral & (r >= 130)
        alpha[fringe] = 0

    arr[:, :, 3] = alpha
    OUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(arr).save(OUT, optimize=True)
    ratio = (alpha == 0).sum() / alpha.size
    print(f"Wrote {OUT} ({ratio:.1%} transparent)")


if __name__ == "__main__":
    main()
