import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "V3 Ajans | Operasyon Paneli",
  description: "V3 Ajans iş ve organizasyon yönetim paneli"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
