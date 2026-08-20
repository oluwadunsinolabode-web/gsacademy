import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin-dashboard/",
        "/tutor-dashboard/",
        "/dashboard/",
        "/api/",
      ],
    },
    sitemap: "https://gsacademyhub.com/sitemap.xml",
  };
}