"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { CraftSection } from "./craft-section";
import { StudioFixedStarfield } from "./studio-fixed-starfield";
import { StudioScrollTheme } from "./studio-scroll-theme";
import { FixedLogo } from "./fixed-logo";
import { HeroTitle } from "./hero-title";
import { DirectionPathSection } from "./direction-path-section";
import { DirectionSection } from "./direction-section";
import { HelpSection } from "./help-section";
import { SunSection } from "./sun-section";
import type { StudioDirection } from "./studio-direction";
import { DetailsSection } from "./details-section";
import { SpeedSection } from "./speed-section";
import { VortexSection } from "./vortex-section";
import { useVortexExit } from "./vortex/use-vortex-exit";
import { ParallaxLayer } from "./parallax-layer";
import { StudioSmoke } from "./studio-smoke";
import { StudioIsland } from "./studio-island";
import { StudioRocket } from "./studio-rocket";
import { StudioFloorLaunchers, StudioFloorWalkers } from "./studio-floor-walkers";
import { StudioTrees } from "./studio-trees";
import { TiltCloud } from "./tilt-cloud";

// ─── Scene config ──────────────────────────────────────────────────────────
// All scroll-linked motion is CSS-driven. React only owns click-to-rain
// state. To extend/reorder the main content stack, edit SCENE_STEPS and the
// renderSceneStep switch below.

const SCENE = {
  /** Total document height. The sticky scene pins for the first 100vh,
   *  leaving (totalHeight − 100vh) of scrollable distance — this drives
   *  --studio-scroll-height in globals.css (currently 1200vh → 1100vh). */
  totalHeight: "1200vh",
  /** CSS perspective enables future translateZ depth poses on layers. */
  perspective: 1200,
  /** Drift multiplier vs scroll distance. Clouds + banner share this so
   *  they all descend at the same visual cadence. */
  parallaxWeight: 1.5,
  cloudWeight: 0.9
} as const;

type CloudConfig = {
  key: string;
  top: string;
  left?: string;
  right?: string;
  width: number;
  facing: "left" | "right";
};

/** Each cloud is a ParallaxLayer with a TiltCloud inside. Negative `top`
 *  values start the cloud above the viewport so it descends into view as
 *  the rocket "climbs" past it. */
const CLOUDS: ReadonlyArray<CloudConfig> = [
  { key: "low-left", top: "20%", left: "8%", width: 260, facing: "left" },
  { key: "low-right", top: "30%", right: "6%", width: 280, facing: "right" },
  { key: "high-left", top: "-60vh", left: "22%", width: 240, facing: "left" },
  { key: "high-right", top: "-130vh", right: "18%", width: 220, facing: "right" },
];

/** Semantic order for screen readers and keyboard users. `step` is the visual
 *  starting lane on the parallax track. Smaller steps drift into view earlier,
 *  so these should read from top-to-bottom in the intended scroll order.
 *  Move sections by changing/reordering this list instead of chasing `top`.
 */
const SCENE_STEPS = [
  { id: "help", step: 2 },
  { id: "direction", step: 4 },
  { id: "sun", step: 5 },
  { id: "craft", step: 6 },
  { id: "speed", step: 7 },
  { id: "details", step: 9 },
  { id: "vortex", step: 10 },
  { id: "path", step: 12 },
] as const;

const DIRECTION_STORAGE_KEY = "studio-direction";

const WATER_HEIGHT_RAINING = "130px";
const WATER_HEIGHT_DRY = "0px";
const WATER_TRANSITION_MS = 4000;

type SceneStepId = (typeof SCENE_STEPS)[number]["id"];

type SceneStepLayerProps = {
  step: number;
  children: ReactNode;
  className?: string;
  fillsViewport?: boolean;
  /** Rays / clouds that extend past the step need visible overflow (x-clip forces y auto). */
  overflowVisible?: boolean;
  /** Paint order vs other steps — sun sits behind direction cloud stack. */
  zClass?: string;
};

type SceneStepStyle = CSSProperties & {
  "--studio-step": number;
};

