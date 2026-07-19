"use client";

import { type RefObject, useEffect, useRef } from "react";

type RepelState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  centerX: number;
  centerY: number;
};

/**
 * Event-driven character repulsion.
 *
 * Character centers are measured only on pointer entry, resize, or text change.
 * Animation frames run only while the pointer moves or characters spring home.
 */
export function usePointerRepel(
  scopeRef: RefObject<HTMLElement | null>,
  selector: string,
  disabled: boolean,
  refreshKey: string,
) {
  const frameRef = useRef(0);

  useEffect(() => {
    if (disabled) return;
    const scope = scopeRef.current;
    if (!scope) return;

    let elements: HTMLElement[] = [];
    let states: RepelState[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    const measure = () => {
      elements = Array.from(scope.querySelectorAll<HTMLElement>(selector));
      states = elements.map((element, index) => {
        const rect = element.getBoundingClientRect();
        const previous = states[index];
        return {
          x: previous?.x ?? 0,
          y: previous?.y ?? 0,
          vx: previous?.vx ?? 0,
          vy: previous?.vy ?? 0,
          centerX: rect.left + rect.width / 2 - (previous?.x ?? 0),
          centerY: rect.top + rect.height / 2 - (previous?.y ?? 0),
        };
      });
    };

    const tick = () => {
      const radius = 110;
      const strength = 2.8;
      const spring = 0.11;
      const damping = 0.78;
      let moving = false;

      elements.forEach((element, index) => {
        const state = states[index];
        if (!state) return;

        if (pointer.active) {
          const dx = state.centerX + state.x - pointer.x;
          const dy = state.centerY + state.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < radius && distance > 1) {
            const force = (1 - distance / radius) * strength;
            state.vx += (dx / distance) * force;
            state.vy += (dy / distance) * force;
          }
        }

        state.vx += -state.x * spring;
        state.vy += -state.y * spring;
        state.vx *= damping;
        state.vy *= damping;
        state.x += state.vx;
        state.y += state.vy;

        const active =
          Math.abs(state.vx) > 0.03 ||
          Math.abs(state.vy) > 0.03 ||
          (!pointer.active &&
            (Math.abs(state.x) > 0.08 || Math.abs(state.y) > 0.08));

        if (!pointer.active && !active) {
          state.x = 0;
          state.y = 0;
          state.vx = 0;
          state.vy = 0;
        }

        element.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`;
        moving ||= active;
      });

      frameRef.current = moving ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(tick);
    };

    const handlePointerEnter = () => measure();
    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      start();
    };
    const handlePointerLeave = () => {
      pointer.active = false;
      start();
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(scope);
    scope.addEventListener("pointerenter", handlePointerEnter);
    scope.addEventListener("pointermove", handlePointerMove);
    scope.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      resizeObserver.disconnect();
      scope.removeEventListener("pointerenter", handlePointerEnter);
      scope.removeEventListener("pointermove", handlePointerMove);
      scope.removeEventListener("pointerleave", handlePointerLeave);
      elements.forEach((element) => {
        element.style.transform = "";
      });
    };
  }, [disabled, refreshKey, scopeRef, selector]);
}
