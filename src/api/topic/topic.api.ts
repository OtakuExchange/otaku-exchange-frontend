import type { Topic, UUID, TopicEventCounts, Event } from "../../models/models";
import { API_URL, authHeaders, type GetToken } from "../api";

export async function fetchTopics(getToken: GetToken): Promise<Topic[]> {
  return fetch(`${API_URL}/topics`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function createTopic(
  topic: string,
  description: string,
  hidden: boolean,
  getToken: GetToken,
): Promise<Topic> {
  return fetch(`${API_URL}/topics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({ topic, description, hidden }),
  }).then((r) => r.json());
}

export async function deleteTopic(
  topicId: UUID,
  getToken: GetToken,
): Promise<void> {
  return fetch(`${API_URL}/topics/${topicId}`, {
    method: "DELETE",
    headers: await authHeaders(getToken),
  }).then(() => undefined);
}

export async function fetchEventsByTopic(
  topicId: UUID,
  getToken: GetToken,
): Promise<Event[]> {
  return fetch(`${API_URL}/topics/${topicId}/events`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function fetchTopicEventCounts(
  topicId: UUID,
): Promise<TopicEventCounts> {
  return fetch(`${API_URL}/topics/${topicId}/subtopics/event-counts`, {}).then(
    (r) => r.json(),
  );
}
