"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { Phone } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StudioLogoMark } from "./studio-logo-mark";
import { useStudioHeaderCreamClip } from "./use-studio-header-cream-clip";

const SIZE = 40;
const CONTACT_HREF = "https://jamesdawson.dev/#contact";

export function FixedLogo() {
  const logoCreamRef = useRef<HTMLSpanElement>(null);
  const buttonCreamRef = useRef<HTMLSpanElement>(null);
  const logoClip = useStudioHeaderCreamClip(logoCreamRef, {
    requireEllipseTop: true,
  });
  const buttonClip = useStudioHeaderCreamClip(buttonCreamRef, {
    requireEllipseTop: true,
  });

  return (
    <div className="fixed top-0 z-[100] flex h-20 w-full items-center justify-between px-[var(--studio-content-gutter)]">
      <a
        href="/studio"
        aria-label="Studio home"
        className="relative inline-flex items-center"
      >
        <StudioLogoMark size={SIZE} trackPupil />
        <motion.span
          ref={logoCreamRef}
          aria-hidden
          className="studio-header-cream-mask pointer-events-none absolute inset-0 flex items-center"
          style={{ clipPath: logoClip, willChange: "clip-path" }}
        >
          <StudioLogoMark size={SIZE} tone="cream" />
        </motion.span>
      </a>

      <div className="relative inline-flex">
        <Button asChild className="h-10 px-5">
          <a href={CONTACT_HREF}>
            <Phone aria-hidden />
            Book a call
          </a>
        </Button>
        <motion.span
          ref={buttonCreamRef}
          aria-hidden
          className="studio-header-cream-mask pointer-events-none absolute inset-0"
          style={{ clipPath: buttonClip, willChange: "clip-path" }}
        >
          <a
            href={CONTACT_HREF}
            className={cn(
              buttonVariants({
                className:
                  "h-10 w-full px-5 bg-studio-cream text-studio-ink hover:bg-studio-cream/90",
              }),
            )}
          >
            <Phone aria-hidden />
            Book a call
          </a>
        </motion.span>
      </div>
    </div>
  );
}
