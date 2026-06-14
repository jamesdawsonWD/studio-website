"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import {
  useViewportVisible,
  VIEWPORT_CULL_MARGIN,
} from "./use-viewport-visible";
import { useVortexHeroForceMount } from "./vortex/vortex-reset-prep";

type Props = {
  /** Drift multiplier vs the scene's scrollable distance.
   *  Clouds + scroll sections all share the same weight so they ride the same
   *  rhythm. Use different values when you want depth separation. */
  weight?: number;
  /** Optional translateZ for depth — opt-in via ParallaxLayer z prop. */
  z?: number | string;
  /** Hide children when this layer is fully outside the viewport (keeps mounted
   *  so scroll-driven transforms do not reset on remount). */
  culled?: boolean;
  /** Mount early before the vortex scroll reset so the hero is ready at top. */
  mountBeforeVortexReset?: boolean;
  /** IntersectionObserver root margin when `culled` is set (px or % only). */
  cullMargin?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className" | "style" | "children"
>;

type StudioCSSVars = {
  "--parallax-weight"?: number;
  "--parallax-z"?: string;
};

export function ParallaxLayer({
  weight,
  z,
  culled = false,
  mountBeforeVortexReset = false,
  cullMargin = VIEWPORT_CULL_MARGIN,
  className,
  style,
  children,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useViewportVisible(ref, {
    rootMargin: cullMargin,
    enabled: culled,
  });
  const forceHeroMount = useVortexHeroForceMount();
  const showChildren =
    !culled ||
    visible ||
    (mountBeforeVortexReset && forceHeroMount);

  const vars: StudioCSSVars = {};
  if (weight !== undefined) vars["--parallax-weight"] = weight;
  if (z !== undefined)
    vars["--parallax-z"] = typeof z === "number" ? `${z}px` : z;

  return (
    <div
      {...rest}
      ref={ref}
      className={className ? `parallax-layer ${className}` : "parallax-layer"}
      style={{ ...style, ...vars } as CSSProperties}
    >
      {culled ? (
        <div
          className={showChildren ? undefined : "invisible"}
          aria-hidden={showChildren ? undefined : true}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
