import { type CSSProperties } from "react";

export type StudioSmokeCircle = {
  w: number;
  h: number;
  z: number;
  ml?: number;
  mr?: number;
};

/** Symmetric smoke circles — generous overlap where they meet. */
export const STUDIO_SMOKE: ReadonlyArray<StudioSmokeCircle> = [
  { w: 72, h: 36, z: 0, mr: 32 },
  { w: 120, h: 60, z: 10, mr: 56 },
  { w: 200, h: 100, z: 20, mr: 88 },
  { w: 360, h: 180, z: 30 },
  { w: 200, h: 100, z: 20, ml: 88 },
  { w: 120, h: 60, z: 10, ml: 56 },
  { w: 72, h: 36, z: 0, ml: 32 },
];

export const STUDIO_CENTER_SMOKE_PEAK = STUDIO_SMOKE[3].w;

const CENTER_INDEX = 3;

/** Push the whole smoke stack down toward / past the viewport bottom. */
const SMOKE_SINK = 72;

/** Dark ground → light upper smoke. Shared by circles and particles. */
const LAYER_GREYS = [
  "#383838",
  "#434343",
  "#505050",
  "#606060",
  "#727272",
  "#868686",
  "#9a9a9a",
  "#b0b0b0",
  "#c6c6c6",
] as const;

/** Each scroll wave stacks at the bottom (offset) and adds a row that overlaps below. */
const SMOKE_WAVES = [
  { scrollStartVh: 0, elevatedBottom: null, shiftX: 0, baseLift: 0 },
  { scrollStartVh: 7, elevatedBottom: 80, shiftX: 32, baseLift: 0 },
  { scrollStartVh: 14, elevatedBottom: 160, shiftX: -40, baseLift: 0 },
  { scrollStartVh: 21, elevatedBottom: 240, shiftX: 24, baseLift: 0 },
] as const;

const MAX_ELEVATED_BOTTOM = Math.max(
  0,
  ...SMOKE_WAVES.map((w) => w.elevatedBottom ?? 0),
);
const MAX_SMOKE_SIZE = Math.max(...STUDIO_SMOKE.map((circle) => circle.w));

const MAX_LAYER_HEIGHT =
  Math.max(...SMOKE_WAVES.map((w) => Math.max(w.baseLift, w.elevatedBottom ?? 0))) +
  MAX_SMOKE_SIZE;

type SmokeParticlePair = {
  spread: number;
  distance: number;
  lift: number;
};

type SmokeParticle = SmokeParticlePair & { x: number };

const PARTICLE_SIZE_NEAR = Math.round(52 * 1.4);
const PARTICLE_SIZE_FAR = Math.round(22 * 1.4);
const MAX_PARTICLE_DISTANCE = 360;

function sizeForDistance(distance: number): number {
  const t = Math.min(1, distance / MAX_PARTICLE_DISTANCE);
  return Math.round(PARTICLE_SIZE_NEAR + (PARTICLE_SIZE_FAR - PARTICLE_SIZE_NEAR) * t);
}

const SMOKE_PARTICLE_PAIRS: ReadonlyArray<SmokeParticlePair> = [
  { spread: 0, distance: 28, lift: 68 },
  { spread: 0, distance: 56, lift: 103 },
  { spread: 0, distance: 88, lift: 48 },
  { spread: 1, distance: 120, lift: 83 },
  { spread: 1, distance: 168, lift: 123 },
  { spread: 1, distance: 210, lift: 58 },
  { spread: 2, distance: 248, lift: 96 },
  { spread: 2, distance: 288, lift: 138 },
  { spread: 3, distance: 320, lift: 73 },
  { spread: 3, distance: 360, lift: 113 },
];

const SMOKE_PARTICLES: ReadonlyArray<SmokeParticle> = SMOKE_PARTICLE_PAIRS.flatMap(
  (p) => [
    { ...p, x: -p.distance },
    { ...p, x: p.distance },
  ],
);

const PARTICLE_LAYERS = [0, 1, 2, 3] as const;

function greyFromHeight(bottomPx: number): string {
  const t = Math.min(1, Math.max(0, bottomPx / MAX_LAYER_HEIGHT));
  const index = Math.round(t * (LAYER_GREYS.length - 1));
  return LAYER_GREYS[index];
}

