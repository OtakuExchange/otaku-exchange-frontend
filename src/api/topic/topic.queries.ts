import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import type { UUID } from "../../models/models";
import { fetchEventsBySubtopic } from "../subtopic/subtopic.api";
import { queryKeys } from "../queryKeys";
import { fetchEventsByTopic, fetchTopicEventCounts } from "./topic.api";

export function useTopicEventsQuery(topicId: UUID, subtopicId: UUID | null) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: subtopicId
      ? queryKeys.eventsBySubtopic(subtopicId)
      : queryKeys.eventsByTopic(topicId),
    queryFn: () =>
      subtopicId
        ? fetchEventsBySubtopic(subtopicId, getToken)
        : fetchEventsByTopic(topicId, getToken),

    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useTopicEventCountQuery(topicId: UUID) {
  return useQuery({
    queryKey: queryKeys.topicEventCounts(topicId),
    queryFn: () => fetchTopicEventCounts(topicId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}