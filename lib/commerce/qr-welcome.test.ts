import { describe, expect, it } from "vitest";
import {
  newQrSlug,
  newWelcomeCode,
  parseQrRegistration,
  QR_SLUG,
  qrPercent,
  scansPerDay,
  welcomeUrl,
} from "./qr-welcome";

describe("QR links", () => {
  it("makes slugs the database accepts", () => {
    for (let i = 0; i < 50; i++) {
      const slug = newQrSlug("mancave");
      expect(slug).toMatch(/^mancave-[2-9a-z]{4}$/);
      expect(QR_SLUG.test(slug)).toBe(true);
    }
  });

  it("makes codes the discount table accepts", () => {
    const code = newWelcomeCode();
    expect(code).toMatch(/^WELCOME-[2-9A-HJKMNP-Z]{6}$/);
    expect(code).toMatch(/^[A-Z0-9][A-Z0-9_-]{1,31}$/);
  });

  it("points at the live site", () => {
    expect(welcomeUrl("online-ab23")).toBe(
      "https://beadsworldafrica.co.ke/welcome/online-ab23",
    );
  });
});

describe("parseQrRegistration", () => {
  const base = {
    slug: "mancave-7k2p",
    firstName: " Amani ",
    phone: "0712 345 678",
  };

  it("normalises a good registration", () => {
    const r = parseQrRegistration({
      ...base,
      consent: true,
      visitorId: "abcdef123456",
    });
    expect(r).toEqual({
      ok: true,
      value: {
        slug: "mancave-7k2p",
        firstName: "Amani",
        phone: "254712345678",
        productId: null,
        consent: true,
        visitorId: "abcdef123456",
      },
    });
  });

  it("accepts +254 and 01 numbers", () => {
    expect(parseQrRegistration({ ...base, phone: "+254 110 123 456" }).ok).toBe(
      true,
    );
  });

  it("rejects bad input with a message", () => {
    expect(parseQrRegistration({ ...base, phone: "12345" })).toMatchObject({
      ok: false,
    });
    expect(parseQrRegistration({ ...base, firstName: "  " })).toMatchObject({
      ok: false,
    });
    expect(parseQrRegistration({ ...base, slug: "../admin" })).toMatchObject({
      ok: false,
    });
  });

  it("only treats a real true as consent", () => {
    const r = parseQrRegistration({ ...base, consent: "yes" });
    expect(r.ok && r.value.consent).toBe(false);
  });

  it("drops a product id that isn't a uuid", () => {
    const r = parseQrRegistration({ ...base, productId: "1; drop table" });
    expect(r.ok && r.value.productId).toBe(null);
  });
});

describe("helpers", () => {
  it("counts scans per Nairobi day", () => {
    const now = new Date("2026-11-09T12:00:00Z");
    const days = scansPerDay(
      ["2026-11-09T08:00:00Z", "2026-11-09T09:00:00Z", "2026-11-08T22:30:00Z"],
      3,
      now,
    );
    // 22:30 UTC on the 8th is 01:30 on the 9th in Nairobi.
    expect(days).toEqual([
      { day: "2026-11-07", count: 0 },
      { day: "2026-11-08", count: 0 },
      { day: "2026-11-09", count: 3 },
    ]);
  });

  it("formats percentages safely", () => {
    expect(qrPercent(1, 4)).toBe("25%");
    expect(qrPercent(1, 0)).toBe("–");
  });
});
