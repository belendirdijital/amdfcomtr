"use client";

import {
  CalendarDays,
  ChevronRight,
  Crosshair,
  FileText,
  House,
  Menu,
  ShieldCheck,
  Trophy,
  UsersRound,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandMark from "@/components/BrandMark";

const LINKS = [
  { href: "/", label: "Ana Sayfa", icon: House },
  { href: "/standings", label: "Puan Durumu", icon: Trophy },
  { href: "/fixtures", label: "Fikstür", icon: CalendarDays },
  { href: "/scorers", label: "Gol Kralı", icon: Crosshair },
  { href: "/fairplay", label: "Fair Play", icon: ShieldCheck },
  { href: "/teams", label: "Takımlar", icon: UsersRound },
  { href: "/documents", label: "Belgeler", icon: FileText }
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <button
            type="button"
            className="site-menu-toggle"
            aria-label="Menüyü aç"
            aria-expanded={menuOpen}
            aria-controls="site-drawer"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
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

      {/* Header'ın backdrop-filter'ı fixed konumlamayı bozduğu için çekmece header dışında. */}
      <div
        className={menuOpen ? "site-drawer site-drawer--open" : "site-drawer"}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <button
          type="button"
          className="site-drawer__backdrop"
          aria-label="Menüyü kapat"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
        />
        <aside
          id="site-drawer"
          className="site-drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Ana menü"
        >
          <div className="site-drawer__head">
            <Link href="/" className="site-drawer__brand" onClick={() => setMenuOpen(false)}>
              <BrandMark className="site-drawer__logo" size={44} />
              <span>
                <strong>Anadolu Masterler</strong>
                <small>Dostluk Federasyonu</small>
              </span>
            </Link>
            <button
              type="button"
              className="site-drawer__close"
              aria-label="Menüyü kapat"
              onClick={() => setMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <span className="site-drawer__eyebrow">Menü</span>
          <nav className="site-drawer__nav" aria-label="Mobil menü">
            {LINKS.map((link, index) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? "site-drawer__link site-drawer__link--active" : "site-drawer__link"}
                  aria-current={active ? "page" : undefined}
                  style={{ transitionDelay: menuOpen ? `${80 + index * 35}ms` : "0ms" }}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="site-drawer__icon">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <span className="site-drawer__label">{link.label}</span>
                  <ChevronRight className="site-drawer__chevron" size={16} />
                </Link>
              );
            })}
          </nav>

          <div className="site-drawer__foot">
            <span className="site-drawer__season">Veteranlar Ligi</span>
            <strong>2026 Sezonu</strong>
          </div>
        </aside>
      </div>
    </>
  );
}
