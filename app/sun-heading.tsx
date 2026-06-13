"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedStudioHeading } from "./animated-studio-heading";

const LINES = [["we", "can", "help."]] as const;

function isEnteringView(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return rect.top < vh * 0.92 && rect.bottom > vh * 0.08;
}

export function SunHeading() {
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

  const headingRef = useCallback(
    (el: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (scrollCheckRef.current) {
        window.removeEventListener("scroll", scrollCheckRef.current);
        window.removeEventListener("resize", scrollCheckRef.current);
        scrollCheckRef.current = null;
      }

      if (!el || doneRef.current) return;

      const check = () => {
        if (isEnteringView(el)) activate();
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
    <div ref={headingRef} className="pt-8">
      <AnimatedStudioHeading
        id="sun-heading"
        lines={LINES}
        level={1}
        as="h1"
        animationKey="sun"
        active={active}
        className="shrink-0 text-[clamp(2.5rem,6vw,5.75rem)]"
      />
    </div>
  );
}
