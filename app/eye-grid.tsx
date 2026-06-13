"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStudioAudio } from "./studio-audio-provider";

const ROWS = 7;
const DEFAULT_MAX_CELL_PX = 75;
const DEFAULT_GAP_RATIO = 0.4;
const BEAT_MS = 500;

/** Matches rainbow-waves.tsx stripe palette. */
const RAINBOW_COLORS = [
  "#B794F6",
  "#7AAEFF",
  "#7CE3A0",
  "#FFE873",
  "#FFA754",
  "#FF8585",
] as const;

type GridLayout = {
  cols: number;
  cellSize: number;
  gapPx: number;
};

const EMPTY_LAYOUT: GridLayout = { cols: 0, cellSize: 0, gapPx: 0 };

function readMaxCellPx() {
  if (typeof document === "undefined") return DEFAULT_MAX_CELL_PX;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--studio-details-eye-max-size")
    .trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_MAX_CELL_PX;
}

function readGapRatio() {
  if (typeof document === "undefined") return DEFAULT_GAP_RATIO;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--studio-details-eye-gap-ratio")
    .trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) && value >= 0 ? value : DEFAULT_GAP_RATIO;
}

/** Rest pose: pupil at (21, 35) in a 56×56 viewBox — rotate so this vector tracks the cursor. */
const DEFAULT_LOOK_RAD = Math.atan2(35 - 28, 21 - 28);

const PUPIL_X = 21;
const PUPIL_Y = 35;
const PUPIL_R = 8;
const PUPIL_SLIT_RY = 1.25;
const BLINK_MS = 240;
const IDLE_MS = 1400;
const IDLE_LOOP_MS = 3_500;
const POINTER_FOLLOW_STRENGTH = 22;
const IDLE_FOLLOW_STRENGTH = 3.2;

type Point = { x: number; y: number };

/**
 * Horizontal ∞ loop inscribed in the grid bounds (crosses centre at t = 0, π).
 * x = sin(t), y = sin(2t)/2 — lobes left/right, path stays inside the rectangle.
 */
function idleLoopPoint(t: number, bounds: DOMRect): Point {
  const insetX = bounds.width * 0.06;
  const insetY = bounds.height * 0.08;
  const cx = bounds.left + bounds.width / 2;
  const cy = bounds.top + bounds.height / 2;
  const halfW = (bounds.width - insetX * 2) / 2;
  const halfH = (bounds.height - insetY * 2) / 2;
  const θ = ((t % 1) + 1) % 1 * Math.PI * 2;

  return {
    x: cx + halfW * Math.sin(θ),
    y: cy + halfH * Math.sin(2 * θ),
  };
}

function lerpToward(
  current: number,
  target: number,
  dtSec: number,
  strength: number,
) {
  const t = 1 - Math.exp(-strength * dtSec);
  return current + (target - current) * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** Closed amount: 0 → 1 → 0 over the blink duration. */
function blinkClosedAmount(progress: number) {
  return progress < 0.5
    ? easeInOut(progress * 2)
    : easeInOut((1 - progress) * 2);
}

function animatePupilBlink(
  pupil: SVGEllipseElement,
  blinking: WeakSet<SVGEllipseElement>,
) {
  if (blinking.has(pupil)) return;
  blinking.add(pupil);

  const start = performance.now();

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / BLINK_MS);
    const closed = blinkClosedAmount(progress);
    const ry = PUPIL_R - (PUPIL_R - PUPIL_SLIT_RY) * closed;
    pupil.setAttribute("ry", ry.toFixed(2));

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    pupil.setAttribute("ry", String(PUPIL_R));
    blinking.delete(pupil);
  };

  requestAnimationFrame(tick);
}

