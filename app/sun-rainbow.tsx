"use client";

import { RainbowWaves } from "./rainbow-waves";

/** Origin just above the sun; extends down through the craft / space band. */
export function SunRainbow() {
  return (
    <div aria-hidden className="studio-sun-rainbow pointer-events-none absolute z-[2]">
      <RainbowWaves variant="space" />
    </div>
  );
}
