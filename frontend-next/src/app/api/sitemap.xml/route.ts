import { ALL_MARKETING_ROUTES, SITE_URL } from "@/lib/constants";
import { getSafeProgrammaticSitemapPaths } from "@/lib/seoContentGenerator";

export const revalidate = 3600;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export async function GET() {
  const updatedAt = new Date().toISOString();
  const safeProgrammaticRoutes = getSafeProgrammaticSitemapPaths();
  const routes = Array.from(new Set([...ALL_MARKETING_ROUTES, ...safeProgrammaticRoutes]));
  const urls = routes
    .map((route) => {
      const priority = route === "/" ? "1.0" : safeProgrammaticRoutes.includes(route) ? "0.85" : "0.70";
      const changefreq = safeProgrammaticRoutes.includes(route) ? "weekly" : "monthly";

      return [
        "  <url>",
        `    <loc>${escapeXml(buildUrl(route))}</loc>`,
        `    <lastmod>${updatedAt}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  const xml = [`<?xml version="1.0" encoding="UTF-8"?>`, `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`, urls, `</urlset>`].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
