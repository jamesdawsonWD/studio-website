"use client";

import { useEffect, useRef } from "react";
import { pluck } from "./guitar";
import { getChordNotes } from "./studio-chords";

// Six rainbow sine waves locked in phase. RAF integrates a slowly-modulated
// speed into a shared phase; wavelength and amplitude breathe on coupled
// long-period oscillators so wide↔shallow and narrow↔tall pulse together.
// Mouse adds extra phase/amp modulation, and every mousemove projects the
// current line shapes back into screen space — when the cursor crosses a
// line, that line's guitar string plucks (per-line cooldown stops spam).
//
// String mapping mirrors guitar tab notation: top = high E (string 1),
// bottom = low E (string 6).

type RainbowWavesProps = {
  /** Craft space band — waves over the earth horizon. */
  variant?: "default" | "space";
};

const W = 1800;
const H = 600;
const POINTS = 80;
const COLORS = [
  "#B794F6", // purple
  "#7AAEFF", // blue
  "#7CE3A0", // green
  "#FFE873", // yellow
  "#FFA754", // orange
  "#FF8585", // red
];
const STROKE_LEFT = 2;
const STROKE_RIGHT = 24;
const SPACING_LEFT = 6;
const SPACING_RIGHT = 48;
const PLUCK_COOLDOWN_MS = 110;

const BASE_AMPLITUDE = 70;
const MOUSE_AMP_RANGE = 75;
const BASE_WAVELENGTH = W * 0.9;
const BASE_SPEED = 0.45;

const LAYOUT = {
  default: {
    yStart: H * 0.28,
    yEnd: H * (2 / 3),
  },
  space: {
    // Top-left near the sun (cream) → bottom-right over the horizon.
    yStart: H * 0.02,
    yEnd: H * 1.02,
  },
} as const;

function viewBoxHeight(yEnd: number) {
  return (
    yEnd +
    ((COLORS.length - 1) / 2) * SPACING_RIGHT +
    BASE_AMPLITUDE +
    MOUSE_AMP_RANGE +
    STROKE_RIGHT / 2
  );
}

export function RainbowWaves({ variant = "default" }: RainbowWavesProps) {
  const { yStart: Y_START, yEnd: Y_END } = LAYOUT[variant];
  const VB_H = viewBoxHeight(Y_END);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const mouse = useRef({ x: 0, y: 0, seen: false });
  const live = useRef({ amplitude: BASE_AMPLITUDE, k: 0, phase: 0 });
  const lastSign = useRef<number[]>(new Array(COLORS.length).fill(0));
  const lastPluck = useRef<number[]>(new Array(COLORS.length).fill(0));

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const hadMouse = mouse.current.seen;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.seen = true;

      const svg = svgRef.current;
      if (!svg || !hadMouse) return;
      const rect = svg.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        // Reset signs when leaving so re-entry doesn't fire a stale crossing
        for (let i = 0; i < COLORS.length; i++) lastSign.current[i] = 0;
        return;
      }
      const vbX = ((e.clientX - rect.left) / rect.width) * W;
      const { amplitude, k, phase } = live.current;
      const wave = amplitude * Math.sin(k * vbX + phase);
      const tx = vbX / W;
      const spacingAtX = SPACING_LEFT + (SPACING_RIGHT - SPACING_LEFT) * tx;
      const now = performance.now();
      const yScale = rect.height / VB_H;
      const notes = getChordNotes(now);

      const baseYAtX = Y_START + (Y_END - Y_START) * tx;
      for (let i = 0; i < COLORS.length; i++) {
        const lineOffset = (i - (COLORS.length - 1) / 2) * spacingAtX;
        const vbY = baseYAtX + lineOffset + wave;
        const screenY = vbY * yScale + rect.top;
        const sign = Math.sign(e.clientY - screenY);
        const prev = lastSign.current[i];
        if (prev !== 0 && sign !== 0 && sign !== prev) {
          if (now - lastPluck.current[i] > PLUCK_COOLDOWN_MS) {
            pluck(notes[i]);
            lastPluck.current[i] = now;
          }
        }
        lastSign.current[i] = sign;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    let lastTime = performance.now();
    const startTime = lastTime;
    let phase = 0;

    const draw = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const t = (now - startTime) / 1000;

      const mx = mouse.current.seen
        ? mouse.current.x / window.innerWidth - 0.5
        : 0;
      const my = mouse.current.seen
        ? mouse.current.y / window.innerHeight - 0.5
        : 0;

      // Coupled breath: when wavelength stretches wide, amplitude shrinks.
      // Compound two sines so it never repeats on a tight cycle.
      const breath =
        0.65 * Math.sin(t * 0.34) + 0.35 * Math.sin(t * 0.11 + 1.7);
      const wavelengthFactor = 1 + breath * 0.55; // ~0.45..1.55
      const amplitudeFactor = 1 - breath * 0.5; // ~0.5..1.5

      const speedFactor = 0.6 + (Math.sin(t * 0.21) + 1) * 0.5; // 0.6..1.6
      const speed = BASE_SPEED * speedFactor;
      phase += speed * dt * 2 * Math.PI;

      const amplitude =
        (BASE_AMPLITUDE + my * MOUSE_AMP_RANGE) * amplitudeFactor;
      const wavelength = BASE_WAVELENGTH * wavelengthFactor * (1 + mx * 0.2);
      const k = (2 * Math.PI) / wavelength;
      const renderPhase = phase + mx * Math.PI;

      live.current.amplitude = amplitude;
      live.current.k = k;
      live.current.phase = renderPhase;

      const midIndex = (COLORS.length - 1) / 2;
      // Reused buffer for the bottom edge so we can append it in reverse to
      // close the ribbon: M(top L->R) + L(bottom R->L) + Z.
      const bottom: string[] = new Array(POINTS + 1);
      for (let line = 0; line < COLORS.length; line++) {
        const el = pathRefs.current[line];
        if (!el) continue;
        const lineFactor = line - midIndex;
        let d = "";
        for (let i = 0; i <= POINTS; i++) {
          const tx = i / POINTS;
          const x = tx * W;
          const stroke = STROKE_LEFT + (STROKE_RIGHT - STROKE_LEFT) * tx;
          const spacing = SPACING_LEFT + (SPACING_RIGHT - SPACING_LEFT) * tx;
          const y =
            Y_START +
            (Y_END - Y_START) * tx +
            lineFactor * spacing +
            amplitude * Math.sin(k * x + renderPhase);
          const half = stroke / 2;
          d +=
            (i === 0 ? "M" : "L") +
            x.toFixed(1) +
            " " +
            (y - half).toFixed(1) +
            " ";
          bottom[i] = x.toFixed(1) + " " + (y + half).toFixed(1);
        }
        for (let i = POINTS; i >= 0; i--) d += "L" + bottom[i] + " ";
        d += "Z";
        el.setAttribute("d", d);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [Y_START, Y_END, VB_H]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${VB_H}`}
      preserveAspectRatio="none"
      className={[
        "pointer-events-none absolute h-full w-full",
        variant === "space" ? "studio-sun-rainbow-svg" : "inset-0",
      ].join(" ")}
      aria-hidden
    >
      {COLORS.map((c, i) => (
        <path
          key={c}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          fill={c}
        />
      ))}
    </svg>
  );
}
