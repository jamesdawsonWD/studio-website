"use client";

import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { readCssLengthPx } from "../read-css-length-px";
import {
  clearVortexResetState,
  isVortexRocketAtRest,
  setVortexResetPrep,
  VORTEX_RESET_RESUME_SCROLL_PX,
} from "./vortex-reset-prep";
import {
  engageVortexScrollLock,
  isVortexScrollLocked,
  releaseVortexScrollLock,
} from "./vortex-scroll-lock";

/** Full-screen cream hold before releasing back to the hero. */
const EXIT_HOLD_MS = 850;

/** Snap to full-screen cream at the vortex exit threshold — no overlay layer. */
export function useVortexExit() {
  const exitingRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let prepStart = readCssLengthPx("--studio-vortex-reset-prep-start");

    const syncPrep = () => {
      if (isVortexScrollLocked() || isVortexRocketAtRest()) {
        return;
      }

      prepStart = readCssLengthPx("--studio-vortex-reset-prep-start");
      setVortexResetPrep(window.scrollY >= prepStart);
    };

    window.addEventListener("scroll", syncPrep, { passive: true });
    window.addEventListener("resize", syncPrep, { passive: true });
    syncPrep();

    return () => {
      window.removeEventListener("scroll", syncPrep);
      window.removeEventListener("resize", syncPrep);
    };
  }, []);

  useEffect(() => {
    let exitStart = readCssLengthPx("--studio-vortex-exit-start");
    let prepStart = readCssLengthPx("--studio-vortex-reset-prep-start");

    const beginExit = () => {
      if (exitingRef.current) return;
      exitingRef.current = true;

      flushSync(() => {
        setVortexResetPrep(true);
      });

      engageVortexScrollLock();

      holdTimerRef.current = window.setTimeout(() => {
        releaseVortexScrollLock();
        exitingRef.current = false;
        holdTimerRef.current = null;

        requestAnimationFrame(() => {
          window.dispatchEvent(new Event("scroll"));
        });
      }, EXIT_HOLD_MS);
    };

    const check = () => {
      if (exitingRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      exitStart = readCssLengthPx("--studio-vortex-exit-start");
      prepStart = readCssLengthPx("--studio-vortex-reset-prep-start");

      if (window.scrollY >= prepStart) {
        setVortexResetPrep(true);
      }

      if (window.scrollY >= exitStart - 1) {
        beginExit();
      }
    };

    const resumeHeroScroll = () => {
      if (isVortexScrollLocked()) return;
      if (window.scrollY >= VORTEX_RESET_RESUME_SCROLL_PX) {
        clearVortexResetState();
      }
    };

    const onResize = () => {
      exitStart = readCssLengthPx("--studio-vortex-exit-start");
      prepStart = readCssLengthPx("--studio-vortex-reset-prep-start");
      check();
    };

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("scroll", resumeHeroScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    check();

    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("scroll", resumeHeroScroll);
      window.removeEventListener("resize", onResize);
      if (holdTimerRef.current) {
        window.clearTimeout(holdTimerRef.current);
      }
    };
  }, []);
}
