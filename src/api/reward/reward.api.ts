import { API_URL, authHeaders, type GetToken } from "../api";
import type { StreakStatus } from "../../models/models";

export async function fetchDailyStreak(getToken: GetToken): Promise<StreakStatus> {
  return fetch(`${API_URL}/rewards/daily`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function claimDailyReward(
  getToken: GetToken,
): Promise<StreakStatus> {
  const res = await fetch(`${API_URL}/rewards/daily/claim`, {
    method: "POST",
    headers: await authHeaders(getToken),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

