import type { MetadataRoute } from "next";
import { site } from "@/data/site";

/** Single-page site, so one entry — but crawlers still expect the file. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
