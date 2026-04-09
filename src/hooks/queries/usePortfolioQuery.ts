import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { fetchPortfolio } from "../../api/portfolio.api";

export function usePortfolioQuery() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.portfolio,
    queryFn: () => fetchPortfolio(getToken),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
