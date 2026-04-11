import type { UUID } from "../models/models";

export const queryKeys = {
  // User
  user: ["user"] as const,

  // Portfolio
  portfolio: ["portfolio"] as const,
  portfolioUserId: (userId: UUID) => ["portfolio", "userId", userId] as const,

  // Topics
  topics: ["topics"] as const,
  topicEventCounts: (topicId: UUID) =>
    ["topic", "eventCounts", topicId] as const,

  // Events
  eventById: (eventId: UUID) => ["event", "id", eventId] as const,
  eventStakes: (eventId: UUID, limit: number) =>
    ["event", "stakes", eventId, "limit", limit] as const,
  eventsByTopic: (topicId: UUID) => ["events", "topic", topicId] as const,
  eventsBySubtopic: (subtopicId: UUID) =>
    ["events", "subtopic", subtopicId] as const,

  // Markets
  poolsByEventId: (eventId: UUID) =>
    ["pools", "v2", "eventId", eventId] as const,
  marketsByEventId: (eventId: UUID) => ["markets", "eventId", eventId] as const,

  // Rank
  leaderboard: (limit: number) => ["leaderboard", "limit", limit] as const,
};
