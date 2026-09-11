import Quiz from "@/components/discovery/Quiz";
export default function FindYourBracelet() {
  return (
    <main>
      <section className="discovery-intro">
        <div className="container">
          <div className="eyebrow">BWA discovery</div>
          <h1 className="display">
            Find the bracelet
            <br />
            that feels like you.
          </h1>
          <p>
            Tell us a little about your style, what you want your bracelet to
            express, and how you see yourself wearing it.
          </p>
        </div>
      </section>
      <Quiz />
    </main>
  );
}
