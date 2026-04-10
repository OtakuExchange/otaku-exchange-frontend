import { useAuth } from "@clerk/react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { LeaderboardEntry } from "../../models/models";
import { queryKeys } from "../queryKeys";
import { fetchLeaderboard } from "./rank.api";

export function useLeaderboardQuery(
  limit: number,
): UseQueryResult<LeaderboardEntry[], Error> {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.leaderboard(limit),
    queryFn: () => fetchLeaderboard(limit, getToken),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}

