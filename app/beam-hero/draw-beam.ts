import { getBeamSliceY } from "./beam-curve";
import { getMascotBodyDiameter } from "./draw-character";
import type { BeamConfig, CanvasLayout } from "./types";

export function drawBeam(
  ctx: CanvasRenderingContext2D,
  beamSlice: HTMLImageElement,
  layout: CanvasLayout,
  config: BeamConfig,
  headY: number,
  tailY: number,
): void {
  const beamStartX = layout.characterX + config.beamOffsetX;
  const beamLength = layout.width - beamStartX;
  const sliceHeight = beamSlice.naturalHeight || beamSlice.height;
  const sourceWidth = beamSlice.naturalWidth || 1;
  const drawHeight = getMascotBodyDiameter(layout);
  const curveAmount = Math.abs(headY - tailY);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (curveAmount < 0.75) {
    const y = headY + (tailY - headY) * 0.5;
    ctx.drawImage(
      beamSlice,
      0,
      0,
      sourceWidth,
      sliceHeight,
      beamStartX,
      y - drawHeight / 2,
      beamLength,
      drawHeight,
    );
    ctx.restore();
    return;
  }

  for (let x = 0; x < beamLength; x += 1) {
    const sliceY = getBeamSliceY(x, beamLength, headY, tailY);
    ctx.drawImage(
      beamSlice,
      0,
      0,
      sourceWidth,
      sliceHeight,
      beamStartX + x,
      sliceY - drawHeight / 2,
      1,
      drawHeight,
    );
  }

  ctx.restore();
}
