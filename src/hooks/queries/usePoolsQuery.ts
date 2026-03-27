import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { fetchPools } from "../../api";
import type { UUID } from "../../models/models";

export function usePoolsQuery(eventId: UUID) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["pools", "v2", "eventId", eventId],
    queryFn: () => fetchPools(eventId, getToken),
    staleTime: 10_000,
    gcTime: 10 * 60_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}
