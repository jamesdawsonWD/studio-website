"use client";

import { Phone, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudioAudio } from "./studio-audio-provider";
import { StudioLogoMark } from "./studio-logo-mark";

const SIZE = 40;
const CONTACT_HREF = "https://jamesdawson.dev/#contact";

function HeaderAudioToggle() {
  const { isPlaying, toggleAudio } = useStudioAudio();

  return (
    <Button
      type="button"
      size="lg"
      className="size-10 shrink-0 px-0"
      onClick={() => {
        void toggleAudio();
      }}
      aria-label={
        isPlaying ? "Pause background music" : "Play background music"
      }
      aria-pressed={isPlaying}
    >
      {isPlaying ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
    </Button>
  );
}

export function FixedLogo() {
  return (
    <div className="fixed top-0 z-[100] flex h-20 w-full items-center justify-between px-[var(--studio-content-gutter)]">
      <a href="/" aria-label="Studio home" className="flex items-center">
        <StudioLogoMark size={SIZE} trackPupil />
      </a>

      <div className="flex items-center gap-2">
        <HeaderAudioToggle />
        <Button asChild className="h-10 px-5">
          <a href={CONTACT_HREF}>
            <Phone aria-hidden />
            Book a call
          </a>
        </Button>
      </div>
    </div>
  );
}
