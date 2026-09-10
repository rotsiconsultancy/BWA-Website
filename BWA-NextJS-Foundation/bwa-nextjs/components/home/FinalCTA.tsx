import Link from "next/link";
export default function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="container">
        <div className="eyebrow">Your bracelet is out there.</div>
        <h2 className="display">Find yours.</h2>
        <Link href="/find-your-bracelet" className="btn primary">
          Find Your Bracelet
        </Link>
      </div>
    </section>
  );
}
