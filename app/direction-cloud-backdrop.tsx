import type { CSSProperties } from "react";
import type { DirectionCloudSide } from "./direction-cloud-art";
import { DirectionPlainCloud } from "./direction-plain-cloud";

type BackdropCloud = {
  left: string;
  top: string;
  width: string;
  side: DirectionCloudSide;
  zIndex: number;
  drift: string;
  /** Lighter layers sit in front — nudge tone up per step. */
  lighten: number;
};

/** A few large clouds spanning the width — same scale as the rain eye clouds. */
const CLOUDS: ReadonlyArray<BackdropCloud> = [
  {
    left: "-34%",
    top: "10%",
    width: "min(80vw, 840px)",
    side: "left",
    zIndex: 0,
    drift: "8vw",
    lighten: 1.22,
  },
  {
    left: "-14%",
    top: "54%",
    width: "min(78vw, 820px)",
    side: "right",
    zIndex: 1,
    drift: "4vw",
    lighten: 1,
  },
  {
    left: "12%",
    top: "40%",
    width: "min(86vw, 900px)",
    side: "left",
    zIndex: 2,
    drift: "11vw",
    lighten: 1.06,
  },
  {
    left: "34%",
    top: "48%",
    width: "min(82vw, 860px)",
    side: "right",
    zIndex: 3,
    drift: "18vw",
    lighten: 1.12,
  },
  {
    left: "58%",
    top: "36%",
    width: "min(80vw, 840px)",
    side: "left",
    zIndex: 4,
    drift: "25vw",
    lighten: 1.18,
  },
];

export function DirectionCloudBackdrop() {
  return (
    <div
      aria-hidden
      className="studio-direction-cloud-backdrop pointer-events-none absolute inset-0 overflow-x-clip overflow-y-visible"
    >
      {CLOUDS.map((cloud) => (
        <div
          key={`${cloud.left}-${cloud.top}`}
          className="studio-direction-cloud-backdrop-row absolute origin-bottom"
          style={
            {
              left: cloud.left,
              top: cloud.top,
              width: cloud.width,
              zIndex: cloud.zIndex,
              "--studio-backdrop-scale": 1,
              "--studio-backdrop-drift": cloud.drift,
              filter: `brightness(${cloud.lighten})`,
            } as CSSProperties
          }
        >
          <DirectionPlainCloud side={cloud.side} />
        </div>
      ))}
    </div>
  );
}
