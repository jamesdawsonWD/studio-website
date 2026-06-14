"use client";

import { useRef } from "react";
import { StarCharacter } from "../star-character";
import { useTrackingPupil } from "../use-tracking-pupil";
import { useVortexScrollActive } from "./use-vortex-scroll-active";

const EYE_VIEWBOX = 56;
/** Mirrored from the details eye — tail points bottom-right toward the vortex swirl. */
const SCLERA = { cx: 31.5, cy: 31.5, r: 14.5 };
const EYE_OUTLINE_PATH =
  "M22 1H34C45.598 1 55 10.402 55 22V34C55 45.598 45.598 55 34 55H4C2.34315 55 1 53.6569 1 52V22L1.00684 21.458C1.29431 10.1105 10.5832 1 22 1Z";
const PUPIL_R = 8;
const PUPIL_EDGE_GAP = 2.5;

const STAR_FLANKS = [
  { top: "6%", left: "4%", size: 52, duration: 2.9, delay: 0 },
  { top: "14%", right: "2%", size: 44, duration: 3.4, delay: 0.35 },
  { bottom: "18%", left: "0%", size: 48, duration: 3.1, delay: 0.7 },
  { bottom: "8%", right: "6%", size: 40, duration: 2.7, delay: 1.1 },
  { top: "42%", left: "-2%", size: 36, duration: 3.6, delay: 0.2 },
  { top: "38%", right: "-3%", size: 42, duration: 3.2, delay: 0.9 },
] as const;

function VortexCenterEye() {
  const svgRef = useRef<SVGSVGElement>(null);
  const vortexScrollActive = useVortexScrollActive();
  const pupil = useTrackingPupil({
    svgRef,
    white: SCLERA,
    pupilR: PUPIL_R,
    edgeGap: PUPIL_EDGE_GAP,
    viewBoxSize: EYE_VIEWBOX,
    enabled: !vortexScrollActive,
  });

  return (
    <div className="studio-vortex-center-eye pointer-events-none absolute left-1/2 top-1/2 z-10 w-[min(34vw,190px)] -translate-x-1/2 -translate-y-1/2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${EYE_VIEWBOX} ${EYE_VIEWBOX}`}
        aria-hidden
        className="block h-auto w-full"
      >
        <g transform="matrix(-1 0 0 1 56 0)">
          <path
            d={EYE_OUTLINE_PATH}
            stroke="#D9D9D9"
            strokeWidth="2"
          />
        </g>
        <circle cx={SCLERA.cx} cy={SCLERA.cy} r={SCLERA.r} fill="#D9D9D9" />
        <circle
          cx={pupil.cx}
          cy={pupil.cy}
          r={PUPIL_R}
          fill="#1B1006"
        />
      </svg>
    </div>
  );
}

/** Large centre eye + bobbing star eyes around the vortex mouth. */
export function VortexEyeOverlay() {
  return (
    <div
      aria-hidden
      className="studio-vortex-eye-overlay pointer-events-none absolute inset-0 z-[4]"
    >
      <VortexCenterEye />
      {STAR_FLANKS.map((star, index) => (
        <div
          key={index}
          className="studio-vortex-eye-star absolute"
          style={{
            top: "top" in star ? star.top : undefined,
            bottom: "bottom" in star ? star.bottom : undefined,
            left: "left" in star ? star.left : undefined,
            right: "right" in star ? star.right : undefined,
            width: star.size,
            ["--vortex-star-bob-duration" as string]: `${star.duration}s`,
            ["--vortex-star-bob-delay" as string]: `${star.delay}s`,
          }}
        >
          <StarCharacter />
        </div>
      ))}
    </div>
  );
}
