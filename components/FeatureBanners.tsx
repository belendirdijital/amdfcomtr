import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { SiteBanner } from "@/lib/types";

export default function FeatureBanners({ banners }: { banners: SiteBanner[] }) {
  if (!banners.length) return null;

  return (
    <section className="feature-banners" aria-label="Öne çıkan bağlantılar">
      {banners.map((banner) => (
        <Link
          key={banner.id}
          href={banner.href || "/"}
          className="feature-banner"
          style={{ backgroundImage: `url(${banner.imageUrl})` }}
        >
          <span className="feature-banner__shade" aria-hidden="true" />
          <span className="feature-banner__arrow" aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
          <span className="feature-banner__body">
            {banner.category && (
              <span className="feature-banner__category">{banner.category}</span>
            )}
            <strong>{banner.title}</strong>
            {banner.description && <small>{banner.description}</small>}
            {banner.buttonLabel && (
              <span className="feature-banner__cta">{banner.buttonLabel}</span>
            )}
          </span>
        </Link>
      ))}
    </section>
  );
}
