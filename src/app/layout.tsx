import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WK Poule 2026 - Elloro X Recranet",
  description: "WK Poule voor het FIFA WK 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
