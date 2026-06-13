// Lazy WebAudio plucked-string synth. Sine fundamental + slightly detuned
// triangle body + a quiet octave shimmer, run through a closing lowpass and
// a soft AD envelope. Release is long (~2.6s) so overlapping plucks ring out
// as a chord rather than discrete hits.

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.32;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

/** Resume AudioContext. Must be called from a user-gesture handler (or on load when autoplay is allowed). */
export async function unlockAudio(): Promise<boolean> {
  const c = getCtx();
  if (!c) return false;
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      /* blocked until user gesture */
    }
  }
  return c.state === "running";
}

export function pluck(freq: number) {
  const c = getCtx();
  if (!c || !masterGain || c.state !== "running") return;

  const now = c.currentTime;

  const sine = c.createOscillator();
  sine.type = "sine";
  sine.frequency.value = freq;
  const sineGain = c.createGain();
  sineGain.gain.value = 0.55;

  const tri = c.createOscillator();
  tri.type = "triangle";
  tri.frequency.value = freq * 1.003;
  const triGain = c.createGain();
  triGain.gain.value = 0.35;

  const oct = c.createOscillator();
  oct.type = "sine";
  oct.frequency.value = freq * 2;
  const octGain = c.createGain();
  octGain.gain.value = 0.12;

  const mix = c.createGain();
  sine.connect(sineGain).connect(mix);
  tri.connect(triGain).connect(mix);
  oct.connect(octGain).connect(mix);

  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.6;
  filter.frequency.setValueAtTime(Math.min(freq * 9, 5500), now);
  filter.frequency.exponentialRampToValueAtTime(
    Math.max(freq * 1.3, 200),
    now + 1.6
  );

  const env = c.createGain();
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(0.4, now + 0.02);
  env.gain.exponentialRampToValueAtTime(0.001, now + 2.6);

  mix.connect(filter).connect(env).connect(masterGain);
  sine.start(now);
  tri.start(now);
  oct.start(now);
  sine.stop(now + 2.7);
  tri.stop(now + 2.7);
  oct.stop(now + 2.7);
}
