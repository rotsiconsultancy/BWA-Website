"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import Money from "@/components/commerce/Money";
import AccountDrawer from "@/components/layout/AccountDrawer";
import { customPieceUrl } from "@/lib/commerce/custom-piece";
import { trackGa4Event } from "@/lib/marketing/ga4";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const closeAccount = useCallback(() => setAccountOpen(false), []);
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
  const { currency, setCurrency, detectedCountry, isManual } = useCurrency();

  // Flag resolution:
  // If user explicitly switched currency, map KES -> "ke", USD -> "us"
  // Otherwise show visitor's actual detected country flag (e.g. "ca", "ke", "us")
  const flagCountry = isManual
    ? currency === "KES"
      ? "ke"
      : "us"
    : (detectedCountry?.toLowerCase() ?? (currency === "KES" ? "ke" : "us"));

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
    setAccountOpen(false);
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
    // Report the settled term, not every keystroke.
    const searchTimer = window.setTimeout(
      () => trackGa4Event("search", { search_term: term }),
      1200,
    );
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(searchTimer);
    };
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
            <Link href="/#story">Our Story</Link>
            <Link
              href="/journal"
              className={pathname.startsWith("/journal") ? "active" : ""}
            >
              Journal
            </Link>
            <Link href="/#contact">Contact</Link>
          </nav>

          <div className="nav-actions">
            <div className="currency-pill">
              {flagCountry && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`https://flagcdn.com/32x24/${flagCountry}.png`}
                  srcSet={`https://flagcdn.com/64x48/${flagCountry}.png 2x`}
                  width={16}
                  height={12}
                  alt=""
                  aria-hidden="true"
                  className="currency-pill__flag"
                />
              )}
              <span className="currency-pill__code">{currency}</span>
              <svg
                className="currency-pill__chevron"
                width="8"
                height="5"
                viewBox="0 0 8 5"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 1l3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <select
                className="currency-pill__select"
                value={currency}
                aria-label="Display currency"
                onChange={(event) =>
                  setCurrency(event.target.value as "KES" | "USD")
                }
              >
                <option value="KES">KES</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <button
              className="icon-btn"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} strokeWidth={1.75} />
            </button>
            <button
              className="icon-btn"
              aria-label="Your details"
              onClick={() => {
                setAccountOpen(true);
                trackGa4Event("account_open");
              }}
            >
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
                <a
                  href={customPieceUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ask us for a custom piece.
                </a>
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

      <AccountDrawer open={accountOpen} onClose={closeAccount} />

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
          <div className="mobile-currency-row">
            <span className="mobile-currency-label">Currency</span>
            <div className="currency-pill currency-pill--mobile">
              {flagCountry && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`https://flagcdn.com/32x24/${flagCountry}.png`}
                  srcSet={`https://flagcdn.com/64x48/${flagCountry}.png 2x`}
                  width={16}
                  height={12}
                  alt=""
                  aria-hidden="true"
                  className="currency-pill__flag"
                />
              )}
              <span className="currency-pill__code">{currency}</span>
              <svg
                className="currency-pill__chevron"
                width="8"
                height="5"
                viewBox="0 0 8 5"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 1l3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <select
                className="currency-pill__select"
                value={currency}
                aria-label="Display currency"
                onChange={(event) =>
                  setCurrency(event.target.value as "KES" | "USD")
                }
              >
                <option value="KES">KES</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <Link href="/shop" onClick={() => setOpen(false)}>
            Shop
          </Link>
          <Link href="/bracelets" onClick={() => setOpen(false)}>
            Bracelets
          </Link>
          <Link href="/find-your-bracelet" onClick={() => setOpen(false)}>
            Find Your Bracelet
          </Link>
          <Link href="/#story" onClick={() => setOpen(false)}>
            Our Story
          </Link>
          <Link href="/journal" onClick={() => setOpen(false)}>
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
