import { MetadataRoute } from "next";
import { db } from "@/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ldk-alhidayah.vercel.app";

  const staticRoutes = [
    "",
    "/profil",
    "/struktur",
    "/program-kerja",
    "/kegiatan",
    "/galeri",
    "/berita",
    "/rekrutmen",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const articles = await db.query.articles.findMany({
    where: (articles, { eq }) => eq(articles.status, "PUBLISHED"),
    columns: {
      slug: true,
      createdAt: true,
      publishedAt: true,
    },
  });

  const dynamicRoutes = articles.map((article) => ({
    url: `${baseUrl}/berita/${article.slug}`,
    lastModified: article.publishedAt ?? article.createdAt,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}