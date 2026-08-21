import type { Metadata } from "next";
import { Arimo } from "next/font/google";
import "./globals.css";

const sans = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${sans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`${sans.className} min-h-full`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
