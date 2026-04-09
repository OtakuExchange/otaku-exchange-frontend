import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import type { UUID } from "../../models/models";
import { queryKeys } from "../queryKeys";
import { fetchEventsByTopic } from "../../api/topic.api";

export function useEventsQuery(topicId: UUID) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.eventsByTopic(topicId),
    queryFn: () => fetchEventsByTopic(topicId, getToken),

    // caching knobs
    staleTime: 60_000, // 1 min: switching tabs won't refetch immediately
    gcTime: 10 * 60_000, // 10 min: keep cache around after unmount
    refetchOnWindowFocus: false,
  });
}
