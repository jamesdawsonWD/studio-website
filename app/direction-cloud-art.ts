export type DirectionCloudSide = "left" | "right";

export const DIRECTION_CLOUD_VIEWBOX_W = 678;
export const DIRECTION_CLOUD_VIEWBOX_H = 455;
export const DIRECTION_CLOUD_PUFF_R = 83.9474;

export type DirectionCloudPuff = { cx: number; cy: number; fill: string };

/** Right-facing art from Group 59 — left variant mirrors cx (no scaleX). */
export const DIRECTION_CLOUD_PUFFS_RIGHT: ReadonlyArray<DirectionCloudPuff> = [
  { cx: 83.9474, cy: 156.411, fill: "#B2B2A9" },
  { cx: 176.914, cy: 241.053, fill: "#B2B2A9" },
  { cx: 211.603, cy: 118.947, fill: "#B2B2A9" },
  { cx: 289.306, cy: 185.55, fill: "#B2B2A9" },
  { cx: 387.947, cy: 286.411, fill: "#B2B2A9" },
  { cx: 480.914, cy: 371.053, fill: "#B2B2A9" },
  { cx: 515.603, cy: 248.947, fill: "#B2B2A9" },
  { cx: 593.306, cy: 315.55, fill: "#B2B2A9" },
  { cx: 368.947, cy: 121.411, fill: "#787872" },
  { cx: 461.914, cy: 206.053, fill: "#787872" },
  { cx: 496.603, cy: 83.9474, fill: "#787872" },
  { cx: 574.306, cy: 150.55, fill: "#787872" },
  { cx: 322.947, cy: 153.411, fill: "#44443F" },
  { cx: 415.914, cy: 238.053, fill: "#44443F" },
  { cx: 450.603, cy: 115.947, fill: "#44443F" },
  { cx: 528.306, cy: 182.55, fill: "#44443F" },
  { cx: 229.947, cy: 264.411, fill: "#787872" },
  { cx: 322.914, cy: 349.053, fill: "#787872" },
  { cx: 357.603, cy: 226.947, fill: "#787872" },
  { cx: 435.306, cy: 293.55, fill: "#787872" },
];

export const DIRECTION_CLOUD_WHITE_RIGHT = {
  cx: 343.993,
  cy: 289.653,
  r: 50.6459,
};

export function mirrorDirectionCloudPuffs(
  puffs: ReadonlyArray<DirectionCloudPuff>,
): DirectionCloudPuff[] {
  return puffs.map((puff) => ({
    ...puff,
    cx: DIRECTION_CLOUD_VIEWBOX_W - puff.cx,
  }));
}

export function mirrorDirectionCloudWhite(white: {
  cx: number;
  cy: number;
  r: number;
}) {
  return {
    cx: DIRECTION_CLOUD_VIEWBOX_W - white.cx,
    cy: white.cy,
    r: white.r,
  };
}
