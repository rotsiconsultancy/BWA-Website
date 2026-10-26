import { describe, expect, it } from "vitest";
import { toWhatsAppNumber } from "./whatsapp";

describe("toWhatsAppNumber", () => {
  it("converts Kenyan local formats", () => {
    expect(toWhatsAppNumber("0712 345 678")).toBe("254712345678");
    expect(toWhatsAppNumber("0110345678")).toBe("254110345678");
    expect(toWhatsAppNumber("712345678")).toBe("254712345678");
  });
  it("keeps international formats", () => {
    expect(toWhatsAppNumber("+254 712 345 678")).toBe("254712345678");
    expect(toWhatsAppNumber("00447700900123")).toBe("447700900123");
  });
  it("rejects empty or too-short numbers", () => {
    expect(toWhatsAppNumber("")).toBeNull();
    expect(toWhatsAppNumber(null)).toBeNull();
    expect(toWhatsAppNumber("12345")).toBeNull();
  });
});
