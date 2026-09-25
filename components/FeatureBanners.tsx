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
          aria-label="Banner bağlantısı"
        >
          <span className="feature-banner__arrow" aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
        </Link>
      ))}
    </section>
  );
}
