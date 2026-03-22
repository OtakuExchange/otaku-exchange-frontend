export type UUID = `${string}-${string}-${string}-${string}-${string}`

export type OrderSide = 'YES' | 'NO'
export type OrderStatus = 'OPEN' | 'PARTIAL' | 'FILLED' | 'CANCELLED'
export type OrderType = 'LIMIT' | 'MARKET'

export interface Subtopic {
  id: UUID
  topicId: UUID
  name: string
  createdAt: string
}

export interface Topic {
  id: UUID
  topic: string
  description: string
  subtopics: Subtopic[]
}

export interface Event {
  id: UUID
  topicId: UUID
  format: string
  name: string
  description: string
  closeTime: string
  status: string
  resolutionRule: string
  logoPath: string | null
  pandaScoreId: string | null
  bookmarked: boolean
  createdAt: string
}

export interface Entity {
  id: UUID
  name: string
  abbreviatedName: string
  logoPath: string
  color: string | null
  createdAt: string
}

export interface Market {
  id: UUID
  eventId: UUID
  entity?: Entity
  relatedEntity?: Entity
  label: string
  isMatch: boolean
  status: string
  createdAt: string
}

export interface CommentUser {
  id: UUID
  username: string
}

export interface Comment {
  id: UUID
  eventId: UUID
  user: CommentUser
  parentId: UUID | null
  content: string
  createdAt: string
  likes: number
  likedByUser: boolean
}

export interface Trade {
  id: UUID
  marketId: UUID
  yesOrderId: UUID
  noOrderId: UUID
  yesPrice: number
  noPrice: number
  quantity: number
  escrowPerContract: number
  executedAt: string
}

export interface Order {
  id: UUID
  userId: UUID
  marketId: UUID
  side: OrderSide
  price: number
  quantity: number
  remaining: number
  status: OrderStatus
  orderType: OrderType
  createdAt: string
  executedAt: string | null
}
