import { useAuth } from "@clerk/react";
import {
  fetchTopics,
  fetchEvents,
  fetchMarkets,
  fetchPools,
  bookmarkEvent,
  unbookmarkEvent,
  createTopic,
  createEvent,
  deleteTopic,
  deleteEvent,
  deleteMarket,
  resolveEvent,
  fetchDailyStreak,
  fetchEntities,
  createEntity,
  createMarketPool,
  updateEventStatus,
  createSubtopic,
  deleteSubtopic,
  linkEventToSubtopic,
  markEventSeen,
} from "../api";
import type { CreateEventPayload } from "../api";
import type { UUID } from "../models/models";

export function useApi() {
  const { getToken } = useAuth();

  return {
    fetchTopics: () => fetchTopics(getToken),
    fetchEvents: (topicId: UUID) => fetchEvents(topicId, getToken),
    fetchMarkets: (eventId: UUID) => fetchMarkets(eventId, getToken),
    fetchPools: (eventId: UUID) => fetchPools(eventId, getToken),
    createTopic: (topic: string, description: string, hidden: boolean) =>
      createTopic(topic, description, hidden, getToken),
    createEvent: (payload: CreateEventPayload) =>
      createEvent(payload, getToken),
    bookmarkEvent: (eventId: UUID) => bookmarkEvent(eventId, getToken),
    unbookmarkEvent: (eventId: UUID) => unbookmarkEvent(eventId, getToken),
    deleteTopic: (topicId: UUID) => deleteTopic(topicId, getToken),
    deleteEvent: (eventId: UUID) => deleteEvent(eventId, getToken),
    deleteMarket: (marketId: UUID) => deleteMarket(marketId, getToken),
    resolveEvent: (eventId: UUID, winningPoolId: UUID) =>
      resolveEvent(eventId, winningPoolId, getToken),
    fetchDailyStreak: () => fetchDailyStreak(getToken),
    fetchEntities: () => fetchEntities(getToken),
    createEntity: (payload: {
      name: string;
      abbreviatedName?: string;
      logoPath: string;
      color?: string;
    }) => createEntity(payload, getToken),
    createMarketPool: (eventId: UUID, label: string, entityId: UUID | null) =>
      createMarketPool(eventId, label, entityId, getToken),
    updateEventStatus: (eventId: UUID, status: string) =>
      updateEventStatus(eventId, status, getToken),
    createSubtopic: (topicId: UUID, name: string) =>
      createSubtopic(topicId, name, getToken),
    deleteSubtopic: (subtopicId: UUID) => deleteSubtopic(subtopicId, getToken),
    linkEventToSubtopic: (eventId: UUID, subtopicId: UUID) =>
      linkEventToSubtopic(eventId, subtopicId, getToken),
    markEventSeen: (eventId: UUID) => markEventSeen(eventId, getToken),
  };
}
