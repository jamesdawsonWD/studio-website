"use client";

import { useRef } from "react";
import {
  DIRECTION_CLOUD_PUFFS_RIGHT,
  DIRECTION_CLOUD_PUFF_R,
  DIRECTION_CLOUD_VIEWBOX_H,
  DIRECTION_CLOUD_VIEWBOX_W,
  DIRECTION_CLOUD_WHITE_RIGHT,
  mirrorDirectionCloudPuffs,
  mirrorDirectionCloudWhite,
  type DirectionCloudSide,
} from "./direction-cloud-art";
import { useTrackingPupil } from "./use-tracking-pupil";

export type { DirectionCloudSide } from "./direction-cloud-art";

const PUPIL_R = 27.2512;
const EDGE_GAP = 2;

const CLOUD_ART = {
  right: {
    puffs: DIRECTION_CLOUD_PUFFS_RIGHT,
    white: DIRECTION_CLOUD_WHITE_RIGHT,
  },
  left: {
    puffs: mirrorDirectionCloudPuffs(DIRECTION_CLOUD_PUFFS_RIGHT),
    white: mirrorDirectionCloudWhite(DIRECTION_CLOUD_WHITE_RIGHT),
  },
} as const;

type Props = {
  side: DirectionCloudSide;
  className?: string;
};

export function DirectionDarkCloud({ side, className = "" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const art = CLOUD_ART[side];
  const pupil = useTrackingPupil({
    svgRef,
    white: art.white,
    pupilR: PUPIL_R,
    edgeGap: EDGE_GAP,
    viewBoxSize: DIRECTION_CLOUD_VIEWBOX_W,
    idleGazeBias: side,
  });

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${DIRECTION_CLOUD_VIEWBOX_W} ${DIRECTION_CLOUD_VIEWBOX_H}`}
      aria-hidden
      className={className ? `block w-full ${className}` : "block w-full"}
    >
      {art.puffs.map((puff) => (
        <circle
          key={`${puff.cx}-${puff.cy}-${puff.fill}`}
          cx={puff.cx}
          cy={puff.cy}
          r={DIRECTION_CLOUD_PUFF_R}
          fill={puff.fill}
        />
      ))}
      <circle
        cx={art.white.cx}
        cy={art.white.cy}
        r={art.white.r}
        fill="#E2E2DB"
      />
      <circle
        cx={pupil.cx}
        cy={pupil.cy}
        r={PUPIL_R}
        fill="#44443F"
        stroke="#D0D0C8"
      />
    </svg>
  );
}
