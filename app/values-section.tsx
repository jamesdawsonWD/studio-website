import type { ReactNode } from "react";
import { DiscoverGraphic } from "./discover-graphic";
import { EveryoneGraphic } from "./everyone-graphic";
import { StudioHeading } from "./studio-heading";

// Section content only. Page owns positioning + parallax via ParallaxLayer.

const CARD_RADIUS = 40;
const CARD_MIN_HEIGHT = "min(520px, 62vh)";
const CARD_BG = "var(--color-studio-card)" as const;

type ValueCardProps = {
  title: string;
  description: string;
  graphic: ReactNode;
};

function ValueCard({ title, description, graphic }: ValueCardProps) {
  return (
    <article
      className="flex w-full flex-col overflow-hidden rounded-[40px] shadow-studio-card"
      style={{
        minHeight: CARD_MIN_HEIGHT,
        borderRadius: CARD_RADIUS,
        backgroundColor: CARD_BG,
      }}
    >
      <div className="min-h-0 flex-1" style={{ backgroundColor: CARD_BG }}>
        {graphic}
      </div>
      <div
        className="px-8 pb-8 pt-6 md:px-10 md:pb-10 md:pt-8"
        style={{ backgroundColor: CARD_BG }}
      >
        <StudioHeading level={4} as="h3" tone="light">
          {title}
        </StudioHeading>
        <p className="mt-3 text-[15px] leading-[1.35] tracking-[-0.01em] text-white/80 md:text-[16px]">
          {description}
        </p>
      </div>
    </article>
  );
}

type ValuesSectionProps = {
  /** Kept for studio-scroll variant; parallax spacer now lives on step 9. */
  compact?: boolean;
};

export function ValuesSection(_props: ValuesSectionProps = {}) {
  return (
    <div className="relative flex w-full flex-col items-center px-6 py-6">
      <div className="grid w-full max-w-[1400px] grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <ValueCard
          title="Easy to find"
          description="We maximise SEO and AEO so you can be discovered."
          graphic={<DiscoverGraphic />}
        />
        <ValueCard
          title="Wonderful for everyone"
          description="Our software is built to be a delight for all — accessibility included."
          graphic={<EveryoneGraphic />}
        />
      </div>
    </div>
  );
}
