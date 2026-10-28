import { redirect } from "next/navigation";

// Hidden while the owner rethinks the bespoke page (2026-10-28). The form
// (components/bespoke/BespokeForm.tsx) and /api/bespoke are kept for that.
// Old links land on the bracelets page instead of a dead end.
export default function BespokePage() {
  redirect("/bracelets");
}
