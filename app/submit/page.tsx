import SubmissionForm from "@/components/SubmissionForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Return Offer Data | RORate",
  description:
    "Submit your internship return offer experience to help others make informed decisions.",
};

export default function SubmitPage() {
  return <SubmissionForm />;
}
