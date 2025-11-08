import { useCallback } from "react";
import { useTopCompanies, CompanyStats } from "./useTopCompanies";

export function usePaginatedCompanies(
  activeTab: "most-submissions" | "best-rates" | "worst-rates",
  limit: number = 15
) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useTopCompanies(activeTab, limit);

  const companies: CompanyStats[] =
    data?.pages.flatMap((page) => page.data) ?? [];

  const year = data?.pages[0]?.year ?? new Date().getFullYear();

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    companies,
    hasMore: hasNextPage ?? false,
    year,
    isLoading: isLoading && companies.length === 0,
    isLoadingMore: isFetchingNextPage,
    loadMore,
    error,
  };
}
