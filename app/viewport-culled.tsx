"use client";

import {
  type CSSProperties,
  type ReactNode,
  useRef,
} from "react";
import {
  useViewportVisible,
  VIEWPORT_CULL_MARGIN,
} from "./use-viewport-visible";

type ViewportCulledProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Keeps layout height when children unmount (native scroll pages). */
  preserveHeight?: boolean;
  rootMargin?: string;
  enabled?: boolean;
};

/** Unmounts children when the wrapper leaves the viewport (both directions). */
export function ViewportCulled({
  children,
  className,
  style,
  preserveHeight = false,
  rootMargin = VIEWPORT_CULL_MARGIN,
  enabled = true,
}: ViewportCulledProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useViewportVisible(ref, {
    rootMargin,
    enabled,
  });

  return (
    <div
      ref={ref}
      className={[
        className,
        preserveHeight ? "min-h-screen w-full" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-hidden={!visible}
    >
      {visible ? children : null}
    </div>
  );
}
