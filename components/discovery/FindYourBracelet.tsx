"use client";

import StoreImage from "@/components/commerce/StoreImage";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  recommendProducts,
  type QuizAnswer,
} from "@/lib/commerce/recommendations";
import type { DiscoveryQuestion } from "@/lib/commerce/quiz-types";
import type { CommerceProduct } from "@/lib/commerce/types";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import Money from "@/components/commerce/Money";
import { customPieceUrl } from "@/lib/commerce/custom-piece";
import { trackGa4Event } from "@/lib/marketing/ga4";

export const fallbackQuestions: DiscoveryQuestion[] = [
  {
    key: "identity",
    caption: "Your identity",
    title: "Which one feels most like you?",
    required: true,
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
    required: true,
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
    required: true,
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
    required: true,
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

export default function FindYourBracelet({
  products,
  questions,
  quizVersionId,
}: {
  products: CommerceProduct[];
  questions: DiscoveryQuestion[];
  quizVersionId?: string;
}) {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const savedRun = useRef<string | null>(null);
  const { addToCart, setDiscoverySessionToken } = useCart();
  const { currency } = useCurrency();
  const result = useMemo(
    () => recommendProducts(products, answers),
    [answers, products],
  );
  const select = (answer: QuizAnswer) => {
    setAnswers((current) => [
      ...current.filter((item) => item.key !== questions[step].key),
      { ...answer, key: questions[step].key },
    ]);
    setStep((current) => current + 1);
  };
  const completed = step >= questions.length;
  const primaryMatch = result[0];
  useEffect(() => {
    if (!completed || !primaryMatch) return;
    const run = answers
      .map((answer) => `${answer.key}:${answer.value}`)
      .join("|");
    if (savedRun.current === run) return;
    savedRun.current = run;
    const token = crypto.randomUUID();
    setSessionToken(token);
    setDiscoverySessionToken(token);
    trackGa4Event("quiz_complete", {
      quiz_version: quizVersionId,
      recommended_item_id: primaryMatch.product.id,
      recommended_item_name: primaryMatch.product.title,
    });
    void fetch("/api/discovery/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionToken: token,
        quizVersionId,
        answers: Object.fromEntries(
          answers.map((answer) => [answer.key, answer.value]),
        ),
        selectedProductId: primaryMatch.product.id,
        rankedProducts: result.slice(0, 3).map(({ product, score }) => ({
          id: product.id,
          slug: product.slug,
          title: product.title,
          score,
        })),
      }),
    });
  }, [
    answers,
    completed,
    primaryMatch,
    quizVersionId,
    result,
    setDiscoverySessionToken,
  ]);
  const restart = () => {
    setStep(-1);
    setAnswers([]);
    setSessionToken(null);
    savedRun.current = null;
  };

  if (step === -1)
    return (
      <main className="discovery-landing">
        <section>
          <p className="eyebrow">BWA Discovery</p>
          <h1>Find the bracelet that feels like you.</h1>
          <p>
            A few considered questions. A recommendation grounded in the
            materials, mood, and life you choose.
          </p>
          <button className="btn btn-primary" onClick={() => setStep(0)}>
            Begin discovery
          </button>
          <Link href="/bracelets">I already know what I want</Link>
        </section>
      </main>
    );

  if (step >= questions.length) {
    const [match, ...alternatives] = result;
    if (!match)
      return (
        <main className="quiz-result-page">
          <p className="eyebrow">A considered next step</p>
          <h1>Let’s create something personal.</h1>
          <p>
            Nothing in the current collection is a close enough match. Tell us
            what you have in mind and our concierge will guide the next step.
          </p>
          <a
            className="btn btn-primary"
            href={customPieceUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ask us on WhatsApp
          </a>
        </main>
      );
    return (
      <main className="quiz-result-page">
        <p className="eyebrow">Your strongest match</p>
        <div className="quiz-result-layout">
          <StoreImage
            src={match.product.images[0]}
            alt={match.product.title}
            sizes="(max-width: 760px) 100vw, 45vw"
          />
          <div>
            <h1>{match.product.title}</h1>
            <p className="product-descriptor">{match.product.descriptor}</p>
            <p>
              You chose a piece that aligns with your preference for{" "}
              {answers.map((answer) => answer.value.toLowerCase()).join(", ")}.
            </p>
            <p className="product-price">
              <Money prices={match.product.prices} />
            </p>
            <div className="quiz-result-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const variant = match.product.variants.find(
                    (item) => item.available,
                  );
                  if (!variant) return;
                  addToCart({
                    productId: match.product.id,
                    variantId: variant.id,
                    slug: match.product.slug,
                    title: match.product.title,
                    subtitle: match.product.subtitle,
                    image: match.product.images[0],
                    unitPrices: {
                      KES:
                        match.product.prices.KES + variant.priceAdjustments.KES,
                      USD:
                        match.product.prices.USD === null ||
                        variant.priceAdjustments.USD === null
                          ? null
                          : match.product.prices.USD +
                            variant.priceAdjustments.USD,
                    },
                    variantName: variant.name,
                  });
                  if (sessionToken)
                    void fetch("/api/discovery/event", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        sessionToken,
                        eventType: "added_to_bag",
                        productId: match.product.id,
                      }),
                    });
                }}
                disabled={match.product.prices[currency] === null}
              >
                Add to bag
              </button>
              <a
                href={customPieceUrl(match.product.title)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ask for a custom version
              </a>
              <Link href={`/product/${match.product.slug}`}>
                View bracelet details
              </Link>
            </div>
            <button className="quiz-restart" onClick={restart}>
              Start again
            </button>
          </div>
        </div>
        <section className="quiz-alternatives">
          <p className="eyebrow">Also considered</p>
          {alternatives.slice(0, 3).map(({ product }) => (
            <Link
              className="quiz-alternative"
              key={product.id}
              href={`/product/${product.slug}`}
            >
              <StoreImage
                src={product.images[0]}
                alt={product.title}
                sizes="120px"
              />
              <span className="quiz-alternative-copy">
                {product.title}
                <span>{product.descriptor}</span>
              </span>
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
          {String(step + 1).padStart(2, "0")} /{" "}
          {String(questions.length).padStart(2, "0")}
        </strong>
      </div>
      <div className="quiz-progress-bar">
        <i style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
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
