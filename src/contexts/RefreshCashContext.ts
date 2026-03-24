import { createContext, useContext } from "react";

export const RefreshCashContext = createContext<() => void>(() => {});

export function useRefreshCash() {
  return useContext(RefreshCashContext);
}
