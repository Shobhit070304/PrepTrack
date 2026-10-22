import type { Metadata } from "next";
import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrepTrack — Exam preparation, made clear",
  description: "Explore your syllabus, track every topic, and make steady progress toward your exam.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-950 font-sans text-zinc-100 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
