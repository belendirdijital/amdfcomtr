"use client";

import { ArrowRight, ChevronLeft, ChevronRight, HeartHandshake, Shield, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SiteSlide } from "@/lib/types";

const FEATURE_ICONS = [Trophy, HeartHandshake, Shield];

function renderTitle(title: string, highlight: string) {
  if (!highlight || !title.includes(highlight)) {
    return title;
  }
  const parts = title.split(highlight);
  return (
    <>
      {parts[0]}
      <em>{highlight}</em>
      {parts.slice(1).join(highlight)}
    </>
  );
}

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
      <div
        className="hero-slider__slide"
        style={{ backgroundImage: `url(${slide.imageUrl})` }}
        key={slide.id}
      >
        <div className="hero-slider__shade" aria-hidden="true" />
        <div className="hero-slider__content">
          <div className="hero-slider__copy">
            {slide.eyebrow && <span className="hero-slider__eyebrow">{slide.eyebrow}</span>}
            <h1>{renderTitle(slide.title, slide.titleHighlight)}</h1>
            {slide.description && <p>{slide.description}</p>}
            {slide.ctaLabel && (
              <Link href={slide.ctaHref || "/"} className="button button--primary hero-slider__cta">
                {slide.ctaLabel}
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {slide.features.length > 0 && (
            <ul className="hero-slider__features">
              {slide.features.map((feature, featureIndex) => {
                const Icon = FEATURE_ICONS[featureIndex % FEATURE_ICONS.length];
                return (
                  <li key={`${feature.title}-${featureIndex}`}>
                    <span className="hero-slider__feature-icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={2.2} />
                    </span>
                    <span>
                      <strong>{feature.title}</strong>
                      {feature.subtitle && <small>{feature.subtitle}</small>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="hero-slider__nav hero-slider__nav--prev"
            onClick={() => go(-1)}
            aria-label="Önceki slayt"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="hero-slider__nav hero-slider__nav--next"
            onClick={() => go(1)}
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
