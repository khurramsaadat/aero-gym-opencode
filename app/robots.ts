import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";

/** robots.txt for the static app: everything is public and indexable. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
