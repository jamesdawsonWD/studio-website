"use client";

import { cn } from "@/lib/utils";
import { useVortexExit } from "./use-vortex-exit";

/** Solid pink hold + fade after the scroll zoom fills the screen with the inner ring. */
export function VortexExitOverlay() {
  const { showOverlay, fading } = useVortexExit();

  if (!showOverlay) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "studio-vortex-exit-overlay pointer-events-none fixed inset-0 z-[100]",
        fading && "studio-vortex-exit-overlay--fading",
      )}
    />
  );
}
