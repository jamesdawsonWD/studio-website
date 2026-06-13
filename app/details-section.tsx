import { EyeGrid } from "./eye-grid";
import { StudioContentRail } from "./studio-content-rail";
import { StudioHeading } from "./studio-heading";

/** Full-bleed details section — eye grid + copy, no card chrome. */
export function DetailsSection() {
  return (
    <section
      className="studio-details-section relative grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden pb-[var(--studio-details-section-pad-bottom,5rem)]"
      aria-labelledby="details-heading"
    >
      <StudioContentRail className="relative z-10 shrink-0 pb-4 pt-8">
        <StudioHeading id="details-heading" level={2} tone="light">
          We are details crazy
        </StudioHeading>
        <p className="mt-3 max-w-md text-[15px] leading-[1.35] tracking-[-0.01em] text-white/80 md:text-[16px]">
          We obsess over the little things that amaze your clients.
        </p>
      </StudioContentRail>
      <StudioContentRail className="relative flex min-h-0 flex-col justify-center overflow-hidden pb-6">
        <EyeGrid />
      </StudioContentRail>
    </section>
  );
}
