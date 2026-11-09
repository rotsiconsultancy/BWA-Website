"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BWA_WHATSAPP,
  CONSENT_TEXT,
  formatQrDate,
} from "@/lib/commerce/qr-welcome";
import { whatsAppLink } from "@/lib/commerce/whatsapp";
import { trackGa4Event } from "@/lib/marketing/ga4";

const VISITOR_KEY = "bwa_visitor";
// One scan per page load, even if React runs the effect twice.
const loggedScans = new Set<string>();
const WELCOME_KEY = "bwa_welcome";

type Result = {
  firstName: string;
  code: string | null;
  endsAt: string | null;
  percent: number | null;
  minimumKes: number | null;
  already: boolean;
  used: boolean;
  paused: boolean;
};

// Storage can be blocked (private mode); the page works without it.
const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* fine: nothing remembered */
  }
};

function visitorId() {
  let id = read(VISITOR_KEY);
  if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    id = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    write(VISITOR_KEY, id);
  }
  return id;
}

export default function WelcomeForm({
  slug,
  percent,
  validDays,
  active,
  products,
}: {
  slug: string;
  percent: number;
  validDays: number;
  active: boolean;
  products: { id: string; title: string }[];
}) {
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [productId, setProductId] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [remembered, setRemembered] = useState(false);
  const visitor = useRef<string>("");

  useEffect(() => {
    visitor.current = visitorId();
    if (!loggedScans.has(slug)) {
      loggedScans.add(slug);
      fetch("/api/qr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, visitorId: visitor.current }),
        keepalive: true,
      }).catch(() => undefined);
      trackGa4Event("welcome_view", { link: slug });
    }
    const saved = read(WELCOME_KEY);
    if (saved)
      try {
        const parsed = JSON.parse(saved) as Result;
        if (parsed?.firstName) {
          setResult(parsed);
          setRemembered(true);
        }
      } catch {
        /* ignore a broken saved value */
      }
  }, [slug]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/qr/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          firstName,
          phone,
          productId: productId || null,
          consent,
          visitorId: visitor.current,
          company,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Please try again.");
      const next: Result = {
        firstName: data.firstName || firstName,
        code: data.code ?? null,
        endsAt: data.endsAt ?? null,
        percent: data.percent ?? null,
        minimumKes: data.minimumKes ?? null,
        already: Boolean(data.already),
        used: Boolean(data.used),
        paused: Boolean(data.paused),
      };
      if (next.code) write(WELCOME_KEY, JSON.stringify(next));
      trackGa4Event("welcome_register", {
        link: slug,
        new_code: Boolean(next.code && !next.already),
        consent,
        bracelet: Boolean(productId),
      });
      setRemembered(false);
      setResult(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (result)
    return (
      <WelcomeDone
        result={result}
        remembered={remembered}
        onAnother={() => {
          setResult(null);
          setRemembered(false);
          setFirstName(result.firstName);
          setProductId("");
        }}
      />
    );

  return (
    <section className="review-card welcome-card">
      <header className="welcome-head">
        <p className="eyebrow">Beads World Africa</p>
        <h1>Your BWA experience doesn&apos;t end here.</h1>
        <p>Register your bracelet in under a minute.</p>
      </header>

      <ul className="welcome-perks" aria-label="What you get">
        {active && (
          <li>
            <span>
              <strong>{percent}% off</strong> your next order
            </span>
          </li>
        )}
        <li>
          <span>
            <strong>One complimentary resizing</strong> if it doesn&apos;t fit
            right
          </span>
        </li>
        <li>
          <span>
            <strong>Early access</strong> to new collections, if you&apos;d like
            it
          </span>
        </li>
      </ul>

      <form className="review-step" onSubmit={submit} noValidate>
        <label className="review-field">
          First name
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            maxLength={60}
            required
          />
        </label>
        <label className="review-field">
          WhatsApp number
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0712 345 678"
            required
          />
        </label>
        {products.length > 0 && (
          <label className="review-field">
            Which bracelet? (optional)
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Not sure</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="welcome-trap" aria-hidden="true">
          Company
          <input
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
        <label className="review-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>{CONSENT_TEXT} (Optional.)</span>
        </label>
        {error && (
          <p className="review-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="btn btn-primary welcome-submit"
          disabled={sending}
        >
          {sending ? "Registering…" : "Register my bracelet"}
        </button>
        <small className="review-fine">
          We use your number to send your code and help with your bracelet. We
          never share it.{" "}
          {active && `One code per number, valid ${validDays} days. `}
          Ask us on WhatsApp any time to see or delete your details.{" "}
          <Link href="/terms">Privacy &amp; terms</Link>
        </small>
      </form>
    </section>
  );
}

function WelcomeDone({
  result,
  remembered,
  onAnother,
}: {
  result: Result;
  remembered: boolean;
  onAnother: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { code, used, paused, already } = result;
  const until = formatQrDate(result.endsAt);
  const expired = result.endsAt ? new Date(result.endsAt) <= new Date() : false;
  const live = Boolean(code) && !used && !expired;

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      trackGa4Event("welcome_code_copy");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the code stays on screen to copy by hand */
    }
  };

  const saveMessage = `Hello BWA, I just registered my bracelet. My welcome code is ${code} (${result.percent}% off, until ${until}).`;
  const resizeMessage = `Hello BWA, I'd like my complimentary resizing.${code ? ` My code is ${code}.` : ""} My name is ${result.firstName}.`;

  return (
    <section className="review-card review-thanks welcome-card">
      <p className="eyebrow">
        {remembered || already ? "Welcome back" : "You're registered"}
      </p>
      <h1>
        {remembered || already
          ? `Good to see you again, ${result.firstName}.`
          : `Welcome to BWA, ${result.firstName}.`}
      </h1>
      {code ? (
        <>
          <p>
            {used
              ? "Your welcome code has been used. Enjoy the bracelet."
              : expired
                ? "Your welcome code has expired."
                : already
                  ? "You already have a welcome code. Here it is again."
                  : `Here's ${result.percent}% off your next order.`}
          </p>
          <div className={`review-code${live ? "" : " is-spent"}`}>
            <span>Your code</span>
            <strong>{code}</strong>
            {live && (
              <button type="button" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          {live && (
            <ul className="review-code-rules">
              <li>Use it once, at checkout on beadsworldafrica.co.ke.</li>
              <li>It only works with the WhatsApp number you gave us.</li>
              {result.minimumKes ? (
                <li>
                  For orders from KES{" "}
                  {result.minimumKes.toLocaleString("en-KE")}.
                </li>
              ) : null}
              {until && <li>Valid until {until}.</li>}
            </ul>
          )}
        </>
      ) : (
        <p>
          {paused
            ? "Your bracelet is registered. Thank you for choosing BWA."
            : "Thank you."}
        </p>
      )}

      <div className="welcome-resize">
        <strong>Doesn&apos;t fit right?</strong>
        <span>
          Your first resizing is on us. Message us and we&apos;ll arrange it.
        </span>
        <a
          href={whatsAppLink(BWA_WHATSAPP, resizeMessage)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackGa4Event("welcome_resize_click")}
        >
          Request resizing
        </a>
      </div>

      <div className="review-actions">
        {live && (
          <a
            className="btn btn-outline"
            href={whatsAppLink(BWA_WHATSAPP, saveMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGa4Event("welcome_save_whatsapp")}
          >
            Save it on WhatsApp
          </a>
        )}
        <Link className="btn btn-primary" href="/bracelets">
          Find your next one
        </Link>
      </div>
      <p className="welcome-another">
        <a
          href="https://www.instagram.com/beadsworldafrica/"
          target="_blank"
          rel="noopener noreferrer"
        >
          @beadsworldafrica
        </a>
        {" · "}
        <button type="button" onClick={onAnother}>
          Register another bracelet
        </button>
      </p>
    </section>
  );
}
