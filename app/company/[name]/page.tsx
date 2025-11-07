import { Metadata } from "next";
import CompanyPageClient from "./CompanyPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const companyName = decodeURIComponent(resolvedParams.name);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rorates.fyi";
  const url = `${siteUrl}/company/${encodeURIComponent(companyName)}`;

  return {
    title: `${companyName} Return Offer Rate - Statistics & Data`,
    description: `Find ${companyName}'s return offer rate, statistics, and data. See how many interns receive return offers from ${companyName} and compare with other companies.`,
    keywords: [
      `${companyName} return offer rate`,
      `${companyName} return offer`,
      `${companyName} internship return offer`,
      `${companyName} intern return offer rate`,
      `${companyName} conversion rate`,
      "return offer statistics",
      "internship return offer data",
    ],
    alternates: {
      canonical: `/company/${encodeURIComponent(companyName)}`,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      title: `${companyName} Return Offer Rate - Statistics & Data`,
      description: `Find ${companyName}'s return offer rate, statistics, and data. See how many interns receive return offers from ${companyName}.`,
      siteName: "Return Offer Rates.fyi",
    },
    twitter: {
      card: "summary_large_image",
      title: `${companyName} Return Offer Rate - Statistics & Data`,
      description: `Find ${companyName}'s return offer rate, statistics, and data. See how many interns receive return offers from ${companyName}.`,
    },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const companyName = decodeURIComponent(resolvedParams.name);

  return <CompanyPageClient companyName={companyName} />;
}
