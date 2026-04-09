import type { PortfolioItem, UUID } from "../models/models";
import { type GetToken, API_URL, authHeaders } from "./api";

export interface PortfolioResponse {
  userId: UUID;
  username: string;
  avatarUrl: string | null;
  balance: number;
  pools: PortfolioItem[];
  createdAt: string;
}

export async function fetchPortfolio(
  getToken: GetToken,
): Promise<PortfolioResponse> {
  return fetch(`${API_URL}/portfolio/me`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function fetchUserPortfolio(
  userId: UUID,
  getToken: GetToken,
): Promise<PortfolioResponse> {
  return fetch(`${API_URL}/portfolio/${userId}`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}
