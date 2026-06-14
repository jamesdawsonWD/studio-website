import { useLayoutEffect, useRef, useState, type RefObject } from "react";

/** Fallback when `--studio-viewport-cull-margin` is unset (px or % only). */
export const VIEWPORT_CULL_MARGIN = "100%";

type RootMarginBox = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type Options = {
  /** Expands the root equally when testing intersection (px or % only). */
  rootMargin?: string;
  /** When false, the target stays mounted (observer disabled). */
  enabled?: boolean;
};

function resolveMarginToken(token: string, axis: "x" | "y"): number {
  if (token.endsWith("%")) {
    const pct = Number.parseFloat(token) / 100;
    const size = axis === "x" ? window.innerWidth : window.innerHeight;
    return size * pct;
  }
  return Number.parseFloat(token) || 0;
}

function parseRootMargin(margin: string): RootMarginBox {
  const parts = margin.trim().split(/\s+/).filter(Boolean);
  const tokens =
    parts.length === 1
      ? [parts[0], parts[0], parts[0], parts[0]]
      : parts.length === 2
        ? [parts[0], parts[1], parts[0], parts[1]]
        : parts.length === 3
          ? [parts[0], parts[1], parts[2], parts[1]]
          : parts.slice(0, 4);

  return {
    top: resolveMarginToken(tokens[0], "y"),
    right: resolveMarginToken(tokens[1], "x"),
    bottom: resolveMarginToken(tokens[2], "y"),
    left: resolveMarginToken(tokens[3], "x"),
  };
}

/** Reads `--studio-viewport-cull-margin` from :root (px or % only). */
export function getViewportCullMargin(): string {
  if (typeof document === "undefined") return VIEWPORT_CULL_MARGIN;

  const fromCss = getComputedStyle(document.documentElement)
    .getPropertyValue("--studio-viewport-cull-margin")
    .trim();

  return fromCss || VIEWPORT_CULL_MARGIN;
}

function resolveRootMargin(override?: string): string {
  if (override && override !== VIEWPORT_CULL_MARGIN) return override;
  return getViewportCullMargin();
}

/** Matches IntersectionObserver with an expanded root (post-transform rect). */
export function isIntersectingViewport(
  el: Element,
  rootMargin?: string,
): boolean {
  const margin = resolveRootMargin(rootMargin);
  const rect = el.getBoundingClientRect();
  const { top, right, bottom, left } = parseRootMargin(margin);

  const rootTop = -top;
  const rootLeft = -left;
  const rootBottom = window.innerHeight + bottom;
  const rootRight = window.innerWidth + right;

  return (
    rect.bottom > rootTop &&
    rect.top < rootBottom &&
    rect.right > rootLeft &&
    rect.left < rootRight
  );
}

/** Frames outside the viewport before hiding a culled layer. */
const CULL_HIDE_FRAMES = 4;

/** True while `ref` intersects the viewport — hides culled layers off-screen. */
export function useViewportVisible(
  ref: RefObject<Element | null>,
  {
    rootMargin = VIEWPORT_CULL_MARGIN,
    enabled = true,
  }: Options = {},
) {
  const [visible, setVisible] = useState(false);
  const missFramesRef = useRef(0);

  useLayoutEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const margin = resolveRootMargin(rootMargin);

    const applyVisibility = (intersecting: boolean) => {
      if (intersecting) {
        missFramesRef.current = 0;
        setVisible(true);
        return;
      }

      missFramesRef.current += 1;
      if (missFramesRef.current >= CULL_HIDE_FRAMES) {
        setVisible(false);
      }
    };

    applyVisibility(isIntersectingViewport(el, margin));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) applyVisibility(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: margin },
    );

    observer.observe(el);

    // Scroll-driven parallax transforms don't always notify IntersectionObserver;
    // sync from getBoundingClientRect on scroll so culled layers still mount.
    let raf = 0;
    const syncFromScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!el.isConnected) return;
        applyVisibility(isIntersectingViewport(el, margin));
      });
    };

    window.addEventListener("scroll", syncFromScroll, { passive: true });
    syncFromScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", syncFromScroll);
      if (raf) cancelAnimationFrame(raf);
      missFramesRef.current = 0;
    };
  }, [enabled, rootMargin]);

  return visible;
}
