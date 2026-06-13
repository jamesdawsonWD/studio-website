import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StudioContentRailProps = {
  children: ReactNode;
  className?: string;
};

/** Full-width column with shared horizontal gutters (--studio-content-gutter). */
export function StudioContentRail({
  children,
  className,
}: StudioContentRailProps) {
  return (
    <div
      className={cn("w-full text-left", className)}
      style={{
        paddingLeft: "var(--studio-content-gutter)",
        paddingRight: "var(--studio-content-gutter)",
      }}
    >
      {children}
    </div>
  );
}
