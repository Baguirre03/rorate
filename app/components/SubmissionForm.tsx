"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import CompanySearch, { Company } from "./CompanySearch";

interface FormData {
  linkedinUrl: string;
  companyName: string;
  year: number;
  term: string;
  internType: string;
  returnOfferExtended: boolean | null;
}

interface FormErrors {
  linkedinUrl?: string;
  companyName?: string;
  year?: string;
  term?: string;
  internType?: string;
  returnOfferExtended?: string;
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
  const [formData, setFormData] = useState<FormData>({
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
      setFormData((prev) => ({ ...prev, companyName: company.name }));
      setSelectedCompany(company);
      // Clear company name error if it exists
      if (errors.companyName) {
        setErrors((prev) => ({ ...prev, companyName: undefined }));
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
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setFormData((prev) => ({ ...prev, year: value || currentYear }));
    if (errors.year) {
      setErrors((prev) => ({ ...prev, year: undefined }));
    }
  };

  const handleReturnOfferChange = (value: boolean) => {
    setFormData((prev) => ({ ...prev, returnOfferExtended: value }));
    if (errors.returnOfferExtended) {
      setErrors((prev) => ({ ...prev, returnOfferExtended: undefined }));
    }
  };

  const handleCompanyInputChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, companyName: value }));

      // If user manually types and it doesn't match selected company, clear selection
      if (selectedCompany && value !== selectedCompany.name) {
        setSelectedCompany(null);
      }

      if (errors.companyName) {
        setErrors((prev) => ({ ...prev, companyName: undefined }));
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
      const payload = {
        linkedinUrl: formData.linkedinUrl.trim(),
        companyName: formData.companyName.trim(),
        year: formData.year,
        term: formData.term,
        internType: formData.internType,
        returnOfferExtended: formData.returnOfferExtended === true,
      };

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

      // Success
      setSubmitStatus({
        type: "success",
        message:
          "Thank you! Your submission is pending review and will appear on the site after moderation.",
      });

      // Clear form
      setFormData({
        linkedinUrl: "",
        companyName: "",
        year: currentYear,
        term: "",
        internType: "",
        returnOfferExtended: null,
      });
      setSelectedCompany(null);
      setErrors({});

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Submission error:", error);
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Submit Your Return Offer Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Help others by sharing your internship return offer experience. All
            submissions are reviewed before being published.
          </p>
        </div>

        {submitStatus.type && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* LinkedIn Profile URL */}
          <div>
            <label
              htmlFor="linkedinUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              LinkedIn Profile URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="linkedinUrl"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/yourprofile"
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.linkedinUrl
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {errors.linkedinUrl && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {errors.linkedinUrl}
              </p>
            )}
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Proof of internship - your LinkedIn profile
            </p>
          </div>

          {/* Company Name */}
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Company Name <span className="text-red-500">*</span>
            </label>
            <div
              className={`${
                errors.companyName
                  ? "border-red-500 rounded-lg border-2 p-1"
                  : ""
              }`}
            >
              <CompanySearch
                onCompanySelect={handleCompanySelect}
                value={formData.companyName}
                onInputChange={handleCompanyInputChange}
              />
            </div>
            {errors.companyName && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {errors.companyName}
              </p>
            )}
            <input
              type="hidden"
              name="companyName"
              value={formData.companyName}
            />
          </div>

          {/* Year and Term */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="term"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Term <span className="text-red-500">*</span>
              </label>
              <select
                id="term"
                name="term"
                value={formData.term}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.term
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Select a term</option>
                {TERMS.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
              {errors.term && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {errors.term}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Year <span className="text-red-500">*</span>
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleYearChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.year
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Select a year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.year && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {errors.year}
                </p>
              )}
            </div>
          </div>

          {/* Intern Type */}
          <div>
            <label
              htmlFor="internType"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Intern Type <span className="text-red-500">*</span>
            </label>
            <select
              id="internType"
              name="internType"
              value={formData.internType}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.internType
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">Select an intern type</option>
              {INTERN_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.internType && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {errors.internType}
              </p>
            )}
          </div>

          {/* Return Offer Extended */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Return Offer Extended? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="returnOfferExtended"
                  checked={formData.returnOfferExtended === true}
                  onChange={() => handleReturnOfferChange(true)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="ml-2.5 text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                  Yes
                </span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="returnOfferExtended"
                  checked={formData.returnOfferExtended === false}
                  onChange={() => handleReturnOfferChange(false)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="ml-2.5 text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                  No
                </span>
              </label>
            </div>
            {errors.returnOfferExtended && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {errors.returnOfferExtended}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !allRequiredFieldsFilled}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
