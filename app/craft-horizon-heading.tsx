"use client";

import { useId } from "react";

/** Matches `.studio-craft-horizon` box — top arc of this ellipse is the text path. */
const HORIZON_VIEWBOX = { width: 2400, height: 920 } as const;
const HORIZON_RX = HORIZON_VIEWBOX.width / 2;
const HORIZON_RY = HORIZON_VIEWBOX.height / 2;

/** Upper semicircle: same curve as the cream horizon mask. */
const HORIZON_ARC_PATH = `M 0 ${HORIZON_RY} A ${HORIZON_RX} ${HORIZON_RY} 0 0 1 ${HORIZON_VIEWBOX.width} ${HORIZON_RY}`;

type CraftHorizonHeadingProps = {
  id?: string;
  text?: string;
};

export function CraftHorizonHeading({
  id = "craft-heading",
  text = "Why should you choose us?",
}: CraftHorizonHeadingProps) {
  const pathId = useId();

  return (
    <div className="studio-craft-horizon-heading pointer-events-none">
      <svg
        viewBox={`0 0 ${HORIZON_VIEWBOX.width} ${HORIZON_VIEWBOX.height}`}
        className="studio-craft-horizon-heading__svg"
        aria-hidden
      >
        <defs>
          <path id={pathId} d={HORIZON_ARC_PATH} />
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
