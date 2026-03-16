import type { Market, UUID } from '../models/models'
import { EVENT_AOT, EVENT_OP_LA, EVENT_JJK, EVENT_BERSERK, EVENT_OP_CH, EVENT_GOJO, EVENT_CSM } from './dummyEvents'

const M = (id: string) => id as UUID

export const dummyMarkets: Record<UUID, Market[]> = {
  [EVENT_AOT]: [
    { id: M('m0000000-0000-0000-0000-000000001001'), eventId: EVENT_AOT,     label: 'Wins Anime of the Year',              status: 'OPEN' },
  ],
  [EVENT_OP_LA]: [
    { id: M('m0000000-0000-0000-0000-000000001002'), eventId: EVENT_OP_LA,   label: 'Higher audience score than season 1', status: 'OPEN' },
  ],
  [EVENT_JJK]: [
    { id: M('m0000000-0000-0000-0000-000000001031'), eventId: EVENT_JJK,     label: 'Score above 8.5 at premiere',         status: 'OPEN' },
    { id: M('m0000000-0000-0000-0000-000000001032'), eventId: EVENT_JJK,     label: 'Score above 8.5 at season end',       status: 'OPEN' },
  ],
  [EVENT_BERSERK]: [
    { id: M('m0000000-0000-0000-0000-000000002001'), eventId: EVENT_BERSERK, label: 'Completed ending released',            status: 'OPEN' },
  ],
  [EVENT_OP_CH]: [
    { id: M('m0000000-0000-0000-0000-000000002002'), eventId: EVENT_OP_CH,   label: 'Reaches chapter 1200',                status: 'OPEN' },
  ],
  [EVENT_GOJO]: [
    { id: M('m0000000-0000-0000-0000-000000003001'), eventId: EVENT_GOJO,    label: 'Sells out within 24 hours',           status: 'OPEN' },
  ],
  [EVENT_CSM]: [
    { id: M('m0000000-0000-0000-0000-000000003021'), eventId: EVENT_CSM,     label: 'Re-release announced',                status: 'OPEN' },
    { id: M('m0000000-0000-0000-0000-000000003022'), eventId: EVENT_CSM,     label: 'Re-release shipped',                  status: 'OPEN' },
  ],
}
