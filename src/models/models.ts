export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export const FIRST_BET_BONUS_STAKE_CENTS = 50_000;

export type OrderSide = "YES" | "NO";
export type OrderStatus =
  | "OPEN"
  | "PARTIAL"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCELLED";
export type OrderType = "LIMIT" | "MARKET" | "NOTIONAL";

export interface Subtopic {
  id: UUID;
  topicId: UUID;
  name: string;
  createdAt: string;
  isNew?: boolean;
}

export interface Topic {
  id: UUID;
  topic: string;
  description: string;
  hidden: boolean;
  subtopics: Subtopic[];
}

export const EVENT_STATUSES = [
  "open",
  "hidden",
  "staking_closed",
  "resolved",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_FORMATS = ["single", "multi"] as const;

export type EventFormat = (typeof EVENT_FORMATS)[number];

export interface Event {
  id: UUID;
  topicId: UUID;
  format: EventFormat;
  name: string;
  alias?: string;
  description: string;
  closeTime: string;
  status: EventStatus;
  resolutionRule: string;
  logoPath: string | null;
  pandaScoreId: string | null;
  bookmarked: boolean;
  createdAt: string;
  tradeVolume: number;
  multiplier: number;
  isNew: boolean;
  isFirstStakeBonusEligible: boolean;
}

export interface Entity {
  id: UUID;
  name: string;
  abbreviatedName: string;
  logoPath: string;
  color: string | null;
  createdAt: string;
}

export interface Market {
  id: UUID;
  eventId: UUID;
  entity?: Entity;
  relatedEntity?: Entity;
  label: string;
  isMatch: boolean;
  status: string;
  tradeVolume: number;
  forecast: number | null;
  createdAt: string;
}

export interface Pool {
  id: UUID;
  eventId: UUID;
  entity: Entity | null;
  label: string;
  isWinner: boolean;
  amount: number;
  volume: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentUser {
  id: UUID;
  username: string;
}

export interface Comment {
  id: UUID;
  eventId: UUID;
  user: CommentUser;
  parentId: UUID | null;
  content: string;
  createdAt: string;
  likes: number;
  likedByUser: boolean;
}

export interface Trade {
  id: UUID;
  marketId: UUID;
  yesOrderId: UUID;
  noOrderId: UUID;
  yesPrice: number;
  noPrice: number;
  quantity: number;
  escrowPerContract: number;
  executedAt: string;
}

export interface Order {
  id: UUID;
  userId: UUID;
  marketId: UUID;
  marketLabel: string;
  eventId: UUID;
  eventName: string;
  topicId: UUID;
  topicName: string;
  side: OrderSide;
  price: number;
  quantity: number;
  remaining: number;
  lockedAmount: number;
  notionalAmount: number | null;
  status: OrderStatus;
  orderType: OrderType;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutPreview {
  hypotheticalStake: number;
  projectedPayout: number;
}

export interface TopicEventCounts {
  topicId: UUID;
  subtopics: SubtopicEventCounts[];
}

export interface SubtopicEventCounts {
  subtopicId: UUID;
  total: number;
  byStatus: Record<EventStatus, number>;
}

export interface PortfolioItem {
  id: UUID;
  eventId: UUID;
  label: string;
  entity: Entity | null;
  isWinner: boolean;
  amount: number;
  volume: number;
  userStake: number | null;
  eventStatus: string;
  createdAt: string;
  eventMultiplier: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: UUID;
  username: string;
  avatarUrl: string | null;
  balance: number;
}

export interface EventStake {
  id: UUID;
  userId: UUID;
  username: string;
  avatarUrl: string | null;
  marketPoolId: UUID;
  poolLabel: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StreakStatus {
  streak: number;
  rewardCents: number;
  canClaim: boolean;
  comebackBonusCents: number;
}