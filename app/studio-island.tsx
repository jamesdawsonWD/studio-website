"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

const ISLAND_HEIGHT_PX = 44;
const ISLAND_RADIUS_PX = 28;
const ISLAND_OFFSET_PX = 24;

type Props = {
  /** True once the user has scrolled past the LAUNCH button. */
  visible: boolean;
  /** Content rendered inside the pill — defaults to the studio wordmark. */
  children?: ReactNode;
};

// Visual-chrome-only dynamic island, ported in spirit from the tech-blog
// version. Fixed to the bottom of the viewport, springs up from below when
// visible flips true and snaps back out when it flips false. No views, no
// audio, no drag — keep it as a launch-pad for adding those later if wanted.
export function StudioIsland({ visible, children }: Props) {
  return (
    <div
      aria-hidden={!visible}
      className="pointer-events-none fixed inset-x-0 z-[9999] flex justify-center"
      style={{ bottom: ISLAND_OFFSET_PX }}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: ISLAND_HEIGHT_PX + ISLAND_OFFSET_PX * 2, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: ISLAND_HEIGHT_PX + ISLAND_OFFSET_PX * 2, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.7 }}
            className="pointer-events-auto"
          >
            <div
              className="flex items-center bg-studio-card px-5 text-sm font-medium tracking-wide text-white shadow-studio-card"
              style={{
                height: ISLAND_HEIGHT_PX,
                borderRadius: ISLAND_RADIUS_PX,
              }}
            >
              {children ?? "STUDIO"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
