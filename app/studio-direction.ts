export type StudioDirection = "launch" | "elevate" | "accelerate";

export const STUDIO_DIRECTION_OPTIONS: ReadonlyArray<{
  id: StudioDirection;
  label: string;
}> = [
  { id: "launch", label: "Software development" },
  { id: "elevate", label: "Userflow consulting" },
  { id: "accelerate", label: "Web performance consulting" },
];

export type DirectionPathContent = {
  headline: string;
  description: string;
  bullets: ReadonlyArray<string>;
};

export type DirectionCraftContent = {
  title: string;
  subtitle: string;
};

export const DIRECTION_CRAFT: Record<StudioDirection, DirectionCraftContent> = {
  launch: {
    title: "Craft for the web",
    subtitle: "Launch-ready sites with the same care we bring to products.",
  },
  elevate: {
    title: "Craft for your feature",
    subtitle: "Polish the flow you have — motion, UX, and the details users feel.",
  },
  accelerate: {
    title: "Craft at speed",
    subtitle: "Beautiful interfaces that stay fast as you ship.",
  },
};

export const DIRECTION_PATHS: Record<StudioDirection, DirectionPathContent> = {
  launch: {
    headline: "Launch something people trust",
    description:
      "We design and build marketing sites and products that are accessible, discoverable, and a joy to use.",
    bullets: [
      "Inclusive UX from day one",
      "SEO and AEO baked in",
      "Fast, polished launches",
    ],
  },
  elevate: {
    headline: "Make what you have irresistible",
    description:
      "We embed with your team to elevate an existing flow — interaction design, motion, and the details users feel.",
    bullets: [
      "Research-led UX improvements",
      "Prototype → ship in your stack",
      "Measure what actually changed",
    ],
  },
  accelerate: {
    headline: "Fast and beautiful, together",
    description:
      "We treat performance as a design constraint and craft interfaces that feel instant without looking sterile.",
    bullets: [
      "Core Web Vitals as a brief",
      "Design systems that scale",
      "Ship speed without the jank",
    ],
  },
};
