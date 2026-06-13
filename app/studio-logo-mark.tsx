"use client";

import { useId, useRef } from "react";
import { type GazeBias, useTrackingPupil } from "./use-tracking-pupil";

export const STUDIO_LOGO_VIEWBOX = 56;

const WHITE = { cx: 29.5, cy: 29.5007, r: 14 };
const PUPIL = { r: 7.5 };
const EDGE_GAP = 2.5;

const MASK_PATH =
  "M1 32L1 24C1 11.2975 11.2975 1 24 1L32 1C44.7025 1 55 11.2975 55 24L55 52C55 53.6569 53.6569 55 52 55L24 55C11.2975 55 1 44.7026 1 32Z";

const BEAK = {
  x: 56,
  y: 34.0007,
  width: 16.707,
  height: 30.4072,
  rotate: 42.4678,
};

type Props = {
  size?: number;
  /** Header logo tracks the pointer; floor walkers use a fixed gaze. */
  trackPupil?: boolean;
  /** Where idle saccades start when the pointer rests (wee guys only). */
  idleGazeBias?: GazeBias;
  /** Cream tone for the scroll-driven header overlay on space sections. */
  tone?: "dark" | "cream";
  className?: string;
};

const TONE = {
  dark: {
    mask: "#1B1006",
    body: "#1B1006",
    eye: "#EEEEE5",
    eyeStroke: "#1B1006",
    pupil: "#1B1006",
    pupilStroke: "#1B1006",
  },
  cream: {
    mask: "#FFFFF5",
    body: "#FFFFF5",
    eye: "#EEEEE5",
    eyeStroke: "#FFFFF5",
    pupil: "#1B1006",
    pupilStroke: "#1B1006",
  },
} as const;

export function StudioLogoMark({
  size = 40,
  trackPupil = false,
  idleGazeBias,
  tone = "dark",
  className = "",
}: Props) {
  const reactId = useId();
  const maskId = `studio-logo-mask${reactId.replace(/:/g, "")}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const pupil = useTrackingPupil({
    svgRef,
    white: WHITE,
    pupilR: PUPIL.r,
    edgeGap: EDGE_GAP,
    viewBoxSize: STUDIO_LOGO_VIEWBOX,
    enabled: trackPupil,
    idleGazeBias: trackPupil ? idleGazeBias : undefined,
  });

  const colors = TONE[tone];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${STUDIO_LOGO_VIEWBOX} ${STUDIO_LOGO_VIEWBOX}`}
      width={size}
      height={size}
      aria-hidden
      className={className ? `block ${className}` : "block"}
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={STUDIO_LOGO_VIEWBOX}
          height={STUDIO_LOGO_VIEWBOX}
          style={{ maskType: "alpha" }}
        >
          <path
            d={MASK_PATH}
            fill={colors.mask}
            stroke={colors.mask}
            strokeWidth={2}
          />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <rect x={-2} y={-2.9993} width={78} height={71} fill={colors.body} />
        <circle
          cx={WHITE.cx}
          cy={WHITE.cy}
          r={WHITE.r}
          fill={colors.eye}
          stroke={colors.eyeStroke}
        />
        <circle
          cx={pupil.cx}
          cy={pupil.cy}
          r={PUPIL.r}
          fill={colors.pupil}
          stroke={colors.pupilStroke}
        />
        <rect
          x={BEAK.x}
          y={BEAK.y}
          width={BEAK.width}
          height={BEAK.height}
          transform={`rotate(${BEAK.rotate} ${BEAK.x} ${BEAK.y})`}
          fill="#FF6767"
        />
      </g>
    </svg>
  );
}
