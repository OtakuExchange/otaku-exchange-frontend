import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { useAuth } from "@clerk/react";
import { fetchDailyStreak } from "./reward.api";

export function useDailyStreakQuery() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.dailyStreak,
    queryFn: () => fetchDailyStreak(getToken),

    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}
