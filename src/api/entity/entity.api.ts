import type { Entity } from "../../models/models";
import { type GetToken, API_URL, authHeaders } from "../api";

export interface CreateEntityPayload {
  name: string;
  abbreviatedName?: string;
  logoPath: string;
  color?: string;
}

export async function fetchEntities(getToken: GetToken): Promise<Entity[]> {
  return fetch(`${API_URL}/entities`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function createEntity(
  payload: CreateEntityPayload,
  getToken: GetToken,
): Promise<Entity> {
  return fetch(`${API_URL}/entities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify(payload),
  }).then((r) => r.json());
}
