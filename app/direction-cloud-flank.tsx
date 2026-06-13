import type { CSSProperties } from "react";
import { CloudRain } from "./cloud-rain";
import { DirectionDarkCloud } from "./direction-dark-cloud";

const FLANK_WIDTH = "min(82vw, 860px)";

export function DirectionCloudFlank() {
  return (
    <>
      <div
        aria-hidden
        className="studio-direction-cloud studio-direction-cloud--left pointer-events-none absolute top-[58%] left-0 z-[5] flex items-end justify-start"
        style={
          {
            width: FLANK_WIDTH,
            "--studio-direction-cloud-scale": 1,
          } as CSSProperties
        }
      >
        <div className="relative isolate w-full">
          <CloudRain sweep="ltr" />
          <DirectionDarkCloud side="left" className="studio-direction-cloud-art" />
        </div>
      </div>

      <div
        aria-hidden
        className="studio-direction-cloud studio-direction-cloud--right pointer-events-none absolute top-[58%] right-0 z-[5] flex items-end justify-end"
        style={
          {
            width: FLANK_WIDTH,
            "--studio-direction-cloud-scale": 1,
          } as CSSProperties
        }
      >
        <div className="relative isolate w-full">
          <CloudRain sweep="rtl" />
          <DirectionDarkCloud side="right" className="studio-direction-cloud-art" />
        </div>
      </div>
    </>
  );
}
