import type { MetadataRoute } from "next";
import { ALL_MARKETING_ROUTES, SITE_URL } from "@/lib/constants";
import { getSafeProgrammaticSitemapPaths } from "@/lib/seoContentGenerator";

export default function sitemap(): MetadataRoute.Sitemap {
  const updatedAt = new Date();
  const seoRoutes = getSafeProgrammaticSitemapPaths();

  return [...ALL_MARKETING_ROUTES, ...seoRoutes].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: updatedAt,
    changeFrequency: route === "/" ? "weekly" : route.includes("/") && route.split("/").length > 2 ? "weekly" : "monthly",
    priority:
      route === "/"
        ? 1
        : route.startsWith("/admin") || route.startsWith("/client-portal")
          ? 0.2
          : seoRoutes.includes(route)
            ? 0.85
            : 0.7,
  }));
}
