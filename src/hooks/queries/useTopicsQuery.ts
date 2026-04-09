import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import type { UUID } from "../../models/models";
import { fetchEventsBySubtopic, fetchEvents } from "../../api/api";
import { queryKeys } from "../queryKeys";

export function useTopicEventsQuery(topicId: UUID, subtopicId: UUID | null) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: subtopicId
      ? queryKeys.eventsBySubtopic(subtopicId)
      : queryKeys.eventsByTopic(topicId),
    queryFn: () =>
      subtopicId
        ? fetchEventsBySubtopic(subtopicId, getToken)
        : fetchEvents(topicId, getToken),

    // caching knobs
    staleTime: 60_000, // 1 min: switching tabs won't refetch immediately
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}
