import { useAuth } from "@clerk/react";
import {
  fetchTopics,
  fetchEvents,
  fetchEventsBySubtopic,
  fetchMarkets,
  fetchPools,
  fetchTrades,
  createStake,
  fetchComments,
  postComment,
  likeComment,
  unlikeComment,
  bookmarkEvent,
  unbookmarkEvent,
  createTopic,
  createEvent,
  createMarket,
  createOrder,
  createNotionalOrder,
  deleteTopic,
  deleteEvent,
  deleteMarket,
  fetchCurrentUser,
  seedMarket,
  fetchMyOrders,
  cancelOrder,
  fetchPortfolioTotal,
  fetchLeaderboard,
  fetchMyStakes,
} from "../api";
import type { CreateEventPayload, SeedMarketPayload } from "../api";
import type { UUID } from "../models/models";

export function useApi() {
  const { getToken } = useAuth();

  return {
    fetchTopics: () => fetchTopics(getToken),
    fetchEvents: (topicId: UUID) => fetchEvents(topicId, getToken),
    fetchEventsBySubtopic: (subtopicId: UUID) =>
      fetchEventsBySubtopic(subtopicId, getToken),
    fetchMarkets: (eventId: UUID) => fetchMarkets(eventId, getToken),
    fetchPools: (eventId: UUID) => fetchPools(eventId, getToken),
    fetchCurrentUser: () => fetchCurrentUser(getToken),
    fetchTrades: (marketId: UUID) => fetchTrades(marketId, getToken),
    createTopic: (topic: string, description: string) =>
      createTopic(topic, description, getToken),
    createEvent: (payload: CreateEventPayload) =>
      createEvent(payload, getToken),
    createMarket: (eventId: UUID, label: string, status: string) =>
      createMarket(eventId, label, status, getToken),
    fetchComments: (eventId: UUID) => fetchComments(eventId, getToken),
    postComment: (eventId: UUID, content: string) =>
      postComment(eventId, content, getToken),
    likeComment: (eventId: UUID, commentId: UUID) =>
      likeComment(eventId, commentId, getToken),
    unlikeComment: (eventId: UUID, commentId: UUID) =>
      unlikeComment(eventId, commentId, getToken),
    bookmarkEvent: (eventId: UUID) => bookmarkEvent(eventId, getToken),
    unbookmarkEvent: (eventId: UUID) => unbookmarkEvent(eventId, getToken),
    deleteTopic: (topicId: UUID) => deleteTopic(topicId, getToken),
    deleteEvent: (eventId: UUID) => deleteEvent(eventId, getToken),
    deleteMarket: (marketId: UUID) => deleteMarket(marketId, getToken),
    createOrder: (
      marketId: UUID,
      side: "YES" | "NO",
      price: number,
      quantity: number,
      lockedAmount: number,
      orderType: "LIMIT" | "MARKET",
    ) =>
      createOrder(
        marketId,
        side,
        price,
        quantity,
        lockedAmount,
        orderType,
        getToken,
      ),
    createNotionalOrder: (
      marketId: UUID,
      side: "YES" | "NO",
      notionalAmount: number,
    ) => createNotionalOrder(marketId, side, notionalAmount, getToken),
    seedMarket: (marketId: UUID, payload: SeedMarketPayload) =>
      seedMarket(marketId, payload, getToken),
    fetchMyOrders: (status: string, orderType: string) =>
      fetchMyOrders(status, orderType, getToken),
    cancelOrder: (orderId: UUID) => cancelOrder(orderId, getToken),
    fetchPortfolioTotal: () => fetchPortfolioTotal(getToken),
    createStake: (marketPoolId: UUID, amount: number) =>
      createStake(marketPoolId, amount, getToken),
    fetchLeaderboard: (limit: number) => fetchLeaderboard(limit, getToken),
    fetchMyStakes: () => fetchMyStakes(getToken),
  };
}
