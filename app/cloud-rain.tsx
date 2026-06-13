"use client";

import { useId } from "react";

const RAIN_LINES = 60;
const RAIN_HEIGHT = 1200;
const RAIN_WIDTH = 260;
const RAIN_COLOR = "#4b5563";
/** Fade the lower third of the column so drops dissolve before the SVG edge. */
const RAIN_MASK_FADE_FROM = 780;

export type RainSweep = "ltr" | "rtl";

type Props = {
  className?: string;
  /** Horizontal phase — rtl mirrors positions and reverses the left→right stagger. */
  sweep?: RainSweep;
};

function lineX(index: number, sweep: RainSweep) {
  const x = 65 + (index / (RAIN_LINES - 1)) * 130;
  return sweep === "rtl" ? RAIN_WIDTH - x : x;
}

function lineDelay(index: number, sweep: RainSweep) {
  const phased = sweep === "rtl" ? RAIN_LINES - 1 - index : index;
  const stagger = (phased / RAIN_LINES) * 0.62;
  const jitter = (((phased * 173) % 700) / 1000) * 0.28;
  return stagger + jitter;
}

/** Falling rain lines — shared by hero tilt clouds and direction dark clouds. */
export function CloudRain({ className = "", sweep = "ltr" }: Props) {
  const uid = useId().replace(/:/g, "");
  const fadeGradientId = `studio-rain-fade-${uid}`;
  const fadeMaskId = `studio-rain-mask-${uid}`;

  return (
    <svg
      aria-hidden
      className={[
        "pointer-events-none absolute left-0 top-[40%] z-0 h-[1200px] w-full overflow-visible",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      viewBox={`0 0 ${RAIN_WIDTH} ${RAIN_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={fadeGradientId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={RAIN_MASK_FADE_FROM}
          x2="0"
          y2={RAIN_HEIGHT}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </linearGradient>
        <mask
          id={fadeMaskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={RAIN_WIDTH}
          height={RAIN_HEIGHT}
        >
          <rect x="0" y="0" width={RAIN_WIDTH} height={RAIN_MASK_FADE_FROM} fill="white" />
          <rect
            x="0"
            y={RAIN_MASK_FADE_FROM}
            width={RAIN_WIDTH}
            height={RAIN_HEIGHT - RAIN_MASK_FADE_FROM}
            fill={`url(#${fadeGradientId})`}
          />
        </mask>
      </defs>
      <g mask={`url(#${fadeMaskId})`}>
        {Array.from({ length: RAIN_LINES }).map((_, i) => {
          const x = lineX(i, sweep);
          const delay = lineDelay(i, sweep);
          const duration = 0.45 + ((i * 53) % 250) / 1000;
          return (
            <g
              key={i}
              className="studio-rain-line"
              style={{
                animationName: "studio-rain-fall",
                animationDuration: `${duration}s`,
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
                animationDelay: `-${delay}s`,
              }}
            >
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={36}
                stroke={RAIN_COLOR}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
