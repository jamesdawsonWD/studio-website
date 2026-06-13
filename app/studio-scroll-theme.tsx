"use client";

import { useEffect } from "react";

/** Enables scroll-driven cream → space background on html for the parallax scene. */
export function StudioScrollTheme() {
  useEffect(() => {
    document.documentElement.classList.add("studio-scroll-scene");
    return () => {
      document.documentElement.classList.remove("studio-scroll-scene");
    };
  }, []);

  return null;
}
