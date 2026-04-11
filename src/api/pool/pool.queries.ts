import { useAuth } from "@clerk/react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Pool, UUID } from "../../models/models";
import { queryKeys } from "../queryKeys";
import { fetchPools } from "./pool.api";

export type PoolItem = NonNullable<
  ReturnType<typeof usePoolsQuery>["data"]
>[number];

export function usePoolsQuery(eventId: UUID | null) {
  const { getToken } = useAuth();

  const enabled = Boolean(eventId);

  return useQuery({
    queryKey: eventId ? queryKeys.poolsByEventId(eventId) : ["pools", "idle"],
    queryFn: () => {
      if (!eventId) throw new Error("No eventId provided");
      return fetchPools(eventId, getToken);
    },
    enabled,
    staleTime: 10_000,
    gcTime: 10 * 60_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function usePoolsByEventIdsQueries(eventIds: UUID[], enabled: boolean) {
  const { getToken } = useAuth();

  const uniqueEventIds = useMemo(
    () => Array.from(new Set(eventIds)),
    [eventIds],
  );

  const results = useQueries({
    queries: uniqueEventIds.map((eventId) => ({
      queryKey: queryKeys.poolsByEventId(eventId),
      queryFn: () => fetchPools(eventId, getToken),
      enabled,
      staleTime: 10_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
    })),
  });

  return {
    eventIds: uniqueEventIds,
    results: results as Array<{ data?: Pool[]; isLoading: boolean; isError: boolean }>,
  };
}