/** Further rings and higher lifts read lighter. */
function greyForParticle(spread: number, distance: number, lift: number): string {
  const spreadT = spread / 3;
  const distanceT = Math.min(1, distance / 380);
  const liftT = Math.min(1, lift / 240);
  const t = spreadT * 0.5 + distanceT * 0.35 + liftT * 0.15;
  const index = Math.round(t * (LAYER_GREYS.length - 1));
  return LAYER_GREYS[Math.min(LAYER_GREYS.length - 1, Math.max(2, index))];
}

function appearStyle(
  waveStartVh: number,
  spread: number,
  durationVh = 1.5,
  delayVh = 0,
): CSSProperties {
  const start = waveStartVh + spread * durationVh + delayVh;

  return {
    "--smoke-appear-start": `${start}vh`,
    "--smoke-appear-end": `${start + durationVh}vh`,
  } as CSSProperties;
}

function smokeIndexStyle(index: number, waveStartVh: number): CSSProperties {
  return appearStyle(waveStartVh, Math.abs(index - CENTER_INDEX));
}

/** Lower on screen = closer = higher z-index. */
function depthZ(bottomPx: number): number {
  return Math.max(0, Math.round(MAX_ELEVATED_BOTTOM + MAX_SMOKE_SIZE - bottomPx));
}

function SmokeRow({
  waveStartVh,
  bottom,
  shiftX,
}: {
  waveStartVh: number;
  bottom: number;
  shiftX: number;
}) {
  const fill = greyFromHeight(bottom + MAX_SMOKE_SIZE * 0.35);

  return (
    <div
      className="absolute inset-x-0 flex items-end justify-center"
      style={{
        bottom: bottom - SMOKE_SINK,
        zIndex: depthZ(bottom),
        transform: `translateX(${shiftX}px)`,
      }}
    >
      {STUDIO_SMOKE.map((circle, index) => (
        <div
          key={index}
          className="studio-smoke relative shrink-0 rounded-full"
          style={{
            width: circle.w,
            height: circle.w,
            zIndex: circle.z,
            marginLeft: circle.ml ? -circle.ml : undefined,
            marginRight: circle.mr ? -circle.mr : undefined,
            backgroundColor: fill,
            ...smokeIndexStyle(index, waveStartVh),
          }}
        />
      ))}
    </div>
  );
}

export function StudioSmoke() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 w-full"
      style={{ minHeight: MAX_ELEVATED_BOTTOM + MAX_SMOKE_SIZE + 160 }}
    >
      {SMOKE_WAVES.flatMap((wave, waveIndex) => {
        const rows = [
          <SmokeRow
            key={`${waveIndex}-base`}
            waveStartVh={wave.scrollStartVh}
            bottom={wave.baseLift}
            shiftX={wave.shiftX}
          />,
        ];

        if (wave.elevatedBottom != null) {
          rows.push(
            <SmokeRow
              key={`${waveIndex}-elevated`}
              waveStartVh={wave.scrollStartVh}
              bottom={wave.elevatedBottom}
              shiftX={-wave.shiftX * 0.65}
            />,
          );
        }

        return rows;
      })}

      {PARTICLE_LAYERS.map((spread) => (
        <div
          key={`particles-${spread}`}
          className="absolute inset-x-0 bottom-0"
          style={{ zIndex: 120 + spread * 12, minHeight: MAX_ELEVATED_BOTTOM + MAX_SMOKE_SIZE + 160 }}
        >
          {SMOKE_PARTICLES.filter((p) => p.spread === spread).map((particle) => {
            const size = sizeForDistance(particle.distance);

            return (
            <div
              key={`${particle.distance}-${particle.x}`}
              aria-hidden
              className="studio-smoke-particle absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `calc(50% + ${particle.x}px)`,
                marginLeft: -size / 2,
                bottom: particle.lift - SMOKE_SINK,
                backgroundColor: greyForParticle(
                  particle.spread,
                  particle.distance,
                  particle.lift,
                ),
                ...appearStyle(0, particle.spread, 1.5, 0.25),
              }}
            />
            );
          })}
        </div>
      ))}
    </div>
  );
}
