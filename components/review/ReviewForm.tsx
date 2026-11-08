"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import StoreImage from "@/components/commerce/StoreImage";
import { trackGa4Event } from "@/lib/marketing/ga4";
import { IMPROVEMENT_OPTIONS, REVIEW_TAGS } from "@/lib/commerce/review-reward";
import type { ReviewBracelet } from "@/lib/commerce/review-request";

const STEPS = ["Your bracelet", "What stood out", "Next time"] as const;
const STAR_WORDS = [
  "",
  "Not for me",
  "Could be better",
  "Good",
  "Really good",
  "Love it",
];
const GOOGLE_REVIEW_URL = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "";

const endsOn = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Africa/Nairobi",
      }).format(new Date(iso))
    : null;

function Stars({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="review-stars" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={n <= value ? "is-on" : ""}
          onClick={() => onChange(n)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
          </svg>
        </button>
      ))}
      <span className="review-stars-word">{STAR_WORDS[value] || " "}</span>
    </div>
  );
}

function Chips({
  options,
  selected,
  onToggle,
  label,
}: {
  options: readonly { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  label: string;
}) {
  return (
    <div className="review-chips" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={selected.includes(option.id)}
          onClick={() => onToggle(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ReviewThanks({
  code,
  endsAt,
  used = false,
  amountKes,
  again = false,
}: {
  code: string | null;
  endsAt: string | null;
  used?: boolean;
  amountKes: number;
  again?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const until = endsOn(endsAt);
  const expired = endsAt ? new Date(endsAt) <= new Date() : false;
  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      trackGa4Event("review_code_copy");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the code stays on screen to copy by hand */
    }
  };
  const keepMessage = `My Beads World Africa thank-you code: ${code} (KES ${amountKes} off, until ${until}). Use it at beadsworldafrica.co.ke with this phone number.`;
  return (
    <section className="review-card review-thanks">
      <p className="eyebrow">{again ? "Already reviewed" : "Thank you"}</p>
      <h1>
        {again
          ? "You've already told us. Thank you."
          : "Thank you. This helps a lot."}
      </h1>
      {code && (
        <>
          <p>
            {used
              ? "Your thank-you code has been used. Enjoy the bracelet."
              : expired
                ? "Your thank-you code has expired."
                : `Here's KES ${amountKes} off your next order.`}
          </p>
          <div className={`review-code${used || expired ? " is-spent" : ""}`}>
            <span>Your code</span>
            <strong>{code}</strong>
            {!used && !expired && (
              <button type="button" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          {!used && !expired && (
            <ul className="review-code-rules">
              <li>Use it once, at checkout on beadsworldafrica.co.ke.</li>
              <li>It only works with the phone number on your order.</li>
              {until && <li>Valid until {until}.</li>}
            </ul>
          )}
          {!used && !expired && (
            <div className="review-actions">
              <a
                className="btn btn-outline"
                href={`https://wa.me/?text=${encodeURIComponent(keepMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGa4Event("review_code_save_whatsapp")}
              >
                Save it in WhatsApp
              </a>
              <Link className="btn btn-primary" href="/bracelets">
                Find your next one
              </Link>
            </div>
          )}
        </>
      )}
      {GOOGLE_REVIEW_URL && !again && (
        <p className="review-google">
          Happy with us? A Google review helps other people find BWA.{" "}
          <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer">
            Review us on Google
          </a>
        </p>
      )}
    </section>
  );
}

export default function ReviewForm({
  token,
  firstName,
  bracelets,
  amountKes,
  validDays,
}: {
  token: string;
  firstName: string | null;
  bracelets: ReviewBracelet[];
  amountKes: number;
  validDays: number;
}) {
  const [step, setStep] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState(firstName || "");
  const [town, setTown] = useState("");
  const [consent, setConsent] = useState(true);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ code: string; endsAt: string } | null>(
    null,
  );
  const startedAt = useRef(Date.now());
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    trackGa4Event("review_start", { bracelets: bracelets.length });
  }, [bracelets.length]);
  useEffect(() => {
    if (step > 0) headingRef.current?.focus();
  }, [step]);

  const allRated = bracelets.every((b) => ratings[b.productId]);
  type Setter = (update: (current: string[]) => string[]) => void;
  const toggle = (set: Setter, id: string) =>
    set((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    );
  const toggleImprovement = (id: string) =>
    // "Nothing, keep it up" and a real suggestion don't go together.
    setImprovements((list) =>
      id === "nothing"
        ? list.includes(id)
          ? []
          : [id]
        : list.includes(id)
          ? list.filter((x) => x !== id)
          : [...list.filter((x) => x !== "nothing"), id],
    );

  const submit = async () => {
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          ratings,
          tags,
          comment,
          displayName,
          town,
          consent,
          improvements,
          note,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "We couldn't save your review.");
      const seconds = Math.round((Date.now() - startedAt.current) / 1000);
      trackGa4Event("review_submit", {
        rating: Math.min(...Object.values(ratings)),
        seconds,
        improvements: improvements.join(","),
      });
      setResult({ code: data.code, endsAt: data.endsAt });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (result)
    return (
      <ReviewThanks
        code={result.code}
        endsAt={result.endsAt}
        amountKes={amountKes}
      />
    );

  return (
    <section className="review-card">
      <header className="review-head">
        <p className="eyebrow">Takes under a minute</p>
        <h1 ref={headingRef} tabIndex={-1}>
          {step === 0 &&
            `${firstName ? `${firstName}, how` : "How"} is your bracelet?`}
          {step === 1 && "What stood out?"}
          {step === 2 && "One thing we could do better next time?"}
        </h1>
        <p className="review-gift">
          As a thank-you: <strong>KES {amountKes} off</strong> your next order,
          whatever you rate us.
        </p>
        <div
          className="review-progress"
          aria-label={`Step ${step + 1} of ${STEPS.length}`}
        >
          {STEPS.map((label, i) => (
            <span key={label} className={i <= step ? "is-done" : ""}>
              {label}
            </span>
          ))}
        </div>
      </header>

      {step === 0 && (
        <div className="review-step">
          {bracelets.map((b) => (
            <div key={b.productId} className="review-bracelet">
              {b.image ? (
                <StoreImage
                  src={b.image}
                  alt={b.title}
                  sizes="88px"
                  width={176}
                  height={211}
                />
              ) : (
                <span className="review-bracelet-blank" aria-hidden="true" />
              )}
              <div>
                <p>{b.title}</p>
                <Stars
                  label={`Your stars for ${b.title}`}
                  value={ratings[b.productId] || 0}
                  onChange={(n) =>
                    setRatings((r) => ({ ...r, [b.productId]: n }))
                  }
                />
              </div>
            </div>
          ))}
          <div className="review-nav">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!allRated}
              onClick={() => setStep(1)}
            >
              Next
            </button>
            {!allRated && (
              <small>
                {bracelets.length > 1
                  ? "Tap the stars for each bracelet."
                  : "Tap the stars to go on."}
              </small>
            )}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="review-step">
          <p className="review-hint">Tap any that fit.</p>
          <Chips
            label="What stood out"
            options={REVIEW_TAGS}
            selected={tags}
            onToggle={(id) => toggle(setTags, id)}
          />
          <label className="review-field">
            In a line (optional)
            <input
              value={comment}
              maxLength={300}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Bought it for my brother, he hasn't taken it off."
            />
          </label>
          <label className="review-consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>BWA may show this review on the website.</span>
          </label>
          {consent && (
            <div className="review-pair">
              <label className="review-field">
                Name to show
                <input
                  value={displayName}
                  maxLength={40}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="First name"
                />
              </label>
              <label className="review-field">
                Town (optional)
                <input
                  value={town}
                  maxLength={40}
                  onChange={(e) => setTown(e.target.value)}
                  placeholder="e.g. Nairobi"
                />
              </label>
            </div>
          )}
          <div className="review-nav">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setStep(0)}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep(2)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="review-step">
          <p className="review-hint">
            Optional, and only we see it. It never goes on the website.
          </p>
          <Chips
            label="What we could do better"
            options={IMPROVEMENT_OPTIONS}
            selected={improvements}
            onToggle={toggleImprovement}
          />
          <label className="review-field">
            Anything else?
            <input
              value={note}
              maxLength={300}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tell us straight, we read every one."
            />
          </label>
          {error && (
            <p className="review-error" role="alert">
              {error}
            </p>
          )}
          <div className="review-nav">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={sending}
              onClick={submit}
            >
              {sending ? "Sending…" : "Send and get my code"}
            </button>
          </div>
          <small className="review-fine">
            One code per order, valid {validDays} days, for the phone number on
            your order.
          </small>
        </div>
      )}
    </section>
  );
}
