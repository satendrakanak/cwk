import { siteConfig } from "@/lib/seo";
import { articleServerService } from "@/services/articles/article.server";
import { courseServerService } from "@/services/courses/course.server";
import type { MetadataRoute } from "next";

const staticRoutes = [
  "/",
  "/courses",
  "/articles",
  "/client-testimonials",
  "/our-faculty",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = staticRoutes.map((route) => ({
    url: new URL(route, siteConfig.url).toString(),
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.8,
  })) satisfies MetadataRoute.Sitemap;

  const [coursesResult, articlesResult] = await Promise.allSettled([
    courseServerService.getAll(),
    articleServerService.getAll(),
  ]);

  const courseEntries =
    coursesResult.status === "fulfilled"
      ? coursesResult.value.data.map((course) => ({
          url: new URL(`/course/${course.slug}`, siteConfig.url).toString(),
          lastModified: course.updatedAt ? new Date(course.updatedAt) : now,
          changeFrequency: "weekly" as const,
          priority: 0.9,
        }))
      : [];

  const articleEntries =
    articlesResult.status === "fulfilled"
      ? articlesResult.value.data.map((article) => ({
          url: new URL(`/article/${article.slug}`, siteConfig.url).toString(),
          lastModified: article.updatedAt ? new Date(article.updatedAt) : now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }))
      : [];

  return [...staticEntries, ...courseEntries, ...articleEntries];
}
