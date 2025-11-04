"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface Company {
  name: string;
  domain: string;
  logoUrl: string | null;
}

interface CompanySearchProps {
  onCompanySelect: (company: Company) => void;
  value?: string;
  className?: string;
}

interface ClearbitSuggestion {
  name: string;
  domain: string;
  logo: string | null;
}

export default function CompanySearch({
  onCompanySelect,
  value = "",
  className = "",
}: CompanySearchProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<ClearbitSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const searchCompanies = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch company suggestions");
      }

      const data: ClearbitSuggestion[] = await response.json();
      setSuggestions(data);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (err) {
      setError("Failed to load company suggestions");
      setSuggestions([]);
      console.error("Company search error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCompanies(searchQuery);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCompanies]);

  // Handle company selection
  const handleSelectCompany = useCallback(
    (company: ClearbitSuggestion) => {
      const selected: Company = {
        name: company.name,
        domain: company.domain,
        logoUrl: company.domain
          ? `/api/logo?domain=${encodeURIComponent(company.domain)}`
          : null,
      };
      setSelectedCompany(selected);
      setSearchQuery(company.name);
      setIsOpen(false);
      setSuggestions([]);
      onCompanySelect(selected);
      inputRef.current?.blur();
    },
    [onCompanySelect]
  );

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen && suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSelectCompany(suggestions[selectedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, suggestions, selectedIndex, handleSelectCompany]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <label
        htmlFor="company-search"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Company
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id="company-search"
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedCompany(null);
            setError(null);
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for a company..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
          aria-haspopup="listbox"
          aria-controls="company-suggestions"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-500"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (suggestions.length > 0 || error) && (
        <div
          ref={dropdownRef}
          id="company-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-auto"
        >
          {error ? (
            <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : suggestions.length === 0 && !isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No companies found - type to add manually
            </div>
          ) : (
            suggestions.map((company, index) => (
              <button
                key={`${company.domain}-${index}`}
                type="button"
                role="option"
                aria-selected={selectedIndex === index}
                onClick={() => handleSelectCompany(company)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedIndex === index ? "bg-gray-100 dark:bg-gray-700" : ""
                }`}
              >
                <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {company.name}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected company info (optional, for display purposes) */}
      {selectedCompany && !isOpen && (
        <div className="mt-2 flex items-center gap-3 text-sm">
          {selectedCompany.logoUrl && (
            <img
              src={selectedCompany.logoUrl}
              alt={`${selectedCompany.name} logo`}
              width={32}
              height={32}
              className="w-8 h-8 rounded object-contain flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
              loading="lazy"
            />
          )}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>Selected: {selectedCompany.name}</span>
            {selectedCompany.domain && (
              <span className="text-gray-400 dark:text-gray-500">
                ({selectedCompany.domain})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
