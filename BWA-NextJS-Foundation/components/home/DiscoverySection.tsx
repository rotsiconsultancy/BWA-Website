import Link from "next/link";
export default function DiscoverySection() {
  return (
    <section className="section">
      <div className="container">
        <div className="eyebrow">Start here</div>
        <div className="section-head">
          <h2 className="display">Which one is you?</h2>
          <Link className="smallcaps" href="/find-your-bracelet">
            Find yours →
          </Link>
        </div>
        <div className="grid4">
          {[
            "I already know what I want",
            "I have a picture / inspiration",
            "Help me discover",
            "I’m buying for someone",
          ].map((x, i) => (
            <Link href="/find-your-bracelet" className="discovery" key={x}>
              <div className="card-img" style={{ aspectRatio: "1/1" }}>
                <span
                  className="display"
                  style={{ fontSize: 27, textAlign: "center", padding: 20 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="display" style={{ fontSize: 23, marginTop: 13 }}>
                {x}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
