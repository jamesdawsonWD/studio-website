"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_VIEWBOX = { width: 2400, height: 920 } as const;

/** Deeper arc for the vortex heading — longer copy, tighter bend over the mouth. */
export const VORTEX_HEADING_ARC = {
  viewBoxWidth: 2400,
  viewBoxHeight: 880,
  arcRy: 760,
} as const;

function buildHorizonArcPath(
  width: number,
  arcRy: number,
): string {
  const rx = width / 2;
  return `M 0 ${arcRy} A ${rx} ${arcRy} 0 0 1 ${width} ${arcRy}`;
}

type CraftHorizonHeadingProps = {
  id?: string;
  text?: string;
  className?: string;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  /** Ellipse vertical radius — larger values produce a deeper arc. */
  arcRy?: number;
};

export function CraftHorizonHeading({
  id = "craft-heading",
  text = "Why should you choose us?",
  className,
  viewBoxWidth = DEFAULT_VIEWBOX.width,
  viewBoxHeight = DEFAULT_VIEWBOX.height,
  arcRy = viewBoxHeight / 2,
}: CraftHorizonHeadingProps) {
  const pathId = useId();
  const arcPath = buildHorizonArcPath(viewBoxWidth, arcRy);

  return (
    <div
      className={cn(
        "studio-craft-horizon-heading pointer-events-none",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="studio-craft-horizon-heading__svg"
        aria-hidden
      >
        <defs>
          <path id={pathId} d={arcPath} />
        </defs>
        <text id={id} className="studio-craft-horizon-heading__text">
          <textPath
            href={`#${pathId}`}
            startOffset="50%"
            textAnchor="middle"
            dy="-0.35em"
          >
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
