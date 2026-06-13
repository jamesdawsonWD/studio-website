"use client";

import { StarCharacter } from "./star-character";

/** Left / right bookends — fixed position, parallax drift only. */
export function CraftStarFlanks() {
  return (
    <>
      <div
        aria-hidden
        className="studio-craft-star-flank studio-craft-star-flank--left"
      >
        <StarCharacter />
      </div>
      <div
        aria-hidden
        className="studio-craft-star-flank studio-craft-star-flank--right"
      >
        <StarCharacter />
      </div>
    </>
  );
}
