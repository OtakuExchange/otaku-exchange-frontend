import { createContext, useContext } from 'react'
import type { Topic } from '../models/models'

export const TopicsContext = createContext<Topic[]>([])

export function useTopics() {
  return useContext(TopicsContext)
}
