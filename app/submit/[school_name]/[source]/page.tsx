import SubmissionForm from "@/components/submit/SubmissionForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Return Offer Data",
  description:
    "Submit your internship return offer experience to help others make informed decisions. Share your company's return offer statistics and contribute to the community database.",
  keywords: [
    "submit return offer",
    "share return offer data",
    "internship return offer submission",
  ],
  openGraph: {
    title: "Submit Return Offer Data | Return Offer Rates.fyi",
    description:
      "Submit your internship return offer experience to help others make informed decisions.",
  },
};

interface SubmitWithAnalyticsPageProps {
  params: Promise<{
    school_name: string;
    source: string;
  }>;
}

export default async function SubmitWithAnalyticsPage({
  params,
}: SubmitWithAnalyticsPageProps) {
  const { school_name, source } = await params;

  // Decode URL-encoded parameters
  const decodedSchoolName = decodeURIComponent(school_name);
  const decodedSource = decodeURIComponent(source);

  return (
    <SubmissionForm schoolName={decodedSchoolName} source={decodedSource} />
  );
}
