"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

const EXIT_FADE_MS = 850;

export type VortexExitPhase = "idle" | "overlay" | "fading";

export function useVortexExit() {
  const [phase, setPhase] = useState<VortexExitPhase>("idle");
  const exitingRef = useRef(false);

  useEffect(() => {
    let exitStart = readCssLengthPx("--studio-vortex-exit-start");
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
    if (phase !== "idle") return;

    let exitStart = readCssLengthPx("--studio-vortex-exit-start");
    let prepStart = readCssLengthPx("--studio-vortex-reset-prep-start");

    const check = () => {
      if (exitingRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      exitStart = readCssLengthPx("--studio-vortex-exit-start");
      prepStart = readCssLengthPx("--studio-vortex-reset-prep-start");

      if (window.scrollY >= prepStart) {
        setVortexResetPrep(true);
      }

      if (window.scrollY >= exitStart - 1) {
        exitingRef.current = true;
        flushSync(() => {
          setVortexResetPrep(true);
        });
        engageVortexScrollLock();
        setPhase("overlay");
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
    };
  }, [phase]);

  useLayoutEffect(() => {
    if (phase !== "overlay") return;

    const frame = requestAnimationFrame(() => {
      setPhase("fading");
    });

    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fading") return;

    const timer = window.setTimeout(() => {
      releaseVortexScrollLock();
      exitingRef.current = false;
      setPhase("idle");

      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }, EXIT_FADE_MS);

    return () => window.clearTimeout(timer);
  }, [phase]);

  return {
    phase,
    showOverlay: phase === "overlay" || phase === "fading",
    fading: phase === "fading",
  };
}
