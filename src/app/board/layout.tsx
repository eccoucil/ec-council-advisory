import { IBM_Plex_Mono, Inter, Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";

const pulseSans = Inter({
  subsets: ["latin"],
  variable: "--font-pulse-sans",
});

const pulseDisplay = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-pulse-display",
  weight: ["500", "600", "700"],
});

const pulseMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-pulse-mono",
  weight: "400",
});

export default function BoardLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`pulse ${pulseSans.variable} ${pulseDisplay.variable} ${pulseMono.variable} ${pulseSans.className}`}
    >
      {children}
    </div>
  );
}
