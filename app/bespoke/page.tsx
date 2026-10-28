import { redirect } from "next/navigation";

// Replaced by Design Your Own (2026-10-28). Old links and the Instagram
// captions that say "bespoke page" land there.
export default function BespokePage() {
  redirect("/design-your-own");
}
