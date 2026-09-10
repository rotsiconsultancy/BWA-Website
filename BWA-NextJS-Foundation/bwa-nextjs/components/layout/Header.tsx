"use client";
import Link from "next/link";
import { useState } from "react";
export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="site-header">
        <div className="nav">
          <Link href="/" className="logo">
            BWA
          </Link>
          <div className="nav-center">
            <Link href="/shop">Shop</Link>
            <Link href="/shop">Collections</Link>
            <Link href="/find-your-bracelet">Find Your Bracelet</Link>
            <Link href="#story">Our Story</Link>
          </div>
          <div className="nav-right">
            <span>Search</span>
            <span>Account</span>
            <Link href="/cart">Bag (1)</Link>
          </div>
          <button
            className="menu"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </header>
      {open && (
        <div className="mobile-menu">
          <Link href="/shop" onClick={() => setOpen(false)}>
            Shop
          </Link>
          <Link href="/shop" onClick={() => setOpen(false)}>
            Collections
          </Link>
          <Link href="/find-your-bracelet" onClick={() => setOpen(false)}>
            Find Your Bracelet
          </Link>
          <Link href="#story" onClick={() => setOpen(false)}>
            Our Story
          </Link>
          <Link href="/cart" onClick={() => setOpen(false)}>
            Bag
          </Link>
        </div>
      )}
    </>
  );
}