function animateRainbowFlash(
  svg: SVGSVGElement,
  flashing: WeakSet<SVGSVGElement>,
) {
  if (flashing.has(svg)) return;
  flashing.add(svg);

  const path = svg.querySelector("path");
  const circle = svg.querySelector("circle");
  if (!path || !circle) {
    flashing.delete(svg);
    return;
  }

  const start = performance.now();
  const duration = BEAT_MS * 0.92;
  const stepMs = duration / RAINBOW_COLORS.length;

  const tick = (now: number) => {
    const elapsed = now - start;
    if (elapsed >= duration) {
      path.setAttribute("stroke", "#D9D9D9");
      circle.setAttribute("fill", "#D9D9D9");
      flashing.delete(svg);
      return;
    }

    const colorIndex =
      Math.floor(elapsed / stepMs) % RAINBOW_COLORS.length;
    const color = RAINBOW_COLORS[colorIndex]!;
    path.setAttribute("stroke", color);
    circle.setAttribute("fill", color);
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

/** ~30% of eyes get an independent random blink loop. */
function isRandomBlinker(index: number) {
  return (index * 17 + 5) % 10 < 3;
}

function gapForCell(cellSize: number, gapRatio: number) {
  return Math.round(cellSize * gapRatio);
}

/** Fewest columns that keeps cells ≤ maxCell, then size to fill width exactly. */
function layoutGridForWidth(
  width: number,
  gapRatio: number,
  maxCell: number,
): GridLayout {
  if (width <= 0) return EMPTY_LAYOUT;

  let cols = 1;
  while (cols < 500) {
    const cell = width / (cols + (cols - 1) * gapRatio);
    if (cell <= maxCell) break;
    cols += 1;
  }

  const cellSize = Math.min(
    maxCell,
    Math.floor(width / (cols + (cols - 1) * gapRatio)),
  );

  if (cellSize <= 0) return EMPTY_LAYOUT;

  return { cols, cellSize, gapPx: gapForCell(cellSize, gapRatio) };
}

type EyeHandle = {
  el: HTMLButtonElement | null;
  pupil: SVGEllipseElement | null;
};

function ensureEye(eyes: EyeHandle[], index: number) {
  if (!eyes[index]) eyes[index] = { el: null, pupil: null };
  return eyes[index];
}

function EyeSvg({
  className,
  pupilRef,
}: {
  className?: string;
  pupilRef: (el: SVGEllipseElement | null) => void;
}) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M22 1H34C45.598 1 55 10.402 55 22V34C55 45.598 45.598 55 34 55H4C2.34315 55 1 53.6569 1 52V22L1.00684 21.458C1.29431 10.1105 10.5832 1 22 1Z"
        stroke="#D9D9D9"
        strokeWidth="2"
      />
      <circle cx="24.5" cy="31.5" r="14.5" fill="#D9D9D9" />
      <ellipse
        ref={pupilRef}
        cx={PUPIL_X}
        cy={PUPIL_Y}
        rx={PUPIL_R}
        ry={PUPIL_R}
        fill="#1B1006"
      />
    </svg>
  );
}

