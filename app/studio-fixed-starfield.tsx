"use client";

import { useEffect, useRef, useState } from "react";
import { useFixedStarfieldCanvas } from "./use-fixed-starfield-canvas";

const SPACE_SECTION_SELECTOR =
  ".studio-craft-section, .studio-speed-section, .studio-details-section";

/** Fixed viewport canvas — parallax drift synced to root scroll. */
export function StudioFixedStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("studio-scroll-scene")) {
      setActive(true);
      return;
    }

    const sections = document.querySelectorAll(SPACE_SECTION_SELECTOR);
    if (sections.length === 0) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setActive(entries.some((entry) => entry.isIntersecting));
      },
      { threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useFixedStarfieldCanvas(canvasRef, active);

  return (
    <div
      aria-hidden
      className="studio-fixed-starfield pointer-events-none fixed inset-0 z-[3] overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
