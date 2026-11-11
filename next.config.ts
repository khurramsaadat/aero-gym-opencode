import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here
     cacheComponents/partialPrefetching intentionally off: this app renders
     per-request (force-dynamic) because every view derives from "today". */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "wger.de" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
