import type { Event, UUID } from '../models/models'

const TOPIC_ANIME   = 'a1b2c3d4-0001-0000-0000-000000000001' as UUID
const TOPIC_MANGA   = 'a1b2c3d4-0001-0000-0000-000000000002' as UUID
const TOPIC_FIGURES = 'a1b2c3d4-0001-0000-0000-000000000003' as UUID

export const EVENT_AOT     = 'e0000000-0000-0000-0000-000000000101' as UUID
export const EVENT_OP_LA   = 'e0000000-0000-0000-0000-000000000102' as UUID
export const EVENT_JJK     = 'e0000000-0000-0000-0000-000000000103' as UUID
export const EVENT_BERSERK = 'e0000000-0000-0000-0000-000000000201' as UUID
export const EVENT_OP_CH   = 'e0000000-0000-0000-0000-000000000202' as UUID
export const EVENT_GOJO    = 'e0000000-0000-0000-0000-000000000301' as UUID
export const EVENT_CSM     = 'e0000000-0000-0000-0000-000000000302' as UUID

export const dummyEvents: Record<UUID, Event[]> = {
  [TOPIC_ANIME]: [
    { id: EVENT_AOT,     topicId: TOPIC_ANIME,   format: 'BINARY', name: 'Attack on Titan Final Season Winner',  description: 'Will Attack on Titan win anime of the year at the next major awards ceremony?',                closeTime: '2026-12-31T00:00:00Z', status: 'OPEN', resolutionRule: 'Resolves YES if AoT wins anime of the year at a major ceremony before close time.' },
    { id: EVENT_OP_LA,   topicId: TOPIC_ANIME,   format: 'BINARY', name: 'One Piece Live Action Season 2',        description: 'Will the One Piece live action season 2 receive a higher audience score than season 1?',      closeTime: '2026-09-30T00:00:00Z', status: 'OPEN', resolutionRule: 'Resolves YES if S2 Rotten Tomatoes audience score exceeds S1 score at time of close.' },
    { id: EVENT_JJK,     topicId: TOPIC_ANIME,   format: 'BINARY', name: 'Jujutsu Kaisen Season 3 Rating',        description: 'Will Jujutsu Kaisen season 3 maintain a MyAnimeList score above 8.5?',                       closeTime: '2026-06-30T00:00:00Z', status: 'OPEN', resolutionRule: 'Resolves YES if MAL score is above 8.5 at time of close.' },
  ],
  [TOPIC_MANGA]: [
    { id: EVENT_BERSERK, topicId: TOPIC_MANGA,   format: 'BINARY', name: 'Berserk Completion',                    description: 'Will the Berserk manga receive an official completed ending by end of year?',                closeTime: '2026-12-31T00:00:00Z', status: 'OPEN', resolutionRule: 'Resolves YES if a final chapter is officially published before close time.' },
    { id: EVENT_OP_CH,   topicId: TOPIC_MANGA,   format: 'BINARY', name: 'One Piece Chapter 1200',                description: 'Will One Piece reach chapter 1200 before the end of the year?',                              closeTime: '2026-12-31T00:00:00Z', status: 'OPEN', resolutionRule: 'Resolves YES if chapter 1200 is published in Weekly Shonen Jump before close time.' },
  ],
  [TOPIC_FIGURES]: [
    { id: EVENT_GOJO,    topicId: TOPIC_FIGURES, format: 'BINARY', name: 'Good Smile Gojo Satoru Figure',         description: 'Will the Good Smile Gojo Satoru scale figure sell out within 24 hours of pre-order opening?',  closeTime: '2026-05-01T00:00:00Z', status: 'OPEN', resolutionRule: 'Resolves YES if the Good Smile store shows as sold out within 24 hours of pre-orders opening.' },
    { id: EVENT_CSM,     topicId: TOPIC_FIGURES, format: 'BINARY', name: 'Nendoroid Chainsaw Man',                description: 'Will the Chainsaw Man Nendoroid be re-released before the end of the year?',                  closeTime: '2026-12-31T00:00:00Z', status: 'OPEN', resolutionRule: 'Resolves YES if Good Smile announces a reissue of the Chainsaw Man Nendoroid before close time.' },
  ],
}
