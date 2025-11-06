"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import CompanySearch, { Company } from "./CompanySearch";
import { SubmissionFormData, SubmissionRequestBody } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormErrors {
  linkedinUrl?: string;
  companyName?: string;
  year?: string;
  term?: string;
  internType?: string;
  returnOfferExtended?: string;
}

// Type guard to ensure payload matches API expectations
function createSubmissionPayload(
  formData: SubmissionFormData
): SubmissionRequestBody {
  return {
    linkedinUrl: formData.linkedinUrl.trim() || undefined,
    companyName: formData.companyName.trim(),
    year: formData.year,
    term: formData.term,
    internType: formData.internType || undefined,
    returnOfferExtended: formData.returnOfferExtended === true,
  };
}

const INTERN_TYPES = [
  "Software Engineering",
  "Product Management",
  "Data Science",
  "Design",
  "Marketing",
  "Finance",
  "Other",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, i) => currentYear - i);
const TERMS = ["Fall", "Spring", "Summer"];

export default function SubmissionForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SubmissionFormData>({
    linkedinUrl: "",
    companyName: "",
    year: currentYear,
    term: "",
    internType: "",
    returnOfferExtended: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const validateLinkedInUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    const linkedinPattern =
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedinPattern.test(url);
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // LinkedIn URL validation
    if (!formData.linkedinUrl.trim()) {
      newErrors.linkedinUrl = "LinkedIn profile URL is required";
    } else if (!validateLinkedInUrl(formData.linkedinUrl)) {
      newErrors.linkedinUrl =
        "Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/yourprofile)";
    }

    // Company name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    // Year validation
    if (!formData.year) {
      newErrors.year = "Year is required";
    } else if (!YEARS.includes(formData.year)) {
      newErrors.year = "Please select a valid year";
    }

    // Term validation
    if (!formData.term) {
      newErrors.term = "Term is required";
    } else if (!TERMS.includes(formData.term)) {
      newErrors.term = "Please select a valid term";
    }

    // Intern type validation
    if (!formData.internType) {
      newErrors.internType = "Intern type is required";
    }

    // Return offer validation
    if (formData.returnOfferExtended === null) {
      newErrors.returnOfferExtended =
        "Please select whether a return offer was extended";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleCompanySelect = useCallback(
    (company: Company) => {
      setFormData((prev: SubmissionFormData) => ({
        ...prev,
        companyName: company.name,
      }));
      setSelectedCompany(company);
      // Clear company name error if it exists
      if (errors.companyName) {
        setErrors((prev: FormErrors) => ({ ...prev, companyName: undefined }));
      }
    },
    [errors.companyName]
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: SubmissionFormData) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev: FormErrors) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setFormData((prev: SubmissionFormData) => ({
      ...prev,
      year: value || currentYear,
    }));
    if (errors.year) {
      setErrors((prev: FormErrors) => ({ ...prev, year: undefined }));
    }
  };

  const handleReturnOfferChange = (value: boolean) => {
    setFormData((prev: SubmissionFormData) => ({
      ...prev,
      returnOfferExtended: value,
    }));
    if (errors.returnOfferExtended) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        returnOfferExtended: undefined,
      }));
    }
  };

  const handleCompanyInputChange = useCallback(
    (value: string) => {
      setFormData((prev: SubmissionFormData) => ({
        ...prev,
        companyName: value,
      }));

      // If user manually types and it doesn't match selected company, clear selection
      if (selectedCompany && value !== selectedCompany.name) {
        setSelectedCompany(null);
      }

      if (errors.companyName) {
        setErrors((prev: FormErrors) => ({ ...prev, companyName: undefined }));
      }
    },
    [selectedCompany, errors.companyName]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus({
        type: "error",
        message: "Please fix the errors above before submitting.",
      });
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const payload: SubmissionRequestBody = createSubmissionPayload(formData);

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      // Success - show toast and redirect to top companies page
      toast.success("Submission successful!", {
        description:
          "Your submission is pending review and will appear on the site after moderation.",
      });

      // Redirect to top companies page after a short delay to allow toast to show
      setTimeout(() => {
        router.push("/companies");
      }, 500);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
      setSubmitStatus({
        type: "error",
        message: "❌ Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const allRequiredFieldsFilled =
    formData.linkedinUrl.trim() &&
    formData.companyName.trim() &&
    formData.year &&
    formData.term &&
    formData.internType &&
    formData.returnOfferExtended !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="px-3 py-2 font-normal text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header Section - Similar to levels.fyi */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground tracking-tight">
            Submit Your Return Offer
          </h1>
          <p className="text-base text-muted-foreground">
            Help others by sharing your internship return offer experience. All
            submissions are reviewed before being published.
          </p>
        </div>

        {submitStatus.type && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              submitStatus.type === "success"
                ? "bg-green-50 dark:bg-green-950/50 text-green-900 dark:text-green-100 border-green-200 dark:border-green-900"
                : "bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-100 border-red-200 dark:border-red-900"
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Submission Information
            </h2>
          </div>

          {/* LinkedIn Profile URL */}
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl" className="text-sm font-medium">
              LinkedIn Profile URL <span className="text-destructive">*</span>
            </Label>
            <Input
              type="url"
              id="linkedinUrl"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/yourprofile"
              disabled={isSubmitting}
              className={errors.linkedinUrl ? "border-destructive" : ""}
            />
            {errors.linkedinUrl && (
              <p className="text-sm text-destructive">{errors.linkedinUrl}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Proof of internship - your LinkedIn profile
            </p>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium">
              Company <span className="text-destructive">*</span>
            </Label>
            <div
              className={
                errors.companyName
                  ? "rounded-md border-2 border-destructive p-1"
                  : ""
              }
            >
              <CompanySearch
                onCompanySelect={handleCompanySelect}
                value={formData.companyName}
                onInputChange={handleCompanyInputChange}
              />
            </div>
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName}</p>
            )}
            <input
              type="hidden"
              name="companyName"
              value={formData.companyName}
            />
          </div>

          {/* Year and Term */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="term" className="text-sm font-medium">
                Term <span className="text-destructive">*</span>
              </Label>
              <select
                id="term"
                name="term"
                value={formData.term}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.term ? "border-destructive" : ""
                }`}
              >
                <option value="">Select a term</option>
                {TERMS.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
              {errors.term && (
                <p className="text-sm text-destructive">{errors.term}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm font-medium">
                Year <span className="text-destructive">*</span>
              </Label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleYearChange}
                disabled={isSubmitting}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.year ? "border-destructive" : ""
                }`}
              >
                <option value="">Select a year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year}</p>
              )}
            </div>
          </div>

          {/* Intern Type */}
          <div className="space-y-2">
            <Label htmlFor="internType" className="text-sm font-medium">
              Intern Type <span className="text-destructive">*</span>
            </Label>
            <select
              id="internType"
              name="internType"
              value={formData.internType}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.internType ? "border-destructive" : ""
              }`}
            >
              <option value="">Select an intern type</option>
              {INTERN_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.internType && (
              <p className="text-sm text-destructive">{errors.internType}</p>
            )}
          </div>

          {/* Return Offer Extended */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Return Offer Extended? <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="returnOfferExtended"
                  checked={formData.returnOfferExtended === true}
                  onChange={() => handleReturnOfferChange(true)}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-foreground border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                  Yes
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="returnOfferExtended"
                  checked={formData.returnOfferExtended === false}
                  onChange={() => handleReturnOfferChange(false)}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-foreground border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                  No
                </span>
              </label>
            </div>
            {errors.returnOfferExtended && (
              <p className="text-sm text-destructive">
                {errors.returnOfferExtended}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !allRequiredFieldsFilled}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
