import { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";

export default function PublicShell({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="site-main">
        <section className="site-hero">
          <span className="eyebrow">Veteranlar Ligi · 2026</span>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </section>
        {children}
      </main>
      <footer className="site-footer">
        <div className="belendir-mark" aria-label="Belendir Dijital">
          <span className="belendir-mark__badge" aria-hidden="true">
            B
          </span>
          <span className="belendir-mark__text">
            <strong>Belendir</strong>
            <em>Dijital</em>
          </span>
        </div>
      </footer>
    </div>
  );
}
