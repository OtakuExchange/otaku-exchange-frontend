import { dummyTopics } from './dummy/dummyTopics'
import { dummyEvents } from './dummy/dummyEvents'
import { dummyMarkets } from './dummy/dummyMarkets'

const isDummy = import.meta.env.VITE_ENV_MODE === 'dummy'
const API_URL = import.meta.env.VITE_API_URL

export async function fetchTopics(): Promise<{ id: string | number; topic: string }[]> {
  if (isDummy) return dummyTopics
  return fetch(`${API_URL}/topics`).then((r) => r.json())
}

export async function fetchEvents(topicId: string | number): Promise<{ eventId: string | number; name: string; description: string }[]> {
  if (isDummy) return dummyEvents[String(topicId)] ?? []
  return fetch(`${API_URL}/events/${topicId}`).then((r) => r.json())
}

export async function fetchMarkets(eventId: string | number): Promise<{ label: string }[]> {
  if (isDummy) return dummyMarkets[String(eventId)] ?? []
  return fetch(`${API_URL}/markets/${eventId}`).then((r) => r.json())
}
