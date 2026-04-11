import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UUID, Event } from "../../models/models";
import { useAuth } from "@clerk/react";
import { queryKeys } from "../queryKeys";
import { bookmarkEvent, createEvent, createStake, deleteEvent, linkEventToSubtopic, markEventSeen, resolveEvent, unbookmarkEvent, updateEventStatus, type CreateEventPayload } from "./events.api";

export function useStakeMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ marketPoolId, amount }: { marketPoolId: UUID; amount: number }) =>
      createStake(marketPoolId, amount, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.eventsByTopic(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.topicEventCounts(variables.topicId) });
      // TODO: invalidate queries for events by subtopic

      // optimistic update
      queryClient.setQueryData(queryKeys.eventsByTopic(variables.topicId), (old: Event[]) => [...old, data]);
      queryClient.setQueriesData({ queryKey: ["events", "subtopic"] }, (old: Event[] | undefined) => old ? [...old, data] : [data]);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (payload: { eventId: UUID; topicId: UUID; }) => deleteEvent(payload.eventId, getToken),
    onSuccess: (_, variables: {eventId: UUID, topicId: UUID}) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventById(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.eventsByTopic(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.topicEventCounts(variables.topicId) });
      // TODO: invalidate queries for events by subtopic

      // optimistic update
      queryClient.setQueryData(queryKeys.eventsByTopic(variables.topicId), (old: Event[]) => old.filter((e) => e.id !== variables.eventId));
      queryClient.setQueriesData({ queryKey: ["events", "subtopic"] }, (old: Event[] | undefined) => old ? old.filter((e) => e.id !== variables.eventId) : old);
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
    mutationFn: (payload: { eventId: UUID; topicId: UUID; }) => markEventSeen(payload.eventId, getToken),
    onSuccess: (_, variables: { eventId: UUID; topicId: UUID; }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventById(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.eventsByTopic(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.topicEventCounts(variables.topicId) });
      // TODO: invalidate queries for events by subtopic

      // optimistic update
      queryClient.setQueryData(queryKeys.eventById(variables.eventId), (old: Event) => ({
        ...old,
        isNew: false,
      }));
      queryClient.setQueryData(queryKeys.eventsByTopic(variables.topicId), (old: Event[]) => old.map((e) => e.id === variables.eventId ? { ...e, isNew: false } : e));
      queryClient.setQueriesData({ queryKey: ["events", "subtopic"] }, (old: Event[] | undefined) => old ? old.map((e) => e.id === variables.eventId ? { ...e, isNew: false } : e) : old);
    },
  });

  const linkToSubtopicMutation = useMutation({
    mutationFn: (payload: { eventId: UUID; topicId: UUID; subtopicId: UUID }) => linkEventToSubtopic(payload.eventId, payload.subtopicId, getToken),
    onSuccess: (_, variables: { eventId: UUID; topicId: UUID; subtopicId: UUID }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventById(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.eventsByTopic(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.eventsBySubtopic(variables.subtopicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.topicEventCounts(variables.topicId) });
    },
  });

  const updateEventStatusMutation = useMutation({
    mutationFn: (payload: { eventId: UUID; topicId: UUID; status: string }) => updateEventStatus(payload.eventId, payload.status, getToken),
    onSuccess: (_, variables: { eventId: UUID; topicId: UUID; status: string }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventById(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.eventsByTopic(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.topicEventCounts(variables.topicId) });
      // TODO: invalidate queries for events by subtopic

      // optimistic update
      queryClient.setQueryData(queryKeys.eventById(variables.eventId), (old: Event) => ({
        ...old,
        status: variables.status,
      }));
      queryClient.setQueryData(queryKeys.eventsByTopic(variables.topicId), (old: Event[]) => old.map((e) => e.id === variables.eventId ? { ...e, status: variables.status } : e));
      queryClient.setQueriesData({ queryKey: ["events", "subtopic"] }, (old: Event[] | undefined) => old ? old.map((e) => e.id === variables.eventId ? { ...e, status: variables.status } : e) : old);
    },
  });

  const resolveEventMutation = useMutation({
    mutationFn: (payload: { eventId: UUID; topicId: UUID; winningPoolId: UUID }) => resolveEvent(payload.eventId, payload.winningPoolId, getToken),
    onSuccess: (_, variables: { eventId: UUID; topicId: UUID; winningPoolId: UUID }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventById(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.eventsByTopic(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.topicEventCounts(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio})
      // TODO: invalidate queries for events by subtopic

      // optimistic update
      queryClient.setQueryData(queryKeys.eventById(variables.eventId), (old: Event) => ({
        ...old,
        status: "resolved",
      }));
      queryClient.setQueryData(queryKeys.eventsByTopic(variables.topicId), (old: Event[]) => old.map((e) => e.id === variables.eventId ? { ...e, status: "resolved" } : e));
      queryClient.setQueriesData({ queryKey: ["events", "subtopic"] }, (old: Event[] | undefined) => old ? old.map((e) => e.id === variables.eventId ? { ...e, status: "resolved" } : e) : old);
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
  }
}

export function useBookmarkMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: (payload: { eventId: UUID; topicId: UUID; }) => bookmarkEvent(payload.eventId, getToken),
    onSuccess: (_, variables: { eventId: UUID; topicId: UUID; }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventById(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.eventsByTopic(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.topicEventCounts(variables.topicId) });
      // TODO: invalidate queries for events by subtopic

      // optimistic update
      queryClient.setQueryData(queryKeys.eventById(variables.eventId), (old: Event) => ({
        ...old,
        bookmarked: true,
      }));
      queryClient.setQueryData(["events"], (old: Event[]) => old.map((e) => e.id === variables.eventId ? { ...e, bookmarked: true } : e));
    },
  });

  const unBookmarkMutation = useMutation({
    mutationFn: (payload: { eventId: UUID; topicId: UUID; }) => unbookmarkEvent(payload.eventId, getToken),
    onSuccess: (_, variables: { eventId: UUID; topicId: UUID; }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventById(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.eventsByTopic(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.topicEventCounts(variables.topicId) });
      // TODO: invalidate queries for events by subtopic

      // optimistic update
      queryClient.setQueryData(queryKeys.eventById(variables.eventId), (old: Event) => ({
        ...old,
        bookmarked: false,
      }));
      queryClient.setQueryData(["events"], (old: Event[]) => old.map((e) => e.id === variables.eventId ? { ...e, bookmarked: false } : e));
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
