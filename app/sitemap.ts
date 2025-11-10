import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SITE_URL || "https://rorates.fyi";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/submissions`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: submissions, error } = await supabase
      .from("public_accepted_submissions")
      .select("company_name")
      .not("company_name", "is", null);

    if (error) {
      console.error("Error fetching companies for sitemap:", error);
      return staticPages;
    }

    // Get unique company names
    const uniqueCompanies = new Set<string>();
    submissions?.forEach((submission: { company_name: string }) => {
      if (submission.company_name) {
        uniqueCompanies.add(submission.company_name);
      }
    });

    // Create sitemap entries for each company
    const companyPages: MetadataRoute.Sitemap = Array.from(uniqueCompanies).map(
      (companyName) => ({
        url: `${baseUrl}/company/${encodeURIComponent(companyName)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    );

    return [...staticPages, ...companyPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}
