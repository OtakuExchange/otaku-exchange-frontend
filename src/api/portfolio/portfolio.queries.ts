import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { fetchPortfolio, fetchUserPortfolio } from "./portfolio.api";
import type { UUID } from "../../models/models";

export function usePortfolioQuery() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.portfolio,
    queryFn: () => fetchPortfolio(getToken),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useUserPortfolioQuery(userId: UUID) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.portfolioUserId(userId),
    queryFn: () => fetchUserPortfolio(userId, getToken),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled: !!userId,
  });
}
