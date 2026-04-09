import type { UUID } from "../models/models";

export const queryKeys = {
  user: ["user"] as const,
  portfolio: ["portfolio"] as const,
  topics: ["topics"] as const,
  eventById: (eventId: UUID) => ["event", "id", eventId] as const,
  poolsByEventId: (eventId: UUID) =>
    ["pools", "v2", "eventId", eventId] as const,
  eventsByTopic: (topicId: UUID) => ["events", "topic", topicId] as const,
  eventsBySubtopic: (subtopicId: UUID) =>
    ["events", "subtopic", subtopicId] as const,
  marketsByEventId: (eventId: UUID) => ["markets", "eventId", eventId] as const,
  topicEventCounts: (topicId: UUID) =>
    ["topic", "eventCounts", topicId] as const,
  leaderboard: (limit: number) => ["leaderboard", "limit", limit] as const,
  eventStakes: (eventId: UUID, limit: number) =>
    ["event", "stakes", eventId, "limit", limit] as const,
};
