import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next 16 defaults to its CLI runner, which cannot execute pnpm's nested
    // TypeScript binary reliably. The compiler API gives the same production
    // checks without that process-wrapper incompatibility.
    useTypeScriptCli: false,
  },
  images: {
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
