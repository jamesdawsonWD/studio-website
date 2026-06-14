import type { Metadata } from "next";
import { Inter, Instrument_Sans, Kanit } from "next/font/google";
import "./globals.css";
import { StudioProviders } from "./studio-providers";

export const metadata: Metadata = {
  title: "Studio",
  description: "A playful interactive Studio website clone.",
  icons: {
    icon: "/studio/icon.svg",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const kanit = Kanit({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-kanit",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${instrumentSans.variable} ${kanit.variable} text-studio-text`}
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <StudioProviders>{children}</StudioProviders>
      </body>
    </html>
  );
}
