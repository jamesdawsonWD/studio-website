import {
  CraftHorizonHeading,
  VORTEX_HEADING_ARC,
} from "./craft-horizon-heading";
import { VortexGraphic } from "./vortex/vortex-graphic";

/**
 * Rides the parallax track into view, then a scroll-driven counter-translate
 * on the stage cancels drift so the vortex stays centred for 200vh.
 */
export function VortexSection() {
  return (
    <section
      className="studio-vortex-section relative h-[var(--studio-vortex-height,200vh)] w-full overflow-visible"
      aria-labelledby="vortex-heading"
    >
      <div className="studio-vortex-stage flex h-screen w-full items-center justify-center overflow-visible">
        <div className="studio-vortex-heading pointer-events-none">
          <CraftHorizonHeading
            id="vortex-heading"
            text="Our websites are one of a kind"
            className="studio-vortex-horizon-heading"
            viewBoxWidth={VORTEX_HEADING_ARC.viewBoxWidth}
            viewBoxHeight={VORTEX_HEADING_ARC.viewBoxHeight}
            arcRy={VORTEX_HEADING_ARC.arcRy}
          />
        </div>
        <div className="studio-vortex-zoom flex items-center justify-center">
          <VortexGraphic />
        </div>
      </div>
    </section>
  );
}
