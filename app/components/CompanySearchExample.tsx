"use client";

import { useState } from "react";
import CompanySearch, { Company } from "./CompanySearch";

export default function CompanySearchExample() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    console.log("Selected company:", company);
    console.log("Logo URL:", company.logoUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCompany) {
      console.log("Form submitted with company:", selectedCompany);
      // Handle form submission here
    } else {
      alert("Please select a company");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Company Search Form
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CompanySearch onCompanySelect={handleCompanySelect} />

        {selectedCompany && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Selected Company:
            </h3>
            <div className="flex items-center gap-3">
              {selectedCompany.logoUrl ? (
                <div className="relative">
                  <img
                    src={selectedCompany.logoUrl}
                    alt={`${selectedCompany.name} logo`}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded object-contain flex-shrink-0 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1"
                    onError={(e) => {
                      console.error(
                        "Failed to load logo:",
                        selectedCompany.logoUrl
                      );
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                      const fallback = document.getElementById("logo-fallback");
                      if (fallback) {
                        fallback.style.display = "flex";
                      }
                    }}
                    onLoad={() => {
                      console.log(
                        "Logo loaded successfully:",
                        selectedCompany.logoUrl
                      );
                    }}
                  />
                  <div
                    className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700 absolute top-0 left-0"
                    style={{ display: "none" }}
                    id="logo-fallback"
                  >
                    <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
                      {selectedCompany.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
                    {selectedCompany.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedCompany.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedCompany.domain}
                </p>
                {selectedCompany.logoUrl && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Logo: {selectedCompany.logoUrl}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Submit Form
        </button>
      </form>
    </div>
  );
}
