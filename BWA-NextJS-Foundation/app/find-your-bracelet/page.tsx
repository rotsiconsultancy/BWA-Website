"use client";

import { useState } from "react";
import Link from "next/link";

const questions = [
  {
    eyebrow: "WHO ARE YOU CHOOSING FOR?",
    title: "Let's start with who we're finding this for.",
    opts: [
      { num: "01", label: "FOR MYSELF", desc: "" },
      { num: "02", label: "FOR SOMEONE ELSE", desc: "" },
    ],
  },
  {
    eyebrow: "WHO ARE WE FINDING A BRACELET FOR?",
    title: "Who are we finding a bracelet for?",
    opts: [
      { num: "01", label: "WOMAN", desc: "" },
      { num: "02", label: "MAN", desc: "" },
      { num: "03", label: "I'D RATHER KEEP THIS OPEN", desc: "" },
    ],
  },
  {
    eyebrow: "YOUR IDENTITY",
    title: "Which one feels most like you?",
    opts: [
      { num: "01", label: "QUIET & GROUNDED", desc: "Calm, understated" },
      { num: "02", label: "BOLD & CONFIDENT", desc: "Strong presence" },
      { num: "03", label: "CLEAN & REFINED", desc: "Considered, polished" },
      { num: "04", label: "FREE & NATURAL", desc: "Relaxed, organic" },
    ],
  },
  {
    eyebrow: "YOUR STYLE",
    title: "Which style draws you in?",
    opts: [
      { num: "01", label: "DARK & UNDERSTATED", desc: "" },
      { num: "02", label: "EARTHY & NATURAL", desc: "" },
      { num: "03", label: "CLEAN & MINIMAL", desc: "" },
      { num: "04", label: "RICH & EXPRESSIVE", desc: "" },
    ],
  },
  {
    eyebrow: "WHAT IT MEANS",
    title: "What would you like your bracelet to express?",
    opts: [
      { num: "01", label: "GROUNDING", desc: "" },
      { num: "02", label: "CONFIDENCE", desc: "" },
      { num: "03", label: "BALANCE", desc: "" },
      { num: "04", label: "INDIVIDUALITY", desc: "" },
    ],
  },
  {
    eyebrow: "YOUR LIFE",
    title: "Where do you see yourself wearing it most?",
    opts: [
      { num: "01", label: "EVERY DAY", desc: "" },
      { num: "02", label: "WORK & BUSINESS", desc: "" },
      { num: "03", label: "CASUAL & WEEKEND", desc: "" },
      { num: "04", label: "EVENINGS & OCCASIONS", desc: "" },
    ],
  },
  {
    eyebrow: "YOUR PALETTE",
    title: "Which palette feels most like you?",
    opts: [
      { num: "01", label: "DARK & DEEP", desc: "" },
      { num: "02", label: "EARTH & WARM", desc: "" },
      { num: "03", label: "LIGHT & NEUTRAL", desc: "" },
      { num: "04", label: "SURPRISE ME", desc: "" },
    ],
  },
  {
    eyebrow: "YOUR PRIORITY",
    title: "When choosing a bracelet, what matters most?",
    opts: [
      { num: "01", label: "HOW IT LOOKS", desc: "" },
      { num: "02", label: "HOW IT FEELS", desc: "" },
      { num: "03", label: "WHAT IT REPRESENTS", desc: "" },
      { num: "04", label: "THE MATERIALS", desc: "" },
    ],
  },
];

