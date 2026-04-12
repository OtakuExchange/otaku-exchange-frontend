import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UUID, Event } from "../../models/models";
import { useAuth } from "@clerk/react";
import { queryKeys } from "../queryKeys";
import {
  applyCreatedEventToCaches,
  applyDeletedEventToCaches,
  applyUpdatedEventToCaches,
  invalidateAfterLinkEventToSubtopic,
  invalidateEventRelatedQueries,
  invalidatePortfolio,
  invalidateUser,
  optimisticallyResolveEventInCaches,
} from "./events.util";
import type { AnalyticsSource } from "../../analytics/ga4";
import { trackEvent } from "../../analytics/ga4";
import {
  bookmarkEvent,
  createEvent,
  createStake,
  deleteEvent,
  linkEventToSubtopic,
  markEventSeen,
  resolveEvent,
  unbookmarkEvent,
  updateEventStatus,
  type CreateEventPayload,
} from "./events.api";

export function useStakeMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      marketPoolId,
      amount,
    }: {
      marketPoolId: UUID;
      amount: number;
    }) => createStake(marketPoolId, amount, getToken),
    onSuccess: () => {
      invalidateUser(queryClient);
      invalidatePortfolio(queryClient);
    },
  });

  return {
    createStake: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isCreated: mutation.isSuccess,
    isError: mutation.isError,
  };
}

export function useEventMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const createEventMutation = useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload, getToken),
    onSuccess: (data: Event, variables: CreateEventPayload) => {
      invalidateEventRelatedQueries(queryClient, {
        topicId: variables.topicId,
        subtopicIds: data.subtopicIds,
      });
      applyCreatedEventToCaches(queryClient, data);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (payload: { eventId: UUID; topicId: UUID }) =>
      deleteEvent(payload.eventId, getToken),
    onSuccess: (_, variables: { eventId: UUID; topicId: UUID }) => {
      const cached = queryClient.getQueryData<Event>(
        queryKeys.eventById(variables.eventId),
      );

      invalidateEventRelatedQueries(queryClient, {
        eventId: variables.eventId,
        topicId: variables.topicId,
        subtopicIds: cached?.subtopicIds,
      });
      applyDeletedEventToCaches(queryClient, {
        eventId: variables.eventId,
        topicId: variables.topicId,
        subtopicIds: cached?.subtopicIds,
      });
    },
  });

  return {
    createEvent: createEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
    isCreated: createEventMutation.isSuccess,
    createEventError: createEventMutation.isError,

    deleteEvent: deleteEventMutation.mutateAsync,
    isDeleting: deleteEventMutation.isPending,
    isDeleted: deleteEventMutation.isSuccess,
    deleteEventError: deleteEventMutation.isError,
  };
}

