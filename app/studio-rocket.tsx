"use client";

import { type CSSProperties, useRef } from "react";
import { useTrackingPupil } from "./use-tracking-pupil";
import { useViewportVisible, VIEWPORT_CULL_MARGIN } from "./use-viewport-visible";

const VIEWBOX = 121;
const SIZE = 96;
const MASK_ID = "studio-rocket-mask";

/** Mascot body circle — rocket rest pose replaces this planet at the same centre. */
const MASCOT_BODY_DIAMETER = 136;
const MASCOT_BODY_RADIUS = MASCOT_BODY_DIAMETER / 2;
/** Rest scale — well above planet size so the rocket reads as the hero body. */
const LAUNCH_SCALE = 2.85;
/** Fin tip in viewBox coords — rest pose aligns this to the viewport bottom. */
const FIN_BOTTOM_Y = 116;
/** Lift the rest pose up from the bottom edge. */
const REST_LIFT = 45;

type Props = {
  /** Hero-only: optional lift for scroll launch keyframes. Fixed variant anchors to the bottom. */
  planetPeak?: number;
  /** `fixed` = original parallax page. `hero` = absolute in hero, launches on section scroll.
   *  `vortex` = re-enters from below during the vortex zoom phase. */
  variant?: "fixed" | "hero" | "vortex";
  /** Unmount rocket art when off-screen (fixed variant only). */
  culled?: boolean;
};

const WHITE = { cx: 60.3001, cy: 57.068, r: 21.5803 };
const PUPIL = { r: 11.6822 };
const EDGE_GAP = 2.5;

const PARTICLE_COLORS = ["#FFE082", "#FFB74D", "#FF7043", "#FF6767", "#FFA000"];
const PARTICLE_COUNT = 26;

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const xPx = ((i * 37) % 21) - 10;
  const size = Math.max(8, 22 - Math.abs(xPx));
  return {
    xPx,
    size,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    duration: 0.6 + (i % 5) * 0.13,
    delay: ((i * 91) % 800) / 1000,
  };
});

/** Nozzle throat in viewBox coords — particles emit here, behind the fin overlay. */
const NOZZLE_TOP_PCT = `${(101 / VIEWBOX) * 100}%`;

export function StudioRocket({
  planetPeak = 0,
  variant = "fixed",
  culled = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = useViewportVisible(rootRef, {
    enabled: culled && variant !== "hero",
    rootMargin: VIEWPORT_CULL_MARGIN,
  });
  const svgRef = useRef<SVGSVGElement>(null);
  const belowCenter = (FIN_BOTTOM_Y / VIEWBOX) * SIZE - SIZE / 2;
  const scaledHalf = belowCenter * LAUNCH_SCALE;
  /** Fin tip at rest, lifted above the viewport bottom. */
  const restBottom = scaledHalf - SIZE / 2 + REST_LIFT;
  const restOffset = restBottom;
  const rocketStyle = {
    "--studio-rocket-launch-scale": String(LAUNCH_SCALE),
    "--studio-rocket-planet-radius": `${MASCOT_BODY_RADIUS}px`,
    "--studio-rocket-rest-drop": "0px",
    "--studio-rocket-rest-bottom": `${restBottom}px`,
    "--studio-rocket-scaled-half": `${scaledHalf}px`,
  } as CSSProperties;

  const heroStyle =
    variant === "hero"
      ? ({
          ...rocketStyle,
          "--studio-rocket-planet-peak": `${planetPeak}px`,
          "--studio-rocket-half-height": `${SIZE / 2}px`,
        } as CSSProperties)
      : ({
          ...rocketStyle,
          "--studio-rocket-rest-offset": `${restOffset}px`,
        } as CSSProperties);
  const pupil = useTrackingPupil({
    svgRef,
    white: WHITE,
    pupilR: PUPIL.r,
    edgeGap: EDGE_GAP,
    viewBoxSize: VIEWBOX,
    enabled: !culled || visible || variant === "hero" || variant === "vortex",
  });

  const rootClassName =
    variant === "hero"
      ? "studio-scroll-rocket pointer-events-none absolute left-1/2 z-50 w-24"
      : variant === "vortex"
        ? "studio-vortex-rocket pointer-events-none fixed left-1/2 top-1/2 z-50 w-24"
        : "studio-rocket pointer-events-none fixed left-1/2 top-1/2 z-50 w-24";

  const particlesClassName =
    variant === "hero"
      ? "studio-scroll-particles absolute left-1/2 z-[5] h-0 w-full -translate-x-1/2"
      : variant === "vortex"
        ? "studio-vortex-rocket-particles absolute left-1/2 z-[5] h-0 w-full -translate-x-1/2"
        : "studio-particles absolute left-1/2 z-[5] h-0 w-full -translate-x-1/2";

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={rootClassName}
      style={heroStyle}
    >
      {!culled || visible || variant === "hero" || variant === "vortex" ? (
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          width={SIZE}
          height={SIZE}
          className="relative z-10 block"
        >
          <defs>
            <mask
              id={MASK_ID}
              maskUnits="userSpaceOnUse"
              x="20"
              y="1"
              width="80"
              height="110"
              style={{ maskType: "alpha" }}
            >
              <path
                d="M84.5357 94.9473L76.5628 102.92C67.5807 111.902 53.0179 111.902 44.0359 102.92L36.063 94.9473C16.9273 75.8116 16.9273 44.7866 36.063 25.6509L58.178 3.53583C59.3496 2.36425 61.2491 2.36425 62.4207 3.53583L84.5357 25.6509C103.671 44.7866 103.671 75.8116 84.5357 94.9473Z"
                fill="#1B1006"
                stroke="#1B1006"
                strokeWidth={2}
              />
            </mask>
          </defs>
          <g mask={`url(#${MASK_ID})`}>
            <path
              d="M94.5782 90.6259C75.052 110.152 43.3938 110.152 23.8676 90.6259L-24.765 41.9933L16.3302 0.898047C35.8564 -18.6282 67.5147 -18.6282 87.0409 0.898064L135.673 49.5307L94.5782 90.6259Z"
              fill="#1B1006"
            />
            <circle
              cx={WHITE.cx}
              cy={WHITE.cy}
              r={WHITE.r}
              fill="#EEEEE5"
              stroke="#1B1006"
            />
            <circle
              cx={pupil.cx}
              cy={pupil.cy}
              r={PUPIL.r}
              fill="#1B1006"
              stroke="#1B1006"
            />
            <path
              d="M35 24L35 1.90735e-06L84 -1.57847e-07L84 24L35 24Z"
              fill="#FF6767"
            />
          </g>
        </svg>

        <div
          className={particlesClassName}
          style={{ top: NOZZLE_TOP_PCT }}
        >
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute block rounded-full"
              style={{
                top: 0,
                left: `calc(50% + ${p.xPx - p.size / 2}px)`,
                width: p.size,
                height: p.size,
                background: p.color,
                opacity: variant === "vortex" ? 1 : 0.85,
                animationName: "studio-particle-flame",
                animationDuration: `${p.duration}s`,
                animationIterationCount: "infinite",
                animationDelay: `-${p.delay}s`,
                animationTimingFunction: "linear",
              }}
            />
          ))}
        </div>

        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          width={SIZE}
          height={SIZE}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 block"
        >
          <path d="M42 101L79 101L91 116H29L42 101Z" fill="#1B1006" />
        </svg>
      </div>
      ) : null}
    </div>
  );
}
