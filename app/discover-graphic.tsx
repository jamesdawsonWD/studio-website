"use client";

import { useEffect, useState } from "react";

const TERMS = ["SEO", "AEO", "schema", "sitemap", "meta", "discover"] as const;

export function DiscoverGraphic() {
  const [termIndex, setTermIndex] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const termId = setInterval(() => {
      setTermIndex((i) => (i + 1) % TERMS.length);
    }, 2200);
    return () => clearInterval(termId);
  }, []);

  useEffect(() => {
    const pulseId = setInterval(() => setPulse((p) => !p), 1600);
    return () => clearInterval(pulseId);
  }, []);

  const term = TERMS[termIndex];

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-6 md:gap-6 md:px-8 md:py-8">
      <div
        className="absolute size-48 rounded-full border border-white/10 transition-transform duration-[1600ms] ease-out"
        style={{
          transform: pulse ? "scale(1.12)" : "scale(0.88)",
          opacity: pulse ? 0.35 : 0.15,
        }}
        aria-hidden
      />
      <div
        className="absolute size-32 rounded-full border border-white/15 transition-transform duration-[1600ms] ease-out delay-100"
        style={{
          transform: pulse ? "scale(1.05)" : "scale(0.95)",
          opacity: pulse ? 0.25 : 0.1,
        }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[280px]">
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
          <svg
            viewBox="0 0 24 24"
            className="size-5 shrink-0 text-white/50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M16 16l5 5" strokeLinecap="round" />
          </svg>
          <span className="text-[15px] text-white/90">
            How do I find{" "}
            <span
              key={term}
              className="inline-block font-semibold text-white"
              style={{ fontFamily: "var(--font-instrument-sans)" }}
            >
              {term}
            </span>
            ?
          </span>
        </div>
        <ul className="mt-3 space-y-2" aria-hidden>
          {[0.9, 0.65, 0.4].map((opacity, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2 transition-opacity duration-500"
              style={{ opacity: i === 0 ? 1 : opacity }}
            >
              <span className="size-2 shrink-0 rounded-full bg-[#7CE3A0]" />
              <span
                className="h-2 rounded-full bg-white/20"
                style={{ width: `${72 - i * 18}%` }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
