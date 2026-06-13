"use client";

import { type CSSProperties, useRef } from "react";
import { useViewportVisible, VIEWPORT_CULL_MARGIN } from "../use-viewport-visible";
import {
  VORTEX_CENTER,
  VORTEX_LAYERS,
  VORTEX_VIEWBOX,
} from "./vortex-paths";
import { useVortexParticles } from "./use-vortex-particles";
import { VortexEyeOverlay } from "./vortex-eye-overlay";

const STROKE_WIDTH = 86;

export function VortexGraphic() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visible = useViewportVisible(rootRef, { rootMargin: VIEWPORT_CULL_MARGIN });

  useVortexParticles(canvasRef, visible);

  return (
    <div
      ref={rootRef}
      className="studio-vortex-graphic relative aspect-[438/447] w-[min(72vw,420px)] max-w-full"
      aria-hidden
    >
      <svg
        viewBox={`0 0 ${VORTEX_VIEWBOX.width} ${VORTEX_VIEWBOX.height}`}
        className="relative z-[1] h-full w-full overflow-visible"
        fill="none"
      >
        {VORTEX_LAYERS.map((layer) => (
          <g
            key={layer.id}
            transform={`translate(${VORTEX_CENTER.x} ${VORTEX_CENTER.y})`}
          >
            <g
              className="studio-vortex-layer"
              style={
                {
                  "--vortex-rotate-duration": `${layer.duration}s`,
                } as CSSProperties
              }
            >
              <g transform={`translate(${-VORTEX_CENTER.x} ${-VORTEX_CENTER.y})`}>
                {layer.paths.map((d, index) => (
                  <path
                    key={`${layer.id}-${index}`}
                    d={d}
                    stroke={layer.color}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                  />
                ))}
              </g>
            </g>
          </g>
        ))}
      </svg>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
      />

      <VortexEyeOverlay />
    </div>
  );
}
