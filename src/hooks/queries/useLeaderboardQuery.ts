import { useAuth } from "@clerk/react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { fetchLeaderboard } from "../../api/rank.api";
import type { LeaderboardEntry } from "../../models/models";

export function useLeaderboardQuery(
  limit: number,
): UseQueryResult<LeaderboardEntry[], Error> {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.leaderboard(limit),
    queryFn: () => fetchLeaderboard(limit, getToken),

    // caching knobs
    staleTime: 60_000, // 1 min: switching tabs won't refetch immediately
    gcTime: 10 * 60_000, // 10 min: keep cache around after unmount
    refetchOnWindowFocus: false,
  });
}
