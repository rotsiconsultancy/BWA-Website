"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand">
              <span className="brand-mark">BWA</span>
              <span className="brand-meta">BEADS WORLD AFRICA</span>
            </div>
            <p>
              Timeless pieces.
              <br />
              Real stories.
            </p>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <div className="footer-links">
              <Link href="/shop">All Bracelets</Link>
              <Link href="/shop">New Arrivals</Link>
              <Link href="/shop">Collections</Link>
              <Link href="/shop">Gift Cards</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4>About</h4>
            <div className="footer-links">
              <Link href="/#story">Our Story</Link>
              <Link href="/#story">Craftsmanship</Link>
              <Link href="/#story">Sustainability</Link>
              <Link href="/#journal">Journal</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4>Join our journey</h4>
            <div className="footer-links">
              <span>Get updates on new collections, stories and more.</span>
            </div>
            <form className="newsletter" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                aria-label="Email address"
                required
              />
              <button type="submit">→</button>
            </form>
            <div className="socials">
              <span>Instagram</span>
              <span>Facebook</span>
              <span>TikTok</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Beads World Africa. All rights reserved.</span>
          <span>Privacy Policy · Terms & Conditions</span>
        </div>
      </div>
    </footer>
  );
}
