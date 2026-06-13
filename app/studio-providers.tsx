"use client";

import type { ReactNode } from "react";
import { StudioAudioProvider } from "./studio-audio-provider";

export function StudioProviders({ children }: { children: ReactNode }) {
  return <StudioAudioProvider>{children}</StudioAudioProvider>;
}
