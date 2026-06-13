import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";

export type StudioHeadingLevel = 1 | 2 | 3 | 4 | 5;

const LEVEL_CLASS: Record<StudioHeadingLevel, string> = {
  1: "text-[68px]",
  2: "text-[44px] md:text-[52px]",
  3: "text-[36px] md:text-[44px]",
  4: "text-[28px] md:text-[32px]",
  5: "text-[22px] md:text-[24px]",
};

const TONE_CLASS = {
  dark: "text-studio-text",
  light: "text-white",
} as const;

type Tone = keyof typeof TONE_CLASS;

/** Shared hero title typography — Instrument Sans, medium, tight tracking. */
export const STUDIO_HEADING_CLASS =
  "font-medium leading-[1.1] tracking-[-0.02em] [-webkit-text-stroke:0.001px_transparent]";

export function studioHeadingClass(
  level: StudioHeadingLevel,
  tone: Tone = "dark",
  extra?: string,
) {
  return [STUDIO_HEADING_CLASS, LEVEL_CLASS[level], TONE_CLASS[tone], extra]
    .filter(Boolean)
    .join(" ");
}

type StudioHeadingProps = {
  level: StudioHeadingLevel;
  as?: ElementType;
  tone?: Tone;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "style" | "children">;

export function StudioHeading({
  level,
  as: Tag = "h2",
  tone = "dark",
  className,
  style,
  children,
  ...rest
}: StudioHeadingProps) {
  return (
    <Tag
      {...rest}
      style={{ fontFamily: "var(--font-instrument-sans)", ...style }}
      className={studioHeadingClass(level, tone, className)}
    >
      {children}
    </Tag>
  );
}
