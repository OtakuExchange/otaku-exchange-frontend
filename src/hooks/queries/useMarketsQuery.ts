import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { fetchMarkets } from "../../api";
import type { UUID } from "../../models/models";
import { queryKeys } from "../queryKeys";

export function useMarketsQuery(eventId: UUID) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.marketsByEventId(eventId),
    queryFn: () => fetchMarkets(eventId, getToken),

    // caching knobs
    staleTime: 60_000, // 1 min: switching tabs won't refetch immediately
    gcTime: 10 * 60_000, // 10 min: keep cache around after unmount
    refetchOnWindowFocus: false,
  });
}
