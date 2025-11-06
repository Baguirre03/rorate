import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useCompanySearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCompanySelect = useCallback(
    (company: { name: string; domain?: string; logoUrl?: string | null }) => {
      const encodedName = encodeURIComponent(company.name);
      router.push(`/company/${encodedName}`);
    },
    [router]
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        const encodedName = encodeURIComponent(searchQuery.trim());
        router.push(`/company/${encodedName}`);
      }
    },
    [searchQuery, router]
  );

  return {
    searchQuery,
    setSearchQuery,
    handleCompanySelect,
    handleSearchSubmit,
  };
}
