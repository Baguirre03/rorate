"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import CompanySearch, { Company } from "@/components/CompanySearch";
import SubmissionCounter from "@/components/SubmissionCounter";
import { SubmissionFormData, SubmissionRequestBody } from "@/types/submission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOURCES } from "./source";
import { UTM } from "./utm";

interface FormErrors {
  linkedinUrl?: string;
  companyName?: string;
  year?: string;
  term?: string;
  internType?: string;
  returnOfferExtended?: string;
  positionType?: string;
}

// Validate LinkedIn URL format
// First normalizes the URL (adds https:// if missing), then validates
function isValidLinkedInUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Normalize the URL first - add https:// if missing
  const normalized = normalizeLinkedInUrl(trimmed);

  // LinkedIn URL patterns (now checking normalized URL with https://):
  // - https://www.linkedin.com/in/username
  // - https://linkedin.com/in/username
  // - https://www.linkedin.com/pub/username
  // - https://linkedin.com/pub/username
  // - https://www.linkedin.com/profile/view?id=...
  // Allows trailing slashes and query parameters
  const linkedInPattern =
    /^https?:\/\/(www\.)?linkedin\.com\/(in|pub|profile\/view)\/[^\/\s]+/i;
  return linkedInPattern.test(normalized);
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
  formData: SubmissionFormData,
  schoolName?: string,
  source?: string
): SubmissionRequestBody {
  return {
    linkedinUrl: normalizeLinkedInUrl(formData.linkedinUrl),
    companyName: formData.companyName.trim(),
    year: formData.year,
    term: formData.term,
    internType: formData.internType || undefined,
    returnOfferExtended: formData.returnOfferExtended === true,
    positionType: formData.positionType || "Full Time",
    schoolName: schoolName || undefined,
    source: source || undefined,
  };
}

const INTERN_TYPES = [
  "Software Engineering",
  "Machine Learning Engineer",
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
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const UTM_PARAM = searchParams.get("utm") || undefined;
  const SOURCE_PARAM = searchParams.get("source") || undefined;
  const schoolName = UTM_PARAM ? UTM[UTM_PARAM] : undefined;
  const source = SOURCE_PARAM ? SOURCES[SOURCE_PARAM] : undefined;

  // Show success toast when redirected after sign-in
  useEffect(() => {
    if (!loading && user && searchParams.get("signedIn") === "true") {
      toast.success("Successfully signed in!");
      // Remove the signedIn parameter from URL, but preserve other params
      const params = new URLSearchParams(searchParams.toString());
      params.delete("signedIn");
      const newUrl = params.toString()
        ? `/submit?${params.toString()}`
        : "/submit";
      router.replace(newUrl);
    }
  }, [user, loading, searchParams, router]);

  const [formData, setFormData] = useState<SubmissionFormData>({
    linkedinUrl: "",
    companyName: "",
    year: currentYear,
    term: "Summer",
    internType: "",
    returnOfferExtended: null,
    positionType: "Full Time",
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

    // LinkedIn URL validation
    if (!formData.linkedinUrl.trim()) {
      newErrors.linkedinUrl = "LinkedIn profile URL is required";
    } else if (!isValidLinkedInUrl(formData.linkedinUrl)) {
      newErrors.linkedinUrl =
        "Please enter a valid LinkedIn profile URL (e.g., linkedin.com/in/yourprofile, www.linkedin.com/in/yourprofile)";
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

    // Position type validation - always required
    const positionType = formData.positionType?.trim();
    if (
      !positionType ||
      (positionType !== "Full Time" && positionType !== "Intern")
    ) {
      newErrors.positionType = "Please select a position type";
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
    setFormData((prev: SubmissionFormData) => {
      // Ensure positionType always has a valid value (always required)
      const trimmed = prev.positionType?.trim();
      let positionType = prev.positionType;
      if (!trimmed || (trimmed !== "Full Time" && trimmed !== "Intern")) {
        positionType = "Full Time";
      } else {
        positionType = trimmed;
      }

      return {
        ...prev,
        returnOfferExtended: value,
        positionType,
      };
    });
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
    const value = e.target.value.trim();
    // Ensure we always have a valid position type
    const positionType =
      value === "Full Time" || value === "Intern" ? value : "Full Time";
    setFormData((prev: SubmissionFormData) => ({
      ...prev,
      positionType,
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
      const payload: SubmissionRequestBody = createSubmissionPayload(
        formData,
        schoolName,
        source
      );

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle duplicate submission error
        if (response.status === 409 && data?.duplicate) {
          setIsSubmitting(false);
          setErrors((prev) => ({
            ...prev,
            linkedinUrl: data.error || "This submission already exists.",
          }));
          setSubmitStatus({
            type: "error",
            message: data.error || "A duplicate submission was found.",
          });
          toast.error("Duplicate submission", {
            description:
              data.error ||
              "A submission with this information already exists.",
          });
          // Scroll to LinkedIn URL field
          setTimeout(() => {
            const linkedInField =
              document.querySelector(`[name="linkedinUrl"]`);
            linkedInField?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 100);
          return;
        }

        // Handle rate limit error
        if (response.status === 429) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Too many requests. Please wait a moment."
          );
        }

        throw new Error(data?.error || data?.message || "Failed to submit");
      }

      // Refetch hasSubmitted query to update status
      // Use exact: false to match all queries starting with ["hasSubmitted"]
      await queryClient.refetchQueries({
        queryKey: ["hasSubmitted"],
        exact: false,
      });

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
    formData.returnOfferExtended !== null &&
    formData.positionType &&
    (formData.positionType === "Full Time" ||
      formData.positionType === "Intern");

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
            contributions are reviewed before being published. Your data will
            remain anonymous.
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

        {/* Submission Counter */}
        <div className="mb-8 -mx-4 sm:-mx-6">
          <SubmissionCounter />
        </div>

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
              LinkedIn Profile URL <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              id="linkedinUrl"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              placeholder="linkedin.com/in/yourprofile"
              disabled={isSubmitting}
              required
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
                className={`flex h-10 w-full rounded-md border-[0.5px] border-input/60 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
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
                className={`flex h-10 w-full rounded-md border-[0.5px] border-input/60 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
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

          {/* Position Type */}
          <div className="space-y-2">
            <Label htmlFor="positionType" className="text-sm font-medium">
              Position Type <span className="text-destructive">*</span>
            </Label>
            <select
              id="positionType"
              name="positionType"
              value={formData.positionType || "Full Time"}
              onChange={handlePositionTypeChange}
              disabled={isSubmitting}
              required
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.positionType ? "border-destructive" : ""
              }`}
            >
              <option value="Full Time">Full Time</option>
              <option value="Intern">Intern</option>
            </select>
            {errors.positionType && (
              <p className="text-sm text-destructive">{errors.positionType}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Was this for a full time or intern return offer?
            </p>
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
