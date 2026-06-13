"use client";

import { useSyncExternalStore } from "react";

let active = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function isSpaceChromeActive() {
  return active;
}

export function setSpaceChromeActive(value: boolean) {
  if (active === value) return;
  active = value;
  notify();
}

export function subscribeSpaceChrome(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function useSpaceChromeActive() {
  return useSyncExternalStore(
    subscribeSpaceChrome,
    isSpaceChromeActive,
    () => false,
  );
}

export function resetSpaceChrome() {
  setSpaceChromeActive(false);
}
