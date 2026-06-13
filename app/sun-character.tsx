"use client";

import { useEffect, useRef } from "react";
import { useTrackingPupil } from "./use-tracking-pupil";

export const SUN_VIEWBOX = 608;

const SUN_TILT_DEG = 13.7621;
const RECT_PIVOT = { x: 162.89, y: 55.0771 };

/** Rendered centre of the tilted yellow disk — ray orbit pivot. */
const SUN_HUB = { cx: 308.837, cy: 295.704 };

const WHITE = { cx: 261.222, cy: 338.786, r: 99.5 };
const PUPIL_R = 49.5;
const EDGE_GAP = 2;
const RAY_ORBIT_MS = 28_000;

/** Original Group 60 rays in absolute viewBox coordinates. */
const RAYS = [
  "M106.684 76.1767L178.319 102.187L119.976 151.219L106.684 76.1767Z",
  "M221.851 17.1953L279.147 67.4461L206.981 91.9406L221.851 17.1953Z",
  "M364.582 9.77472L387.073 82.5907L312.767 65.6603L364.582 9.77472Z",
  "M477.208 50.9405L477.063 127.151L411.136 88.9198L477.208 50.9405Z",
  "M555.028 127.996L527.888 199.21L479.785 140.098L555.028 127.996Z",
  "M600.088 246.256L541.337 294.798L528.674 219.648L600.088 246.256Z",
  "M597.278 365.366L524.747 388.762L540.751 314.251L597.278 365.366Z",
  "M549.499 472.782L473.5 467.107L516.414 404.128L549.499 472.782Z",
  "M466.438 557.215L397.423 524.89L459.925 481.284L466.438 557.215Z",
  "M349.63 600.817L301.369 541.835L376.58 529.531L349.63 600.817Z",
  "M227.686 593.914L206.731 520.641L280.665 539.13L227.686 593.914Z",
  "M116.173 533.264L122.422 457.311L185.075 500.699L116.173 533.264Z",
  "M28.7897 437.673L67.2582 371.884L104.999 438.093L28.7897 437.673Z",
  "M3.23542 312.22L66.2548 269.365L71.8587 345.369L3.23542 312.22Z",
  "M20.0272 197.464L93.4706 177.115L74.3712 250.893L20.0272 197.464Z",
] as const;

type Props = {
  className?: string;
};

export function SunCharacter({ className = "" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const raysRef = useRef<SVGGElement>(null);
  const pupil = useTrackingPupil({
    svgRef,
    white: WHITE,
    pupilR: PUPIL_R,
    edgeGap: EDGE_GAP,
    viewBoxSize: SUN_VIEWBOX,
  });

  useEffect(() => {
    const rays = raysRef.current;
    if (!rays) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const { cx, cy } = SUN_HUB;
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const angle = (((now - start) % RAY_ORBIT_MS) / RAY_ORBIT_MS) * 360;
      rays.setAttribute("transform", `rotate(${angle} ${cx} ${cy})`);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SUN_VIEWBOX} ${SUN_VIEWBOX}`}
      aria-hidden
      className={className ? `block w-full ${className}` : "block w-full"}
    >
      <g ref={raysRef} className="studio-sun-rays">
        {RAYS.map((d) => (
          <path key={d} d={d} fill="#FF9A67" />
        ))}
      </g>

      <rect
        x="162.89"
        y="55.0771"
        width="398"
        height="398"
        rx="199"
        transform={`rotate(${SUN_TILT_DEG} ${RECT_PIVOT.x} ${RECT_PIVOT.y})`}
        fill="#FFE872"
        stroke="#FFDA1C"
        strokeWidth="2"
      />

      <circle
        cx={WHITE.cx}
        cy={WHITE.cy}
        r={WHITE.r}
        fill="#FFFFEF"
        stroke="#CDB32F"
      />
      <circle
        cx={pupil.cx}
        cy={pupil.cy}
        r={PUPIL_R}
        fill="#51460B"
        stroke="#FFDA1C"
      />
    </svg>
  );
}
