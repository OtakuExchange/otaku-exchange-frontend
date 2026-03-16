import { useAuth } from '@clerk/react'
import { fetchTopics, fetchEvents, fetchMarkets, createTopic, createEvent, createMarket } from '../api'
import type { CreateEventPayload } from '../api'
import type { UUID } from '../models/models'

export function useApi() {
  const { getToken } = useAuth()

  return {
    fetchTopics: () => fetchTopics(getToken),
    fetchEvents: (topicId: UUID) => fetchEvents(topicId, getToken),
    fetchMarkets: (eventId: UUID) => fetchMarkets(eventId, getToken),
    createTopic: (topic: string, description: string) => createTopic(topic, description, getToken),
    createEvent: (payload: CreateEventPayload) => createEvent(payload, getToken),
    createMarket: (eventId: UUID, label: string, status: string) => createMarket(eventId, label, status, getToken),
  }
}
