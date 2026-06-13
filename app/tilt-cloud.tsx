"use client";

import { useRef } from "react";
import { CloudRain } from "./cloud-rain";
import { useTrackingPupil } from "./use-tracking-pupil";

export type CloudFacing = "left" | "right";

type Props = {
  facing: CloudFacing;
  raining: boolean;
  onToggle: () => void;
};

const VIEWBOX_W = 269;
const VIEWBOX_H = 209;
const PUPIL_R = 19.5;
const EDGE_GAP = 2;

type Puff = { cx: number; cy: number; r: number };

/** Static left / right art — no runtime scaleX flip (keeps pupil tracking natural). */
const CLOUD_ART: Record<
  CloudFacing,
  { puffs: ReadonlyArray<Puff>; white: { cx: number; cy: number; r: number } }
> = {
  left: {
    puffs: [
      { cx: 60.5, cy: 87.5, r: 60.5 },
      { cx: 127.5, cy: 148.5, r: 60.5 },
      { cx: 152.5, cy: 60.5, r: 60.5 },
      { cx: 208.5, cy: 108.5, r: 60.5 },
    ],
    white: { cx: 147.5, cy: 105.5, r: 36.5 },
  },
  right: {
    puffs: [
      { cx: 208.5, cy: 87.5, r: 60.5 },
      { cx: 141.5, cy: 148.5, r: 60.5 },
      { cx: 116.5, cy: 60.5, r: 60.5 },
      { cx: 60.5, cy: 108.5, r: 60.5 },
    ],
    white: { cx: 121.5, cy: 105.5, r: 36.5 },
  },
};

export function TiltCloud({ facing, raining, onToggle }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const art = CLOUD_ART[facing];
  const pupil = useTrackingPupil({
    svgRef,
    white: art.white,
    pupilR: PUPIL_R,
    edgeGap: EDGE_GAP,
    viewBoxSize: VIEWBOX_W,
  });

  return (
    <div className="isolate w-full">
      {raining && <CloudRain sweep={facing === "left" ? "ltr" : "rtl"} />}
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={raining}
        aria-label={`Eye cloud — ${raining ? "raining" : "dry"}`}
        className="relative z-10 block w-full cursor-pointer"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          width={VIEWBOX_W}
          height={VIEWBOX_H}
          aria-hidden
          className={`block w-full select-none transition-[filter] duration-300 ${
            raining ? "brightness-75 saturate-75" : ""
          }`}
        >
          {art.puffs.map((puff) => (
            <circle
              key={`${puff.cx}-${puff.cy}`}
              cx={puff.cx}
              cy={puff.cy}
              r={puff.r}
              fill="#EEEEE5"
            />
          ))}
          <circle
            cx={art.white.cx}
            cy={art.white.cy}
            r={art.white.r}
            fill="#FCFCF4"
          />
          <circle
            cx={pupil.cx}
            cy={pupil.cy}
            r={PUPIL_R}
            fill="#AEAEA5"
            stroke="#D0D0C8"
          />
        </svg>
        <span className="sr-only">Eye cloud {raining ? "raining" : "dry"}</span>
      </button>
    </div>
  );
}
