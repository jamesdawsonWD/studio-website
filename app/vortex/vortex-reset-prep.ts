"use client";

import { useSyncExternalStore } from "react";

export const VORTEX_RESET_PREP_LEAD_PX = 100;
/** Ignore momentum — only resume scroll-driven hero once the user has moved. */
export const VORTEX_RESET_RESUME_SCROLL_PX = 48;

let prepActive = false;
let rocketAtRest = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function isVortexResetPrepActive() {
  return prepActive;
}

export function isVortexRocketAtRest() {
  return rocketAtRest;
}

export function isVortexHeroForceMount() {
  return prepActive || rocketAtRest;
}

export function subscribeVortexResetPrep(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function setVortexResetPrep(active: boolean) {
  if (prepActive === active) return;
  prepActive = active;

  if (active) {
    document.documentElement.classList.add("studio-vortex-reset-prep");
  } else {
    document.documentElement.classList.remove("studio-vortex-reset-prep");
  }

  notify();
}

export function setVortexRocketAtRest(active: boolean) {
  if (rocketAtRest === active) return;
  rocketAtRest = active;

  if (active) {
    document.documentElement.classList.add("studio-rocket-at-rest");
  } else {
    document.documentElement.classList.remove("studio-rocket-at-rest");
  }

  notify();
}

export function useVortexResetPrepActive() {
  return useSyncExternalStore(
    subscribeVortexResetPrep,
    isVortexResetPrepActive,
    () => false,
  );
}

export function useVortexHeroForceMount() {
  return useSyncExternalStore(
    subscribeVortexResetPrep,
    isVortexHeroForceMount,
    () => false,
  );
}

/** Clears hero prep mount + frozen rocket pose once the user scrolls again. */
export function clearVortexResetState() {
  setVortexRocketAtRest(false);
  setVortexResetPrep(false);
}
