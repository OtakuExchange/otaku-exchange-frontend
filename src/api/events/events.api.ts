import type { Entity, Event, EventStake, UUID } from "../../models/models";
import { type GetToken, API_URL, authHeaders } from "../api";

// EVENTS
export async function fetchEvent(
  eventId: UUID,
  getToken: GetToken,
): Promise<Event> {
  return fetch(`${API_URL}/events/${eventId}`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export interface CreateEventPayload {
  topicId: UUID;
  format: string;
  name: string;
  description: string;
  closeTime: string;
  status: string;
  resolutionRule: string;
  logoPath?: string;
  alias?: string;
}

export async function createEvent(
  payload: CreateEventPayload,
  getToken: GetToken,
): Promise<Event> {
  return fetch(`${API_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify(payload),
  }).then((r) => r.json());
}

export async function deleteEvent(
  eventId: UUID,
  getToken: GetToken,
): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}`, {
    method: "DELETE",
    headers: await authHeaders(getToken),
  }).then(() => undefined);
}

// EVENT ACTIONS
export async function resolveEvent(
  eventId: UUID,
  winningPoolId: UUID,
  getToken: GetToken,
): Promise<void> {
  const res = await fetch(`${API_URL}/events/${eventId}/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({ winningPoolId }),
  });
  if (!res.ok) throw new Error(await res.text());
}
export async function markEventSeen(
  eventId: UUID,
  getToken: GetToken,
): Promise<void> {
  const headers = await authHeaders(getToken);
  await fetch(`${API_URL}/events/${eventId}/seen`, {
    method: "POST",
    headers,
  });
}

export async function updateEventStatus(
  eventId: UUID,
  status: string,
  getToken: GetToken,
): Promise<void> {
  const res = await fetch(`${API_URL}/events/${eventId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function linkEventToSubtopic(
  eventId: UUID,
  subtopicId: UUID,
  getToken: GetToken,
): Promise<void> {
  const res = await fetch(
    `${API_URL}/events/${eventId}/subtopics/${subtopicId}`,
    { method: "POST", headers: await authHeaders(getToken) },
  );
  if (!res.ok) throw new Error(await res.text());
}

// BOOKMARKING

export async function bookmarkEvent(
  eventId: UUID,
  getToken: GetToken,
): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}/bookmark`, {
    method: "POST",
    headers: await authHeaders(getToken),
  }).then(() => undefined);
}

export async function unbookmarkEvent(
  eventId: UUID,
  getToken: GetToken,
): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}/bookmark`, {
    method: "DELETE",
    headers: await authHeaders(getToken),
  }).then(() => undefined);
}

// STAKES
export async function fetchEventStakes(
  eventId: UUID,
  limit: number,
): Promise<EventStake[]> {
  return fetch(
    `${API_URL}/events/${eventId}/stakes?limit=${limit}&includeAdmins=false`,
  ).then((r) => r.json());
}

export async function createStake(
  marketPoolId: UUID,
  amount: number,
  getToken: GetToken,
): Promise<void> {
  const res = await fetch(`${API_URL}/stakes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({ marketPoolId, amount }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
}

export interface Stake {
  id: UUID;
  userId: UUID;
  marketPoolId: UUID;
  label: string;
  entity: Entity | null;
  amount: number;
  createdAt: string;
  updatedAt: string;
}
