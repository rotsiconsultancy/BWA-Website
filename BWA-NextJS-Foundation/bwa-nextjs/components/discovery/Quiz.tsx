"use client";
import { useState } from "react";
import { quizQuestions } from "@/data/quiz";
import { recommend } from "@/lib/recommendations";
import Link from "next/link";
export default function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const q = quizQuestions[step];
  if (step >= quizQuestions.length) {
    const product = recommend(answers);
    return (
      <section className="quiz-result">
        <div className="eyebrow">We think we found yours.</div>
        <h1 className="display">{product.name}</h1>
        <p>{product.descriptor}</p>
        <Link className="btn primary" href={`/product/${product.slug}`}>
          Discover your bracelet
        </Link>
      </section>
    );
  }
  const choose = (v: string) => setAnswers({ ...answers, [q.id]: v });
  return (
    <section className="quiz">
      <div className="quiz-top">
        <span>
          {String(step + 1).padStart(2, "0")} /{" "}
          {String(quizQuestions.length).padStart(2, "0")}
        </span>
        <div className="bar">
          <i
            style={{ width: `${((step + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="eyebrow">
        {step < 2
          ? "Getting to know you"
          : step < 4
            ? "Narrowing it down"
            : step === 4
              ? "You’re doing well"
              : "Almost there"}
      </div>
      <h1 className="display">{q.title}</h1>
      <div className="quiz-options">
        {q.options.map((o) => (
          <button
            className={"quiz-option " + (answers[q.id] === o ? "selected" : "")}
            key={o}
            onClick={() => choose(o)}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="quiz-nav">
        <button
          disabled={step === 0}
          onClick={() => setStep(Math.max(0, step - 1))}
        >
          ← Back
        </button>
        <button
          className="btn primary"
          disabled={!answers[q.id]}
          onClick={() => setStep(step + 1)}
        >
          {step === quizQuestions.length - 1 ? "Show my match" : "Continue"}
        </button>
      </div>
    </section>
  );
}
