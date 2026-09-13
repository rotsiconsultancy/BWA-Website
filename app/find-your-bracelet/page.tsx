"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  recommendProducts,
  type QuizAnswer,
} from "@/lib/commerce/recommendations";

const questions: {
  key: string;
  title: string;
  caption: string;
  options: QuizAnswer[];
}[] = [
  {
    key: "identity",
    caption: "Your identity",
    title: "Which one feels most like you?",
    options: [
      {
        key: "quiet",
        value: "Quiet & grounded",
        weights: {
          "energy_vibe:grounding": 5,
          "style_tags:everyday_minimal": 4,
        },
      },
      {
        key: "bold",
        value: "Bold & confident",
        weights: { "intention:courage": 5, "style_tags:bold_statement": 4 },
      },
      {
        key: "refined",
        value: "Clean & refined",
        weights: { "energy_vibe:calm": 4, "style_tags:everyday_minimal": 4 },
      },
      {
        key: "natural",
        value: "Free & natural",
        weights: { "style_tags:raw_rugged": 5, "color_palette:raw_natural": 3 },
      },
    ],
  },
  {
    key: "meaning",
    caption: "What it means",
    title: "What would you like it to express?",
    options: [
      {
        key: "grounding",
        value: "Grounding",
        weights: { "energy_vibe:grounding": 5, "intention:peace_mind": 3 },
      },
      {
        key: "confidence",
        value: "Confidence",
        weights: { "intention:inner_strength": 5, "energy_vibe:vitality": 3 },
      },
      {
        key: "clarity",
        value: "Clarity",
        weights: { "energy_vibe:clarity": 5, "intention:peace_mind": 3 },
      },
      {
        key: "change",
        value: "Transformation",
        weights: { "intention:transformation": 5, "energy_vibe:focus": 3 },
      },
    ],
  },
  {
    key: "palette",
    caption: "Your palette",
    title: "Which palette feels most like you?",
    options: [
      {
        key: "dark",
        value: "Dark & deep",
        weights: { "color_palette:dark_monochrome": 5 },
      },
      {
        key: "earth",
        value: "Earth & warm",
        weights: { "color_palette:earth_tones": 5 },
      },
      {
        key: "blue",
        value: "Blue & clear",
        weights: { "color_palette:deep_blue": 5 },
      },
      {
        key: "raw",
        value: "Raw & natural",
        weights: { "color_palette:raw_natural": 5 },
      },
    ],
  },
  {
    key: "wear",
    caption: "Your life",
    title: "Where will you wear it most?",
    options: [
      { key: "daily", value: "Every day", weights: { "occasion:everyday": 4 } },
      {
        key: "work",
        value: "Work & business",
        weights: { "occasion:work": 4 },
      },
      {
        key: "weekend",
        value: "Weekends & movement",
        weights: { "occasion:weekend": 4 },
      },
      {
        key: "evening",
        value: "Evenings & occasions",
        weights: { "occasion:evening": 4 },
      },
    ],
  },
];

export default function FindYourBraceletPage() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const result = useMemo(() => recommendProducts(answers), [answers]);
  const select = (answer: QuizAnswer) => {
    setAnswers((current) => [
      ...current.filter((item) => item.key !== questions[step].key),
      answer,
    ]);
    setStep((current) => current + 1);
  };
  if (step === -1)
    return (
      <main className="discovery-landing">
        <section>
          <p className="eyebrow">BWA Discovery</p>
          <h1>Find the bracelet that feels like you.</h1>
          <p>
            Four considered questions. A recommendation grounded in the
            materials, mood, and life you choose.
          </p>
          <button className="btn btn-primary" onClick={() => setStep(0)}>
            Begin discovery
          </button>
          <Link href="/shop">I already know what I want</Link>
        </section>
      </main>
    );
  if (step >= questions.length) {
    const [match, ...alternatives] = result;
    return (
      <main className="quiz-result-page">
        <p className="eyebrow">Your strongest match</p>
        <div className="quiz-result-layout">
          <img src={match.product.images[0]} alt={match.product.title} />
          <div>
            <h1>{match.product.title}</h1>
            <p className="product-descriptor">{match.product.descriptor}</p>
            <p>
              You chose a piece that aligns with your preference for{" "}
              {answers.map((answer) => answer.value.toLowerCase()).join(", ")}.
            </p>
            <p className="product-price">
              KES {match.product.price.toLocaleString()}
            </p>
            <Link
              className="btn btn-primary"
              href={"/product/" + match.product.slug}
            >
              Discover your bracelet
            </Link>
            <button
              className="quiz-restart"
              onClick={() => {
                setStep(-1);
                setAnswers([]);
              }}
            >
              Start again
            </button>
          </div>
        </div>
        <section className="quiz-alternatives">
          <p className="eyebrow">Also considered</p>
          {alternatives.slice(0, 2).map(({ product }) => (
            <Link key={product.id} href={"/product/" + product.slug}>
              {product.title}
              <span>{product.descriptor}</span>
            </Link>
          ))}
        </section>
      </main>
    );
  }
  const question = questions[step];
  return (
    <main className="quiz-page">
      <div className="quiz-progress">
        <span>Find your bracelet</span>
        <strong>
          0{step + 1} / 0{questions.length}
        </strong>
      </div>
      <div className="quiz-progress-bar">
        <i style={{ width: ((step + 1) / questions.length) * 100 + "%" }} />
      </div>
      <section>
        <p className="eyebrow">{question.caption}</p>
        <h1>{question.title}</h1>
        <div className="quiz-options">
          {question.options.map((answer) => (
            <button key={answer.key} onClick={() => select(answer)}>
              <span>{answer.value}</span>
              <b>→</b>
            </button>
          ))}
        </div>
        <button
          className="quiz-back"
          onClick={() => setStep((current) => Math.max(-1, current - 1))}
        >
          ← Back
        </button>
      </section>
    </main>
  );
}
