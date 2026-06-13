"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

type WhiteCircle = {
  cx: number;
  cy: number;
  r: number;
};

export type GazeBias = "left" | "right";

type Options = {
  svgRef: RefObject<SVGSVGElement | null>;
  white: WhiteCircle;
  pupilR: number;
  edgeGap: number;
  viewBoxSize: number;
  /** When false, pupil stays centred and no listeners run. */
  enabled?: boolean;
  /** Idle gaze starts and wanders on this side (SVG +x = right). */
  idleGazeBias?: GazeBias;
};

type Offset = { x: number; y: number };

type IdleGaze = {
  current: Offset;
  from: Offset;
  to: Offset;
  phase: "hold" | "saccade";
  /** When the current phase ends (ms). */
  until: number;
  /** Saccade start time — only set while phase === "saccade". */
  saccadeStart: number;
};

/** Ms without pointer movement before idle gaze takes over. */
const IDLE_MS = 1400;
const SACCADE_MS_MIN = 70;
const SACCADE_MS_MAX = 140;
const HOLD_MS_MIN = 550;
const HOLD_MS_MAX = 2400;
/** Chance each new fixation is center (not the first — that always starts centered). */
const CENTER_FIXATION_CHANCE = 0.3;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function sideGazeOffset(bias: GazeBias, maxOffset: number): Offset {
  const mag = maxOffset * 0.62;
  return bias === "right"
    ? { x: mag, y: maxOffset * 0.1 }
    : { x: -mag, y: maxOffset * 0.1 };
}

function pickFixation(
  maxOffset: number,
  allowCenter: boolean,
  bias?: GazeBias,
): Offset {
  if (allowCenter && !bias && Math.random() < CENTER_FIXATION_CHANCE) {
    return { x: 0, y: 0 };
  }
  if (bias) {
    const spread = Math.PI / 3;
    const base = bias === "right" ? 0 : Math.PI;
    const angle = base + (Math.random() - 0.5) * spread;
    const dist = maxOffset * (0.45 + Math.random() * 0.4);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  }
  const angle = Math.random() * Math.PI * 2;
  const dist = maxOffset * (0.5 + Math.random() * 0.5);
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
}

/** Ease from the last tracked offset back to the idle home before wandering. */
function createIdleGazeFromTracking(
  now: number,
  from: Offset,
  home: Offset,
): IdleGaze {
  const duration =
    SACCADE_MS_MIN + Math.random() * (SACCADE_MS_MAX - SACCADE_MS_MIN);
  return {
    current: { ...from },
    from: { ...from },
    to: { ...home },
    phase: "saccade",
    saccadeStart: now,
    until: now + duration,
  };
}

function beginSaccade(
  gaze: IdleGaze,
  now: number,
  maxOffset: number,
  bias?: GazeBias,
) {
  gaze.from = { ...gaze.current };
  gaze.to = pickFixation(maxOffset, true, bias);
  gaze.phase = "saccade";
  gaze.saccadeStart = now;
  const duration = SACCADE_MS_MIN + Math.random() * (SACCADE_MS_MAX - SACCADE_MS_MIN);
  gaze.until = now + duration;
}

function beginHold(gaze: IdleGaze, now: number) {
  gaze.current = { ...gaze.to };
  gaze.phase = "hold";
  gaze.until = now + HOLD_MS_MIN + Math.random() * (HOLD_MS_MAX - HOLD_MS_MIN);
}

/** Map viewport coords into this SVG's user space (respects ancestor CSS transforms). */
function clientToSvg(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): Offset | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const local = point.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
}

function clampPupilOffset(
  white: WhiteCircle,
  localPointer: Offset,
  maxOffset: number,
): Offset {
  const dx = localPointer.x - white.cx;
  const dy = localPointer.y - white.cy;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return { x: 0, y: 0 };
  const clampedDist = Math.min(dist, maxOffset);
  const angle = Math.atan2(dy, dx);
  return {
    x: Math.cos(angle) * clampedDist,
    y: Math.sin(angle) * clampedDist,
  };
}

function stepIdleGaze(
  gaze: IdleGaze,
  now: number,
  maxOffset: number,
  bias?: GazeBias,
): Offset {
  if (gaze.phase === "hold") {
    if (now >= gaze.until) beginSaccade(gaze, now, maxOffset, bias);
    return gaze.current;
  }

  const duration = gaze.until - gaze.saccadeStart;
  const t = duration > 0 ? Math.min(1, (now - gaze.saccadeStart) / duration) : 1;
  const eased = easeOutCubic(t);

  gaze.current = {
    x: lerp(gaze.from.x, gaze.to.x, eased),
    y: lerp(gaze.from.y, gaze.to.y, eased),
  };

  if (t >= 1) beginHold(gaze, now);
  return gaze.current;
}

export function useTrackingPupil({
  svgRef,
  white,
  pupilR,
  edgeGap,
  viewBoxSize,
  enabled = true,
  idleGazeBias,
}: Options) {
  const maxOffset = white.r - pupilR - edgeGap;
  const idleStart = idleGazeBias
    ? sideGazeOffset(idleGazeBias, maxOffset)
    : { x: 0, y: 0 };
  const [pupil, setPupil] = useState({
    cx: white.cx + idleStart.x,
    cy: white.cy + idleStart.y,
  });
  const pointerRef = useRef({ x: 0, y: 0 });
  const hasPointerRef = useRef(false);
  const lastMoveAtRef = useRef(0);
  const currentOffsetRef = useRef<Offset>(idleStart);
  const idleGazeRef = useRef<IdleGaze | null>(null);
  const wasIdleRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;

    const tick = () => {
      const anchor = svgRef.current;
      if (!anchor) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const now = performance.now();
      const idle =
        !hasPointerRef.current || now - lastMoveAtRef.current > IDLE_MS;

      if (idle) {
        if (!wasIdleRef.current) {
          idleGazeRef.current = createIdleGazeFromTracking(
            now,
            currentOffsetRef.current,
            idleStart,
          );
        }
        wasIdleRef.current = true;

        const gaze = idleGazeRef.current!;
        const { x, y } = stepIdleGaze(gaze, now, maxOffset, idleGazeBias);
        currentOffsetRef.current = { x, y };
        setPupil({ cx: white.cx + x, cy: white.cy + y });
      } else {
        wasIdleRef.current = false;
        idleGazeRef.current = null;

        const { x, y } = pointerRef.current;
        const local = clientToSvg(anchor, x, y);
        if (!local) {
          setPupil({ cx: white.cx, cy: white.cy });
          return;
        }

        const { x: offsetX, y: offsetY } = clampPupilOffset(
          white,
          local,
          maxOffset,
        );
        currentOffsetRef.current = { x: offsetX, y: offsetY };

        setPupil({
          cx: white.cx + offsetX,
          cy: white.cy + offsetY,
        });
      }

      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      hasPointerRef.current = true;
      lastMoveAtRef.current = performance.now();
      pointerRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [
    edgeGap,
    enabled,
    idleGazeBias,
    maxOffset,
    svgRef,
    viewBoxSize,
    white.cx,
    white.cy,
  ]);

  if (!enabled) {
    return { cx: white.cx, cy: white.cy };
  }

  return pupil;
}
