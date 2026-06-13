import {
  setVortexResetPrep,
  setVortexRocketAtRest,
} from "./vortex-reset-prep";
const SCROLL_KEYS = new Set([
  " ",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "ArrowUp",
  "ArrowDown",
]);

let locked = false;
let cleanup: (() => void) | null = null;

/** Synchronous — call the instant the vortex exit threshold is crossed. */
export function engageVortexScrollLock() {
  if (locked) return;
  locked = true;

  const { documentElement: html, body } = document;

  html.classList.add("studio-vortex-exiting");
  setVortexRocketAtRest(true);
  setVortexResetPrep(true);
  window.scrollTo(0, 0);

  body.style.position = "fixed";
  body.style.top = "0";
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";

  const prevent = (event: Event) => {
    event.preventDefault();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.has(event.key)) {
      event.preventDefault();
    }
  };

  const pinScrollTop = () => {
    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
  };

  window.addEventListener("wheel", prevent, { passive: false });
  window.addEventListener("touchmove", prevent, { passive: false });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("scroll", pinScrollTop, { passive: true });

  cleanup = () => {
    window.removeEventListener("wheel", prevent);
    window.removeEventListener("touchmove", prevent);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("scroll", pinScrollTop);

    html.classList.remove("studio-vortex-exiting");

    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";

    window.scrollTo(0, 0);

    locked = false;
    cleanup = null;
  };
}

export function releaseVortexScrollLock() {
  cleanup?.();
}

export function isVortexScrollLocked() {
  return locked;
}
