"use client";

import { AnimatedStudioHeading } from "./animated-studio-heading";

const LINES = [
  ["You", "can't", "afford"],
  ["to", "be", "boring"],
] as const;

export function HeroTitle() {
  return (
    <AnimatedStudioHeading
      lines={LINES}
      level={1}
      as="h1"
      animationKey="hero"
    />
  );
}
