import { clamp } from "./math";

/** Single smooth bend — head at mascot, tail at rolling beam anchor. */
export function getBeamSliceY(
  x: number,
  beamLength: number,
  headY: number,
  tailY: number,
): number {
  if (Math.abs(headY - tailY) < 0.5) return headY;

  const t = clamp(x / beamLength, 0, 1);
  const bend = t * t;
  return headY + (tailY - headY) * bend;
}
