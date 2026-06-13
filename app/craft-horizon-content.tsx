"use client";

import { CraftHorizonHeading } from "./craft-horizon-heading";
import { CraftStarFlanks } from "./craft-star-flanks";
import { ParallaxLayer } from "./parallax-layer";

/** Stars sit fixed in the flanks — parallax weight only, no rise animation. */
const CRAFT_STAR_PARALLAX = 0.12;

export function CraftHorizonContent() {
  return (
    <>
      <ParallaxLayer
        aria-hidden
        weight={CRAFT_STAR_PARALLAX}
        className="pointer-events-none absolute inset-0 z-[5] overflow-visible"
      >
        <div className="studio-craft-star-flanks">
          <CraftStarFlanks />
        </div>
      </ParallaxLayer>

      <div className="studio-craft-horizon-rise pointer-events-none">
        <CraftHorizonHeading />
      </div>
    </>
  );
}
