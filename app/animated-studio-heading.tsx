"use client";

import { motion } from "motion/react";
import type { ElementType } from "react";
import {
  type StudioHeadingLevel,
  studioHeadingClass,
} from "./studio-heading";

const TIMING = {
  stagger: 80,
  duration: 600,
};

const hidden = {
  opacity: 0,
  y: "100%",
  rotateX: -80,
  z: 0,
};

const visible = {
  opacity: 1,
  y: 0,
  rotateX: 0,
  z: 0,
};

type WordSpanProps = {
  word: string;
  index: number;
  active: boolean;
  timing?: AnimatedStudioHeadingProps["timing"];
};

function WordSpan({ word, index, active, timing }: WordSpanProps) {
  const stagger = timing?.stagger ?? TIMING.stagger;
  const duration = timing?.duration ?? TIMING.duration;
  const baseDelay = timing?.delay ?? 0;

  return (
    <motion.span
      initial={hidden}
      animate={active ? visible : hidden}
      transition={{
        duration: duration / 1000,
        delay: (baseDelay + index * stagger) / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        display: "inline-block",
        position: "relative",
        transformOrigin: "bottom",
      }}
    >
      {word}
    </motion.span>
  );
}

export type AnimatedStudioLines = readonly (readonly string[])[];

type AnimatedStudioHeadingProps = {
  lines: AnimatedStudioLines;
  level: StudioHeadingLevel;
  as?: ElementType;
  className?: string;
  id?: string;
  animationKey?: string;
  /** When false, words stay hidden. Defaults to true (plays immediately). */
  active?: boolean;
  timing?: {
    delay?: number;
    stagger?: number;
    duration?: number;
  };
};

export function AnimatedStudioHeading({
  lines,
  level,
  as,
  className,
  id,
  animationKey,
  active = true,
  timing,
}: AnimatedStudioHeadingProps) {
  const Tag = as ?? (level === 1 ? "h1" : "h2");
  let wordIndex = 0;

  return (
    <Tag
      id={id}
      key={animationKey}
      style={{
        fontFamily: "var(--font-instrument-sans)",
        perspective: 600,
        overflow: "hidden",
        paddingBottom: level === 1 ? 16 : 0,
      }}
      className={studioHeadingClass(level, "dark", className)}
    >
      {lines.map((line, lineIndex) => (
        <span key={`${animationKey ?? "default"}-${line.join("-")}`}>
          {lineIndex > 0 ? <br /> : null}
          {line.map((word, i) => {
            const index = wordIndex++;
            return (
              <span key={`${word}-${index}`}>
                <WordSpan word={word} index={index} active={active} timing={timing} />
                {i < line.length - 1 ? " " : null}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
