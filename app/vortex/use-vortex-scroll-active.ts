"use client";

import { useEffect, useState } from "react";
import { readCssLengthPx } from "../read-css-length-px";

/** True once scroll enters the vortex pin range. */
export function useVortexScrollActive() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let pinStart = readCssLengthPx("--studio-vortex-pin-start");

    const sync = () => {
      pinStart = readCssLengthPx("--studio-vortex-pin-start");
      setActive(window.scrollY >= pinStart);
    };

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    sync();

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return active;
}
