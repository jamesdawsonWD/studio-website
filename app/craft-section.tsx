import { CraftHorizonContent } from "./craft-horizon-content";
import type { StudioDirection } from "./studio-direction";

// Full-bleed space band — curved heading rides the horizon arc at the bottom.

type CraftSectionProps = {
  direction?: StudioDirection | null;
};

export function CraftSection(_props: CraftSectionProps) {
  return (
    <section
      className="studio-craft-section relative h-full min-h-screen w-full overflow-visible"
      aria-labelledby="craft-heading"
    >
      <CraftHorizonContent />
    </section>
  );
}
