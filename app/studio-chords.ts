// I ii vi V in C — six strings per chord (high → low), same voicing as
// rainbow-waves. Top index = highest pitch (string 1).

export const CHORD_DURATION_MS = 2500;

export const CHORDS: ReadonlyArray<ReadonlyArray<number>> = [
  // I — Cmaj7
  [329.63, 246.94, 196.0, 164.81, 130.81, 65.41],
  // ii — Dm9
  [329.63, 220.0, 174.61, 146.83, 110.0, 73.42],
  // vi — Am7
  [392.0, 329.63, 261.63, 220.0, 164.81, 110.0],
  // V — G7
  [392.0, 293.66, 246.94, 174.61, 146.83, 98.0],
];

export const STRING_COUNT = CHORDS[0].length;

export function getChordNotes(atMs: number = performance.now()): ReadonlyArray<number> {
  const index = Math.floor(atMs / CHORD_DURATION_MS) % CHORDS.length;
  return CHORDS[index] ?? CHORDS[0];
}
