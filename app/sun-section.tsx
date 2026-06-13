import { ParallaxLayer } from "./parallax-layer";
import { SunCharacter } from "./sun-character";
import { SunHeading } from "./sun-heading";
import { SunRainbow } from "./sun-rainbow";
import { StudioContentRail } from "./studio-content-rail";

const SUN_PARALLAX = 0.12;

/** Sun rises from behind the direction cloud backdrop as you scroll past the rain section. */
export function SunSection() {
  return (
    <section
      className="studio-sun-section relative flex h-full min-h-screen w-full items-center justify-center overflow-visible py-16"
      aria-labelledby="sun-heading"
    >
      <div aria-hidden className="studio-sun-space-band">
        <div className="studio-sun-space-band__buffer" />
        <div className="studio-sun-space-band__fill" />
        <div className="studio-craft-horizon pointer-events-none absolute bottom-0 left-1/2 z-[1]" />
      </div>
      <div aria-hidden className="studio-sun-space-band__fade" />
      <SunRainbow />
      <ParallaxLayer
        weight={SUN_PARALLAX}
        className="pointer-events-none relative z-[11] flex h-full w-full items-center overflow-visible"
      >
        <StudioContentRail className="w-full">
          <div className="flex w-full items-center justify-between gap-8 md:gap-12 lg:gap-16">
            <SunHeading />
            <div className="studio-sun-rise w-full max-w-[min(36vw,320px)] shrink-0">
              <SunCharacter />
            </div>
          </div>
        </StudioContentRail>
      </ParallaxLayer>
    </section>
  );
}
