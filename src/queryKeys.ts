import type { UUID } from "./models/models";

export const queryKeys = {
  topics: ["topics"] as const,
  eventsByTopic: (topicId: UUID) => ["events", "topic", topicId] as const,
  eventsBySubtopic: (subtopicId: UUID) => ["events", "subtopic", subtopicId] as const,
  marketsByEventId: (eventId: UUID) => ["markets", "eventId", eventId] as const,
};