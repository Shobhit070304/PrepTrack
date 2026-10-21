import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrepTrack — Your progress, your pace",
  description: "A focused workspace to organize your exam preparation and track every step forward.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
