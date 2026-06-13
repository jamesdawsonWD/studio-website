"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { pluck, unlockAudio } from "./guitar";
import { getChordNotes } from "./studio-chords";

const BEAT_MS = 500;

/** Arpeggio high → low → high across the six chord strings. */
const ARPEGGIO = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1] as const;

type BeatListener = () => void;

type StudioAudioContextValue = {
  isPlaying: boolean;
  toggleAudio: () => Promise<void>;
  /** True while the arpeggio loop is running — gates beat-synced UI. */
  audioReady: boolean;
  subscribeBeat: (listener: BeatListener) => () => void;
};

const StudioAudioContext = createContext<StudioAudioContextValue>({
  isPlaying: false,
  toggleAudio: async () => {},
  audioReady: false,
  subscribeBeat: () => () => {},
});

export function useStudioAudio() {
  return useContext(StudioAudioContext);
}

/** Site-wide guitar arpeggio — starts only from the header toggle. */
export function StudioAudioProvider({ children }: { children: ReactNode }) {
  const [motionOk, setMotionOk] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const arpeggioIndexRef = useRef(0);
  const beatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatListenersRef = useRef(new Set<BeatListener>());

  const subscribeBeat = useCallback((listener: BeatListener) => {
    beatListenersRef.current.add(listener);
    return () => {
      beatListenersRef.current.delete(listener);
    };
  }, []);

  const emitBeat = useCallback(() => {
    for (const listener of beatListenersRef.current) {
      listener();
    }
  }, []);

  const toggleAudio = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const ok = await unlockAudio();
    if (!ok) return;
    setIsPlaying(true);
  }, [isPlaying]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!motionOk || !isPlaying) return;

    let cancelled = false;

    const playBeat = () => {
      if (cancelled) return;

      const string = ARPEGGIO[arpeggioIndexRef.current % ARPEGGIO.length];
      arpeggioIndexRef.current += 1;

      const chord = getChordNotes(performance.now());
      pluck(chord[string] ?? chord[0]);
      emitBeat();

      beatTimerRef.current = setTimeout(playBeat, BEAT_MS);
    };

    playBeat();

    return () => {
      cancelled = true;
      if (beatTimerRef.current) clearTimeout(beatTimerRef.current);
    };
  }, [motionOk, isPlaying, emitBeat]);

  return (
    <StudioAudioContext.Provider
      value={{
        isPlaying,
        toggleAudio,
        audioReady: isPlaying,
        subscribeBeat,
      }}
    >
      {children}
    </StudioAudioContext.Provider>
  );
}
