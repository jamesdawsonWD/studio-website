/** Resolves a CSS custom property length (including calc/vh) to pixels. */
export function readCssLengthPx(name: string, element: Element | null = null): number {
  const host = element ?? document.documentElement;
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.height = `var(${name})`;
  host.appendChild(probe);
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return px;
}
