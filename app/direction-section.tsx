"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedStudioHeading } from "./animated-studio-heading";
import { DirectionCloudBackdrop } from "./direction-cloud-backdrop";
import { DirectionCloudFlank } from "./direction-cloud-flank";
import { ParallaxLayer } from "./parallax-layer";
import { StudioHeading } from "./studio-heading";

/** Subtle depth on the step-4 layer — stay aligned, headline drifts slightly ahead. */
const DIRECTION_CLOUD_PARALLAX = 0.1;
const DIRECTION_TEXT_PARALLAX = 0.35;

const SECOND_LINE = [
  ["Especially", "when", "slop", "is", "making", "so", "much", "noise."],
] as const;

const TIMING = {
  wipe: 0.55,
  line2Delay: 0.32,
  wordStagger: 40,
  wordDuration: 450,
  ease: [0.22, 1, 0.36, 1] as const,
};

function isLineEnteringView(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return rect.top < vh * 0.92 && rect.bottom > vh * 0.08;
}

/** Scroll-driven dark clouds — no cards; direction comes from island / storage. */
export function DirectionSection() {
  const [active, setActive] = useState(false);
  const doneRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollCheckRef = useRef<(() => void) | null>(null);

  const activate = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setActive(true);
    observerRef.current?.disconnect();
    if (scrollCheckRef.current) {
      window.removeEventListener("scroll", scrollCheckRef.current);
      window.removeEventListener("resize", scrollCheckRef.current);
    }
  }, []);

  const line1Ref = useCallback(
    (el: HTMLSpanElement | null) => {
      observerRef.current?.disconnect();
      if (scrollCheckRef.current) {
        window.removeEventListener("scroll", scrollCheckRef.current);
        window.removeEventListener("resize", scrollCheckRef.current);
        scrollCheckRef.current = null;
      }

      if (!el || doneRef.current) return;

      const check = () => {
        if (isLineEnteringView(el)) activate();
      };
      scrollCheckRef.current = check;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) activate();
        },
        { threshold: 0 },
      );
      observerRef.current.observe(el);

      check();
      window.addEventListener("scroll", check, { passive: true });
      window.addEventListener("resize", check);
    },
    [activate],
  );

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      if (scrollCheckRef.current) {
        window.removeEventListener("scroll", scrollCheckRef.current);
        window.removeEventListener("resize", scrollCheckRef.current);
      }
    },
    [],
  );

  return (
    <section
      className="studio-direction-clouds relative h-full min-h-screen w-full overflow-x-clip overflow-y-visible"
      aria-labelledby="direction-cloud-heading"
    >
      <ParallaxLayer
        aria-hidden
        weight={DIRECTION_CLOUD_PARALLAX}
        className="pointer-events-none absolute inset-0 overflow-x-clip overflow-y-visible"
      >
        <DirectionCloudBackdrop />
        <DirectionCloudFlank />
      </ParallaxLayer>

      <ParallaxLayer
        weight={DIRECTION_TEXT_PARALLAX}
        className="relative z-10 flex h-full min-h-screen items-end justify-center px-6 pb-0"
      >
        <StudioHeading
          level={2}
          as="h2"
          id="direction-cloud-heading"
          className="max-w-[min(100%,790px)] text-center text-balance"
        >
          <motion.span
            ref={line1Ref}
            className="block"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={
              active
                ? { clipPath: "inset(0 0 0 0)" }
                : { clipPath: "inset(0 100% 0 0)" }
            }
            transition={{ duration: TIMING.wipe, ease: TIMING.ease }}
          >
            It can feel hopeless trying to find your voice.
          </motion.span>
          <AnimatedStudioHeading
            as="span"
            lines={SECOND_LINE}
            level={2}
            className="block"
            animationKey="direction-line-2"
            active={active}
            timing={{
              delay: TIMING.line2Delay * 1000,
              stagger: TIMING.wordStagger,
              duration: TIMING.wordDuration,
            }}
          />
        </StudioHeading>
      </ParallaxLayer>
    </section>
  );
}
