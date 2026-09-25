"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SiteSlide } from "@/lib/types";

export default function HeroSlider({ slides }: { slides: SiteSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [count]);

  if (!count) return null;

  const slide = slides[Math.min(index, count - 1)];
  const go = (delta: number) => {
    setIndex((current) => (current + delta + count) % count);
  };

  return (
    <section className="hero-slider" aria-roledescription="carousel" aria-label="Öne çıkan">
      <Link
        href={slide.href || "/"}
        className="hero-slider__slide"
        style={{ backgroundImage: `url(${slide.imageUrl})` }}
        key={slide.id}
        aria-label="Slayt bağlantısı"
      />

      {count > 1 && (
        <>
          <button
            type="button"
            className="hero-slider__nav hero-slider__nav--prev"
            onClick={(event) => {
              event.preventDefault();
              go(-1);
            }}
            aria-label="Önceki slayt"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="hero-slider__nav hero-slider__nav--next"
            onClick={(event) => {
              event.preventDefault();
              go(1);
            }}
            aria-label="Sonraki slayt"
          >
            <ChevronRight size={22} />
          </button>
          <div className="hero-slider__dots" role="tablist" aria-label="Slayt seçimi">
            {slides.map((item, dotIndex) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={dotIndex === index}
                className={
                  dotIndex === index
                    ? "hero-slider__dot hero-slider__dot--active"
                    : "hero-slider__dot"
                }
                onClick={() => setIndex(dotIndex)}
                aria-label={`Slayt ${dotIndex + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
