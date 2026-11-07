import { Bricolage_Grotesque } from "next/font/google";

// Display face for the brand-story pages (/our-story, /corporate-gifts);
// the rest of the site keeps Cormorant.
export const storyDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
  display: "swap",
  variable: "--font-story",
});
