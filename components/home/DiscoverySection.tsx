import Link from "next/link";

export default function DiscoverySection() {
  return (
    <section className="discovery" id="discover">
      <div className="container discovery-grid">
        <div className="discovery-copy">
          <p className="eyebrow">Not sure which one?</p>
          <h2>Tell us a little about yourself.</h2>
          <p className="lede">
            We'll help you discover a bracelet that fits your style, personality and the way you want to wear it.
          </p>
          <Link className="btn btn-primary" href="/find-your-bracelet">
            Help Me Discover <span>→</span>
          </Link>
          <p style={{ fontSize: "11px", color: "var(--muted)", margin: "13px 0 0" }}>
            ◷ About 1 minute
          </p>
        </div>
        <div className="discovery-visual" role="img" aria-label="BWA bracelet discovery image"></div>
      </div>
    </section>
  );
}
