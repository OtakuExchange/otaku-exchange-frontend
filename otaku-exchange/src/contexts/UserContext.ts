import { createContext, useContext } from 'react'

export const UserContext = createContext<string | null>(null)

export function useUserId() {
  return useContext(UserContext)
}
