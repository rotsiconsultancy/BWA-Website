"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

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

  // Close menu on route change or ESC key
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
            <Link href="/find-your-bracelet" className={pathname === "/find-your-bracelet" ? "active" : ""}>
              Find Your Bracelet
            </Link>
            <Link href="/#story">Our Story</Link>
            <Link href="/#journal">Journal</Link>
            <Link href="/#contact">Contact</Link>
          </nav>

          <div className="nav-actions">
            <button className="icon-btn" aria-label="Search">
              <Search size={16} strokeWidth={1.75} />
            </button>
            <button className="icon-btn" aria-label="Account">
              <User size={16} strokeWidth={1.75} />
            </button>
            <Link href="/cart" className="icon-btn" aria-label="Cart">
              <ShoppingBag size={16} strokeWidth={1.75} />
            </Link>
            <span className="cart-count">0</span>
            <button
              className="icon-btn menu-btn"
              onClick={() => setOpen((prev) => !prev)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={16} strokeWidth={1.75} /> : <Menu size={16} strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <aside className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu-head">
          <Link className="brand" href="/" onClick={() => setOpen(false)}>
            <span className="brand-emblem" aria-hidden="true" />
            <span className="brand-meta">BEADS WORLD AFRICA</span>
          </Link>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <nav className="mobile-links">
          <Link href="/shop" onClick={() => setOpen(false)}>
            Shop
          </Link>
          <Link href="/find-your-bracelet" onClick={() => setOpen(false)}>
            Find Your Bracelet
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