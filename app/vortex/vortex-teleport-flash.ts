"use client";

import { useSyncExternalStore } from "react";

/** Total fade-in, hold, and fade-out duration for the teleport flash. */
export const VORTEX_TELEPORT_FLASH_MS = 200;

let flashActive = false;
let flashId = 0;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function getSnapshot() {
  return flashActive ? flashId : 0;
}

function getServerSnapshot() {
  return 0;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function triggerVortexTeleportFlash() {
  flashId += 1;
  flashActive = true;
  notify();

  window.setTimeout(() => {
    flashActive = false;
    notify();
  }, VORTEX_TELEPORT_FLASH_MS);
}

export function useVortexTeleportFlash() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
