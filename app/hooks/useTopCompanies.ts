import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";

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

type sortType = "most-submissions" | "best-rates" | "worst-rates";

export function useTopCompanies(
  sort: sortType = "most-submissions",
  limit: number = 15
) {
  return useInfiniteQuery<
    TopCompaniesData,
    Error,
    InfiniteData<TopCompaniesData>,
    (string | number)[],
    number
  >({
    queryKey: ["topCompanies", sort, limit],
    queryFn: async ({ pageParam }): Promise<TopCompaniesData> => {
      const params = new URLSearchParams({
        sort,
        limit: limit.toString(),
        offset: pageParam.toString(),
      });
      const response = await fetch(`/api/companies/top?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch top companies");
      }
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * limit;
      return lastPage.hasMore ? nextOffset : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
