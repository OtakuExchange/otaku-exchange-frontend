import type { QueryClient } from "@tanstack/react-query";
import type { Event, UUID } from "../../models/models";
import { queryKeys } from "../queryKeys";

export function invalidateUser(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.user });
}

export function invalidatePortfolio(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
}

export function invalidateEventById(queryClient: QueryClient, eventId: UUID) {
  queryClient.invalidateQueries({ queryKey: queryKeys.eventById(eventId) });
}

export function invalidateEventsByTopic(queryClient: QueryClient, topicId: UUID) {
  queryClient.invalidateQueries({ queryKey: queryKeys.eventsByTopic(topicId) });
}

export function invalidateTopicEventCounts(
  queryClient: QueryClient,
  topicId: UUID,
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.topicEventCounts(topicId) });
}

export function patchEventInList(
  old: Event[] | undefined,
  updated: Event,
): Event[] | undefined {
  if (!old) return old;
  return old.map((e) => (e.id === updated.id ? { ...e, ...updated } : e));
}

export function removeEventFromList(
  old: Event[] | undefined,
  eventId: UUID,
): Event[] | undefined {
  if (!old) return old;
  return old.filter((e) => e.id !== eventId);
}

export function invalidateEventsBySubtopic(
  queryClient: QueryClient,
  subtopicIds: UUID[] | undefined,
) {
  if (subtopicIds == null) {
    queryClient.invalidateQueries({
      queryKey: ["events", "subtopic"] as const,
      exact: false,
    });
    return;
  }

  if (subtopicIds.length === 0) return;

  for (const subtopicId of subtopicIds) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.eventsBySubtopic(subtopicId),
    });
  }
}

export function invalidateEventRelatedQueries(
  queryClient: QueryClient,
  params: {
    eventId?: UUID;
    topicId?: UUID;
    subtopicIds?: UUID[];
    includeTopicEventCounts?: boolean;
    includePortfolio?: boolean;
  },
) {
  if (params.eventId) invalidateEventById(queryClient, params.eventId);
  if (params.topicId) invalidateEventsByTopic(queryClient, params.topicId);

  if (params.includeTopicEventCounts !== false && params.topicId) {
    invalidateTopicEventCounts(queryClient, params.topicId);
  }
  if (params.includePortfolio) invalidatePortfolio(queryClient);

  invalidateEventsBySubtopic(queryClient, params.subtopicIds);
}

export function setEventById(queryClient: QueryClient, event: Event) {
  queryClient.setQueryData(queryKeys.eventById(event.id), event);
}

export function appendEventToTopicList(
  queryClient: QueryClient,
  topicId: UUID,
  event: Event,
) {
  queryClient.setQueryData(
    queryKeys.eventsByTopic(topicId),
    (old: Event[] | undefined) => (old ? [...old, event] : [event]),
  );
}

export function patchEventInTopicList(
  queryClient: QueryClient,
  topicId: UUID,
  updated: Event,
) {
  queryClient.setQueryData(
    queryKeys.eventsByTopic(topicId),
    (old: Event[] | undefined) => patchEventInList(old, updated),
  );
}

export function removeEventFromTopicList(
  queryClient: QueryClient,
  topicId: UUID,
  eventId: UUID,
) {
  queryClient.setQueryData(
    queryKeys.eventsByTopic(topicId),
    (old: Event[] | undefined) => removeEventFromList(old, eventId),
  );
}

export function patchEventInSubtopicLists(
  queryClient: QueryClient,
  updated: Event,
) {
  if (!updated.subtopicIds?.length) return;

  for (const subtopicId of updated.subtopicIds) {
    queryClient.setQueryData(
      queryKeys.eventsBySubtopic(subtopicId),
      (old: Event[] | undefined) => patchEventInList(old, updated),
    );
  }
}

export function appendEventToSubtopicListsIfCached(
  queryClient: QueryClient,
  event: Event,
) {
  if (!event.subtopicIds?.length) return;

  for (const subtopicId of event.subtopicIds) {
    queryClient.setQueryData(
      queryKeys.eventsBySubtopic(subtopicId),
      (old: Event[] | undefined) => (old ? [...old, event] : old),
    );
  }
}

export function removeEventFromSubtopicLists(
  queryClient: QueryClient,
  eventId: UUID,
  subtopicIds: UUID[] | undefined,
) {
  if (!subtopicIds?.length) return;

  for (const subtopicId of subtopicIds) {
    queryClient.setQueryData(
      queryKeys.eventsBySubtopic(subtopicId),
      (old: Event[] | undefined) => removeEventFromList(old, eventId),
    );
  }
}

export function applyCreatedEventToCaches(
  queryClient: QueryClient,
  event: Event,
) {
  setEventById(queryClient, event);
  appendEventToTopicList(queryClient, event.topicId, event);
  appendEventToSubtopicListsIfCached(queryClient, event);
}

export function applyUpdatedEventToCaches(
  queryClient: QueryClient,
  event: Event,
) {
  setEventById(queryClient, event);
  patchEventInTopicList(queryClient, event.topicId, event);
  patchEventInSubtopicLists(queryClient, event);
}

export function applyDeletedEventToCaches(
  queryClient: QueryClient,
  params: { eventId: UUID; topicId: UUID; subtopicIds?: UUID[] },
) {
  removeEventFromTopicList(queryClient, params.topicId, params.eventId);
  removeEventFromSubtopicLists(queryClient, params.eventId, params.subtopicIds);
}

export function invalidateAfterLinkEventToSubtopic(
  queryClient: QueryClient,
  params: { eventId: UUID; topicId: UUID; subtopicId: UUID },
) {
  invalidateEventById(queryClient, params.eventId);
  invalidateEventsByTopic(queryClient, params.topicId);
  invalidateTopicEventCounts(queryClient, params.topicId);
  queryClient.invalidateQueries({
    queryKey: queryKeys.eventsBySubtopic(params.subtopicId),
  });
}

export function optimisticallyResolveEventInCaches(
  queryClient: QueryClient,
  params: { eventId: UUID; topicId: UUID; cached?: Event },
) {
  queryClient.setQueryData(
    queryKeys.eventById(params.eventId),
    (old: Event | undefined) => (old ? { ...old, status: "resolved" } : old),
  );

  queryClient.setQueryData(
    queryKeys.eventsByTopic(params.topicId),
    (old: Event[] | undefined) =>
      old
        ? old.map((e) =>
            e.id === params.eventId ? { ...e, status: "resolved" } : e,
          )
        : old,
  );

  const optimistic: Event | undefined = params.cached
    ? { ...params.cached, status: "resolved" }
    : undefined;
  if (optimistic) patchEventInSubtopicLists(queryClient, optimistic);
}
