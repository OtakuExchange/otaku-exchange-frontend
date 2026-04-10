import { useAuth } from "@clerk/react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { EventStake, UUID } from "../../models/models";
import { queryKeys } from "../queryKeys";
import { fetchEvent, fetchEventStakes } from "./events.api";

export function useEventQuery(eventId: UUID) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.eventById(eventId),
    queryFn: () => fetchEvent(eventId, getToken),

    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useEventStakesQuery(
  eventId: UUID,
  limit: number,
): UseQueryResult<EventStake[], Error> {
  return useQuery({
    queryKey: queryKeys.eventStakes(eventId, limit),
    queryFn: () => fetchEventStakes(eventId, limit),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}
