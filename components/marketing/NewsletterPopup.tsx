"use client";

import { useState, useEffect } from "react";
import { X, Mail, Sparkles, Check } from "lucide-react";

const STORAGE_KEY = "bwa_newsletter_dismissed_until";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if user has dismissed within the last 7 days
    try {
      const savedExpiration = localStorage.getItem(STORAGE_KEY);
      if (savedExpiration) {
        const expirationTime = parseInt(savedExpiration, 10);
        if (Date.now() < expirationTime) {
          return; // Still within 7-day suppression period
        }
      }
    } catch (e) {
      console.warn("Unable to access localStorage:", e);
    }

    let timer: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollPosition / Math.max(totalHeight, 1)) * 100;

      // Trigger popup after scrolling past 40%
      if (scrollPercent >= 40) {
        timer = setTimeout(() => {
          setVisible(true);
        }, 1500);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const saveDismissal = () => {
    try {
      const expirationDate = Date.now() + SEVEN_DAYS_MS;
      localStorage.setItem(STORAGE_KEY, expirationDate.toString());
    } catch (e) {
      console.warn("Unable to write to localStorage:", e);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    saveDismissal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        saveDismissal();
        setTimeout(() => setVisible(false), 4000);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to subscribe.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Newsletter sign up"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 99,
        maxWidth: "400px",
        width: "calc(100vw - 48px)",
        background: "var(--charcoal)",
        color: "var(--ivory)",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        border: "1px solid rgba(245,241,232,0.14)",
        animation: "slideInPopup 400ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <button
        onClick={handleDismiss}
        aria-label="Close modal"
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          background: "none",
          border: "none",
          color: "rgba(245,241,232,0.6)",
          cursor: "pointer",
        }}
      >
        <X size={16} />
      </button>

      {status === "success" ? (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "rgba(63, 107, 80, 0.25)",
              color: "#52ab77",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 12px",
            }}
          >
            <Check size={20} />
          </div>
          <h4 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", margin: "0 0 6px" }}>
            Welcome to the Circle
          </h4>
          <p style={{ fontSize: "12px", color: "rgba(245,241,232,0.7)", margin: 0 }}>
            You will be the first to know about new stone drops and stories.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--brass)",
              fontSize: "11px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            <Sparkles size={14} /> VIP Access
          </div>

          <h4 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "24px", fontWeight: 500, margin: "0 0 8px", lineHeight: 1.1 }}>
            Wear stories worth telling.
          </h4>

          <p style={{ fontSize: "12px", color: "rgba(245,241,232,0.72)", marginBottom: "18px", lineHeight: 1.5 }}>
            Subscribe to receive 10% off your first handcrafted bracelet and early access to rare stone releases.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: "44px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(245,241,232,0.2)",
                  borderRadius: "4px",
                  padding: "0 12px 0 36px",
                  color: "var(--ivory)",
                  fontSize: "12px",
                  outline: "none",
                }}
              />
              <Mail size={14} style={{ position: "absolute", left: "12px", top: "15px", color: "rgba(245,241,232,0.4)" }} />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                height: "44px",
                padding: "0 18px",
                background: "var(--ivory)",
                color: "var(--charcoal)",
                border: "none",
                borderRadius: "4px",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {status === "loading" ? "..." : "Join"}
            </button>
          </form>

          {status === "error" && (
            <p style={{ fontSize: "11px", color: "#e57373", marginTop: "8px", margin: "8px 0 0" }}>
              {errorMessage}
            </p>
          )}
        </>
      )}
    </div>
  );
}
