"use client";

import { useRef } from "react";
import { useTrackingPupil } from "./use-tracking-pupil";

export const STAR_VIEWBOX = { width: 57, height: 81 } as const;

const WHITE = { cx: 28.183, cy: 40.7922, r: 11.8705 };
const PUPIL_R = 6.32512;
const EDGE_GAP = 1.5;

const RAYS = [
  "M56.8176 41.3782L38.9545 45.1699L38.9545 37.5866L56.8176 41.3782Z",
  "M27.7057 0L34.379 31.2605H21.0324L27.7057 0Z",
  "M-1.91378e-07 41.3782L17.8632 37.5866L17.8632 45.1699L-1.91378e-07 41.3782Z",
  "M28.0714 80.2599L21.3981 48.9994L34.7447 48.9993L28.0714 80.2599Z",
] as const;

type Props = {
  className?: string;
};

/** Star eyeball — Group 75 art with pointer-tracking pupil. */
export function StarCharacter({ className = "" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pupil = useTrackingPupil({
    svgRef,
    white: WHITE,
    pupilR: PUPIL_R,
    edgeGap: EDGE_GAP,
    viewBoxSize: STAR_VIEWBOX.width,
  });

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${STAR_VIEWBOX.width} ${STAR_VIEWBOX.height}`}
      aria-hidden
      className={className ? `block w-full ${className}` : "block w-full"}
    >
      {RAYS.map((d) => (
        <path key={d} d={d} fill="#D9D9D9" />
      ))}
      <circle
        cx={WHITE.cx}
        cy={WHITE.cy}
        r={WHITE.r}
        fill="#EEEEE5"
        stroke="#212121"
      />
      <circle
        cx={pupil.cx}
        cy={pupil.cy}
        r={PUPIL_R}
        fill="#272727"
        stroke="#212121"
      />
    </svg>
  );
}
