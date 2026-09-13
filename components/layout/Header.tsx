"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import Money from "@/components/commerce/Money";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    {
      slug: string;
      title: string;
      subtitle: string;
      prices: import("@/lib/commerce/money").Prices;
      image: string;
    }[]
  >([]);
  const searchInput = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { cartCount, openDrawer } = useCart();
  const { currency, setCurrency } = useCurrency();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await response.json();
      setResults(data.products || []);
    }, 160);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <>
      <header className={`site-header ${isHome ? "" : "sticky-header"}`}>
        <div className="container nav">
          <Link className="brand" href="/">
            <span className="brand-emblem" aria-hidden="true" />
            <span className="brand-meta">BEADS WORLD AFRICA</span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary">
            <Link href="/shop" className={pathname === "/shop" ? "active" : ""}>
              Shop
            </Link>
            <Link
              href="/bracelets"
              className={pathname === "/bracelets" ? "active" : ""}
            >
              Bracelets
            </Link>
            <Link
              href="/find-your-bracelet"
              className={pathname === "/find-your-bracelet" ? "active" : ""}
            >
              Find Your Bracelet
            </Link>
            <Link
              href="/bespoke"
              className={pathname === "/bespoke" ? "active" : ""}
            >
              Bespoke
            </Link>
            <Link href="/#story">Our Story</Link>
            <Link href="/#journal">Journal</Link>
            <Link href="/#contact">Contact</Link>
          </nav>

          <div className="nav-actions">
            <label className="currency-switcher">
              <span className="sr-only">Display currency</span>
              <select
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value as "KES" | "USD")
                }
              >
                <option value="KES">KES</option>
                <option value="USD">USD</option>
              </select>
            </label>
            <button
              className="icon-btn"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} strokeWidth={1.75} />
            </button>
            <button className="icon-btn" aria-label="Account">
              <User size={16} strokeWidth={1.75} />
            </button>
            <button
              className="icon-btn"
              aria-label="Open bag"
              onClick={openDrawer}
              style={{ position: "relative" }}
            >
              <ShoppingBag size={16} strokeWidth={1.75} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button
              className="icon-btn menu-btn"
              onClick={() => setOpen((prev) => !prev)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? (
                <X size={16} strokeWidth={1.75} />
              ) : (
                <Menu size={16} strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div
          className="site-search"
          role="dialog"
          aria-modal="true"
          aria-label="Search BWA"
        >
          <button
            className="site-search-backdrop"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          />
          <section className="site-search-panel">
            <div className="site-search-input">
              <Search size={18} aria-hidden="true" />
              <input
                ref={searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search bracelets, stones, or moods"
                aria-label="Search bracelets, stones, or moods"
              />
              <button type="button" onClick={() => setSearchOpen(false)}>
                Esc
              </button>
            </div>
            {!query && (
              <p className="site-search-hint">
                Try “Tiger Eye”, “grounded”, or “gift”.
              </p>
            )}
            {query.length >= 2 && !results.length && (
              <p className="site-search-hint">
                No pieces found yet.{" "}
                <Link href="/bespoke" onClick={() => setSearchOpen(false)}>
                  Create something bespoke.
                </Link>
              </p>
            )}
            <div className="site-search-results">
              {results.map((product) => (
                <Link
                  key={product.slug}
                  href={`/product/${product.slug}`}
                  onClick={() => setSearchOpen(false)}
                >
                  <img src={product.image} alt="" />
                  <span>
                    <strong>{product.title}</strong>
                    <small>{product.subtitle}</small>
                  </span>
                  <b>
                    <Money prices={product.prices} />
                  </b>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Mobile Drawer */}
      <aside
        className={`mobile-menu ${open ? "open" : ""}`}
        aria-hidden={!open}
      >
        <div className="mobile-menu-head">
          <Link className="brand" href="/" onClick={() => setOpen(false)}>
            <span className="brand-emblem" aria-hidden="true" />
            <span className="brand-meta">BEADS WORLD AFRICA</span>
          </Link>
          <button
            className="icon-btn"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <nav className="mobile-links">
          <label className="currency-switcher currency-switcher--mobile">
            Display currency
            <select
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value as "KES" | "USD")
              }
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <Link href="/shop" onClick={() => setOpen(false)}>
            Shop
          </Link>
          <Link href="/bracelets" onClick={() => setOpen(false)}>
            Bracelets
          </Link>
          <Link href="/find-your-bracelet" onClick={() => setOpen(false)}>
            Find Your Bracelet
          </Link>
          <Link href="/bespoke" onClick={() => setOpen(false)}>
            Bespoke
          </Link>
          <Link href="/#story" onClick={() => setOpen(false)}>
            Our Story
          </Link>
          <Link href="/#journal" onClick={() => setOpen(false)}>
            Journal
          </Link>
          <Link href="/#contact" onClick={() => setOpen(false)}>
            Contact
          </Link>
        </nav>
      </aside>
    </>
  );
}
