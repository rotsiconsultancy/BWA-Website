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
          BWA is more than a jewellery brand. We're a celebration of African
          craftsmanship, natural materials and the stories that connect us.
        </p>
        <Link className="btn btn-light" href="/#story">
          Our Story <span>→</span>
        </Link>
      </div>
    </section>
  );
}
