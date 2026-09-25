"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandMark from "@/components/BrandMark";

const LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/standings", label: "Puan Durumu" },
  { href: "/fixtures", label: "Fikstür" },
  { href: "/scorers", label: "Gol Kralı" },
  { href: "/fairplay", label: "Fair Play" },
  { href: "/teams", label: "Takımlar" }
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-brand">
          <BrandMark />
          <span>
            <strong>Anadolu Masterler</strong>
            <small>Dostluk Federasyonu · Veteranlar</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Ana menü">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
