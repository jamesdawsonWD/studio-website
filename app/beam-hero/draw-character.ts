import type { CanvasLayout } from "./types";

type DrawCharacterOptions = {
  characterY: number;
  time: number;
  reducedMotion?: boolean;
};

const MASCOT_ASPECT = 156 / 136;

export function getCharacterSize(layout: CanvasLayout): number {
  return Math.min(layout.width * 0.22, layout.height * 0.38, 110);
}

/** Main body circle diameter — equals rendered mascot height (136/136 viewBox). */
export function getMascotBodyDiameter(layout: CanvasLayout): number {
  return getCharacterSize(layout) / MASCOT_ASPECT;
}

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  mascot: HTMLImageElement,
  layout: CanvasLayout,
  options: DrawCharacterOptions,
): void {
  const { characterY, time, reducedMotion = false } = options;
  const size = getCharacterSize(layout);
  const width = size;
  const height = size / MASCOT_ASPECT;

  const idleBob = reducedMotion ? 0 : Math.sin(time * 0.002) * 3;

  const drawX = layout.characterX - width * 0.42;
  const drawY = characterY + idleBob - height / 2;

  ctx.drawImage(mascot, drawX, drawY, width, height);
}
