import { useQuery } from "@tanstack/react-query";

export type CompanyStats = {
  name: string;
  total: number;
  offers: number;
  percentage: number;
  logoUrl?: string | null;
};

type TopCompaniesData = {
  data: CompanyStats[];
  total: number;
  hasMore: boolean;
  year: number;
};

export function useTopCompanies(
  sort: "most-submissions" | "best-rates" | "worst-rates" = "most-submissions",
  limit: number = 15,
  offset: number = 0
) {
  return useQuery<TopCompaniesData>({
    queryKey: ["topCompanies", sort, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        sort,
        limit: limit.toString(),
        offset: offset.toString(),
      });
      const response = await fetch(`/api/companies/top?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch top companies");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
