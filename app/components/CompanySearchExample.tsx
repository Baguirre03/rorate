"use client";

import { useState } from "react";
import CompanySearch, { Company } from "./CompanySearch";

export default function CompanySearchExample() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    console.log("Selected company:", company);
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
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Selected Company:
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Name:</strong> {selectedCompany.name}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Domain:</strong> {selectedCompany.domain}
            </p>
            {selectedCompany.logoUrl && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Logo:</strong> {selectedCompany.logoUrl}
              </p>
            )}
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
