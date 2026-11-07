import Link from "next/link";

export default function StorySection() {
  return (
    <section className="story" id="story">
      <div
        className="story-image"
        role="img"
        aria-label="BWA craftsmanship and bracelet lifestyle image"
      ></div>
      <div className="story-copy">
        <p className="eyebrow">Our story</p>
        <h2>Wear what means something.</h2>
        <p>
          A bracelet goes where you go: to church, to the market, to the office,
          across the table on date night. Handmade in Kenya, and with you for
          all of it.
        </p>
        <Link className="btn btn-light" href="/our-story">
          Our Story <span>→</span>
        </Link>
      </div>
    </section>
  );
}