export function useEventActionMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const markSeenMutation = useMutation({
    mutationFn: (payload: { eventId: UUID; topicId: UUID }) =>
      markEventSeen(payload.eventId, getToken),
    onSuccess: (data: Event, variables: { eventId: UUID; topicId: UUID }) => {
      invalidateEventRelatedQueries(queryClient, {
        eventId: variables.eventId,
        topicId: variables.topicId,
        subtopicIds: data.subtopicIds,
      });
      applyUpdatedEventToCaches(queryClient, data);
    },
  });

  const linkToSubtopicMutation = useMutation({
    mutationFn: (payload: { eventId: UUID; topicId: UUID; subtopicId: UUID }) =>
      linkEventToSubtopic(payload.eventId, payload.subtopicId, getToken),
    onSuccess: (
      _,
      variables: { eventId: UUID; topicId: UUID; subtopicId: UUID },
    ) => {
      invalidateAfterLinkEventToSubtopic(queryClient, variables);
    },
  });

  const updateEventStatusMutation = useMutation({
    mutationFn: (payload: { eventId: UUID; topicId: UUID; status: string }) =>
      updateEventStatus(payload.eventId, payload.status, getToken),
    onSuccess: (
      data,
      variables: { eventId: UUID; topicId: UUID; status: string },
    ) => {
      invalidateEventRelatedQueries(queryClient, {
        eventId: variables.eventId,
        topicId: variables.topicId,
        subtopicIds: data.subtopicIds,
      });
      applyUpdatedEventToCaches(queryClient, data);
    },
  });

  const resolveEventMutation = useMutation({
    mutationFn: (payload: {
      eventId: UUID;
      topicId: UUID;
      winningPoolId: UUID;
    }) => resolveEvent(payload.eventId, payload.winningPoolId, getToken),
    onSuccess: (
      _,
      variables: { eventId: UUID; topicId: UUID; winningPoolId: UUID },
    ) => {
      const cached = queryClient.getQueryData<Event>(
        queryKeys.eventById(variables.eventId),
      );

      invalidateEventRelatedQueries(queryClient, {
        eventId: variables.eventId,
        topicId: variables.topicId,
        subtopicIds: cached?.subtopicIds,
        includePortfolio: true,
      });
      optimisticallyResolveEventInCaches(queryClient, {
        eventId: variables.eventId,
        topicId: variables.topicId,
        cached,
      });
    },
  });

  return {
    markEventSeen: markSeenMutation.mutateAsync,
    isMarkingEventSeen: markSeenMutation.isPending,
    isMarkedEventSeen: markSeenMutation.isSuccess,
    markEventSeenError: markSeenMutation.isError,

    linkEventToSubtopic: linkToSubtopicMutation.mutateAsync,
    isLinkingToSubtopic: linkToSubtopicMutation.isPending,
    isLinkedToSubtopic: linkToSubtopicMutation.isSuccess,
    linkToSubtopicError: linkToSubtopicMutation.isError,

    updateEventStatus: updateEventStatusMutation.mutateAsync,
    isUpdatingEventStatus: updateEventStatusMutation.isPending,
    isUpdatedEventStatus: updateEventStatusMutation.isSuccess,
    updateEventStatusError: updateEventStatusMutation.isError,

    resolveEvent: resolveEventMutation.mutateAsync,
    isResolvingEvent: resolveEventMutation.isPending,
    isResolvedEvent: resolveEventMutation.isSuccess,
    resolveEventError: resolveEventMutation.isError,
  };
}

export function useBookmarkMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: (payload: {
      eventId: UUID;
      topicId: UUID;
      source?: AnalyticsSource;
    }) => bookmarkEvent(payload.eventId, getToken),
    onSuccess: (
      data: Event,
      variables: { eventId: UUID; topicId: UUID; source?: AnalyticsSource },
    ) => {
      invalidateEventRelatedQueries(queryClient, {
        eventId: variables.eventId,
        topicId: variables.topicId,
        subtopicIds: data.subtopicIds,
      });
      applyUpdatedEventToCaches(queryClient, data);
      trackEvent("bookmark_toggled", {
        event_id: variables.eventId,
        topic_id: variables.topicId,
        bookmarked: true,
        source: variables.source ?? "direct",
      });
    },
  });

  const unBookmarkMutation = useMutation({
    mutationFn: (payload: {
      eventId: UUID;
      topicId: UUID;
      source?: AnalyticsSource;
    }) => unbookmarkEvent(payload.eventId, getToken),
    onSuccess: (
      data: Event,
      variables: { eventId: UUID; topicId: UUID; source?: AnalyticsSource },
    ) => {
      invalidateEventRelatedQueries(queryClient, {
        eventId: variables.eventId,
        topicId: variables.topicId,
        subtopicIds: data.subtopicIds,
      });
      applyUpdatedEventToCaches(queryClient, data);
      trackEvent("bookmark_toggled", {
        event_id: variables.eventId,
        topic_id: variables.topicId,
        bookmarked: false,
        source: variables.source ?? "direct",
      });
    },
  });

  return {
    bookmarkEvent: bookmarkMutation.mutateAsync,
    isBookingEvent: bookmarkMutation.isPending,
    isBookedEvent: bookmarkMutation.isSuccess,
    bookmarkEventError: bookmarkMutation.isError,

    unbookmarkEvent: unBookmarkMutation.mutateAsync,
    isUnbookingEvent: unBookmarkMutation.isPending,
    isUnbookedEvent: unBookmarkMutation.isSuccess,
    unbookmarkEventError: unBookmarkMutation.isError,
  };
}
