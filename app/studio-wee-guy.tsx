"use client";

import type { CSSProperties } from "react";
import { StudioLogoMark } from "./studio-logo-mark";

const SIZE = 40;

type Props = {
  /** `right` → beak at 3 o'clock. `left` → beak at 9 o'clock. */
  facing: "left" | "right";
  className?: string;
  /** Offset the shared bounce loop (e.g. `-0.2s`). */
  bounceDelay?: string;
};

export function StudioWeeGuy({
  facing,
  className = "",
  bounceDelay,
}: Props) {
  return (
    <div
      className={["studio-wee-bob", className].filter(Boolean).join(" ")}
      style={
        bounceDelay
          ? ({ animationDelay: bounceDelay } as CSSProperties)
          : undefined
      }
    >
      <div
        className={[
          "studio-wee-orient",
          facing === "left"
            ? "studio-wee-orient--left"
            : "studio-wee-orient--right",
        ].join(" ")}
      >
        <StudioLogoMark size={SIZE} trackPupil idleGazeBias={facing} />
      </div>
    </div>
  );
}
