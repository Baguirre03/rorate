import SubmissionForm from "@/components/SubmissionForm";
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

export default function SubmitPage() {
  return <SubmissionForm />;
}
