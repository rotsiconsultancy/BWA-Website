// Short ids for sent designs, e.g. D-4K7QM: easy to read out on WhatsApp, so
// no 0/O, 1/I/L. 31^5 ≈ 28 million; the table's primary key catches a repeat.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const DESIGN_ID = /^D-[2-9A-HJKMNP-Z]{5}$/;

export function newDesignId() {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return "D-" + [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("");
}
