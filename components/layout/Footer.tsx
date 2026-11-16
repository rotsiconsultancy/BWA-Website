"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FaInstagram, FaFacebook, FaTiktok, FaLinkedin } from "react-icons/fa";
import { trackGa4Event } from "@/lib/marketing/ga4";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const subscribe = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "footer" }),
    });
    setStatus(response.ok ? "success" : "error");
    if (response.ok) trackGa4Event("sign_up", { method: "newsletter_footer" });
  };

  return (
    <footer id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand">
              {/* <span className="brand-mark">BWA</span> */}
              <span className="brand-emblem" aria-hidden="true" />
              <span className="brand-meta">BEADS WORLD AFRICA</span>
            </div>
            <p>
              Natural materials, personal meaning, and bracelets made to become
              part of your rhythm.
            </p>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <div className="footer-links">
              <Link href="/shop">Shop</Link>
              <Link href="/bracelets">All Bracelets</Link>
              <Link href="/bracelets">Popular picks</Link>
              <Link href="/find-your-bracelet">Find your bracelet</Link>
              <Link href="/design-your-own">Design your own</Link>
              <Link href="/stone-meanings">Stone meanings</Link>
              <Link href="/stockists">Where to buy</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4>About</h4>
            <div className="footer-links">
              <Link href="/our-story">Our Story</Link>
              <Link href="/corporate-gifts">Corporate gifts</Link>
              <Link href="/#contact">Order help</Link>
              <Link href="/returns">Exchange Policy</Link>
              <Link href="/terms">Terms &amp; Conditions</Link>
              <Link href="/admin/login">BWA team login</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4>Join our journey</h4>
            <div className="footer-links">
              <span>Get updates on new collections, stories and more.</span>
            </div>
            <form className="newsletter" onSubmit={subscribe}>
              <input
                type="email"
                placeholder="Your email address"
                aria-label="Email address"
                required
                value={email}
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
              />
              <button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "…" : "→"}
              </button>
            </form>
            <p className="footer-newsletter-status" role="status">
              {status === "success"
                ? "You’re on the list."
                : status === "error"
                  ? "Please try again shortly."
                  : ""}
            </p>
            <div className="socials">
              <a
                href="https://instagram.com/beadsworldafrica"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                href="https://facebook.com/beadsworldafrica"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook />
              </a>
              <a
                href="https://tiktok.com/@beadsworldafrica"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTiktok />
              </a>
              <a
                href="https://www.linkedin.com/company/beadsworldafrica"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {currentYear} Beads World Africa. All rights reserved.</span>
          <span className="footer-legal-links">
            <Link href="/returns">Exchange Policy</Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms">Terms &amp; Conditions</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
