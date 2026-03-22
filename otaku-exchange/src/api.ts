import type { Comment, Event, Market, Topic, UUID } from './models/models'
import { dummyTopics } from './dummy/dummyTopics'
import { dummyEvents } from './dummy/dummyEvents'
import { dummyMarkets } from './dummy/dummyMarkets'

const isDummy = import.meta.env.VITE_ENV_MODE === 'dummy'
const API_URL = import.meta.env.VITE_API_URL

type GetToken = () => Promise<string | null>

async function authHeaders(getToken: GetToken): Promise<HeadersInit> {
  const token = await getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchTopics(getToken: GetToken): Promise<Topic[]> {
  if (isDummy) return dummyTopics
  return fetch(`${API_URL}/topics`, { headers: await authHeaders(getToken) }).then((r) => r.json())
}

export async function fetchEvents(topicId: UUID, getToken: GetToken): Promise<Event[]> {
  if (isDummy) return dummyEvents[topicId] ?? []
  return fetch(`${API_URL}/topics/${topicId}/events`, { headers: await authHeaders(getToken) }).then((r) => r.json())
}

export async function fetchEventsBySubtopic(subtopicId: UUID, getToken: GetToken): Promise<Event[]> {
  return fetch(`${API_URL}/subtopics/${subtopicId}/events`, { headers: await authHeaders(getToken) }).then((r) => r.json())
}

export async function fetchMarkets(eventId: UUID, getToken: GetToken): Promise<Market[]> {
  if (isDummy) return dummyMarkets[eventId] ?? []
  return fetch(`${API_URL}/events/${eventId}/markets`, { headers: await authHeaders(getToken) }).then((r) => r.json())
}

export interface CreateEventPayload {
  topicId: UUID
  format: string
  name: string
  description: string
  closeTime: string
  status: string
  resolutionRule: string
}

export async function createEvent(payload: CreateEventPayload, getToken: GetToken): Promise<Event> {
  return fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...await authHeaders(getToken) },
    body: JSON.stringify(payload),
  }).then((r) => r.json())
}

export async function createMarket(eventId: UUID, label: string, status: string, getToken: GetToken): Promise<Market> {
  return fetch(`${API_URL}/markets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...await authHeaders(getToken) },
    body: JSON.stringify({ eventId, label, status }),
  }).then((r) => r.json())
}

export async function postComment(eventId: UUID, content: string, getToken: GetToken): Promise<Comment> {
  return fetch(`${API_URL}/events/${eventId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...await authHeaders(getToken) },
    body: JSON.stringify({ content }),
  }).then((r) => r.json())
}

export async function fetchComments(eventId: UUID, getToken: GetToken): Promise<Comment[]> {
  return fetch(`${API_URL}/events/${eventId}/comments`, { headers: await authHeaders(getToken) }).then((r) => r.json())
}

export async function likeComment(eventId: UUID, commentId: UUID, getToken: GetToken): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}/comments/${commentId}/like`, {
    method: 'POST',
    headers: await authHeaders(getToken),
  }).then(() => undefined)
}

export async function unlikeComment(eventId: UUID, commentId: UUID, getToken: GetToken): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}/comments/${commentId}/like`, {
    method: 'DELETE',
    headers: await authHeaders(getToken),
  }).then(() => undefined)
}

export async function bookmarkEvent(eventId: UUID, getToken: GetToken): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}/bookmark`, {
    method: 'POST',
    headers: await authHeaders(getToken),
  }).then(() => undefined)
}

export async function unbookmarkEvent(eventId: UUID, getToken: GetToken): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}/bookmark`, {
    method: 'DELETE',
    headers: await authHeaders(getToken),
  }).then(() => undefined)
}

export async function deleteTopic(topicId: UUID, getToken: GetToken): Promise<void> {
  return fetch(`${API_URL}/topics/${topicId}`, {
    method: 'DELETE',
    headers: await authHeaders(getToken),
  }).then(() => undefined)
}

export async function deleteEvent(eventId: UUID, getToken: GetToken): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}`, {
    method: 'DELETE',
    headers: await authHeaders(getToken),
  }).then(() => undefined)
}

export async function deleteMarket(marketId: UUID, getToken: GetToken): Promise<void> {
  return fetch(`${API_URL}/markets/${marketId}`, {
    method: 'DELETE',
    headers: await authHeaders(getToken),
  }).then(() => undefined)
}

export async function createOrder(marketId: UUID, side: 'YES' | 'NO', price: number, quantity: number, lockedAmount: number, orderType: 'LIMIT' | 'MARKET', getToken: GetToken): Promise<void> {
  return fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...await authHeaders(getToken) },
    body: JSON.stringify({ marketId, side, price, quantity, lockedAmount, orderType }),
  }).then(() => undefined)
}

export async function createTopic(topic: string, description: string, getToken: GetToken): Promise<Topic> {
  return fetch(`${API_URL}/topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...await authHeaders(getToken) },
    body: JSON.stringify({ topic, description }),
  }).then((r) => r.json())
}
