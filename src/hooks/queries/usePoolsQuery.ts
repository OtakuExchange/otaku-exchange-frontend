import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { fetchPools } from "../../api";
import type { UUID } from "../../models/models";
import { queryKeys } from "../../queryKeys";

export type PoolItem = NonNullable<
  ReturnType<typeof usePoolsQuery>["data"]
>[number];

export function usePoolsQuery(eventId: UUID) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.poolsByEventId(eventId),
    queryFn: () => fetchPools(eventId, getToken),
    staleTime: 10_000,
    gcTime: 10 * 60_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}
