// The /bespoke page is hidden while the owner rethinks it (2026-10-28).
// Until then, every "custom piece" link opens WhatsApp with a short note.
export const customPieceUrl = (bracelet?: string) =>
  `https://wa.me/254745474586?text=${encodeURIComponent(
    bracelet
      ? `Hello BWA, I would like a custom version of the ${bracelet}.`
      : "Hello BWA, I would like a custom bracelet made.",
  )}`;
