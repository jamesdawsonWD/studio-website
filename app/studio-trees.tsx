const TREE_SRC = "/studio/group-55.svg";

/** Oversized so clusters bleed past the sides and below the viewport. */
const TREE_CLASS =
  "absolute h-auto w-[min(52vw,547px)] max-w-none origin-bottom select-none";

export function StudioTrees() {
  return (
    <>
      <img
        src={TREE_SRC}
        alt=""
        width={551}
        height={826}
        className={`${TREE_CLASS} bottom-0 left-0 -translate-x-[42.5%] translate-y-1/5`}
        draggable={false}
      />
      <img
        src={TREE_SRC}
        alt=""
        width={551}
        height={826}
        className={`${TREE_CLASS} bottom-0 right-0 translate-x-[42.5%] translate-y-1/5 -scale-x-100`}
        draggable={false}
      />
    </>
  );
}
