import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-content">
        <p className="eyebrow">Bracelets with a story.</p>
        <h1>
          Natural stones.
          <br />
          Handmade in Africa.
        </h1>
        <p className="hero-copy">
          Contemporary bracelets designed around natural materials, personal style and the stories we choose to wear.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-light" href="/find-your-bracelet">
            Find My Bracelet <span>→</span>
          </Link>
          <Link className="btn btn-outline" href="/shop">
            Shop All Bracelets <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
