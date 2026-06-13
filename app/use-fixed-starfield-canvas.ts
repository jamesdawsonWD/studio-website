"use client";

import { type RefObject, useEffect, useRef } from "react";
import {
  buildStarLayer,
  FIXED_STARFIELD_LAYERS,
  readScrollHeightVh,
  type StarDot,
} from "./studio-starfield-data";

type LayerState = {
  weight: number;
  stars: StarDot[];
};

const STAR_COLOR = "#FFFFF5";
const FIELD_HEIGHT_RATIO = 2.75;

function scrollProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}

function layerDriftPx(weight: number, scrollHeightVh: number): number {
  const progress = scrollProgress();
  return ((progress * weight * scrollHeightVh) / 100) * window.innerHeight;
}

export function useFixedStarfieldCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  active: boolean,
) {
  const layersRef = useRef<LayerState[]>([]);
  const fieldHeightRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;

    const rebuildField = (width: number) => {
      const fieldHeight = Math.max(window.innerHeight * FIELD_HEIGHT_RATIO, 1200);
      fieldHeightRef.current = fieldHeight;
      layersRef.current = FIXED_STARFIELD_LAYERS.map((layer) => ({
        weight: layer.weight,
        stars: buildStarLayer(
          layer.count,
          layer.seed,
          layer.sizeRange,
          width,
          fieldHeight,
        ),
      }));
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuildField(width);
    };

    const draw = (now: number) => {
      if (disposed) return;

      if (!active) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const fieldHeight = fieldHeightRef.current;
      const scrollHeightVh = readScrollHeightVh();

      ctx.clearRect(0, 0, width, height);

      for (const layer of layersRef.current) {
        const drift = layerDriftPx(layer.weight, scrollHeightVh);

        for (const star of layer.stars) {
          let y = (star.y + drift) % fieldHeight;
          if (y < 0) y += fieldHeight;

          const twinkle =
            star.opacityMin +
            (star.opacityMax - star.opacityMin) *
              (0.5 +
                0.5 *
                  Math.sin(now * 0.001 * star.twinkleSpeed + star.phase));

          for (const offset of [-fieldHeight, 0, fieldHeight]) {
            const drawY = y + offset;
            if (drawY < -star.size || drawY > height + star.size) continue;

            ctx.globalAlpha = twinkle;
            ctx.fillStyle = STAR_COLOR;
            ctx.beginPath();
            ctx.arc(star.x, drawY, star.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => resize();

    resize();
    window.addEventListener("resize", onResize, { passive: true });
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, canvasRef]);
}
