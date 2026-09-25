import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Anadolu Masterler · Dostluk Federasyonu",
    template: "%s · AMDF"
  },
  description:
    "Anadolu Masterler Dostluk Federasyonu Veteranlar Ligi puan durumu, fikstür, gol kralı ve fair play.",
  icons: {
    icon: "/logo.png?v=2",
    apple: "/logo.png?v=2"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
