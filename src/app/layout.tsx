import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecTrace — Forensic Investigation Platform",
  description: "Your connected digital forensics workspace. Manage investigations, preserve evidence, verify integrity, and turn findings into clear reports.",
  applicationName: "SecTrace",
  icons: { icon: "/icon.svg" },
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><head><link rel="preload" href="/fonts/inter-400.ttf" as="font" type="font/ttf" crossOrigin="anonymous" /><link rel="preload" href="/fonts/rajdhani-600.ttf" as="font" type="font/ttf" crossOrigin="anonymous" /></head><body>{children}</body></html>;
}
