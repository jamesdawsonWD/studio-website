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

/** Browsers block AudioContext until a user gesture — polling can't bypass that. */
const UNLOCK_EVENTS = [
  "pointerdown",
  "keydown",
  "touchstart",
  "wheel",
] as const;

type BeatListener = () => void;

type StudioAudioContextValue = {
  audioReady: boolean;
  /** Fires on each arpeggio pluck — subscribe instead of polling context state. */
  subscribeBeat: (listener: BeatListener) => () => void;
};

const StudioAudioContext = createContext<StudioAudioContextValue>({
  audioReady: false,
  subscribeBeat: () => () => {},
});

export function useStudioAudio() {
  return useContext(StudioAudioContext);
}

/** Site-wide guitar arpeggio + gesture unlock for the studio clone. */
export function StudioAudioProvider({ children }: { children: ReactNode }) {
  const [motionOk, setMotionOk] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
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

  useEffect(() => {
    let done = false;
    const opts = { capture: true, passive: true } as const;

    const start = (ok: boolean) => {
      if (!ok || done) return;
      done = true;
      setAudioReady(true);
      for (const event of UNLOCK_EVENTS) {
        document.removeEventListener(event, onGesture, opts);
      }
    };

    const onGesture = () => {
      void unlockAudio().then(start);
    };

    for (const event of UNLOCK_EVENTS) {
      document.addEventListener(event, onGesture, opts);
    }

    void unlockAudio().then(start);

    return () => {
      for (const event of UNLOCK_EVENTS) {
        document.removeEventListener(event, onGesture, opts);
      }
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!motionOk || !audioReady) return;

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
  }, [motionOk, audioReady, emitBeat]);

  return (
    <StudioAudioContext.Provider value={{ audioReady, subscribeBeat }}>
      {children}
    </StudioAudioContext.Provider>
  );
}
