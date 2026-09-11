import Link from "next/link";
export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div>
          <div className="eyebrow">Natural stone · Handmade in Africa</div>
          <h1 className="display">
            Bracelets
            <br />
            with a story.
          </h1>
          <p>Find the bracelet that feels like you.</p>
          <div className="actions">
            <Link className="btn primary" href="/find-your-bracelet">
              Find Your Bracelet
            </Link>
            <Link className="btn secondary" href="/shop">
              Shop Bracelets
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
