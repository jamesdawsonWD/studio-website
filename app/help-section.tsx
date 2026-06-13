"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedStudioHeading } from "./animated-studio-heading";
import { StudioContentRail } from "./studio-content-rail";
import { StudioHeading } from "./studio-heading";

const SECOND_LINE = [
  ["Connecting", "meaningfully", "with", "people", "is", "harder", "than", "ever."],
] as const;

/** Matches the fast scroll-driven timing we tuned earlier. */
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

export function HelpSection() {
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
    <section className="flex h-full min-h-screen w-full items-center justify-center">
      <StudioContentRail>
        <StudioHeading
          level={2}
          className="max-w-[790px] text-left text-balance"
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
            We live in an overwhelmed world.
          </motion.span>
          <AnimatedStudioHeading
            as="span"
            lines={SECOND_LINE}
            level={2}
            className="block"
            animationKey="help-line-2"
            active={active}
            timing={{
              delay: TIMING.line2Delay * 1000,
              stagger: TIMING.wordStagger,
              duration: TIMING.wordDuration,
            }}
          />
        </StudioHeading>
      </StudioContentRail>
    </section>
  );
}
