"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface Company {
  name: string;
  domain: string;
  logoUrl: string | null;
}

interface CompanySearchProps {
  onCompanySelect: (company: Company) => void;
  value?: string;
  className?: string;
  onInputChange?: (value: string) => void;
  clearOnSelect?: boolean;
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
  onInputChange,
  clearOnSelect = false,
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
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  const searchCompanies = useCallback(
    async (query: string, shouldOpen = true) => {
      if (!query.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      if (selectedCompany && query === selectedCompany.name && !shouldOpen) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/companies/search?query=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch company suggestions");
        }

        const result = await response.json();
        const data: ClearbitSuggestion[] = result.data || [];

        const seenNames = new Set<string>();
        const uniqueSuggestions = data.filter((company) => {
          const normalizedName = company.name.toLowerCase().trim();
          if (seenNames.has(normalizedName)) {
            return false;
          }
          seenNames.add(normalizedName);
          return true;
        });

        setSuggestions(uniqueSuggestions);
        if (shouldOpen) {
          setIsOpen(true);
        }
        setSelectedIndex(-1);
      } catch (err) {
        setError("Failed to load company suggestions");
        setSuggestions([]);
        console.error("Company search error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCompany]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen && suggestions.length > 0) {
      updateDropdownPosition();

      const handleResize = () => {
        updateDropdownPosition();
      };

      const handleScroll = () => {
        updateDropdownPosition();
      };

      window.addEventListener("resize", handleResize, { passive: true });
      window.addEventListener("scroll", handleScroll, {
        passive: true,
        capture: true,
      });
      document.addEventListener("scroll", handleScroll, {
        passive: true,
        capture: true,
      });

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, { capture: true });
        document.removeEventListener("scroll", handleScroll, { capture: true });
      };
    } else if (!isOpen) {
      setDropdownPosition(null);
    }
  }, [isOpen, suggestions.length, updateDropdownPosition]);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    if (selectedCompany && searchQuery === selectedCompany.name) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCompanies(searchQuery, true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCompanies, selectedCompany]);

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
      if (clearOnSelect) {
        setSearchQuery("");
        setSelectedCompany(null);
      } else {
        setSearchQuery(company.name);
      }
      setIsOpen(false);
      setSuggestions([]);
      onCompanySelect(selected);
      inputRef.current?.blur();
    },
    [onCompanySelect, clearOnSelect]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <div className="relative">
        <Input
          ref={inputRef}
          id="company-search"
          type="text"
          value={searchQuery}
          onChange={(e) => {
            const newValue = e.target.value;
            setSearchQuery(newValue);
            if (selectedCompany && newValue !== selectedCompany.name) {
              setSelectedCompany(null);
            }
            setError(null);
            onInputChange?.(newValue);
          }}
          onFocus={() => {
            if (
              suggestions.length > 0 &&
              (!selectedCompany || searchQuery !== selectedCompany.name)
            ) {
              setIsOpen(true);
              requestAnimationFrame(() => {
                updateDropdownPosition();
              });
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for a company..."
          className={cn("w-full", className)}
          aria-haspopup="listbox"
          aria-controls="company-suggestions"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-500"></div>
          </div>
        )}
      </div>

      {/* Dropdown - Rendered via Portal */}
      {mounted &&
        isOpen &&
        (suggestions.length > 0 || error) &&
        dropdownPosition &&
        createPortal(
          <div
            ref={dropdownRef}
            id="company-suggestions"
            role="listbox"
            className="fixed z-9999 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              maxHeight: "16rem",
            }}
          >
            {suggestions.map((company, index) => {
              const logoUrl = company.domain
                ? `/api/logo?domain=${encodeURIComponent(company.domain)}`
                : null;
              return (
                <button
                  key={`${company.domain}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={selectedIndex === index}
                  onClick={() => handleSelectCompany(company)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                    selectedIndex === index
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }`}
                >
                  {logoUrl ? (
                    <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded border border-border bg-muted flex items-center justify-center shrink-0">
                      <Image
                        src={logoUrl}
                        alt={`${company.name} logo`}
                        width={32}
                        height={32}
                        className="w-full h-full object-contain rounded"
                        unoptimized
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-border bg-muted flex items-center justify-center shrink-0">
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded bg-muted-foreground/20" />
                    </div>
                  )}
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {company.name}
                  </span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
