import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import type { UUID } from "../../models/models";
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

