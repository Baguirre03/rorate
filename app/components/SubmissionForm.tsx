"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
  positionType?: string;
}

// Normalize LinkedIn URL - add https:// if missing
function normalizeLinkedInUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  // If it doesn't start with http:// or https://, add https://
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

// Type guard to ensure payload matches API expectations
function createSubmissionPayload(
  formData: SubmissionFormData
): SubmissionRequestBody {
  return {
    linkedinUrl: formData.linkedinUrl.trim()
      ? normalizeLinkedInUrl(formData.linkedinUrl)
      : undefined,
    companyName: formData.companyName.trim(),
    year: formData.year,
    term: formData.term,
    internType: formData.internType || undefined,
    returnOfferExtended: formData.returnOfferExtended === true,
    positionType:
      formData.returnOfferExtended === true
        ? formData.positionType || "Full Time"
        : undefined,
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
    positionType: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

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

    // Position type is optional (can be null)

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
      // Set default to "Full Time" if offer was extended, clear if not
      positionType: value ? prev.positionType || "Full Time" : null,
    }));
    if (errors.returnOfferExtended) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        returnOfferExtended: undefined,
      }));
    }
    if (errors.positionType) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        positionType: undefined,
      }));
    }
  };

  const handlePositionTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData((prev: SubmissionFormData) => ({
      ...prev,
      positionType: value || "Full Time",
    }));
    if (errors.positionType) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        positionType: undefined,
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
    formData.companyName.trim() &&
    formData.year &&
    formData.term &&
    formData.internType &&
    formData.returnOfferExtended !== null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Header Section - Similar to levels.fyi */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground tracking-tight">
            Submit Your Return Offer
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section Header */}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Submission Information
            </h2>
          </div>

          {/* LinkedIn Profile URL */}
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl" className="text-sm font-medium">
              LinkedIn Profile URL
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => handleReturnOfferChange(true)}
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-md border transition-colors w-full sm:min-w-[120px] font-medium text-sm cursor-pointer ${
                  formData.returnOfferExtended === true
                    ? "bg-green-500 text-white border-green-500 dark:bg-green-600 dark:border-green-600"
                    : "border-input hover:bg-accent hover:border-ring text-foreground"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleReturnOfferChange(false)}
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-md border transition-colors w-full sm:min-w-[120px] cursor-pointer font-medium text-sm ${
                  formData.returnOfferExtended === false
                    ? "bg-red-500 text-white border-red-500 dark:bg-red-600 dark:border-red-600"
                    : "border-input hover:bg-accent hover:border-ring text-foreground"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                No
              </button>
            </div>
            {errors.returnOfferExtended && (
              <p className="text-sm text-destructive">
                {errors.returnOfferExtended}
              </p>
            )}
          </div>

          {/* Position Type - Only show if offer was extended */}
          {formData.returnOfferExtended === true && (
            <div className="space-y-2">
              <Label htmlFor="positionType" className="text-sm font-medium">
                Return Offer Position Type
              </Label>
              <select
                id="positionType"
                name="positionType"
                value={formData.positionType || "Full Time"}
                onChange={handlePositionTypeChange}
                disabled={isSubmitting}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.positionType ? "border-destructive" : ""
                }`}
              >
                <option value="Full Time">Full Time</option>
                <option value="Intern">Intern</option>
              </select>
              {errors.positionType && (
                <p className="text-sm text-destructive">
                  {errors.positionType}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Was the return offer for another internship or a full-time
                position?
              </p>
            </div>
          )}

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
