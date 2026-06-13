"use client";

import { useRef } from "react";
import { useCanvasAnimation } from "./use-canvas-animation";

type BeamHeroProps = {
  /** Full-bleed over starfield — no opaque card fill per frame. */
  transparent?: boolean;
  /** Section layout — mascot sits higher under a heading. */
  variant?: "card" | "section";
};

export function BeamHero({
  transparent = false,
  variant = "card",
}: BeamHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasAnimation(canvasRef, { transparent, variant });

  return (
    <>
      <canvas
        ref={canvasRef}
        className={
          variant === "section"
            ? "pointer-events-none absolute inset-0 size-full"
            : "absolute inset-0 size-full touch-pan-y"
        }
        aria-hidden
      />
      <span className="sr-only">
        Animated mascot with energy beam — move pointer vertically to guide it
      </span>
    </>
  );
}
