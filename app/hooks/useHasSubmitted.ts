import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import { Tables } from "@/types/supabase";

interface HasSubmittedResponse {
  hasSubmitted: boolean;
  submissions: (Tables<"submissions"> & {
    companies: Pick<Tables<"companies">, "id" | "name"> | null;
  })[];
  error?: string;
}

/**
 * Hook to check if the current user has submitted a return offer
 * Returns { hasSubmitted: boolean | null, isLoading: boolean }
 * - null if user is not logged in
 * - boolean if user is logged in
 */
export default function useHasSubmitted() {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading } = useQuery<HasSubmittedResponse>({
    queryKey: ["hasSubmitted", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/submissions/check", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { hasSubmitted: false, submissions: [] };
        }
        const error = await response.json();
        throw new Error(error.error || "Failed to check submissions");
      }

      const result = await response.json();
      return result;
    },
    enabled: !!user, // Only run query if user is logged in
    retry: false,
  });

  if (authLoading) {
    return { hasSubmitted: null, isLoading: true };
  }

  if (!user) {
    return { hasSubmitted: null, isLoading: false };
  }

  return {
    hasSubmitted: data?.hasSubmitted ?? null,
    submissions: data?.submissions ?? null,
    isLoading,
  };
}
