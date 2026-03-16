import { useAuth } from '@clerk/react'
import { fetchTopics, fetchEvents, fetchMarkets } from '../api'
import type { UUID } from '../models/models'

export function useApi() {
  const { getToken } = useAuth()

  return {
    fetchTopics: () => fetchTopics(getToken),
    fetchEvents: (topicId: UUID) => fetchEvents(topicId, getToken),
    fetchMarkets: (eventId: UUID) => fetchMarkets(eventId, getToken),
  }
}
