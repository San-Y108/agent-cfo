"""Extract policy audit scene mascot from purple gradient background PNG.

Output is a transparent PNG cropped to the subject (robot + audit panels) with
alpha-matted edges so it composites cleanly on both light and dark console
backgrounds.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "inbox" / "check-audit2.png"
OUT = ROOT / "frontend" / "public" / "console" / "mascots" / "policy-audit-scene.png"

# Minimum size for a foreground blob to keep (removes isolated noise specks).
MIN_COMPONENT_SIZE = 40
# Padding around the subject bounding box before the alpha-mat feather is applied.
CROP_PAD = 24
# Feather radius in original pixels for decontaminating anti-aliased edges.
FEATHER_RADIUS = 6.0
# Maximum display dimension for the final asset.
MAX_DISPLAY_DIM = 400


def is_background(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> np.ndarray:
    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)
    sat = maxc - minc

    # Purple / lavender gradient backdrop
    purple_field = (
        (maxc >= 95)
        & (b >= g - 12)
        & (r >= g - 45)
        & (sat <= 95)
        & (b >= 100)
    )

    # Soft floor glow (slightly darker purple, still low saturation)
    floor_glow = (
        (maxc >= 75)
        & (maxc <= 160)
        & (b >= r - 25)
        & (sat <= 80)
        & (r >= 90)
    )

    return purple_field | floor_glow


def remove_small_components(mask: np.ndarray, min_size: int) -> np.ndarray:
    labeled, num = ndimage.label(mask)
    if num == 0:
        return mask
    component_sizes = np.bincount(labeled.ravel())[1:]
    keep = component_sizes >= min_size
    return keep[labeled - 1]


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    arr = np.array(im, dtype=np.uint8)
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)

    bg = is_background(r, g, b)

    # Flood-fill from image edges to mark the exterior background.
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

    # Foreground = everything not connected to the exterior background.
    fg_mask = ~visited
    fg_mask = remove_small_components(fg_mask, MIN_COMPONENT_SIZE)

    ys, xs = np.where(fg_mask)
    if len(xs) == 0:
        raise RuntimeError("No foreground subject found")

    # Crop to subject with a little breathing room for the feather.
    y0, y1 = max(0, ys.min() - CROP_PAD), min(h, ys.max() + CROP_PAD + 1)
    x0, x1 = max(0, xs.min() - CROP_PAD), min(w, xs.max() + CROP_PAD + 1)

    crop_fg = fg_mask[y0:y1, x0:x1]
    crop_src = arr[y0:y1, x0:x1]

    # Use an eroded version of the foreground as the clean color source so that
    # anti-aliased boundary pixels do not bleed the purple background back in.
    clean = ndimage.binary_erosion(crop_fg, iterations=1)

    # Distance from each pixel to the nearest clean foreground pixel.
    dist, nearest = ndimage.distance_transform_edt(~clean, return_indices=True)
    t = np.clip(1.0 - dist / FEATHER_RADIUS, 0, 1)
    alpha = (255 * t).astype(np.uint8)

    ny, nx = nearest
    out_rgb = crop_src[ny, nx, :3].copy()

    # Fully opaque clean foreground keeps its original color.
    out_rgb[clean] = crop_src[clean, :3]
    alpha[clean] = 255

    out = np.dstack([out_rgb, alpha])
    cropped = Image.fromarray(out, mode="RGBA")

    # Downscale to a console-friendly size while keeping the edges sharp.
    cropped.thumbnail((MAX_DISPLAY_DIM, MAX_DISPLAY_DIM), Image.Resampling.LANCZOS)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(OUT, optimize=True)
    print(
        f"Wrote {OUT} ({cropped.size}, "
        f"{(alpha == 0).sum() / alpha.size:.1%} transparent)"
    )


if __name__ == "__main__":
    main()
