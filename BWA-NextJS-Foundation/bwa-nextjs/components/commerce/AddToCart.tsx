"use client";
import { useState } from "react";
import Link from "next/link";
export default function AddToCart() {
  const [added, setAdded] = useState(false);
  return added ? (
    <div>
      <div style={{ padding: "16px 0", fontSize: 13 }}>Added to your bag.</div>
      <Link className="btn primary full-btn" href="/cart">
        View Bag
      </Link>
    </div>
  ) : (
    <button className="btn primary full-btn" onClick={() => setAdded(true)}>
      Add to bag
    </button>
  );
}
