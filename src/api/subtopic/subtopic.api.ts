import type { Event, Subtopic, UUID } from "../../models/models";
import { API_URL, authHeaders, type GetToken } from "../api";

export async function fetchEventsBySubtopic(
  subtopicId: UUID,
  getToken: GetToken,
): Promise<Event[]> {
  return fetch(`${API_URL}/subtopics/${subtopicId}/events`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function createSubtopic(
  topicId: UUID,
  name: string,
  getToken: GetToken,
): Promise<Subtopic> {
  const res = await fetch(`${API_URL}/topics/${topicId}/subtopics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({ name, topicId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteSubtopic(
  subtopicId: UUID,
  getToken: GetToken,
): Promise<void> {
  const res = await fetch(`${API_URL}/subtopics/${subtopicId}`, {
    method: "DELETE",
    headers: await authHeaders(getToken),
  });
  if (!res.ok) throw new Error(await res.text());
}

