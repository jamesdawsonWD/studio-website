"use client";

import { useEffect, useRef, type RefObject } from "react";
import { drawBeam } from "./draw-beam";
import { drawCharacter } from "./draw-character";
import {
  createSpeedLines,
  drawSpeedLines,
  updateSpeedLines,
} from "./draw-speed-lines";
import { clamp } from "./math";
import {
  BEAM_CONFIG,
  BEAM_ROLL_STRENGTH,
  FOLLOW_STRENGTH,
  RETURN_DELAY_MS,
  RETURN_STRENGTH,
  type AnimationState,
  type CanvasLayout,
} from "./types";

const MASCOT_SRC = "/studio/mascot.svg";
const BEAM_SLICE_SRC = "/studio/beam-slice.png";

function getLayout(
  width: number,
  height: number,
  variant: "card" | "section" = "card",
): CanvasLayout {
  if (variant === "section") {
    return {
      width,
      height,
      characterX: width * 0.36,
      minY: height * 0.06,
      maxY: height * 0.82,
      centerY: height * 0.28,
    };
  }

  return {
    width,
    height,
    characterX: width * 0.36,
    minY: height * 0.22,
    maxY: height * 0.72,
    centerY: height * 0.42,
  };
}

function getLineCount(width: number): number {
  return width < 640 ? 14 : 26;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

type CanvasAnimationOptions = {
  /** Clear each frame instead of painting card bg — for full-bleed space sections. */
  transparent?: boolean;
  /** Tighter vertical layout when sitting below a section heading. */
  variant?: "card" | "section";
};

export function useCanvasAnimation(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { transparent = false, variant = "card" }: CanvasAnimationOptions = {},
) {
  const stateRef = useRef<AnimationState | null>(null);
  const layoutRef = useRef<CanvasLayout | null>(null);
  const imagesRef = useRef<{
    mascot: HTMLImageElement;
    beamSlice: HTMLImageElement;
  } | null>(null);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const visibleRef = useRef(true);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;
    let returnTimeout: ReturnType<typeof setTimeout> | null = null;

    const clearReturnTimeout = () => {
      if (returnTimeout) {
        clearTimeout(returnTimeout);
        returnTimeout = null;
      }
    };

    const scheduleReturn = () => {
      clearReturnTimeout();
      returnTimeout = setTimeout(() => {
        returnTimeout = null;
        const state = stateRef.current;
        const layout = layoutRef.current;
        if (!state || !layout || state.mouseActive) return;
        state.targetY = layout.centerY;
      }, RETURN_DELAY_MS);
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;

    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    const onVisibility = () => {
      visibleRef.current = document.visibilityState === "visible";
      if (visibleRef.current) {
        lastFrameRef.current = performance.now();
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const layout = getLayout(width, height, variant);
      layoutRef.current = layout;

      const prev = stateRef.current;
      stateRef.current = {
        targetY: layout.centerY,
        characterY: prev?.characterY ?? layout.centerY,
        beamY: prev?.beamY ?? layout.centerY,
        time: prev?.time ?? 0,
        lines: createSpeedLines(layout, getLineCount(width)),
        mouseActive: false,
      };
    };

    const setTargetY = (clientY: number) => {
      const layout = layoutRef.current;
      const state = stateRef.current;
      if (!layout || !state) return;

      clearReturnTimeout();

      const boundsEl = canvas.parentElement ?? canvas;
      const rect = boundsEl.getBoundingClientRect();
      const localY = clientY - rect.top;
      state.targetY = clamp(localY, layout.minY, layout.maxY);
      state.mouseActive = true;
    };

    const onPointerMove = (event: Event) => {
      if (!(event instanceof PointerEvent)) return;
      setTargetY(event.clientY);
    };

    const onPointerLeave = () => {
      const state = stateRef.current;
      if (!state) return;
      state.mouseActive = false;
      scheduleReturn();
    };

    const onPointerDown = (event: Event) => {
      if (!(event instanceof PointerEvent)) return;
      setTargetY(event.clientY);
    };

    const onPointerUp = () => {
      const state = stateRef.current;
      if (!state) return;
      state.mouseActive = false;
    };

    const useWindowPointer = variant === "section";
    const pointerTarget: Window | HTMLCanvasElement = useWindowPointer
      ? window
      : canvas;

    pointerTarget.addEventListener("pointermove", onPointerMove);
    pointerTarget.addEventListener("pointerdown", onPointerDown);
    if (!useWindowPointer) {
      canvas.addEventListener("pointerleave", onPointerLeave);
    }
    pointerTarget.addEventListener("pointerup", onPointerUp);
    pointerTarget.addEventListener("pointercancel", onPointerUp);

    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    resize();

    const tick = (now: number) => {
      if (disposed) return;

      if (!visibleRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05);
      lastFrameRef.current = now;

      const layout = layoutRef.current;
      const state = stateRef.current;
      const images = imagesRef.current;

      if (layout && state && images && ctx) {
        const reducedMotion = reducedMotionRef.current;
        const strength = state.mouseActive ? FOLLOW_STRENGTH : RETURN_STRENGTH;

        state.time += reducedMotion ? dt * 200 : dt * 1000;
        state.characterY += (state.targetY - state.characterY) * strength;
        state.beamY += (state.characterY - state.beamY) * BEAM_ROLL_STRENGTH;

        if (!reducedMotion) {
          updateSpeedLines(state.lines, layout, dt);
        }

        if (transparent) {
          ctx.clearRect(0, 0, layout.width, layout.height);
        } else {
          const cardBg =
            (canvas.parentElement &&
              getComputedStyle(canvas.parentElement).backgroundColor) ||
            getComputedStyle(document.documentElement)
              .getPropertyValue("--color-studio-card")
              .trim();
          ctx.fillStyle =
            cardBg && cardBg !== "rgba(0, 0, 0, 0)" ? cardBg : "#1B1006";
          ctx.fillRect(0, 0, layout.width, layout.height);
        }

        drawSpeedLines(ctx, state.lines);
        drawBeam(
          ctx,
          images.beamSlice,
          layout,
          BEAM_CONFIG,
          state.characterY,
          state.beamY,
        );
        drawCharacter(ctx, images.mascot, layout, {
          characterY: state.characterY,
          time: state.time,
          reducedMotion,
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    Promise.all([loadImage(MASCOT_SRC), loadImage(BEAM_SLICE_SRC)])
      .then(([mascot, beamSlice]) => {
        if (disposed) return;
        imagesRef.current = { mascot, beamSlice };
        lastFrameRef.current = performance.now();
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch(() => {
        /* static fallback handled by empty canvas */
      });

    return () => {
      disposed = true;
      clearReturnTimeout();
      cancelAnimationFrame(rafRef.current);
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
      pointerTarget.removeEventListener("pointermove", onPointerMove);
      pointerTarget.removeEventListener("pointerdown", onPointerDown);
      if (!useWindowPointer) {
        canvas.removeEventListener("pointerleave", onPointerLeave);
      }
      pointerTarget.removeEventListener("pointerup", onPointerUp);
      pointerTarget.removeEventListener("pointercancel", onPointerUp);
      resizeObserver.disconnect();
    };
  }, [canvasRef, transparent, variant]);
}
