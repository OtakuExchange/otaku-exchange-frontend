import type {
  Comment,
  Event,
  Market,
  Order,
  Pool,
  Topic,
  Trade,
  UUID,
  Entity,
} from "./models/models";

const API_URL = import.meta.env.VITE_API_URL;

type GetToken = () => Promise<string | null>;

async function authHeaders(getToken: GetToken): Promise<HeadersInit> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchTopics(getToken: GetToken): Promise<Topic[]> {
  return fetch(`${API_URL}/topics`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function fetchEvents(
  topicId: UUID,
  getToken: GetToken,
): Promise<Event[]> {
  return fetch(`${API_URL}/topics/${topicId}/events`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function fetchEventsBySubtopic(
  subtopicId: UUID,
  getToken: GetToken,
): Promise<Event[]> {
  return fetch(`${API_URL}/subtopics/${subtopicId}/events`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function fetchTrades(
  marketId: UUID,
  getToken: GetToken,
): Promise<Trade[]> {
  return fetch(`${API_URL}/markets/${marketId}/trades`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function fetchMarkets(
  eventId: UUID,
  getToken: GetToken,
): Promise<Market[]> {
  return fetch(`${API_URL}/events/${eventId}/markets`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function fetchPools(
  eventId: UUID,
  getToken: GetToken,
): Promise<Pool[]> {
  return fetch(`${API_URL}/events/${eventId}/pools`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

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

export interface SeedMarketPayload {
  midpoint?: number;
  levels?: number;
  quantities?: number[];
  useLastPrice?: boolean;
}

export async function seedMarket(
  marketId: UUID,
  payload: SeedMarketPayload,
  getToken: GetToken,
): Promise<string> {
  const res = await fetch(`${API_URL}/admin/markets/${marketId}/seed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify(payload),
  });
  return res.text();
}

export interface CreateEventPayload {
  topicId: UUID;
  format: string;
  name: string;
  description: string;
  closeTime: string;
  status: string;
  resolutionRule: string;
  logoPath?: string;
}

export async function createEvent(
  payload: CreateEventPayload,
  getToken: GetToken,
): Promise<Event> {
  return fetch(`${API_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify(payload),
  }).then((r) => r.json());
}

export async function createMarket(
  eventId: UUID,
  label: string,
  status: string,
  getToken: GetToken,
): Promise<Market> {
  return fetch(`${API_URL}/markets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({ eventId, label, status }),
  }).then((r) => r.json());
}

export async function postComment(
  eventId: UUID,
  content: string,
  getToken: GetToken,
): Promise<Comment> {
  return fetch(`${API_URL}/events/${eventId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({ content }),
  }).then((r) => r.json());
}

export async function fetchComments(
  eventId: UUID,
  getToken: GetToken,
): Promise<Comment[]> {
  return fetch(`${API_URL}/events/${eventId}/comments`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function likeComment(
  eventId: UUID,
  commentId: UUID,
  getToken: GetToken,
): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}/comments/${commentId}/like`, {
    method: "POST",
    headers: await authHeaders(getToken),
  }).then(() => undefined);
}

export async function unlikeComment(
  eventId: UUID,
  commentId: UUID,
  getToken: GetToken,
): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}/comments/${commentId}/like`, {
    method: "DELETE",
    headers: await authHeaders(getToken),
  }).then(() => undefined);
}

export async function bookmarkEvent(
  eventId: UUID,
  getToken: GetToken,
): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}/bookmark`, {
    method: "POST",
    headers: await authHeaders(getToken),
  }).then(() => undefined);
}

export async function unbookmarkEvent(
  eventId: UUID,
  getToken: GetToken,
): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}/bookmark`, {
    method: "DELETE",
    headers: await authHeaders(getToken),
  }).then(() => undefined);
}

export async function deleteTopic(
  topicId: UUID,
  getToken: GetToken,
): Promise<void> {
  return fetch(`${API_URL}/topics/${topicId}`, {
    method: "DELETE",
    headers: await authHeaders(getToken),
  }).then(() => undefined);
}

export async function deleteEvent(
  eventId: UUID,
  getToken: GetToken,
): Promise<void> {
  return fetch(`${API_URL}/events/${eventId}`, {
    method: "DELETE",
    headers: await authHeaders(getToken),
  }).then(() => undefined);
}

export async function deleteMarket(
  marketId: UUID,
  getToken: GetToken,
): Promise<void> {
  return fetch(`${API_URL}/markets/${marketId}`, {
    method: "DELETE",
    headers: await authHeaders(getToken),
  }).then(() => undefined);
}

export async function createOrder(
  marketId: UUID,
  side: "YES" | "NO",
  price: number,
  quantity: number,
  lockedAmount: number,
  orderType: "LIMIT" | "MARKET",
  getToken: GetToken,
): Promise<void> {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({
      marketId,
      side,
      price,
      quantity,
      lockedAmount,
      orderType,
    }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
}

export async function createNotionalOrder(
  marketId: UUID,
  side: "YES" | "NO",
  notionalAmount: number,
  getToken: GetToken,
): Promise<void> {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({
      marketId,
      side,
      price: 99,
      quantity: 0,
      notionalAmount,
      lockedAmount: notionalAmount,
      orderType: "NOTIONAL",
    }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
}

export async function fetchMyOrders(
  status: string,
  orderType: string,
  getToken: GetToken,
): Promise<Order[]> {
  return fetch(`${API_URL}/orders/me?status=${status}&orderType=${orderType}`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function fetchPortfolioTotal(getToken: GetToken): Promise<number> {
  return fetch(`${API_URL}/positions/me/total`, {
    headers: await authHeaders(getToken),
  })
    .then((r) => r.json())
    .then((d) => d.total);
}

export async function cancelOrder(
  orderId: UUID,
  getToken: GetToken,
): Promise<void> {
  return fetch(`${API_URL}/orders/${orderId}`, {
    method: "DELETE",
    headers: await authHeaders(getToken),
  }).then(() => undefined);
}

export async function createStake(
  marketPoolId: UUID,
  amount: number,
  getToken: GetToken,
): Promise<void> {
  const res = await fetch(`${API_URL}/stakes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({ marketPoolId, amount }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
}

export interface Stake {
  id: UUID;
  userId: UUID;
  marketPoolId: UUID;
  label: string;
  entity: import("./models/models").Entity | null;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export async function fetchMyStakes(getToken: GetToken): Promise<Stake[]> {
  return fetch(`${API_URL}/stakes/me`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export interface LeaderboardEntry {
  rank: number;
  userId: UUID;
  username: string;
  avatarUrl: string | null;
  balance: number;
}

export async function fetchLeaderboard(
  limit: number,
  getToken: GetToken,
): Promise<LeaderboardEntry[]> {
  return fetch(`${API_URL}/rank/wallet?limit=${limit}`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function createTopic(
  topic: string,
  description: string,
  hidden: boolean,
  getToken: GetToken,
): Promise<Topic> {
  return fetch(`${API_URL}/topics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({ topic, description, hidden }),
  }).then((r) => r.json());
}

export async function resolveEvent(
  eventId: UUID,
  winningPoolId: UUID,
  getToken: GetToken,
): Promise<void> {
  const res = await fetch(`${API_URL}/events/${eventId}/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({ winningPoolId }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export interface StreakStatus {
  streak: number;
  rewardCents: number;
  canClaim: boolean;
}

export async function fetchDailyStreak(getToken: GetToken): Promise<StreakStatus> {
  return fetch(`${API_URL}/rewards/daily`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function claimDailyReward(getToken: GetToken): Promise<StreakStatus> {
  const res = await fetch(`${API_URL}/rewards/daily/claim`, {
    method: "POST",
    headers: await authHeaders(getToken),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchEntities(getToken: GetToken): Promise<Entity[]> {
  return fetch(`${API_URL}/entities`, {
    headers: await authHeaders(getToken),
  }).then((r) => r.json());
}

export async function createEntity(
  payload: { name: string; abbreviatedName?: string; logoPath: string; color?: string },
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

export async function updateEventStatus(
  eventId: UUID,
  status: string,
  getToken: GetToken,
): Promise<void> {
  const res = await fetch(`${API_URL}/events/${eventId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(getToken)),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
}
