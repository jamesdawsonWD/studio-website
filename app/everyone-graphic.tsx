"use client";

import { useEffect, useState } from "react";

const PEOPLE = [
  { head: "#B794F6", body: "#9B7ED4" },
  { head: "#7AAEFF", body: "#5A94E8" },
  { head: "#7CE3A0", body: "#5BC982" },
  { head: "#FFE873", body: "#E8C84A" },
  { head: "#FFA754", body: "#E88A34" },
  { head: "#FF8585", body: "#E86A6A" },
  { head: "#D9D9D9", body: "#A8A8A8" },
] as const;

function Person({
  head,
  body,
  focused,
}: {
  head: string;
  body: string;
  focused: boolean;
}) {
  return (
    <div
      className="relative flex flex-col items-center"
      aria-hidden
    >
      <div
        className="absolute -inset-2 rounded-full transition-opacity duration-500"
        style={{
          opacity: focused ? 1 : 0,
          boxShadow: "0 0 0 3px #fff, 0 0 0 6px rgba(255,255,255,0.25)",
        }}
      />
      <div
        className="relative z-10 rounded-full"
        style={{ width: 28, height: 28, background: head }}
      />
      <div
        className="relative z-10 -mt-1 rounded-b-2xl rounded-t-md"
        style={{ width: 36, height: 44, background: body }}
      />
    </div>
  );
}

export function EveryoneGraphic() {
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFocusIndex((i) => (i + 1) % PEOPLE.length);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-wrap items-end justify-center gap-5 md:gap-6">
        {PEOPLE.map((p, i) => (
          <Person
            key={i}
            head={p.head}
            body={p.body}
            focused={i === focusIndex}
          />
        ))}
      </div>
      <p className="pointer-events-none absolute bottom-6 left-0 right-0 text-center text-[11px] font-medium tracking-wide text-white/35">
        Focus moves to everyone
      </p>
    </div>
  );
}
