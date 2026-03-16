import type { Event, Market, Topic, UUID } from './models/models'
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

export async function fetchMarkets(eventId: UUID, getToken: GetToken): Promise<Market[]> {
  if (isDummy) return dummyMarkets[eventId] ?? []
  return fetch(`${API_URL}/events/${eventId}/markets`, { headers: await authHeaders(getToken) }).then((r) => r.json())
}
