"use client";

import { type RefObject, useEffect, useRef } from "react";
import { useMotionValue, useScroll, useTransform } from "motion/react";
import { readCssLengthPx } from "./read-css-length-px";
import {
  isSpaceChromeActive,
  setSpaceChromeActive,
  subscribeSpaceChrome,
} from "./studio-space-chrome";

export const STUDIO_SPACE_BAND_SELECTOR = ".studio-sun-space-band";
export const STUDIO_SPACE_HORIZON_SELECTOR =
  ".studio-sun-section .studio-craft-horizon";

const HIDDEN = "inset(100% 0 0 0)";
const VISIBLE = "inset(0)";
const HEADER_BOTTOM_PX = 80;

/** Ellipse crossed the header during the current forward pass. */
let hasSeenHorizonCrossing = false;

function intersectionRect(a: DOMRect, b: DOMRect): DOMRect | null {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.right, b.right);
  const bottom = Math.min(a.bottom, b.bottom);
  if (left >= right || top >= bottom) return null;
  return new DOMRect(left, top, right - left, bottom - top);
}

function ellipseSubpath(horizon: DOMRect, target: DOMRect): string {
  const cx = horizon.left + horizon.width / 2 - target.left;
  const cy = horizon.top + horizon.height / 2 - target.top;
  const rx = horizon.width / 2;
  const ry = horizon.height / 2;
  const x0 = cx + rx;
  const x1 = cx - rx;

  return `M ${x0} ${cy} A ${rx} ${ry} 0 1 1 ${x1} ${cy} A ${rx} ${ry} 0 1 1 ${x0} ${cy} Z`;
}

function rectSubpath(rect: DOMRect, target: DOMRect): string {
  const x = rect.left - target.left;
  const y = rect.top - target.top;
  return `M ${x} ${y} H ${x + rect.width} V ${y + rect.height} H ${x} Z`;
}

function ellipticalSpaceClipPath(
  target: DOMRect,
  horizon: DOMRect,
): string | null {
  const horizonOverlap = intersectionRect(target, horizon);
  if (!horizonOverlap) return null;

  const outer = rectSubpath(horizonOverlap, target);
  const hole = ellipseSubpath(horizon, target);
  return `path(evenodd, '${outer} ${hole}')`;
}

function ellipseTopCrossedHeader(horizon: DOMRect): boolean {
  return horizon.top <= HEADER_BOTTOM_PX;
}

/** Space band overlaps the fixed header — the “perfect” mask window. */
function spaceBandInHeaderZone(band: DOMRect): boolean {
  return band.top <= HEADER_BOTTOM_PX && band.bottom > 0;
}

/** Full space band (buffer + fill) has cleared the fixed header bar. */
function spaceBandClearedHeader(band: DOMRect): boolean {
  return band.bottom <= HEADER_BOTTOM_PX;
}

function syncSpaceChromeLatch(
  bandRect: DOMRect | null,
  horizonRect: DOMRect | null,
  scrollY: number,
  sectionEntryScrollPx: number,
  latchScrollPx: number,
) {
  if (scrollY < sectionEntryScrollPx) {
    hasSeenHorizonCrossing = false;
    setSpaceChromeActive(false);
    return;
  }

  if (isSpaceChromeActive()) return;

  if (
    horizonRect &&
    ellipseTopCrossedHeader(horizonRect) &&
    bandRect &&
    spaceBandInHeaderZone(bandRect)
  ) {
    hasSeenHorizonCrossing = true;
  }

  if (!hasSeenHorizonCrossing) return;

  const horizonCleared =
    horizonRect !== null && horizonRect.bottom <= HEADER_BOTTOM_PX;
  const bandCleared =
    bandRect !== null && spaceBandClearedHeader(bandRect);
  const scrollPastLatch = scrollY >= latchScrollPx;
  const bandGoneAfterCrossing = bandRect === null;

  if (horizonCleared || bandCleared || scrollPastLatch || bandGoneAfterCrossing) {
    setSpaceChromeActive(true);
  }
}

function headerCreamClipPath(
  target: DOMRect,
  bandRect: DOMRect | null,
  horizonRect: DOMRect | null,
  scrollY: number,
  sectionEntryScrollPx: number,
  latchScrollPx: number,
  reducedMotion: boolean,
  requireEllipseTop: boolean,
): string {
  syncSpaceChromeLatch(
    bandRect,
    horizonRect,
    scrollY,
    sectionEntryScrollPx,
    latchScrollPx,
  );

  if (isSpaceChromeActive()) {
    return VISIBLE;
  }

  if (reducedMotion) {
    return scrollY >= latchScrollPx ? VISIBLE : HIDDEN;
  }

  if (!bandRect || !spaceBandInHeaderZone(bandRect)) {
    return HIDDEN;
  }

  if (!horizonRect) {
    return HIDDEN;
  }

  if (requireEllipseTop && !ellipseTopCrossedHeader(horizonRect)) {
    return HIDDEN;
  }

  if (horizonRect.top >= target.bottom) {
    return HIDDEN;
  }

  return ellipticalSpaceClipPath(target, horizonRect) ?? HIDDEN;
}

/** Ellipse mask in the space-band window; latch to full cream once it closes. */
export function useStudioHeaderCreamClip(
  targetRef: RefObject<HTMLElement | null>,
  options?: { requireEllipseTop?: boolean },
) {
  const requireEllipseTop = options?.requireEllipseTop ?? false;
  const { scrollY } = useScroll();
  const latchTick = useMotionValue(0);
  const sectionEntryRef = useRef<number | null>(null);
  const latchScrollRef = useRef<number | null>(null);
  const reducedMotionRef = useRef<boolean | null>(null);

  useEffect(() => {
    return subscribeSpaceChrome(() => {
      latchTick.set(latchTick.get() + 1);
    });
  }, [latchTick]);

  return useTransform(() => {
    scrollY.get();
    latchTick.get();

    const target = targetRef.current;
    if (!target) return HIDDEN;

    if (sectionEntryRef.current === null) {
      sectionEntryRef.current = readCssLengthPx(
        "--studio-sun-section-at-header",
      );
    }
    if (latchScrollRef.current === null) {
      latchScrollRef.current = readCssLengthPx(
        "--studio-header-space-latch-scroll",
      );
    }
    if (reducedMotionRef.current === null) {
      reducedMotionRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    }

    const band = document.querySelector(STUDIO_SPACE_BAND_SELECTOR);
    const horizon = document.querySelector(STUDIO_SPACE_HORIZON_SELECTOR);

    return headerCreamClipPath(
      target.getBoundingClientRect(),
      band?.getBoundingClientRect() ?? null,
      horizon?.getBoundingClientRect() ?? null,
      scrollY.get(),
      sectionEntryRef.current,
      latchScrollRef.current,
      reducedMotionRef.current,
      requireEllipseTop,
    );
  });
}

export function resetSpaceChromeTransitionState() {
  hasSeenHorizonCrossing = false;
}
