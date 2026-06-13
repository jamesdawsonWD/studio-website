import { StudioWeeGuy } from "./studio-wee-guy";

/** Floor line + walkers that stay on the ground (parallax). */
export function StudioFloorWalkers() {
  return (
    <div
      aria-hidden
      className="studio-floor-walkers pointer-events-none absolute inset-x-0 bottom-0 h-10 overflow-visible"
    >
      <div className="absolute inset-x-0 bottom-0 border-t border-studio-ink" />

      <div className="absolute inset-x-0 bottom-0 z-[46] h-11 overflow-visible">
        <div className="studio-wee-walker studio-wee-walker--ltr studio-wee-walker--ltr-alt absolute">
          <div className="studio-wee-stay">
            <StudioWeeGuy facing="right" bounceDelay="-0.42s" />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[52] h-11 overflow-visible">
        <div className="studio-wee-walker studio-wee-walker--rtl absolute">
          <div className="studio-wee-stay">
            <StudioWeeGuy facing="left" bounceDelay="-0.25s" />
          </div>
        </div>
        <div className="studio-wee-chat-row absolute left-[58%] flex items-end gap-0.5">
          <div className="studio-wee-stay">
            <StudioWeeGuy facing="right" bounceDelay="-0.35s" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Scroll-driven hop copies — must share the floor walkers' parallax layer so
 * the arc stays on the drifting ground line (fixed positioning desyncs immediately).
 */
export function StudioFloorLaunchers() {
  return (
    <div
      aria-hidden
      className="studio-floor-launchers pointer-events-none absolute inset-x-0 bottom-0 z-[49] h-11 overflow-visible"
    >
      <div className="studio-wee-launch-slot studio-wee-launch-slot--ltr">
        <div className="studio-wee-launch studio-wee-launch--ltr">
          <StudioWeeGuy facing="right" bounceDelay="-0.1s" />
        </div>
      </div>

      <div className="studio-wee-launch-slot studio-wee-launch-slot--chat-b">
        <div className="studio-wee-launch studio-wee-launch--chat-b">
          <StudioWeeGuy facing="left" bounceDelay="-0.18s" />
        </div>
      </div>
    </div>
  );
}
