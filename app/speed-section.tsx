import { BeamHero } from "./beam-hero/beam-hero";
import { StudioContentRail } from "./studio-content-rail";
import { StudioHeading } from "./studio-heading";

/** Full-bleed speed section — beam canvas + copy, no card chrome. */
export function SpeedSection() {
  return (
    <section
      className="studio-speed-section relative flex h-full min-h-0 w-full flex-col overflow-hidden"
      aria-labelledby="speed-heading"
    >
      <StudioContentRail className="relative z-10 shrink-0 pb-2 pt-8">
        <StudioHeading id="speed-heading" level={2} tone="light">
          A need for speed
        </StudioHeading>
        <p className="mt-3 max-w-md text-[15px] leading-[1.35] tracking-[-0.01em] text-white/80 md:text-[16px]">
          We make your software fast by default, no excuse.
        </p>
      </StudioContentRail>
      <div className="studio-speed-canvas relative z-[2] min-h-0 flex-1">
        <BeamHero transparent variant="section" />
      </div>
    </section>
  );
}
