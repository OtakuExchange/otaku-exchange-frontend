import { createContext, useContext } from "react";

export const RefreshTopicsContext = createContext<() => void>(() => {});

export function useRefreshTopics() {
  return useContext(RefreshTopicsContext);
}
