export default function BWADifference() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="display">Why BWA?</h2>
        </div>
        <div className="grid4">
          {[
            ["01", "Identity-led"],
            ["02", "Natural materials"],
            ["03", "Handmade with care"],
            ["04", "Built to mean something"],
          ].map(([n, t]) => (
            <div
              key={n}
              style={{ borderTop: "1px solid var(--line)", paddingTop: 18 }}
            >
              <div className="eyebrow">{n}</div>
              <div className="display" style={{ fontSize: 26, marginTop: 10 }}>
                {t}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
