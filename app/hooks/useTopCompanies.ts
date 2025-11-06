import { useQuery } from "@tanstack/react-query";

type CompanyStats = {
  name: string;
  total: number;
  offers: number;
  percentage: number;
  logoUrl?: string | null;
};

type TopCompaniesData = {
  data: {
    mostSubmissions: CompanyStats[];
    bestRates: CompanyStats[];
    worstRates: CompanyStats[];
  };
  year: number;
};

export function useTopCompanies() {
  return useQuery<TopCompaniesData>({
    queryKey: ["topCompanies"],
    queryFn: async () => {
      const response = await fetch("/api/companies/top");
      if (!response.ok) {
        throw new Error("Failed to fetch top companies");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
