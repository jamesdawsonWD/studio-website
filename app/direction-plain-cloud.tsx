import {
  DIRECTION_CLOUD_PUFFS_RIGHT,
  DIRECTION_CLOUD_PUFF_R,
  DIRECTION_CLOUD_VIEWBOX_H,
  DIRECTION_CLOUD_VIEWBOX_W,
  mirrorDirectionCloudPuffs,
  type DirectionCloudSide,
} from "./direction-cloud-art";

type Props = {
  side?: DirectionCloudSide;
  className?: string;
};

/** Large rain-cloud art without the eye — for backdrop layers. */
export function DirectionPlainCloud({
  side = "right",
  className = "",
}: Props) {
  const puffs =
    side === "left"
      ? mirrorDirectionCloudPuffs(DIRECTION_CLOUD_PUFFS_RIGHT)
      : DIRECTION_CLOUD_PUFFS_RIGHT;

  return (
    <svg
      viewBox={`0 0 ${DIRECTION_CLOUD_VIEWBOX_W} ${DIRECTION_CLOUD_VIEWBOX_H}`}
      aria-hidden
      className={className ? `block w-full ${className}` : "block w-full"}
      shapeRendering="optimizeSpeed"
    >
      {puffs.map((puff) => (
        <circle
          key={`${puff.cx}-${puff.cy}-${puff.fill}`}
          cx={puff.cx}
          cy={puff.cy}
          r={DIRECTION_CLOUD_PUFF_R}
          fill={puff.fill}
        />
      ))}
    </svg>
  );
}
