import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { UUID } from "../../models/models";
import { fetchEventStakes, type EventStake } from "../../api";
import { queryKeys } from "../../queryKeys";

export function useEventStakesQuery(eventId: UUID, limit: number): UseQueryResult<EventStake[], Error> {

  return useQuery({
    queryKey: queryKeys.eventStakes(eventId, limit),
    queryFn: () => fetchEventStakes(eventId, limit),

    // caching knobs
    staleTime: 60_000, // 1 min: switching tabs won't refetch immediately
    gcTime: 10 * 60_000, // 10 min: keep cache around after unmount
    refetchOnWindowFocus: false,
  });
}
