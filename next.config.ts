import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next 16 defaults to its CLI runner, which cannot execute pnpm's nested
    // TypeScript binary reliably. The compiler API gives the same production
    // checks without that process-wrapper incompatibility.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
