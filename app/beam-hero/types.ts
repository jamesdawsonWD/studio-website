export type SpeedLine = {
  x: number;
  y: number;
  width: number;
  speed: number;
  opacity: number;
  thickness: number;
};

export type AnimationState = {
  targetY: number;
  characterY: number;
  beamY: number;
  time: number;
  lines: SpeedLine[];
  mouseActive: boolean;
};

export type CanvasLayout = {
  width: number;
  height: number;
  characterX: number;
  minY: number;
  maxY: number;
  centerY: number;
};

export type BeamConfig = {
  beamOffsetX: number;
};

export const BEAM_CONFIG: BeamConfig = {
  beamOffsetX: 25,
};

export const FOLLOW_STRENGTH = 0.08;
export const RETURN_STRENGTH = 0.04;
/** Beam rolls behind the mascot — lower = more lag. */
export const BEAM_ROLL_STRENGTH = 0.045;
/** Pause before the mascot drifts back to center after pointer leaves. */
export const RETURN_DELAY_MS = 700;