export default function FindYourBraceletPage() {
  const [viewState, setViewState] = useState<"intro" | "quiz" | "checkpoint" | "result">("intro");
  const [step, setStep] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const startQuiz = () => {
    setViewState("quiz");
    setStep(0);
    setSelectedOpt(null);
  };

  const handleNext = () => {
    if (step === 4 && viewState !== "checkpoint") {
      setViewState("checkpoint");
      return;
    }
    if (step < questions.length - 1) {
      setStep(step + 1);
      setSelectedOpt(null);
      setViewState("quiz");
    } else {
      setViewState("result");
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setSelectedOpt(null);
      setViewState("quiz");
    } else {
      setViewState("intro");
    }
  };

  const q = questions[step];
  const progressPercent = ((step + 1) / questions.length) * 100;

  return (
    <main>
      {viewState === "intro" && (
        <>
          <section className="find-hero">
            <div className="container find-hero-inner">
              <div className="eyebrow">Beads World Africa</div>
              <h1 className="display" style={{ fontSize: "clamp(52px,7vw,92px)", margin: "18px 0 24px" }}>
                Find the bracelet
                <br />
                that feels like you.
              </h1>
              <p style={{ maxWidth: "620px", margin: "0 auto", color: "#57534d", fontSize: "16px", lineHeight: "1.8" }}>
                Not sure where to start? Tell us a little about your style, what you want your bracelet to express, and how you see yourself wearing it.
              </p>
              <div className="hero-actions" style={{ justifyContent: "center", marginTop: "38px" }}>
                <button className="btn btn-primary" onClick={startQuiz}>
                  LET'S FIND YOURS
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    const el = document.getElementById("paths");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  EXPLORE YOUR WAY
                </button>
              </div>
              <div style={{ marginTop: "18px", fontSize: "11px", color: "var(--muted)" }}>
                Takes about 1 minute · No right or wrong answers
              </div>
            </div>
          </section>

          <section className="discovery" id="paths" style={{ padding: "20px 0 110px" }}>
            <div className="container">
              <div className="eyebrow" style={{ marginBottom: "18px" }}>
                Choose your starting point
              </div>
              <div className="entry-grid">
                <button className="entry-card" onClick={startQuiz}>
                  <div>
                    <div className="eyebrow">01</div>
                    <h3>I already know what I want.</h3>
                    <p>Browse by style, colour, stone or collection.</p>
                  </div>
                  <span style={{ fontSize: "18px" }}>→</span>
                </button>

                <button className="entry-card" onClick={startQuiz}>
                  <div>
                    <div className="eyebrow">02</div>
                    <h3>I have a picture / inspiration.</h3>
                    <p>Use a look, outfit or bracelet as your visual starting point.</p>
                  </div>
                  <span style={{ fontSize: "18px" }}>→</span>
                </button>

                <button className="entry-card" onClick={startQuiz}>
                  <div>
                    <div className="eyebrow">03</div>
                    <h3>Help me discover.</h3>
                    <p>Answer a few simple questions and we'll narrow it down.</p>
                  </div>
                  <span style={{ fontSize: "18px" }}>→</span>
                </button>

                <button className="entry-card" onClick={startQuiz}>
                  <div>
                    <div className="eyebrow">04</div>
                    <h3>I'm buying for someone.</h3>
                    <p>Find a meaningful gift without having to know their exact style.</p>
                  </div>
                  <span style={{ fontSize: "18px" }}>→</span>
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {viewState === "quiz" && (
        <section className="quiz-shell container">
          <div className="quiz-top-bar">
            <div>
              <div className="eyebrow">Find your bracelet</div>
              <div className="progressbar">
                <span style={{ width: `${progressPercent}%` }}></span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.12em" }}>
                0{step + 1} / 08
              </div>
              <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "5px" }}>
                Finding your style
              </div>
            </div>
          </div>

          <div className="quiz-question-box">
            <div className="eyebrow">{q.eyebrow}</div>
            <h2 className="display">{q.title}</h2>
            <div className="quiz-options-grid">
              {q.opts.map((opt, i) => (
                <button
                  key={i}
                  className={`quiz-option-card ${selectedOpt === i ? "selected" : ""}`}
                  onClick={() => setSelectedOpt(i)}
                >
                  <div className="eyebrow" style={{ fontSize: "10px" }}>{opt.num}</div>
                  <strong style={{ display: "block", fontSize: "14px", margin: "13px 0 5px" }}>{opt.label}</strong>
                  {opt.desc && <small style={{ fontSize: "11px", opacity: 0.65 }}>{opt.desc}</small>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "40px" }}>
            <button className="text-link" onClick={handleBack}>
              ← BACK
            </button>
            {selectedOpt !== null && (
              <button className="btn btn-primary" onClick={handleNext}>
                CONTINUE →
              </button>
            )}
          </div>
        </section>
      )}

      {viewState === "checkpoint" && (
        <section className="quiz-shell container" style={{ textAlign: "center", paddingTop: "80px" }}>
          <div style={{ maxWidth: "620px", margin: "auto", padding: "32px", background: "#fff", border: "1px solid var(--stone)" }}>
            <div className="eyebrow">YOU’RE DOING WELL.</div>
            <strong style={{ display: "block", fontFamily: "Cormorant Garamond, serif", fontSize: "30px", margin: "9px 0 4px" }}>
              We’re getting a clearer picture of your style.
            </strong>
            <span style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "20px" }}>
              3 more questions to go.
            </span>
            <button className="btn btn-primary" onClick={handleNext}>
              CONTINUE →
            </button>
          </div>
        </section>
      )}

      {viewState === "result" && (
        <section className="container" style={{ padding: "65px 0 100px" }}>
          <div className="eyebrow">Your match</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.08fr .92fr", gap: "70px", alignItems: "center" }}>
            <div style={{ aspectRatio: "4/5", background: "#e7e0d5", overflow: "hidden" }}>
              <img
                src="https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840"
                alt="Recommended BWA bracelet"
              />
            </div>
            <div>
              <div className="eyebrow">WE THINK WE FOUND YOURS.</div>
              <h2 className="display" style={{ fontSize: "clamp(50px,6vw,76px)", margin: "12px 0" }}>
                THE GROUNDED
              </h2>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "27px", color: "#514d47", marginBottom: "30px" }}>
                Understated. Natural. Quietly confident.
              </div>
              <div style={{ borderTop: "1px solid var(--stone)", borderBottom: "1px solid var(--stone)", padding: "24px 0", margin: "32px 0" }}>
                <strong style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Why it feels like you</strong>
                <p style={{ margin: "10px 0 0", fontSize: "14px", color: "#625e57" }}>
                  You lean toward pieces that feel calm, considered and natural — something with presence without needing to announce itself.
                </p>
              </div>
              <div style={{ display: "flex", gap: "30px", margin: "25px 0 30px" }}>
                <div>
                  <b style={{ display: "block", fontSize: "14px" }}>Black Onyx · Lava Stone</b>
                  <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Materials</span>
                </div>
                <div>
                  <b style={{ display: "block", fontSize: "14px" }}>KES 4,500</b>
                  <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Price</span>
                </div>
              </div>
              <Link href="/product/the-grounded" className="btn btn-primary">
                DISCOVER YOUR BRACELET →
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
