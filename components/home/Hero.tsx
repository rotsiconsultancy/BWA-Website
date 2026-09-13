"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  // {
  //   url: "/images/hero-image.png",
  //   eyebrow: "Bracelets with a story.",
  //   title: <>Natural stones.<br />Handmade in Africa.</>,
  //   copy: "Contemporary bracelets designed around natural materials, personal style and the stories we choose to wear."
  // },
  {
    url: "/images/hero-image-mountain-woman-wearing-beads-world-africa-bracelet.png",
    eyebrow: "Crafted for adventure.",
    title: (
      <>
        Authentic materials.
        <br />
        Timeless design.
      </>
    ),
    copy: "Handcrafted with genuine semi-precious stones sourced across the African continent.",
  },
  {
    url: "/images/hero-image-mountain-man-wearing-beads-world-africa-bracelet.png",
    eyebrow: "Personal statement.",
    title: (
      <>
        Find your energy.
        <br />
        Wear your vision.
      </>
    ),
    copy: "Every bracelet carries unique energy, history, and craftsmanship.",
  },
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = HERO_IMAGES[currentIndex];

  return (
    <section className="hero">
      {HERO_IMAGES.map((slide, idx) => (
        <div
          key={slide.url}
          className={`hero-bg-layer ${idx === currentIndex ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.url})` }}
          aria-hidden="true"
        />
      ))}
      <div className="hero-overlay" aria-hidden="true" />

      <div className="container hero-content">
        <p className="eyebrow">{currentSlide.eyebrow}</p>
        <h1>{currentSlide.title}</h1>
        <p className="hero-copy">{currentSlide.copy}</p>

        <div className="hero-actions">
          <Link className="btn btn-light" href="/find-your-bracelet">
            Find My Bracelet <span>→</span>
          </Link>
          <Link className="btn btn-outline" href="/shop">
            Shop All Bracelets <span>→</span>
          </Link>
        </div>

        {/* Carousel Indicators */}
        <div
          className="hero-indicators"
          role="tablist"
          aria-label="Hero slides"
        >
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              className={`hero-dot ${idx === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-selected={idx === currentIndex}
              role="tab"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
