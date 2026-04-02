import type { Metadata } from "next";
import { config } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${config.appName} | ${config.companyName}`,
  description: `Doe mee met de ${config.appName}! ${config.tagline}`,
  keywords: [config.appName, "Poule", "Voorspellingen", config.companyName],
  openGraph: {
    title: `${config.appName} | ${config.companyName}`,
    description: config.tagline,
    type: "website",
  },
  icons: {
    icon: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${config.favicon}</text></svg>`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="h-full antialiased">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
