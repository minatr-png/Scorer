"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Slides a single indicator pill to the active item of a switch.
 * Items mark themselves with `data-pill-key`; the container must be `relative`.
 * Positions are written straight to the DOM so the move is a pure CSS transition.
 */
export function useSlidingPill(activeKey: string | null) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const pill = pillRef.current;
    if (!container || !pill) return;

    const place = (animate: boolean) => {
      const target = activeKey
        ? container.querySelector<HTMLElement>(`[data-pill-key="${CSS.escape(activeKey)}"]`)
        : null;
      if (!target) {
        pill.style.opacity = "0";
        placed.current = false;
        return;
      }
      // Jump into place the first time (and on resize); slide on every later change.
      pill.style.transition = animate && placed.current ? "" : "none";
      pill.style.width = `${target.offsetWidth}px`;
      pill.style.height = `${target.offsetHeight}px`;
      pill.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop}px)`;
      pill.style.opacity = "1";
      placed.current = true;
    };

    place(true);
    // ResizeObserver fires once on observe; skipping it keeps that call from cancelling the slide.
    let initial = true;
    const observer = new ResizeObserver(() => {
      if (initial) {
        initial = false;
        return;
      }
      place(false);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeKey]);

  return { containerRef, pillRef };
}
