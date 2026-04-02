import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WK Poule 2026 | Recranet X Elloro",
  description: "Doe mee met de WK Poule 2026! Voorspel alle uitslagen van het FIFA WK in de VS, Canada en Mexico en strijd om de titel.",
  keywords: ["WK 2026", "WK Poule", "FIFA World Cup", "Voorspellingen", "Recranet", "Elloro"],
  openGraph: {
    title: "WK Poule 2026 | Recranet X Elloro",
    description: "Voorspel alle WK-uitslagen en strijd met je collega's om de eerste plek!",
    type: "website",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚽</text></svg>",
  },
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
