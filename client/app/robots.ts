import { siteConfig } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/auth", "/checkout", "/cart"],
    },
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
  };
}
