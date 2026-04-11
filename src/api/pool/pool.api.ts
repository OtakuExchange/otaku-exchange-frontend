import type { UUID, Pool } from "../../models/models";
import { type GetToken, API_URL, authHeaders } from "../api";

export async function createMarketPool(
  eventId: UUID,
  label: string,
  entityId: UUID | null,
  getToken: GetToken,
): Promise<void> {
  const res = await fetch(`${API_URL}/events/${eventId}/pools`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({ label, entityId }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchPools(
  eventId: UUID,
  getToken: GetToken,
): Promise<Pool[]> {
  return fetch(`${API_URL}/events/${eventId}/pools`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}
