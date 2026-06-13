export type StarDot = {
  x: number;
  y: number;
  size: number;
  opacityMin: number;
  opacityMax: number;
  phase: number;
  twinkleSpeed: number;
};

export type StarfieldLayerConfig = {
  id: string;
  weight: number;
  count: number;
  seed: number;
  sizeRange: [number, number];
};

/** Depth layers — weights match the old DOM parallax starfield. */
export const FIXED_STARFIELD_LAYERS: ReadonlyArray<StarfieldLayerConfig> = [
  { id: "far", weight: 0.06, count: 280, seed: 4206, sizeRange: [1, 2.5] },
  { id: "mid", weight: 0.1, count: 140, seed: 9061, sizeRange: [1.5, 3] },
  { id: "near", weight: 0.14, count: 60, seed: 1337, sizeRange: [2, 4] },
];

/** Seeded PRNG — stable star positions across SSR and client. */
export function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function buildStarLayer(
  count: number,
  seed: number,
  sizeRange: [number, number],
  fieldWidth: number,
  fieldHeight: number,
): StarDot[] {
  const rand = createRng(seed);
  const [minSize, maxSize] = sizeRange;

  return Array.from({ length: count }, () => {
    const size = minSize + rand() * (maxSize - minSize);
    return {
      x: rand() * fieldWidth,
      y: rand() * fieldHeight,
      size,
      opacityMin: 0.15 + rand() * 0.25,
      opacityMax: 0.55 + rand() * 0.45,
      phase: rand() * Math.PI * 2,
      twinkleSpeed: 0.8 + rand() * 1.6,
    };
  });
}

export function readScrollHeightVh(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--studio-scroll-height")
    .trim();
  const match = raw.match(/^([\d.]+)vh$/);
  return match ? Number.parseFloat(match[1]) : 800;
}
