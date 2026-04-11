import type { LeaderboardEntry } from "../../models/models";
import { API_URL, authHeaders, type GetToken } from "../api";

export async function fetchLeaderboard(
  limit: number,
  getToken: GetToken,
): Promise<LeaderboardEntry[]> {
  return fetch(`${API_URL}/rank/wallet?limit=${limit}`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}
