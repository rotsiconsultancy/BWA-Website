"use client";

import { FormEvent, useEffect, useState } from "react";

export default function BespokePage() {
  const [discoveryContext, setDiscoveryContext] = useState({
    product: "",
    quiz: "",
  });
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setDiscoveryContext({
      product: query.get("product") || "",
      quiz: query.get("quiz") || "",
    });
  }, []);
  const [form, setForm] = useState({
    firstName: "",
    phone: "",
    email: "",
    notes: "",
    intention: "",
    palette: "",
    wristSize: "",
    budgetRange: "",
  });
  const [message, setMessage] = useState("");
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/bespoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        intention: form.intention ? [form.intention] : [],
        palette: form.palette ? [form.palette] : [],
        wristSize: form.wristSize,
        budgetRange: form.budgetRange,
        startingProductId: discoveryContext.product || undefined,
        quizSessionToken: discoveryContext.quiz || undefined,
      }),
    });
    const data = await response.json();
    setMessage(
      response.ok
        ? "Your request " +
            data.requestNumber +
            " is with BWA. We will continue the conversation on WhatsApp."
        : data.error,
    );
  };
  return (
    <main className="bespoke-page">
      <section>
        <p className="eyebrow">BWA bespoke</p>
        <h1>Begin with a feeling.</h1>
        <p>
          Tell us what you want a bracelet to hold. We will shape the rest with
          you.
        </p>
      </section>
      <form onSubmit={submit}>
        <label>
          Name
          <input
            required
            value={form.firstName}
            onChange={(event) => update("firstName", event.target.value)}
          />
        </label>
        <label>
          Phone / WhatsApp
          <input
            required
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </label>
        <label>
          Intention
          <select
            value={form.intention}
            onChange={(event) => update("intention", event.target.value)}
          >
            <option value="">Choose one</option>
            <option value="inner_strength">Inner strength</option>
            <option value="peace_mind">Peace of mind</option>
            <option value="courage">Courage</option>
            <option value="transformation">Transformation</option>
          </select>
        </label>
        <label>
          Palette
          <select
            value={form.palette}
            onChange={(event) => update("palette", event.target.value)}
          >
            <option value="">Choose one</option>
            <option value="dark_monochrome">Dark & deep</option>
            <option value="earth_tones">Earth & warm</option>
            <option value="deep_blue">Blue & clear</option>
            <option value="raw_natural">Raw & natural</option>
          </select>
        </label>
        <label>
          Wrist size
          <input
            placeholder="e.g. 18cm"
            value={form.wristSize}
            onChange={(event) => update("wristSize", event.target.value)}
          />
        </label>
        <label>
          Budget guidance
          <input
            placeholder="e.g. KES 4,000–6,000"
            value={form.budgetRange}
            onChange={(event) => update("budgetRange", event.target.value)}
          />
        </label>
        <label className="bespoke-notes">
          What are you imagining?
          <textarea
            required
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Stone, colour, inspiration, gift message, or simply the feeling you want…"
          />
        </label>
        {message && <p role="status">{message}</p>}
        <button className="btn btn-primary">Send my brief</button>
      </form>
    </main>
  );
}