function SceneStepLayer({
  step,
  children,
  className = "",
  fillsViewport = true,
  overflowVisible = false,
  zClass = "z-20",
}: SceneStepLayerProps) {
  return (
    <ParallaxLayer
      weight={SCENE.parallaxWeight}
      culled
      className={[
        "studio-scene-step absolute inset-x-0",
        zClass,
        overflowVisible ? "overflow-visible" : "overflow-x-clip",
        fillsViewport ? "h-screen" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--studio-step": step } as SceneStepStyle}
    >
      {children}
    </ParallaxLayer>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function StudioClone() {
  useVortexExit();

  const [rain, setRain] = useState<Record<string, boolean>>({});
  const toggleRain = (key: string) =>
    setRain((r) => ({ ...r, [key]: !r[key] }));
  const bothLowRaining = rain["low-left"] && rain["low-right"];

  // The launch button drifts via the parallax transform; once it leaves the
  // viewport, the studio island springs up from the bottom. IntersectionObserver
  // reads the transformed bounding rect, so we don't need a scroll listener.
  const launchRef = useRef<HTMLButtonElement>(null);
  const [islandVisible, setIslandVisible] = useState(false);
  const [direction, setDirection] = useState<StudioDirection | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(DIRECTION_STORAGE_KEY);
      if (
        stored === "launch" ||
        stored === "elevate" ||
        stored === "accelerate"
      ) {
        setDirection(stored);
      }
    } catch {
      /* private mode / blocked storage */
    }
  }, []);

  const clearDirection = () => {
    setDirection(null);
    try {
      sessionStorage.removeItem(DIRECTION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const renderSceneStep = (id: SceneStepId) => {
    switch (id) {
      case "help":
        return <HelpSection />;
      case "sun":
        return <SunSection />;
      case "direction":
        return <DirectionSection />;
      case "path":
        return direction ? (
          <DirectionPathSection
            direction={direction}
            onChangeDirection={clearDirection}
          />
        ) : null;
      case "craft":
        return <CraftSection direction={direction} />;
      case "speed":
        return <SpeedSection />;
      case "vortex":
        return <VortexSection />;
      case "details":
        return <DetailsSection />;
      default:
        id satisfies never;
        return null;
    }
  };

  useEffect(() => {
    const el = launchRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIslandVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <StudioScrollTheme />
      <FixedLogo />
      <main
        className="studio-scene-main relative overflow-x-clip"
        style={{
          height: SCENE.totalHeight,
          perspective: `${SCENE.perspective}px`,
        }}
      >
        <div className="sticky top-0 z-10 flex h-screen w-full flex-col items-center justify-center overflow-visible">
          <StudioFixedStarfield placement="absolute" />
          {/* DOM order is bottom-up for accessibility; explicit z-index preserves
              paint order (melody < clouds < banner < hero < water). Smoke lives in
              a fixed layer (see below) so smoke can stack above the rocket on takeoff. */}

          <ParallaxLayer
            aria-hidden
            weight={SCENE.parallaxWeight}
            culled
            mountBeforeVortexReset
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[48] overflow-x-clip"
          >
            <StudioTrees />
          </ParallaxLayer>

          <ParallaxLayer
            aria-hidden
            weight={SCENE.parallaxWeight}
            culled
            mountBeforeVortexReset
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[48] overflow-visible"
          >
            <StudioFloorWalkers />
            <StudioFloorLaunchers />
          </ParallaxLayer>

          <ParallaxLayer
            aria-hidden
            weight={SCENE.parallaxWeight}
            culled
            mountBeforeVortexReset
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 bg-studio-water"
            style={{
              height: bothLowRaining ? WATER_HEIGHT_RAINING : WATER_HEIGHT_DRY,
              transitionProperty: "height",
              transitionDuration: `${WATER_TRANSITION_MS}ms`,
              transitionTimingFunction: "ease-out",
            }}
          />

          <ParallaxLayer
            weight={SCENE.parallaxWeight}
            culled
            mountBeforeVortexReset
            className="relative z-10 flex h-screen w-full flex-col items-center justify-center gap-14 px-6 text-center"
          >
            <div className="relative flex w-full max-w-4xl flex-col items-stretch gap-1.5 pb-[38px] text-center">
              <HeroTitle />
              <p className="text-[20px] font-normal leading-[1.2] tracking-[-0.02em]">
                Design engineering by{" "}
                <a
                  href="https://jamesdawson.dev"
                  className="font-medium underline underline-offset-2"
                >
                  James Dawson
                </a>
              </p>
          
            </div>
          </ParallaxLayer>

          {CLOUDS.map((c) => (
            <ParallaxLayer
              key={c.key}
              weight={SCENE.cloudWeight}
              culled
              mountBeforeVortexReset={
                c.key === "low-left" || c.key === "low-right"
              }
              className="absolute z-0 select-none"
              style={{
                top: c.top,
                left: c.left,
                right: c.right,
                width: c.width,
              }}
            >
              <TiltCloud
                facing={c.facing}
                raining={!!rain[c.key]}
                onToggle={() => toggleRain(c.key)}
              />
            </ParallaxLayer>
          ))}

          {SCENE_STEPS.map(({ id, step }) => {
            const content = renderSceneStep(id);
            if (!content) return null;

            return (
              <SceneStepLayer
                key={id}
                step={step}
                fillsViewport={id !== "vortex" && id !== "details"}
                className={
                  id === "vortex"
                    ? "h-[var(--studio-vortex-height,200vh)]"
                    : id === "details"
                      ? "min-h-[var(--studio-details-step-height)]"
                      : ""
                }
                overflowVisible={
                  id === "sun" ||
                  id === "direction" ||
                  id === "craft" ||
                  id === "speed" ||
                  id === "vortex" ||
                  id === "details"
                }
                zClass={
                  id === "direction"
                    ? "z-30"
                    : id === "sun"
                      ? "z-25"
                      : id === "vortex"
                        ? "z-[21]"
                        : "z-20"
                }
              >
                {content}
              </SceneStepLayer>
            );
          })}
        </div>
      </main>

      <StudioRocket />
      <StudioRocket variant="vortex" culled />

      <ParallaxLayer
        weight={SCENE.parallaxWeight}
        culled
        mountBeforeVortexReset
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[55]"
      >
        <StudioSmoke />
      </ParallaxLayer>

      <StudioIsland visible={islandVisible} />
    </>
  );
}
