import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev badge sits over the mobile theme toggle at the bottom-left.
  devIndicators: false,
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
