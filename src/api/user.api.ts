import type { UUID } from "../models/models";
import { API_URL, authHeaders, type GetToken } from "./api";

export interface CurrentUser {
  id: UUID;
  username: string;
  email: string;
  balance: number;
  lockedBalance: number;
  isAdmin: boolean;
}

export async function fetchCurrentUser(
  getToken: GetToken,
): Promise<CurrentUser | null> {
  const headers = await authHeaders(getToken);
  if (!("Authorization" in headers)) return null;
  return fetch(`${API_URL}/users/me`, { headers }).then((r) =>
    r.ok ? r.json() : null,
  );
}
