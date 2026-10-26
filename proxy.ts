import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const country =
    // Cloudflare sits in front of Vercel, so its header describes the
    // visitor; Vercel's would describe the Cloudflare edge.
    (
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cloudfront-viewer-country") ||
      request.headers.get("x-country-code") ||
      ""
    ).toUpperCase();
  // Cloudflare uses XX/T1 for unknown and Tor; treat those as no answer.
  const knownCountry = /^[A-Z]{2}$/.test(country) && country !== "XX";

  if (knownCountry) {
    // Read by CurrencyContext so the browser never needs a geolocation API.
    if (request.cookies.get("bwa_country")?.value !== country)
      response.cookies.set("bwa_country", country, {
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
      });

    // Only auto-detect if the user has not explicitly set a preference cookie
    if (!request.cookies.get("bwa_store_currency")?.value)
      response.cookies.set(
        "bwa_store_currency",
        country === "KE" ? "KES" : "USD",
        {
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: "lax",
        },
      );
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all storefront routes; skip static files, images, api routes, and admin pages
    "/((?!_next/static|_next/image|favicon.ico|api/|admin/).*)",
  ],
};
