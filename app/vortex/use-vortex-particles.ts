"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  VORTEX_CENTER,
  VORTEX_LAYERS,
  VORTEX_VIEWBOX,
  type VortexLayer,
} from "./vortex-paths";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

type LayerEmitter = {
  layer: VortexLayer;
  nextEmit: number;
};

const STROKE_WIDTH = 86;
const MAX_PARTICLES = 140;

function randomArcSpread() {
  return (Math.random() - 0.5) * 0.55;
}

function spawnBurst(
  particles: Particle[],
  layer: VortexLayer,
  angle: number,
  scale: number,
) {
  const count = 2 + Math.floor(Math.random() * 3);
  const baseRadius =
    layer.radius * Math.min(VORTEX_VIEWBOX.width, VORTEX_VIEWBOX.height) * 0.42;

  for (let i = 0; i < count; i += 1) {
    if (particles.length >= MAX_PARTICLES) particles.shift();

    const arcOffset = randomArcSpread();
    const emitAngle = angle + arcOffset;
    const radiusJitter = baseRadius * (0.92 + Math.random() * 0.14);
    const x = VORTEX_CENTER.x + Math.cos(emitAngle) * radiusJitter;
    const y = VORTEX_CENTER.y + Math.sin(emitAngle) * radiusJitter;

    const tangent = emitAngle + Math.PI / 2 + (Math.random() - 0.5) * 0.35;
    const speed = (48 + Math.random() * 72) * scale;
    const radial = 18 + Math.random() * 36;

    particles.push({
      x: x * scale,
      y: y * scale,
      vx: Math.cos(tangent) * speed + Math.cos(emitAngle) * radial,
      vy: Math.sin(tangent) * speed + Math.sin(emitAngle) * radial,
      life: 0,
      maxLife: 0.55 + Math.random() * 0.75,
      size: (STROKE_WIDTH * 0.07 + Math.random() * STROKE_WIDTH * 0.05) * scale,
      color: layer.color,
    });
  }
}

export function useVortexParticles(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  enabled: boolean,
) {
  const particlesRef = useRef<Particle[]>([]);
  const emittersRef = useRef<LayerEmitter[]>(
    VORTEX_LAYERS.map((layer) => ({
      layer,
      nextEmit: Math.random() * layer.emitInterval,
    })),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    let visible = document.visibilityState === "visible";
    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    resize();

    const tick = (now: number) => {
      if (disposed) return;

      if (!visible) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const parent = canvas.parentElement;
      if (!parent) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const { width, height } = parent.getBoundingClientRect();
      const scale = Math.min(width / VORTEX_VIEWBOX.width, height / VORTEX_VIEWBOX.height);
      const offsetX = (width - VORTEX_VIEWBOX.width * scale) / 2;
      const offsetY = (height - VORTEX_VIEWBOX.height * scale) / 2;

      ctx.clearRect(0, 0, width, height);

      if (!reducedMotion) {
        elapsed += dt * 1000;
        const particles = particlesRef.current;

        for (const emitter of emittersRef.current) {
          const { layer } = emitter;
          if (elapsed < emitter.nextEmit) continue;

          const rotation =
            ((elapsed / 1000 / layer.duration) * Math.PI * 2) % (Math.PI * 2);
          const baseAngle =
            rotation + (Math.random() - 0.5) * Math.PI * 0.35 + Math.PI * 0.15;

          spawnBurst(particles, layer, baseAngle, scale);
          emitter.nextEmit =
            elapsed + layer.emitInterval * (0.65 + Math.random() * 0.7);
        }

        for (let i = particles.length - 1; i >= 0; i -= 1) {
          const p = particles[i];
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.985;
          p.vy *= 0.985;

          const t = p.life / p.maxLife;
          if (t >= 1) {
            particles.splice(i, 1);
            continue;
          }

          const alpha = (1 - t) * 0.85;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(offsetX + p.x, offsetY + p.y, p.size * (1 - t * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      particlesRef.current = [];
    };
  }, [canvasRef, enabled]);
}
