import { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rorates.fyi";

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
    // Fetch all companies with accepted submissions
    const supabase = await createServerSupabaseClient();
    const { data: companies, error } = await supabase
      .from("submissions")
      .select("companies!inner(name)")
      .eq("status", "accepted")
      .not("companies.name", "is", null);

    if (error) {
      console.error("Error fetching companies for sitemap:", error);
      return staticPages;
    }

    // Get unique company names
    const uniqueCompanies = new Set<string>();
    companies?.forEach((submission: any) => {
      const company = Array.isArray(submission.companies)
        ? submission.companies[0]
        : submission.companies;
      if (company?.name) {
        uniqueCompanies.add(company.name);
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

