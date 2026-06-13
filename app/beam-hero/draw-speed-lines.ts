import { random } from "./math";
import type { CanvasLayout, SpeedLine } from "./types";

const LINE_COLOR = "#FFFFF5";

export function createSpeedLines(
  layout: CanvasLayout,
  count: number,
): SpeedLine[] {
  const padding = layout.height * 0.08;
  return Array.from({ length: count }, () => createLine(layout, padding));
}

const THICK_LINE_SPEED = [10, 18] as const;
const THIN_LINE_SPEED = [7, 13] as const;

function createLine(layout: CanvasLayout, padding: number): SpeedLine {
  const thick = Math.random() > 0.68;
  return {
    x: random(-layout.width * 0.9, layout.width),
    y: random(padding, layout.height - padding),
    width: thick ? random(92, 210) : random(100, 290),
    speed: thick
      ? random(THICK_LINE_SPEED[0] * 1.25, THICK_LINE_SPEED[1] * 1.25)
      : random(THIN_LINE_SPEED[0] * 1.35, THIN_LINE_SPEED[1] * 1.35),
    opacity: thick ? random(0.72, 0.95) : random(0.28, 0.58),
    thickness: thick ? random(5, 7) : 1,
  };
}

export function updateSpeedLines(
  lines: SpeedLine[],
  layout: CanvasLayout,
  dt: number,
): void {
  const padding = layout.height * 0.08;

  for (const line of lines) {
    line.x += line.speed * dt * 60;

    if (line.x - line.width > layout.width) {
      line.x = -line.width - random(20, layout.width * 0.45);
      line.y = random(padding, layout.height - padding);
    }
  }
}

export function drawSpeedLines(
  ctx: CanvasRenderingContext2D,
  lines: SpeedLine[],
): void {
  ctx.save();
  ctx.lineCap = "round";

  for (const line of lines) {
    ctx.globalAlpha = line.opacity;
    ctx.lineWidth = line.thickness;
    const gradient = ctx.createLinearGradient(
      line.x,
      line.y,
      line.x + line.width,
      line.y,
    );
    gradient.addColorStop(0, "rgba(255, 255, 245, 0)");
    gradient.addColorStop(0.42, "rgba(255, 255, 245, 0.42)");
    gradient.addColorStop(1, LINE_COLOR);
    ctx.strokeStyle = gradient;

    if (line.thickness > 2) {
      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(line.x + line.width, line.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(line.x, line.y + 0.5);
      ctx.lineTo(line.x + line.width, line.y + 0.5);
      ctx.stroke();
    }
  }

  ctx.restore();
}
