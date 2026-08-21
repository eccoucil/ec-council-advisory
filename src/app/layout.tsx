import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans({
  variable: "--font-ibm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const display = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "EC-Council AI Advisory Board",
  description:
    "Member access for the EC-Council Artificial Intelligence Advisory Board.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
