import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="container final-cta-content">
        <p className="eyebrow">Your bracelet is out there.</p>
        <h2>Find yours.</h2>
        <p>
          Discover the bracelet that fits your style, your story and the way you
          want to wear it.
        </p>
        <Link className="btn btn-light" href="/find-your-bracelet">
          Find My Bracelet <span>→</span>
        </Link>
      </div>
    </section>
  );
}
