import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The compiler API is more reliable than the CLI parser in this container.
    useTypeScriptCli: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