export function EyeGrid() {
  const { audioReady, subscribeBeat } = useStudioAudio();
  const measureRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<EyeHandle[]>([]);
  const blinkingRef = useRef(new WeakSet<SVGEllipseElement>());
  const rainbowFlashRef = useRef(new WeakSet<SVGSVGElement>());
  const eyeCountRef = useRef(0);
  const pointerRef = useRef({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });
  const lastPointerMoveRef = useRef(0);
  const hasPointerRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const gazeRef = useRef({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });
  const idleLoopStartRef = useRef<number | null>(null);
  const wasPointerIdleRef = useRef(true);
  const lastFrameRef = useRef(0);
  const [layout, setLayout] = useState<GridLayout>(EMPTY_LAYOUT);

  useEffect(() => {
    const measureEl = measureRef.current;
    if (!measureEl) return;

    const measure = () => {
      setLayout(
        layoutGridForWidth(
          measureEl.clientWidth,
          readGapRatio(),
          readMaxCellPx(),
        ),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(measureEl);
    return () => observer.disconnect();
  }, []);

  const eyeCount = layout.cols * ROWS;
  eyeCountRef.current = eyeCount;
  const gridReady = layout.cols > 0 && layout.cellSize > 0;
  const gridWidth = gridReady
    ? layout.cellSize * layout.cols + layout.gapPx * (layout.cols - 1)
    : undefined;
  const gridHeight = gridReady
    ? layout.cellSize * ROWS + layout.gapPx * (ROWS - 1)
    : undefined;

  const blinkEye = useCallback((index: number) => {
    const pupil = eyesRef.current[index]?.pupil;
    if (!pupil) return;
    animatePupilBlink(pupil, blinkingRef.current);
  }, []);

  useEffect(() => {
    let raf = 0;

    const updateEyes = (now: number) => {
      const dtSec = Math.min(
        lastFrameRef.current > 0 ? (now - lastFrameRef.current) / 1000 : 0,
        0.05,
      );
      lastFrameRef.current = now;

      const pointerIdle =
        !hasPointerRef.current || now - lastPointerMoveRef.current > IDLE_MS;

      if (pointerIdle && !wasPointerIdleRef.current) {
        idleLoopStartRef.current = now;
      } else if (!pointerIdle) {
        idleLoopStartRef.current = null;
      }
      wasPointerIdleRef.current = pointerIdle;

      let desiredX = pointerRef.current.x;
      let desiredY = pointerRef.current.y;

      if (pointerIdle) {
        const bounds = measureRef.current?.getBoundingClientRect();
        if (bounds && bounds.width > 0 && bounds.height > 0) {
          if (idleLoopStartRef.current === null) {
            idleLoopStartRef.current = now;
          }
          const phase = reducedMotionRef.current
            ? 0
            : ((now - idleLoopStartRef.current) % IDLE_LOOP_MS) / IDLE_LOOP_MS;
          const point = idleLoopPoint(phase, bounds);
          desiredX = point.x;
          desiredY = point.y;
        }
      }

      const followStrength = pointerIdle
        ? IDLE_FOLLOW_STRENGTH
        : POINTER_FOLLOW_STRENGTH;

      gazeRef.current = {
        x: lerpToward(gazeRef.current.x, desiredX, dtSec, followStrength),
        y: lerpToward(gazeRef.current.y, desiredY, dtSec, followStrength),
      };

      const { x: targetX, y: targetY } = gazeRef.current;

      for (const { el } of eyesRef.current) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const lookRad = Math.atan2(targetY - cy, targetX - cx);
        const deg = ((lookRad - DEFAULT_LOOK_RAD) * 180) / Math.PI;
        el.style.transform = `rotate(${deg}deg)`;
      }

      raf = requestAnimationFrame(updateEyes);
    };

    const onPointer = (event: PointerEvent) => {
      hasPointerRef.current = true;
      lastPointerMoveRef.current = performance.now();
      pointerRef.current = { x: event.clientX, y: event.clientY };
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    raf = requestAnimationFrame(updateEyes);

    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      motionQuery.removeEventListener("change", onMotionChange);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (eyeCount <= 0) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < eyeCount; i++) {
      if (!isRandomBlinker(i)) continue;

      const schedule = () => {
        const delay = 1800 + Math.random() * 4200;
        const id = setTimeout(() => {
          blinkEye(i);
          schedule();
        }, delay);
        timeouts.push(id);
      };

      timeouts.push(setTimeout(schedule, 400 + (i % 11) * 180));
    }

    return () => {
      for (const id of timeouts) clearTimeout(id);
    };
  }, [blinkEye, eyeCount]);

  useEffect(() => {
    if (!audioReady) return;

    const onBeat = () => {
      const count = eyeCountRef.current;
      if (count <= 0 || reducedMotionRef.current) return;

      const index = Math.floor(Math.random() * count);
      const svg = eyesRef.current[index]?.el?.querySelector("svg");
      if (svg instanceof SVGSVGElement) {
        animateRainbowFlash(svg, rainbowFlashRef.current);
      }
    };

    return subscribeBeat(onBeat);
  }, [audioReady, subscribeBeat]);

  return (
    <div ref={measureRef} className="w-full">
      <div
        className="grid w-full"
        style={{
          width: gridWidth,
          height: gridHeight,
          gap: layout.gapPx,
          gridTemplateColumns: gridReady
            ? `repeat(${layout.cols}, ${layout.cellSize}px)`
            : undefined,
          gridTemplateRows: gridReady
            ? `repeat(${ROWS}, ${layout.cellSize}px)`
            : undefined,
        }}
      >
          {Array.from({ length: eyeCount }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label="Blink eye"
              onClick={() => blinkEye(i)}
              ref={(el) => {
                ensureEye(eyesRef.current, i).el = el;
              }}
              style={
                gridReady
                  ? { width: layout.cellSize, height: layout.cellSize }
                  : undefined
              }
              className="flex origin-center cursor-pointer items-center justify-center border-0 bg-transparent p-0 will-change-transform"
            >
              <EyeSvg
                className="pointer-events-none size-full"
                pupilRef={(el) => {
                  ensureEye(eyesRef.current, i).pupil = el;
                }}
              />
            </button>
          ))}
      </div>
    </div>
  );
}
