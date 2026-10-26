import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next 16 defaults to its CLI runner, which cannot execute pnpm's nested
    // TypeScript binary reliably. The compiler API gives the same production
    // checks without that process-wrapper incompatibility.
    useTypeScriptCli: false,
  },
  // Journal posts are Markdown files read at request time on revalidation.
  outputFileTracingIncludes: {
    "/journal": ["./content/journal/**"],
    "/journal/*": ["./content/journal/**"],
    "/sitemap.xml": ["./content/journal/**"],
    "/llms.txt": ["./content/journal/**"],
  },
  images: {
    // Some local networks (NAT64 DNS) resolve Supabase to 64:ff9b:: addresses,
    // which Next treats as private. Production optimises images on Vercel.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.net",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
