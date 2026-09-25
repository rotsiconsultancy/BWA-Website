import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const existingCurrency = request.cookies.get("bwa_store_currency")?.value;

  // Only auto-detect if the user has not explicitly set a preference cookie
  if (!existingCurrency) {
    const country = (
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      request.headers.get("cloudfront-viewer-country") ||
      request.headers.get("x-country-code") ||
      ""
    ).toUpperCase();

    const detectedCurrency = country === "KE" ? "KES" : "USD";

    response.cookies.set("bwa_store_currency", detectedCurrency, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all storefront routes; skip static files, images, api routes, and admin pages
    "/((?!_next/static|_next/image|favicon.ico|api/|admin/).*)",
  ],
};
