"use client";

import {
  DIRECTION_PATHS,
  STUDIO_DIRECTION_OPTIONS,
  type StudioDirection,
} from "./studio-direction";
import { StudioHeading } from "./studio-heading";

type DirectionPathSectionProps = {
  direction: StudioDirection;
  onChangeDirection: () => void;
};

export function DirectionPathSection({
  direction,
  onChangeDirection,
}: DirectionPathSectionProps) {
  const path = DIRECTION_PATHS[direction];
  const label =
    STUDIO_DIRECTION_OPTIONS.find((o) => o.id === direction)?.label ?? "";

  return (
    <div className="flex h-full min-h-screen w-full items-center justify-center px-6">
      <section className="w-full max-w-[720px] text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Your direction
        </p>
        <p className="mt-2 text-sm font-medium text-neutral-700">{label}</p>
        <StudioHeading level={2} as="h2" className="mt-6">
          {path.headline}
        </StudioHeading>
        <p className="mt-5 text-[17px] leading-[1.4] tracking-[-0.01em] text-neutral-700 md:text-[19px]">
          {path.description}
        </p>
        <ul className="mt-8 flex flex-col gap-3 text-left md:mx-auto md:max-w-md">
          {path.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-3 text-[15px] leading-snug text-neutral-800"
            >
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full bg-studio-ink"
                aria-hidden
              />
              {bullet}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onChangeDirection}
          className="mt-10 text-sm font-medium text-neutral-500 underline-offset-2 transition hover:text-neutral-800 hover:underline"
        >
          Choose a different direction
        </button>
        <p className="mt-6 text-sm text-neutral-500">Keep scrolling</p>
      </section>
    </div>
  );
}
