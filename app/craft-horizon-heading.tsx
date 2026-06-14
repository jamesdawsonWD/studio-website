"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_VIEWBOX = { width: 2400, height: 920 } as const;

/** Deeper arc for the vortex heading — longer copy, tighter bend over the mouth. */
export const VORTEX_HEADING_ARC = {
  viewBoxWidth: 2400,
  viewBoxHeight: 880,
  arcRy: 760,
} as const;

function buildHorizonArcPath(
  width: number,
  arcRy: number,
  yShift = 0,
): string {
  const rx = width / 2;
  const y = arcRy + yShift;
  return `M 0 ${y} A ${rx} ${arcRy} 0 0 1 ${width} ${y}`;
}

type HeroStatLine = {
  type: "hero-stat";
  value: string;
  suffix: string;
};

type CraftHorizonLine = string | HeroStatLine;

type CraftHorizonHeadingProps = {
  id?: string;
  text?: string | readonly CraftHorizonLine[];
  className?: string;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  /** Ellipse vertical radius — larger values produce a deeper arc. */
  arcRy?: number;
};

function isHeroStatLine(line: CraftHorizonLine): line is HeroStatLine {
  return typeof line === "object" && line.type === "hero-stat";
}

function normalizeLines(text: string | readonly CraftHorizonLine[]): CraftHorizonLine[] {
  if (typeof text === "string") return [text];
  return [...text];
}

function getLineYShifts(
  lines: CraftHorizonLine[],
  viewBoxHeight: number,
): number[] {
  const baseGap = viewBoxHeight * 0.085;
  const heroGap = viewBoxHeight * 0.14;

  const shifts: number[] = [];
  let cumulative = 0;

  for (let index = 0; index < lines.length; index++) {
    shifts[index] = -cumulative;

    if (index < lines.length - 1) {
      const current = lines[index];
      const next = lines[index + 1];
      cumulative +=
        isHeroStatLine(current) || isHeroStatLine(next) ? heroGap : baseGap;
    }
  }

  return shifts;
}

function renderLineContent(line: CraftHorizonLine) {
  if (!isHeroStatLine(line)) return line;

  return (
    <>
      <tspan className="studio-craft-horizon-heading__hero-stat">
        {line.value}
      </tspan>
      <tspan className="studio-craft-horizon-heading__hero-stat-suffix" dy="0.28em">
        {line.suffix}
      </tspan>
    </>
  );
}

export function CraftHorizonHeading({
  id = "craft-heading",
  text = [
    "We can bring your next idea to life.",
    "design and engineering experience.",
    { type: "hero-stat", value: "10", suffix: " years" },
  ],
  className,
  viewBoxWidth = DEFAULT_VIEWBOX.width,
  viewBoxHeight = DEFAULT_VIEWBOX.height,
  arcRy = viewBoxHeight / 2,
}: CraftHorizonHeadingProps) {
  const pathId = useId();
  const lines = normalizeLines(text);
  const lineYShifts = getLineYShifts(lines, viewBoxHeight);

  return (
    <div
      className={cn(
        "studio-craft-horizon-heading pointer-events-none",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="studio-craft-horizon-heading__svg"
        aria-hidden
      >
        <defs>
          {lines.map((_, index) => (
            <path
              key={index}
              id={`${pathId}-${index}`}
              d={buildHorizonArcPath(
                viewBoxWidth,
                arcRy,
                lineYShifts[index],
              )}
            />
          ))}
        </defs>
        {lines.map((line, index) => (
          <text
            key={index}
            id={index === 0 ? id : undefined}
            className={cn(
              "studio-craft-horizon-heading__text",
              isHeroStatLine(line) &&
                "studio-craft-horizon-heading__text--hero-stat",
            )}
          >
            <textPath
              href={`#${pathId}-${index}`}
              startOffset="50%"
              textAnchor="middle"
              dy={isHeroStatLine(line) ? "-0.55em" : "-0.35em"}
            >
              {renderLineContent(line)}
            </textPath>
          </text>
        ))}
      </svg>
    </div>
  );
}
