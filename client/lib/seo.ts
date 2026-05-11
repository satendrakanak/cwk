import type { Metadata } from "next";

export const siteConfig = {
  name: "CodeWithKasa",
  title: "CodeWithKasa | Practical Coding Courses",
  description:
    "Practical coding courses, live classes, exams, certificates, and career-focused learning.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image,
}: {
  title?: string;
  description?: string | null;
  path?: string;
  image?: string | null;
}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;
  const url = new URL(path, siteConfig.url).toString();

  return {
    title: pageTitle,
    description: description || siteConfig.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: pageTitle,
      description: description || siteConfig.description,
      url,
      siteName: siteConfig.name,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: description || siteConfig.description,
      images: image ? [image] : undefined,
    },
  };
}
