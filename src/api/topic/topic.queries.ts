import { useAuth } from "@clerk/react";
import { useQueries, useQuery } from "@tanstack/react-query";
import type { Event, UUID } from "../../models/models";
import { fetchEventsBySubtopic } from "../subtopic/subtopic.api";
import { queryKeys } from "../queryKeys";
import {
  fetchEventsByTopic,
  fetchTopicEventCounts,
  fetchTopics,
} from "./topic.api";

export function useMultiTopicEventsQuery(topicIds: UUID[]) {
  const { getToken } = useAuth();
  const results = useQueries({
    queries: topicIds.map((topicId) => ({
      queryKey: queryKeys.eventsByTopic(topicId),
      queryFn: () => fetchEventsByTopic(topicId, getToken),
      enabled: !!topicId,
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
    })),
  });

  return {
    data: results.map((result) => (result.data ?? []) as Event[]),
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
    error: results.find((result) => result.error)?.error,
  };
}

export function useTopicEventsQuery(
  topicId: UUID | "",
  subtopicId: UUID | null,
) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey:
      subtopicId !== null
        ? queryKeys.eventsBySubtopic(subtopicId)
        : topicId !== ""
          ? queryKeys.eventsByTopic(topicId)
          : ["events", "idle"],

    queryFn: async () => {
      if (subtopicId !== null) {
        return fetchEventsBySubtopic(subtopicId, getToken);
      }
      if (topicId !== "") {
        return fetchEventsByTopic(topicId, getToken);
      }
      throw new Error("No topicId or subtopicId");
    },
    enabled: subtopicId !== null || topicId !== "",
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

export function useTopicsQuery() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.topics,
    queryFn: () => fetchTopics(getToken),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}
