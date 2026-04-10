import { useAuth } from "@clerk/react";
import type { UUID } from "../models/models";
import { fetchEntities, createEntity } from "../api/entity/entity.api";
import { type CreateEventPayload, createEvent, bookmarkEvent, unbookmarkEvent, deleteEvent, resolveEvent, updateEventStatus, linkEventToSubtopic, markEventSeen } from "../api/events/events.api";
import { fetchMarkets, fetchPools, deleteMarket, createMarketPool } from "../api/market/market.api";
import { fetchDailyStreak } from "../api/reward/reward.api";
import { createSubtopic, deleteSubtopic } from "../api/subtopic/subtopic.api";

export function useApi() {
  const { getToken } = useAuth();

  return {
    fetchMarkets: (eventId: UUID) => fetchMarkets(eventId, getToken),
    fetchPools: (eventId: UUID) => fetchPools(eventId, getToken),
    createEvent: (payload: CreateEventPayload) =>
      createEvent(payload, getToken),
    bookmarkEvent: (eventId: UUID) => bookmarkEvent(eventId, getToken),
    unbookmarkEvent: (eventId: UUID) => unbookmarkEvent(eventId, getToken),
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
