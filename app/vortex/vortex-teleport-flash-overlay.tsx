"use client";

import {
  useVortexTeleportFlash,
  VORTEX_TELEPORT_FLASH_MS,
} from "./vortex-teleport-flash";

/** Full-screen cream flash fixed above the app during vortex teleport. */
export function VortexTeleportFlashOverlay() {
  const flashKey = useVortexTeleportFlash();

  if (flashKey === 0) return null;

  return (
    <div
      key={flashKey}
      aria-hidden
      className="studio-vortex-teleport-flash pointer-events-none fixed inset-0 z-[200] bg-studio-cream"
      style={{
        ["--studio-vortex-teleport-flash-ms" as string]: `${VORTEX_TELEPORT_FLASH_MS}ms`,
      }}
    />
  );
}
